import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSendEmail, useReplyEmail } from "@/hooks/react-query/useEmails";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { EmailDetail } from "@/services/email";

function extractEmailAddress(emailString: string): string {
  if (!emailString) return "";

  const match = emailString.match(/<([^>]+)>/);
  if (match) {
    return match[1].trim();
  }

  return emailString.trim();
}

const formSchema = z.object({
  to: z.string().refine(
    (val) => {
      // Allow comma-separated emails for reply all
      const emails = val.split(",").map((e) => e.trim());
      return emails.every((emailStr) => {
        if (!emailStr) return false;
        const email = extractEmailAddress(emailStr);
        return z.string().email().safeParse(email).success;
      });
    },
    { message: "Invalid email address(es)" }
  ),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Message body is required"),
});

type FormInputs = z.infer<typeof formSchema>;

export type ComposeMode = "compose" | "reply" | "replyAll" | "forward";

interface ComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: ComposeMode;
  initialData?: {
    email?: EmailDetail;
    to?: string;
    subject?: string;
    body?: string;
  };
}

export function ComposeDialog({
  open,
  onOpenChange,
  mode = "compose",
  initialData,
}: ComposeDialogProps) {
  const form = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: "",
      subject: "",
      body: "",
    },
  });

  const sendEmailMutation = useSendEmail();
  const replyEmailMutation = useReplyEmail();

  // Update form when initialData or mode changes
  useEffect(() => {
    if (open && initialData?.email) {
      const email = initialData.email;

      if (mode === "forward") {
        // Forward: empty to, subject with Fw:, body with original message
        form.reset({
          to: initialData.to || "",
          subject: email.subject.startsWith("Fw:") ? email.subject : `Fw: ${email.subject}`,
          body:
            initialData.body ||
            `\n\n--- Forwarded Message ---\nFrom: ${email.from}\nTo: ${email.to}\nDate: ${email.sentAt}\nSubject: ${email.subject}\n\n${email.body}`,
        });
      } else if (mode === "reply" || mode === "replyAll") {
        // Reply/Reply All: to is original sender (or all recipients for reply all), subject with Re:, body with original message
        let toValue = extractEmailAddress(email.from);
        if (mode === "replyAll" && email.to) {
          // For reply all, include original sender + original recipients (excluding current user if needed)
          const originalToEmails = email.to.split(",").map((e) => extractEmailAddress(e.trim()));
          const recipientsSet = new Set([extractEmailAddress(email.from)]);
          originalToEmails.forEach((e) => {
            const emailAddr = extractEmailAddress(e);
            if (
              emailAddr &&
              emailAddr.toLowerCase() !== extractEmailAddress(email.from).toLowerCase()
            ) {
              recipientsSet.add(emailAddr);
            }
          });
          toValue = Array.from(recipientsSet).join(", ");
        }

        form.reset({
          to: toValue,
          subject: email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`,
          body: initialData.body || "",
        });
      } else {
        // Compose: use provided initial data or empty
        form.reset({
          to: initialData.to || "",
          subject: initialData.subject || "",
          body: initialData.body || "",
        });
      }
    } else if (open && initialData) {
      // If no email but has initialData
      form.reset({
        to: initialData.to || "",
        subject: initialData.subject || "",
        body: initialData.body || "",
      });
    } else if (open) {
      // Reset to empty for new compose
      form.reset({
        to: "",
        subject: "",
        body: "",
      });
    }
  }, [open, mode, initialData, form]);

  const onSubmit = (data: FormInputs) => {
    if (mode === "reply" || mode === "replyAll") {
      // Use reply API
      if (initialData?.email) {
        console.log(`🟢 [ComposeDialog] Submitting ${mode} to email ID:`, initialData.email.id, {
          to: data.to,
          subject: data.subject,
          bodyLength: data.body.length,
        });
        replyEmailMutation.mutate(
          {
            id: initialData.email.id,
            data: {
              body: data.body,
              replyAll: mode === "replyAll",
            },
          },
          {
            onSuccess: () => {
              console.log(`✅ [ComposeDialog] ${mode} submitted successfully`);
              form.reset();
              onOpenChange(false);
            },
          }
        );
      }
    } else {
      // Use send API for compose and forward
      console.log(`🟢 [ComposeDialog] Submitting ${mode}:`, data);
      sendEmailMutation.mutate(data, {
        onSuccess: () => {
          console.log(`✅ [ComposeDialog] ${mode} submitted successfully`);
          form.reset();
          onOpenChange(false);
        },
      });
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "reply":
        return "Reply";
      case "replyAll":
        return "Reply All";
      case "forward":
        return "Forward";
      default:
        return "Compose Email";
    }
  };

  const isLoading = sendEmailMutation.isPending || replyEmailMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="recipient@example.com"
                      {...field}
                      disabled={mode === "reply" || mode === "replyAll"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Email subject" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Type your message here..." rows={10} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "reply" || mode === "replyAll" ? "Reply" : "Send"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

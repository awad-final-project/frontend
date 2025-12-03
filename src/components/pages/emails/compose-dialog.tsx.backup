import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSendEmail, useReplyEmail, useUploadAttachment } from '@/hooks/react-query/useEmails';
import { Loader2, Paperclip, X, FileIcon } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { AttachmentDto, EmailDetail } from '@/services/email';
import { useToast } from '@/hooks/use-toast';

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

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function ComposeDialog({ open, onOpenChange, mode = "compose", initialData }: ComposeDialogProps) {
  const [attachments, setAttachments] = useState<AttachmentDto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
  const uploadAttachmentMutation = useUploadAttachment();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        // Check file size (max 25MB)
        if (file.size > 25 * 1024 * 1024) {
          toast({
            title: 'Error',
            description: `File "${file.name}" exceeds the 25MB limit`,
            variant: 'destructive',
          });
          continue;
        }

        const result = await uploadAttachmentMutation.mutateAsync(file);
        setAttachments((prev) => [...prev, result]);
      }
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.message || 'Failed to upload attachment',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.attachmentId !== attachmentId));
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      form.reset();
      setAttachments([]);
    }
    onOpenChange(open);
  };

  useEffect(() => {
    if (open && initialData?.email) {
      const email = initialData.email;

      if (mode === "forward") {
        form.reset({
          to: initialData.to || "",
          subject: email.subject.startsWith("Fw:") ? email.subject : `Fw: ${email.subject}`,
          body:
            initialData.body ||
            `\n\n--- Forwarded Message ---\nFrom: ${email.from}\nTo: ${email.to}\nDate: ${email.sentAt}\nSubject: ${email.subject}\n\n${email.body}`,
        });
      } else if (mode === "reply" || mode === "replyAll") {
        let toValue = extractEmailAddress(email.from);
        if (mode === "replyAll" && email.to) {
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
        form.reset({
          to: initialData.to || "",
          subject: initialData.subject || "",
          body: initialData.body || "",
        });
      }
    } else if (open && initialData) {
      form.reset({
        to: initialData.to || "",
        subject: initialData.subject || "",
        body: initialData.body || "",
      });
    } else if (open) {
      form.reset({
        to: "",
        subject: "",
        body: "",
      });
    }
  }, [open, mode, initialData, form]);

  const onSubmit = (data: FormInputs) => {
    if (mode === "reply" || mode === "replyAll") {
      if (initialData?.email) {
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
              form.reset();
              onOpenChange(false);
            },
  const onSubmit = (data: FormInputs) => {
    if (mode === "reply" || mode === "replyAll") {
      if (initialData?.email) {
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
              form.reset();
              setAttachments([]);
              onOpenChange(false);
            },
          }
        );
      }
    } else {
      sendEmailMutation.mutate(
        {
          ...data,
          attachments: attachments.length > 0 ? attachments : undefined,
        },
        {
          onSuccess: () => {
            form.reset();
            setAttachments([]);
            onOpenChange(false);
          },
        },
      );
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

            {/* Attachments Section */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <FormLabel>Attachments</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.attachmentId}
                      className="flex items-center gap-2 bg-muted px-3 py-2 rounded-md text-sm"
                    >
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="max-w-[150px] truncate" title={attachment.filename}>
                        {attachment.filename}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        ({formatFileSize(attachment.size)})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(attachment.attachmentId)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />

            <div className="flex justify-between items-center">
              {/* Attachment button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Paperclip className="mr-2 h-4 w-4" />
                )}
                {isUploading ? 'Uploading...' : 'Attach Files'}
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleClose(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={sendEmailMutation.isPending || isUploading}>
                  {sendEmailMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Send
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

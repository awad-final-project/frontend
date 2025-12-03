import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSendEmail, useUploadAttachment } from '@/hooks/react-query/useEmails';
import { useCreateDraft, useUpdateDraft } from '@/hooks/react-query/useDrafts';
import { Loader2, Paperclip, X, FileIcon, Save } from 'lucide-react';
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
  draftId?: string | null;
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

export function ComposeDialog({ open, onOpenChange, mode = "compose", draftId, initialData }: ComposeDialogProps) {
  const [attachments, setAttachments] = useState<AttachmentDto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(draftId || null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
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
  const uploadAttachmentMutation = useUploadAttachment();
  const createDraftMutation = useCreateDraft();
  const updateDraftMutation = useUpdateDraft();

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
      setCurrentDraftId(null);
      setLastSaved(null);
      // Clear auto-save timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    }
    onOpenChange(open);
  };

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!open) return;

    const saveDraft = async () => {
      const values = form.getValues();
      
      // Only save if there's content
      if (!values.to && !values.subject && !values.body) return;

      try {
        const draftData = {
          to: values.to || '',
          subject: values.subject || '',
          body: values.body || '',
        };

        if (currentDraftId) {
          await updateDraftMutation.mutateAsync({
            draftId: currentDraftId,
            updateDto: draftData,
          });
        } else {
          const draft = await createDraftMutation.mutateAsync(draftData);
          setCurrentDraftId(draft._id);
        }
        
        setLastSaved(new Date());
      } catch (error) {
        // Silent fail for auto-save
        console.error('Auto-save failed:', error);
      }
    };

    // Start auto-save timer
    autoSaveTimerRef.current = setInterval(saveDraft, 30000); // 30 seconds

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [open, currentDraftId, form, createDraftMutation, updateDraftMutation]);

  // Manual save draft
  const handleSaveDraft = async () => {
    const values = form.getValues();
    
    try {
      const draftData = {
        to: values.to || '',
        subject: values.subject || '',
        body: values.body || '',
      };

      if (currentDraftId) {
        await updateDraftMutation.mutateAsync({
          draftId: currentDraftId,
          updateDto: draftData,
        });
      } else {
        const draft = await createDraftMutation.mutateAsync(draftData);
        setCurrentDraftId(draft._id);
      }
      
      setLastSaved(new Date());
      toast({
        title: 'Draft saved',
        description: 'Your draft has been saved successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to save draft',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
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
          body: initialData.body || `\n\n--- Original Message ---\nFrom: ${email.from}\nDate: ${email.sentAt}\nSubject: ${email.subject}\n\n${email.body}`,
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

  const onSubmit = async (data: FormInputs) => {
    if (mode === "reply" || mode === "replyAll") {
      if (initialData?.email) {
        // For reply, we need to send as a new email with reply info
        sendEmailMutation.mutate(
          {
            to: data.to,
            subject: data.subject,
            body: data.body,
            attachments: attachments.length > 0 ? attachments : undefined,
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
            // Delete draft after successful send
            if (currentDraftId) {
              fetch(`/api/email/drafts/${currentDraftId}`, { method: 'DELETE' })
                .catch(() => {}); // Silent fail
            }
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto w-[calc(100vw-2rem)] md:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">{getTitle()}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
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
                    <Textarea 
                      placeholder="Type your message here..." 
                      rows={8} 
                      className="min-h-[150px] md:min-h-[200px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attachments Section */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <FormLabel>Attachments</FormLabel>
                <div className="flex flex-col gap-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.attachmentId}
                      className="flex items-center justify-between gap-2 bg-muted px-3 py-2 rounded-md text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate" title={attachment.filename}>
                          {attachment.filename}
                        </span>
                        <span className="text-muted-foreground text-xs whitespace-nowrap">
                          ({formatFileSize(attachment.size)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(attachment.attachmentId)}
                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                        aria-label="Remove attachment"
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

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Attachment button - available for all modes */}
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
                  {isUploading ? 'Uploading...' : 'Attach'}
                </Button>

                {/* Save Draft button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={createDraftMutation.isPending || updateDraftMutation.isPending}
                >
                  {(createDraftMutation.isPending || updateDraftMutation.isPending) ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save
                </Button>

                {/* Auto-save indicator */}
                {lastSaved && (
                  <span className="text-xs text-muted-foreground">
                    Saved {new Date().getTime() - lastSaved.getTime() < 60000 
                      ? 'just now' 
                      : `${Math.floor((new Date().getTime() - lastSaved.getTime()) / 60000)}m ago`}
                  </span>
                )}
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleClose(false)}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={sendEmailMutation.isPending || isUploading}
                  className="flex-1 sm:flex-none"
                >
                  {sendEmailMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {mode === "reply" || mode === "replyAll" ? "Reply" : mode === "forward" ? "Forward" : "Send"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

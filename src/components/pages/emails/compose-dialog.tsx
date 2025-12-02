import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSendEmail, useUploadAttachment } from '@/hooks/react-query/useEmails';
import { Loader2, Paperclip, X, FileIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { AttachmentDto } from '@/services/email';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Message body is required'),
});

type FormInputs = z.infer<typeof formSchema>;

interface ComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function ComposeDialog({ open, onOpenChange }: ComposeDialogProps) {
  const [attachments, setAttachments] = useState<AttachmentDto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: '',
      subject: '',
      body: '',
    },
  });

  const sendEmailMutation = useSendEmail();
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

  const onSubmit = (data: FormInputs) => {
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
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      form.reset();
      setAttachments([]);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
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
                    <Input
                      type="text"
                      placeholder="Email subject"
                      {...field}
                    />
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
                      rows={10}
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

import { useEmailDetail, useToggleStar, useMarkAsRead, useDeleteEmail, useDownloadAttachment } from '@/hooks/react-query/useEmails';
import { Button } from '@/components/ui/button';
import { Loader2, Star, Reply, ReplyAll, Forward, Trash2, Mail, X, ArrowLeft, Paperclip, Download, FileIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { ComposeDialog, ComposeMode } from './compose-dialog';
import { useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface EmailDetailProps {
  emailId: string;
  onClose: () => void;
  onDelete: () => void;
  onBack?: () => void;
}

// Sanitize HTML content - remove tracking pixels and malicious scripts
function sanitizeEmailHtml(html: string): string {
  if (!html) return "";

  // Remove tracking pixels and web beacons
  let cleaned = html.replace(
    /<img[^>]*(?:src="[^"]*(?:gs-getmailtracker|mailtracker|pixel)[^"]*"[^>]*|[^>]*(?:width="0"|height="0")[^>]*)>/gi,
    ""
  );

  // Sanitize with DOMPurify to prevent XSS
  const sanitized = DOMPurify.sanitize(cleaned, {
    ALLOWED_TAGS: [
      "b",
      "i",
      "em",
      "strong",
      "a",
      "p",
      "br",
      "div",
      "span",
      "ul",
      "ol",
      "li",
      "img",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
      "hr",
      "table",
      "thead",
      "tbody",
      "tr",
      "td",
      "th",
      "font",
    ],
    ALLOWED_ATTR: [
      "href",
      "src",
      "alt",
      "title",
      "target",
      "rel",
      "style",
      "color",
      "face",
      "size",
    ],
    ALLOW_DATA_ATTR: false,
  });

  return sanitized;
}

export function EmailDetail({ emailId, onClose, onDelete, onBack }: EmailDetailProps) {
  const { data: email, isLoading } = useEmailDetail(emailId);
  const toggleStarMutation = useToggleStar();
  const markAsReadMutation = useMarkAsRead();
  const deleteEmailMutation = useDeleteEmail();
  const downloadAttachmentMutation = useDownloadAttachment();
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<ComposeMode>("compose");

  const handleToggleStar = () => {
    if (email) {
      toggleStarMutation.mutate(email.id);
    }
  };

  const handleMarkAsUnread = () => {
    if (email) {
      markAsReadMutation.mutate({ id: email.id, isRead: false });
    }
  };

  const handleDelete = () => {
    if (email) {
      deleteEmailMutation.mutate(email.id, {
        onSuccess: () => {
          onDelete();
        },
      });
    }
  };

  const handleDownloadAttachment = (attachmentId: string, filename: string) => {
    downloadAttachmentMutation.mutate({ attachmentId, filename });
  };

  const handleReply = () => {
    setComposeMode("reply");
    setComposeOpen(true);
  };

  const handleReplyAll = () => {
    setComposeMode("replyAll");
    setComposeOpen(true);
  };

  const handleForward = () => {
    setComposeMode("forward");
    setComposeOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p>Email not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header - Gmail Style */}
      <div className="border-b bg-white p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">{email.subject}</h2>

            {/* Sender info - Gmail style */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-white">
                {email.from.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{email.from}</div>
                <div className="text-xs text-gray-500">to {email.to.split(",")[0]}</div>
              </div>
              <div className="text-right text-xs text-gray-500">
                {format(new Date(email.sentAt), "PPp")}
              </div>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose} className="hidden md:flex">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mb-2 md:hidden">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 border-t pt-4">
          <Button variant="outline" size="sm" onClick={handleReply} className="gap-2">
            <Reply className="h-4 w-4" />
            Reply
          </Button>
          <Button variant="outline" size="sm" onClick={handleReplyAll} className="gap-2">
            <ReplyAll className="h-4 w-4" />
            Reply All
          </Button>
          <Button variant="outline" size="sm" onClick={handleForward} className="gap-2">
            <Forward className="h-4 w-4" />
            Forward
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStar}
            disabled={toggleStarMutation.isPending}
            className="gap-2"
          >
            <Star
              className={`h-4 w-4 ${email.isStarred ? "fill-yellow-400 text-yellow-400" : ""}`}
            />
            {email.isStarred ? "Unstar" : "Star"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAsUnread}
            disabled={markAsReadMutation.isPending}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            Mark Unread
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteEmailMutation.isPending}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

{/* Email Body */}
<div className="flex-1 overflow-y-auto p-6">
  {/* Attachments */}
  {email.attachments && email.attachments.length > 0 && (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Paperclip className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm">
          Attachments ({email.attachments.length})
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {email.attachments.map((attachment) => (
          <div
            key={attachment.id || attachment.attachmentId}
            className="flex items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg border hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <FileIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" title={attachment.filename || attachment.originalName}>
                  {attachment.filename || attachment.originalName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDownloadAttachment(
                attachment.id || attachment.attachmentId,
                attachment.filename || attachment.originalName
              )}
              disabled={downloadAttachmentMutation.isPending}
              title="Download"
            >
              {downloadAttachmentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </div>
      <Separator className="mt-6" />
    </div>
  )}

  {/* Email Body Content */}
  <div className="prose max-w-none">
    <div className="whitespace-pre-wrap">
      {email.body ? (
        <div
          className="email-body-content prose prose-sm max-w-none break-words text-gray-900"
          style={{
            fontSize: "14px",
            lineHeight: "1.6",
            color: "#202124",
          }}
          dangerouslySetInnerHTML={{
            __html: sanitizeEmailHtml(email.body), // Assuming you sanitize the HTML content
          }}
        />
      ) : (
        <div>{email.body}</div> // If body is plain text
      )}
    </div>
  </div>
</div>


      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        mode={composeMode}
        initialData={email ? { email } : undefined}
      />
    </div>
  );
}

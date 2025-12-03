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

  // Remove tracking pixels and web beacons (1x1 images)
  let cleaned = html.replace(
    /<img[^>]*(?:src="[^"]*(?:gs-getmailtracker|mailtracker|pixel|beacon)[^"]*"[^>]*|[^>]*(?:width=["']?[01]["']?|height=["']?[01]["']?)[^>]*)>/gi,
    ""
  );

  // Remove potentially dangerous script-bearing elements
  cleaned = cleaned.replace(/<script[^>]*>.*?<\/script>/gis, "");
  cleaned = cleaned.replace(/<iframe[^>]*>.*?<\/iframe>/gis, "");
  cleaned = cleaned.replace(/<object[^>]*>.*?<\/object>/gis, "");
  cleaned = cleaned.replace(/<embed[^>]*>/gi, "");

  // Sanitize with DOMPurify to prevent XSS
  const sanitized = DOMPurify.sanitize(cleaned, {
    ALLOWED_TAGS: [
      "b", "i", "em", "strong", "u", "s", "strike",
      "a", "p", "br", "div", "span",
      "ul", "ol", "li",
      "img",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "blockquote", "code", "pre",
      "hr",
      "table", "thead", "tbody", "tfoot", "tr", "td", "th", "caption",
      "font", "center",
      "sup", "sub",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel",
      "src", "alt", "title", "width", "height",
      "style", "class",
      "color", "face", "size",
      "align", "valign",
      "border", "cellpadding", "cellspacing",
    ],
    ALLOW_DATA_ATTR: false,
    // Allow all safe URIs including http/https/data for images
    ADD_ATTR: ['target'],
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
    console.log('📎 Download attachment:', { 
      attachmentId, 
      filename,
      emailId: email?.id,
      allAttachments: email?.attachments 
    });
    downloadAttachmentMutation.mutate({ 
      attachmentId, 
      filename,
      emailId: email?.id // Pass emailId for Gmail attachments
    });
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
      <div className="border-b bg-white p-4 md:p-6">
        {/* Mobile back button at the top */}
        {onBack && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack} 
            className="mb-3 md:hidden -ml-2"
            aria-label="Back to email list"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        
        <div className="mb-3 md:mb-4 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="mb-3 md:mb-4 text-xl md:text-2xl font-semibold text-gray-900 break-words">{email.subject}</h2>

            {/* Sender info - Gmail style */}
            <div className="mb-3 md:mb-4 flex items-start md:items-center gap-2 md:gap-3 flex-col sm:flex-row">
              <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-gray-300 text-xs md:text-sm font-medium text-white flex-shrink-0">
                  {email.from.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm md:text-base text-gray-900 truncate">{email.from}</div>
                  <div className="text-xs text-gray-500 truncate">to {email.to.split(",")[0]}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 sm:ml-auto">
                {format(new Date(email.sentAt), "PPp")}
              </div>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="hidden md:flex h-8 w-8 flex-shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-1.5 md:gap-2 border-t pt-3 md:pt-4">
          <Button variant="outline" size="sm" onClick={handleReply} className="gap-1.5 text-xs md:text-sm h-8 md:h-9">
            <Reply className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Reply</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleReplyAll} className="gap-1.5 text-xs md:text-sm h-8 md:h-9">
            <ReplyAll className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Reply All</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleForward} className="gap-1.5 text-xs md:text-sm h-8 md:h-9">
            <Forward className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Forward</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStar}
            disabled={toggleStarMutation.isPending}
            className="gap-1.5 text-xs md:text-sm h-8 md:h-9"
            aria-label={email.isStarred ? "Unstar" : "Star"}
          >
            <Star
              className={`h-3.5 w-3.5 md:h-4 md:w-4 ${email.isStarred ? "fill-yellow-400 text-yellow-400" : ""}`}
            />
            <span className="hidden lg:inline">{email.isStarred ? "Unstar" : "Star"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAsUnread}
            disabled={markAsReadMutation.isPending}
            className="gap-1.5 text-xs md:text-sm h-8 md:h-9"
            aria-label="Mark as unread"
          >
            <Mail className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden lg:inline">Unread</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteEmailMutation.isPending}
            className="gap-1.5 text-xs md:text-sm h-8 md:h-9"
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden lg:inline">Delete</span>
          </Button>
        </div>
      </div>

{/* Email Body */}
<div className="flex-1 overflow-y-auto p-4 md:p-6">
  {/* Attachments */}
  {email.attachments && email.attachments.length > 0 && (
    <div className="mb-4 md:mb-6">
      <div className="flex items-center gap-2 mb-2 md:mb-3">
        <Paperclip className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm">
          Attachments ({email.attachments.length})
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
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
  <div className="email-content-wrapper">
    <style>{`
      .email-content-wrapper {
        width: 100%;
        overflow-x: auto;
      }
      
      .email-body-content {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #202124;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
      
      /* Let HTML render naturally - minimal constraints */
      .email-body-content * {
        max-width: 100%;
        box-sizing: border-box;
      }
      
      /* Remove default borders from divs */
      .email-body-content div {
        border: none !important;
      }
      
      /* Typography - preserve email styles */
      .email-body-content h1, .email-body-content h2, .email-body-content h3,
      .email-body-content h4, .email-body-content h5, .email-body-content h6 {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
      }
      
      .email-body-content p {
        margin: 0.5em 0;
      }
      
      .email-body-content a {
        color: #1a73e8;
        text-decoration: none;
      }
      
      .email-body-content a:hover {
        text-decoration: underline;
      }
      
      /* Images - Responsive and allow external sources */
      .email-body-content img {
        max-width: 100%;
        height: auto;
        display: inline-block;
        vertical-align: middle;
        loading: lazy;
      }
      
      /* Allow images to load from any source */
      .email-body-content img[src] {
        content-visibility: auto;
      }
      
      /* Lists */
      .email-body-content ul, .email-body-content ol {
        margin: 0.5em 0;
        padding-left: 2em;
      }
      
      /* Blockquotes - subtle styling */
      .email-body-content blockquote {
        margin: 1em 0;
        padding-left: 1em;
        border-left: 3px solid #dadce0;
        color: #5f6368;
      }
      
      /* Code blocks */
      .email-body-content pre {
        background-color: #f8f9fa;
        border-radius: 4px;
        padding: 1em;
        overflow-x: auto;
        font-family: 'Courier New', Courier, monospace;
        font-size: 13px;
      }
      
      .email-body-content code {
        background-color: #f8f9fa;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: 'Courier New', Courier, monospace;
        font-size: 13px;
      }
      
      .email-body-content pre code {
        background-color: transparent;
        padding: 0;
      }
      
      /* Tables - preserve email table styling */
      .email-body-content table {
        border-collapse: collapse;
        margin: 1em 0;
      }
      
      .email-body-content table th,
      .email-body-content table td {
        padding: 8px 12px;
      }
      
      /* Gmail quoted text */
      .email-body-content .gmail_quote {
        margin: 1em 0;
        padding-left: 1em;
        border-left: 2px solid #dadce0;
        color: #5f6368;
      }
      
      /* Plain text emails */
      .email-body-plaintext {
        white-space: pre-wrap;
        font-family: monospace;
        font-size: 13px;
      }
    `}</style>
    
    {email.body ? (
      email.body.includes('<') && email.body.includes('>') ? (
        <div
          className="email-body-content"
          dangerouslySetInnerHTML={{
            __html: sanitizeEmailHtml(email.body),
          }}
        />
      ) : (
        <div className="email-body-plaintext">{email.body}</div>
      )
    ) : (
      <p className="text-muted-foreground italic">No content</p>
    )}
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

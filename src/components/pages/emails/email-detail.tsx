import {
  useEmailDetail,
  useToggleStar,
  useMarkAsRead,
  useDeleteEmail,
} from "@/hooks/react-query/useEmails";
import { Button } from "@/components/ui/button";
import { Loader2, Star, Reply, ReplyAll, Forward, Trash2, Mail, X, ArrowLeft, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { ComposeDialog, ComposeMode } from "./compose-dialog";
import { useState } from "react";
import DOMPurify from 'isomorphic-dompurify';

interface EmailDetailProps {
  emailId: string;
  onClose: () => void;
  onDelete: () => void;
  onBack?: () => void;
}

// Sanitize HTML content - remove tracking pixels and malicious scripts
function sanitizeEmailHtml(html: string): string {
  if (!html) return '';
  
  // Remove tracking pixels and web beacons
  let cleaned = html.replace(/<img[^>]*(?:src="[^"]*(?:gs-getmailtracker|mailtracker|pixel)[^"]*"[^>]*|[^>]*(?:width="0"|height="0")[^>]*)>/gi, "");
  
  // Sanitize with DOMPurify to prevent XSS
  const sanitized = DOMPurify.sanitize(cleaned, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'div', 'span', 'ul', 'ol', 'li', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'hr', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'font'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'style', 'color', 'face', 'size'],
    ALLOW_DATA_ATTR: false,
  });
  
  return sanitized;
}

export function EmailDetail({ emailId, onClose, onDelete, onBack }: EmailDetailProps) {
  const { data: email, isLoading } = useEmailDetail(emailId);
  const toggleStarMutation = useToggleStar();
  const markAsReadMutation = useMarkAsRead();
  const deleteEmailMutation = useDeleteEmail();
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
                <div className="text-xs text-gray-500">
                  to {email.to.split(',')[0]}
                </div>
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
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden mb-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
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

      {/* Email Body - Gmail Style */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="mx-auto max-w-3xl border-x">
          {/* Email content container */}
          <div className="p-6">
            {/* Display HTML body if available, otherwise show plain text */}
            <div 
              className="email-body-content prose prose-sm max-w-none break-words text-gray-900"
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#202124',
              }}
              dangerouslySetInnerHTML={{ 
                __html: sanitizeEmailHtml(email.body) 
              }}
            />
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

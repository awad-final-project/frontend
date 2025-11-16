import { useEmailDetail, useToggleStar, useMarkAsRead, useDeleteEmail } from '@/hooks/react-query/useEmails';
import { Button } from '@/components/ui/button';
import { Loader2, Star, Reply, ReplyAll, Forward, Trash2, Mail, X } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface EmailDetailProps {
  emailId: string;
  onClose: () => void;
  onDelete: () => void;
}

export function EmailDetail({ emailId, onClose, onDelete }: EmailDetailProps) {
  const { data: email, isLoading } = useEmailDetail(emailId);
  const toggleStarMutation = useToggleStar();
  const markAsReadMutation = useMarkAsRead();
  const deleteEmailMutation = useDeleteEmail();

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
      {/* Header */}
      <div className="border-b p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{email.subject}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">From:</span>
              <span>{email.from}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">To:</span>
              <span>{email.to}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Date:</span>
              <span className="text-muted-foreground">
                {format(new Date(email.sentAt), 'PPpp')}
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Reply className="mr-2 h-4 w-4" />
            Reply
          </Button>
          <Button variant="outline" size="sm">
            <ReplyAll className="mr-2 h-4 w-4" />
            Reply All
          </Button>
          <Button variant="outline" size="sm">
            <Forward className="mr-2 h-4 w-4" />
            Forward
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStar}
            disabled={toggleStarMutation.isPending}
          >
            <Star
              className={`mr-2 h-4 w-4 ${
                email.isStarred ? 'fill-yellow-400 text-yellow-400' : ''
              }`}
            />
            {email.isStarred ? 'Unstar' : 'Star'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAsUnread}
            disabled={markAsReadMutation.isPending}
          >
            <Mail className="mr-2 h-4 w-4" />
            Mark Unread
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteEmailMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap">{email.body}</div>
        </div>
      </div>
    </div>
  );
}

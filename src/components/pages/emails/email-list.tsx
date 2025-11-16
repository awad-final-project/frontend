import { useEmailsByFolder } from '@/hooks/react-query/useEmails';
import { Loader2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface EmailListProps {
  folder: string;
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
}

export function EmailList({ folder, selectedEmailId, onSelectEmail }: EmailListProps) {
  const { data, isLoading } = useEmailsByFolder(folder);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.emails.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <p>No emails in this folder</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {data.emails.map((email) => {
        const isSelected = selectedEmailId === email.id;

        return (
          <button
            key={email.id}
            onClick={() => onSelectEmail(email.id)}
            className={cn(
              'w-full border-b p-4 text-left transition-colors hover:bg-muted/50',
              isSelected && 'bg-muted',
              !email.isRead && 'font-semibold',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className={cn('truncate', !email.isRead && 'font-bold')}>
                    {email.from}
                  </span>
                  {email.isStarred && (
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
                <p className={cn('truncate text-sm', !email.isRead && 'font-semibold')}>
                  {email.subject}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {email.preview}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {format(new Date(email.sentAt), 'MMM d')}
                </span>
                {!email.isRead && (
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

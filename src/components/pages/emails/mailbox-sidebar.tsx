import { useMailboxes } from '@/hooks/react-query/useEmails';
import { Badge } from '@/components/ui/badge';
import { Loader2, Inbox, Star, Send, FileText, Archive, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MailboxSidebarProps {
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
}

const folderIcons: Record<string, React.ElementType> = {
  inbox: Inbox,
  starred: Star,
  sent: Send,
  drafts: FileText,
  archive: Archive,
  trash: Trash2,
};

export function MailboxSidebar({ selectedFolder, onSelectFolder }: MailboxSidebarProps) {
  const { data: mailboxes, isLoading } = useMailboxes();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <nav className="space-y-1 p-2">
      {mailboxes?.map((mailbox) => {
        const Icon = folderIcons[mailbox.id] || Inbox;
        const isSelected = selectedFolder === mailbox.id;

        return (
          <button
            key={mailbox.id}
            onClick={() => onSelectFolder(mailbox.id)}
            className={cn(
              'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted',
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4" />
              <span>{mailbox.name}</span>
            </div>
            {mailbox.count > 0 && (
              <Badge
                variant={isSelected ? 'secondary' : 'default'}
                className="ml-auto"
              >
                {mailbox.count}
              </Badge>
            )}
          </button>
        );
      })}
    </nav>
  );
}

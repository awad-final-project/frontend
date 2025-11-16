import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { MailboxSidebar } from '@/components/pages/emails/mailbox-sidebar';
import { EmailList } from '@/components/pages/emails/email-list';
import { EmailDetail } from '@/components/pages/emails/email-detail';
import { Button } from '@/components/ui/button';
import { PenSquare, RefreshCw } from 'lucide-react';
import { ComposeDialog } from '@/components/pages/emails/compose-dialog';
import { useMailboxes } from '@/hooks/react-query/useEmails';

export const Route = createFileRoute('/_authenticated/inbox')({
  component: InboxPage,
});

function InboxPage() {
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const { refetch: refetchMailboxes } = useMailboxes();

  const handleRefresh = () => {
    refetchMailboxes();
    setSelectedEmailId(null);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Column 1: Mailbox Sidebar */}
      <div className="w-64 border-r bg-muted/10">
        <div className="border-b p-4">
          <Button
            onClick={() => setIsComposeOpen(true)}
            className="w-full"
            size="sm"
          >
            <PenSquare className="mr-2 h-4 w-4" />
            Compose
          </Button>
        </div>
        <MailboxSidebar
          selectedFolder={selectedFolder}
          onSelectFolder={(folder) => {
            setSelectedFolder(folder);
            setSelectedEmailId(null);
          }}
        />
      </div>

      {/* Column 2: Email List */}
      <div className="w-2/5 border-r">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold capitalize">{selectedFolder}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <EmailList
          folder={selectedFolder}
          selectedEmailId={selectedEmailId}
          onSelectEmail={setSelectedEmailId}
        />
      </div>

      {/* Column 3: Email Detail */}
      <div className="flex-1">
        {selectedEmailId ? (
          <EmailDetail
            emailId={selectedEmailId}
            onClose={() => setSelectedEmailId(null)}
            onDelete={() => setSelectedEmailId(null)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">No email selected</p>
              <p className="text-sm">Select an email from the list to view details</p>
            </div>
          </div>
        )}
      </div>

      <ComposeDialog
        open={isComposeOpen}
        onOpenChange={setIsComposeOpen}
      />
    </div>
  );
}

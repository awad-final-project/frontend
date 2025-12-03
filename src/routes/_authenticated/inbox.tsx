import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { MailboxSidebar } from '@/components/pages/emails/mailbox-sidebar';
import { EmailList } from '@/components/pages/emails/email-list';
import { EmailDetail } from '@/components/pages/emails/email-detail';
import { Button } from '@/components/ui/button';
import { PenSquare, RefreshCw, Mail, LogOut, User, Settings, Shield, Menu } from 'lucide-react';
import { ComposeDialog } from '@/components/pages/emails/compose-dialog';
import { useMailboxes, useMarkAsRead } from '@/hooks/react-query/useEmails';
import { useSignOut, useUserProfile } from '@/hooks/react-query/useAuth';
import { useUserRole } from '@/hooks/useRole';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Route = createFileRoute('/_authenticated/inbox')({
  component: InboxPage,
});

function InboxPage() {
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const { refetch: refetchMailboxes } = useMailboxes();
  const { data: userProfile } = useUserProfile();
  const signOutMutation = useSignOut();
  const markAsReadMutation = useMarkAsRead();
  const userRole = useUserRole();

  const handleRefresh = () => {
    refetchMailboxes();
  };

  const handleSelectEmail = (emailId: string) => {
    // Mark as read immediately with optimistic update
    markAsReadMutation.mutate({ id: emailId, isRead: true });
    setSelectedEmailId(emailId);
    setIsMobileDetailView(true);
  };

  const handleCloseDetail = () => {
    setSelectedEmailId(null);
    setIsMobileDetailView(false);
  };

  const handleLogout = () => {
    signOutMutation.mutate();
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* Top Navigation Bar */}
      <header className="flex h-16 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Mail className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Email Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsComposeOpen(true)}
            size="sm"
            className="hidden md:flex"
          >
            <PenSquare className="mr-2 h-4 w-4" />
            Compose
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userProfile?.username || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{userProfile?.email || ''}</p>
                  {userRole && (
                    <p className="text-xs text-muted-foreground">
                      Role: <span className="font-semibold capitalize">{userRole}</span>
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = '/profile'} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/settings'} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              {userRole === 'admin' && (
                <DropdownMenuItem onClick={() => window.location.href = '/admin'} className="cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Panel
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                disabled={signOutMutation.isPending}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {signOutMutation.isPending ? 'Logging out...' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Column 1: Mailbox Sidebar - 20% width on desktop */}
        <div className={`w-full flex-shrink-0 border-r bg-muted/30 md:w-64 lg:w-72 ${
          isMobileDetailView ? 'hidden md:block' : isMobileSidebarOpen ? 'block' : 'hidden md:block'
        }`}>
          <div className="border-b bg-background p-3 md:hidden">
            <Button
              onClick={() => setIsComposeOpen(true)}
              className="w-full gap-2"
              size="default"
            >
              <PenSquare className="h-4 w-4" />
              Compose
            </Button>
          </div>
          <MailboxSidebar
            selectedFolder={selectedFolder}
            onSelectFolder={(folder) => {
              setSelectedFolder(folder);
              setSelectedEmailId(null);
              setIsMobileDetailView(false);
              setIsMobileSidebarOpen(false);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Column 2: Email List - 40% width on desktop */}
        <div className={`flex h-full w-full flex-shrink-0 flex-col border-r bg-background md:w-[40%] ${isMobileDetailView ? 'hidden md:block' : 'block'}`}>
          <div className="flex-shrink-0 flex items-center justify-between border-b bg-muted/30 px-4 py-3">
            <h2 className="text-lg font-semibold capitalize">{selectedFolder}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <EmailList
            folder={selectedFolder}
            selectedEmailId={selectedEmailId}
            onSelectEmail={handleSelectEmail}
            page={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            />
          </div>
        </div>

        {/* Column 3: Email Detail - 40% width on desktop */}
        <div className={`flex-1 bg-background ${isMobileDetailView ? 'block' : 'hidden md:block'}`}>
          {selectedEmailId ? (
            <EmailDetail
              emailId={selectedEmailId}
              onClose={handleCloseDetail}
              onDelete={handleCloseDetail}
              onBack={handleCloseDetail}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Mail className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
                <p className="text-lg font-medium">No email selected</p>
                <p className="text-sm">Select an email from the list to view its contents</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ComposeDialog
        open={isComposeOpen}
        onOpenChange={setIsComposeOpen}
      />
    </div>
  );
}

import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { MailboxSidebar } from '@/components/pages/emails/mailbox-sidebar';
import { EmailList } from '@/components/pages/emails/email-list';
import { EmailDetail } from '@/components/pages/emails/email-detail';
import { KeyboardShortcutsHelp } from '@/components/pages/emails/keyboard-shortcuts-help';
import { EmailFilters, EmailFilterValues } from '@/components/pages/emails/email-filters';
import { ThemeToggle } from '@/components/theme-toggle';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { PenSquare, RefreshCw, Mail, LogOut, User, Settings, Shield, Menu } from 'lucide-react';
import { ComposeDialog } from '@/components/pages/emails/compose-dialog';
import { useMailboxes, useMarkAsRead, useToggleStar, useDeleteEmail } from '@/hooks/react-query/useEmails';
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
import { useToast } from '@/hooks/use-toast';

export const Route = createFileRoute('/_authenticated/inbox')({
  component: InboxPage,
});

function InboxPage() {
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState<EmailFilterValues>({});
  const { refetch: refetchMailboxes } = useMailboxes();
  const { data: userProfile } = useUserProfile();
  const signOutMutation = useSignOut();
  const markAsReadMutation = useMarkAsRead();
  const toggleStarMutation = useToggleStar();
  const deleteEmailMutation = useDeleteEmail();
  const userRole = useUserRole();
  const { toast } = useToast();

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Don't trigger shortcuts if a modal is open
      if (isComposeOpen) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'c':
          // Compose new email
          e.preventDefault();
          setIsComposeOpen(true);
          break;
        case '?':
          // Show keyboard shortcuts help
          e.preventDefault();
          setIsKeyboardHelpOpen(true);
          break;
        case 'r':
          // Refresh
          if (e.ctrlKey || e.metaKey) {
            // Allow default browser refresh
            return;
          }
          e.preventDefault();
          handleRefresh();
          toast({
            title: 'Refreshing',
            description: 'Updating mailbox...',
          });
          break;
        case 's':
          // Star/unstar selected email
          if (selectedEmailId && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            toggleStarMutation.mutate(selectedEmailId);
          }
          break;
        case 'delete':
        case 'd':
          // Delete selected email (only 'd' key, not 'delete' key to avoid accidental deletion)
          if (selectedEmailId && e.key === 'd' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            deleteEmailMutation.mutate(selectedEmailId, {
              onSuccess: () => {
                handleCloseDetail();
                toast({
                  title: 'Email deleted',
                  description: 'Email moved to trash',
                });
              },
            });
          }
          break;
        case 'escape':
          // Close email detail or compose
          if (selectedEmailId) {
            e.preventDefault();
            handleCloseDetail();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEmailId, isComposeOpen, toggleStarMutation, deleteEmailMutation, toast]);

  const handleRefresh = () => {
    refetchMailboxes();
  };

  const handleFiltersChange = (newFilters: EmailFilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
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
      <header className="flex h-14 md:h-16 items-center justify-between border-b bg-background px-3 md:px-4" role="banner">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            aria-label="Toggle sidebar menu"
            aria-expanded={isMobileSidebarOpen}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Mail className="h-5 w-5 md:h-6 md:w-6 text-primary" aria-hidden="true" />
          <h1 className="text-lg md:text-xl font-bold">Email Dashboard</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Compose FAB */}
          <Button
            onClick={() => setIsComposeOpen(true)}
            size="icon"
            className="md:hidden h-9 w-9 rounded-full"
            aria-label="Compose email"
          >
            <PenSquare className="h-4 w-4" />
          </Button>
          
          {/* Desktop Compose Button */}
          <Button
            onClick={() => setIsComposeOpen(true)}
            size="sm"
            className="hidden md:flex"
          >
            <PenSquare className="mr-2 h-4 w-4" />
            Compose
          </Button>

          {/* Theme Toggle */}
          {/* <ThemeToggle /> */}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-10 w-10 rounded-full"
                aria-label={`User menu for ${userProfile?.username || 'user'}`}
              >
                {userProfile?.picture ? (
                  <img
                    src={userProfile.picture}
                    alt={userProfile.username}
                    className="h-full w-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                )}
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
              <DropdownMenuItem onClick={() => setIsKeyboardHelpOpen(true)} className="cursor-pointer">
                <span className="mr-2 h-4 w-4 flex items-center justify-center font-bold text-xs">?</span>
                Keyboard Shortcuts
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
      <main className="flex flex-1 overflow-hidden" role="main">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 md:hidden" 
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        
        {/* Column 1: Mailbox Sidebar - 20% width on desktop */}
        <nav 
          className={`w-[280px] flex-shrink-0 border-r bg-background md:w-64 lg:w-72 transition-transform duration-200 ${
            isMobileDetailView 
              ? 'hidden md:block' 
              : isMobileSidebarOpen 
                ? 'fixed left-0 top-14 bottom-0 z-50 md:relative md:top-0' 
                : 'hidden md:block'
          }`}
          aria-label="Mailbox folders"
        >
          <div className="border-b bg-background p-3 md:hidden">
            <Button
              onClick={() => {
                setIsComposeOpen(true);
                setIsMobileSidebarOpen(false);
              }}
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
        </nav>        {/* Column 2: Email List - 40% width on desktop */}
        <ErrorBoundary onReset={() => setSelectedFolder(selectedFolder)}>
          <section 
            className={`flex h-full w-full flex-shrink-0 flex-col border-r bg-background md:w-[40%] ${isMobileDetailView ? 'hidden md:flex' : 'flex'}`}
            aria-label="Email list"
          >
            <div className="flex-shrink-0 flex items-center justify-between border-b bg-muted/30 px-3 md:px-4 py-2.5 md:py-3">
              <h2 className="text-lg font-semibold capitalize">{selectedFolder}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                className="h-8 w-8"
                aria-label="Refresh mailbox"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Search and Filters */}
            {/* <EmailFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            /> */}
            
            <div className="flex-1 flex flex-col min-h-0">
              <EmailList
              folder={selectedFolder}
              selectedEmailId={selectedEmailId}
              onSelectEmail={handleSelectEmail}
              page={currentPage}
              pageSize={pageSize}
              filters={filters}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              />
            </div>
          </section>
        </ErrorBoundary>

        {/* Column 3: Email Detail - 40% width on desktop */}
        <ErrorBoundary onReset={() => setSelectedEmailId(null)}>
          <article 
            className={`flex-1 bg-background ${isMobileDetailView ? 'block' : 'hidden md:block'}`}
            aria-label="Email detail"
          >
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
          </article>
        </ErrorBoundary>
      </main>

      <ComposeDialog
        open={isComposeOpen}
        onOpenChange={setIsComposeOpen}
      />

      <KeyboardShortcutsHelp
        open={isKeyboardHelpOpen}
        onOpenChange={setIsKeyboardHelpOpen}
      />
    </div>
  );
}

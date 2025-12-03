import { useEmailsByFolder } from '@/hooks/react-query/useEmails';
import { Loader2, Star, Paperclip, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useRef } from 'react';

interface EmailListProps {
  folder: string;
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function EmailList({ 
  folder, 
  selectedEmailId, 
  onSelectEmail,
  page = 1,
  pageSize = 25,
  onPageChange,
  onPageSizeChange
}: EmailListProps) {
  const { data, isLoading } = useEmailsByFolder(folder, page, pageSize);
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll to top when page changes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [page, folder]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, emailId: string, index: number) => {
    if (!data?.emails) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        onSelectEmail(emailId);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (index < data.emails.length - 1) {
          const nextButton = document.querySelector(
            `[data-email-index="${index + 1}"]`
          ) as HTMLButtonElement;
          nextButton?.focus();
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (index > 0) {
          const prevButton = document.querySelector(
            `[data-email-index="${index - 1}"]`
          ) as HTMLButtonElement;
          prevButton?.focus();
        }
        break;
    }
  };

  const totalPages = data?.totalPages || 0;
  const hasMore = data?.hasMore ?? false;
  const currentTotal = data?.total || 0;
  const startItem = currentTotal > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem = Math.min(page * pageSize, currentTotal);

  return (
    <div className="flex h-full flex-col">
      <div ref={listRef} className="flex-1 overflow-y-auto" role="list">
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && (!data || data.emails.length === 0) && (
          <div className="flex h-full items-center justify-center p-8 text-muted-foreground">
            <p>No emails in this folder</p>
          </div>
        )}

        {!isLoading &&
          data?.emails.map((email, index) => {
            const isSelected = selectedEmailId === email.id;

            return (
              <button
                key={email.id}
                data-email-index={index}
                onClick={() => onSelectEmail(email.id)}
                onKeyDown={(e) => handleKeyDown(e, email.id, index)}
                className={cn(
                  'w-full border-b p-4 text-left transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset',
                  isSelected && 'bg-muted',
                  !email.isRead && 'font-semibold'
                )}
                role="listitem"
                aria-label={`Email from ${email.from}: ${email.subject}`}
                aria-selected={isSelected}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className={cn('truncate', !email.isRead && 'font-bold')}>
                        {email.from}
                      </span>
                      {email.isStarred && (
                        <Star
                          className="h-3 w-3 fill-yellow-400 text-yellow-400"
                          aria-label="Starred"
                        />
                      )}
                    </div>
                    <p className={cn('truncate text-sm', !email.isRead && 'font-semibold')}>
                      {email.subject}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{email.preview}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {format(new Date(email.sentAt), 'MMM d')}
                    </span>
                    {!email.isRead && (
                      <div className="h-2 w-2 rounded-full bg-blue-500" aria-label="Unread" />
                    )}
                    {email.attachments && email.attachments.length > 0 && (
                      <Paperclip className="h-3 w-3 text-muted-foreground" aria-label="Has attachments" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
      </div>

      {/* Pagination Controls */}
      {!isLoading && data && data.emails.length > 0 && onPageChange && (
        <div className="border-t bg-muted/30 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {/* Items count */}
            <div className="text-xs text-muted-foreground">
              Showing {startItem}-{endItem} of {currentTotal} emails
            </div>

            <div className="flex items-center gap-2">
              {/* Page size selector */}
              {onPageSizeChange && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Per page:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => onPageSizeChange(Number(value))}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Page navigation */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onPageChange(1)}
                  disabled={page === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex h-8 min-w-[80px] items-center justify-center text-xs">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onPageChange(page + 1)}
                  disabled={!hasMore}
                  title={hasMore ? 'Next page' : 'No more pages'}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onPageChange(totalPages)}
                  disabled={!hasMore}
                  title={hasMore ? 'Last page' : 'No more pages'}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEmailsByFolder } from "@/hooks/react-query/useEmails";
import { Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface EmailListProps {
  folder: string;
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
}

export function EmailList({ folder, selectedEmailId, onSelectEmail }: EmailListProps) {
  const { data, isLoading } = useEmailsByFolder(folder);

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

  return (
    <div className="flex-1 overflow-y-auto" role="list">
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
                "w-full border-b p-4 text-left transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary",
                isSelected && "bg-muted",
                !email.isRead && "font-semibold"
              )}
              role="listitem"
              aria-label={`Email from ${email.from}: ${email.subject}`}
              aria-selected={isSelected}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className={cn("truncate", !email.isRead && "font-bold")}>
                      {email.from}
                    </span>
                    {email.isStarred && (
                      <Star
                        className="h-3 w-3 fill-yellow-400 text-yellow-400"
                        aria-label="Starred"
                      />
                    )}
                  </div>
                  <p className={cn("truncate text-sm", !email.isRead && "font-semibold")}>
                    {email.subject}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{email.preview}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {format(new Date(email.sentAt), "MMM d")}
                  </span>
                  {!email.isRead && (
                    <div className="h-2 w-2 rounded-full bg-blue-500" aria-label="Unread" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
    </div>
  );
}

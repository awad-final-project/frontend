import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Keyboard } from 'lucide-react';
import { emailShortcuts, formatShortcut } from '@/hooks/useKeyboardShortcuts';

interface AdvancedShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdvancedShortcutsHelp({ open, onOpenChange }: AdvancedShortcutsHelpProps) {
  const categories = [
    { name: 'Navigation', shortcuts: emailShortcuts.navigation },
    { name: 'Actions', shortcuts: emailShortcuts.actions },
    { name: 'Selection', shortcuts: emailShortcuts.selection },
    { name: 'Search', shortcuts: emailShortcuts.search },
    { name: 'General', shortcuts: emailShortcuts.general },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Master these keyboard shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category.name}>
                <h3 className="text-sm font-semibold mb-3 text-primary">
                  {category.name}
                </h3>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 text-xs font-semibold text-primary bg-muted rounded border border-border">
                        {formatShortcut(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Tips Section */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
              <h3 className="text-sm font-semibold mb-2">💡 Pro Tips</h3>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Use <kbd className="px-1 py-0.5 bg-muted rounded">j/k</kbd> for quick navigation through emails</li>
                <li>• Press <kbd className="px-1 py-0.5 bg-muted rounded">x</kbd> to select, then use bulk actions</li>
                <li>• Use <kbd className="px-1 py-0.5 bg-muted rounded">g + i/s/d</kbd> combos to jump to folders</li>
                <li>• Press <kbd className="px-1 py-0.5 bg-muted rounded">/</kbd> to quickly search emails</li>
                <li>• <kbd className="px-1 py-0.5 bg-muted rounded">Esc</kbd> closes any dialog or modal</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

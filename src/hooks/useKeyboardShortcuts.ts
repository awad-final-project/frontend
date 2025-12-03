import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action?: () => void;
  category?: string;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
  preventDefault = true,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if user is typing in an input/textarea/contenteditable
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find((shortcut) => {
        const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;
        const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey;

        return keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches;
      });

      if (matchingShortcut) {
        if (preventDefault) {
          event.preventDefault();
        }
        matchingShortcut.action?.();
      }
    },
    [shortcuts, enabled, preventDefault]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}

// Predefined shortcut groups
export const emailShortcuts = {
  navigation: [
    { key: 'j', description: 'Next email', category: 'Navigation' },
    { key: 'k', description: 'Previous email', category: 'Navigation' },
    { key: 'o', description: 'Open email', category: 'Navigation' },
    { key: 'u', description: 'Back to list', category: 'Navigation' },
    { key: 'i', shift: true, description: 'Go to inbox', category: 'Navigation' },
    { key: 's', shift: true, description: 'Go to starred', category: 'Navigation' },
    { key: 'd', shift: true, description: 'Go to drafts', category: 'Navigation' },
  ],
  actions: [
    { key: 'c', description: 'Compose new email', category: 'Actions' },
    { key: 'r', description: 'Reply to email', category: 'Actions' },
    { key: 'a', description: 'Reply all', category: 'Actions' },
    { key: 'f', description: 'Forward email', category: 'Actions' },
    { key: 's', description: 'Star/unstar email', category: 'Actions' },
    { key: 'e', description: 'Archive email', category: 'Actions' },
    { key: '#', description: 'Delete email', category: 'Actions' },
    { key: 'u', shift: true, description: 'Mark as unread', category: 'Actions' },
    { key: 'i', shift: true, description: 'Mark as read', category: 'Actions' },
  ],
  selection: [
    { key: 'x', description: 'Select/deselect email', category: 'Selection' },
    { key: 'a', shift: true, description: 'Select all', category: 'Selection' },
    { key: 'n', shift: true, description: 'Deselect all', category: 'Selection' },
    { key: 'r', shift: true, description: 'Select read', category: 'Selection' },
    { key: 'u', shift: true, description: 'Select unread', category: 'Selection' },
    { key: 's', shift: true, description: 'Select starred', category: 'Selection' },
  ],
  search: [
    { key: '/', description: 'Focus search', category: 'Search' },
    { key: 'Escape', description: 'Clear search', category: 'Search' },
  ],
  general: [
    { key: '?', description: 'Show shortcuts help', category: 'General' },
    { key: 'Escape', description: 'Close dialog/modal', category: 'General' },
    { key: 'Enter', description: 'Confirm action', category: 'General' },
  ],
};

export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.meta) parts.push('Cmd');
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(' + ');
}

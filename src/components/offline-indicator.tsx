import { useOfflineCache } from '@/hooks/useOfflineCache';
import { WifiOff, Wifi, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function OfflineIndicator() {
  const { isOnline, cacheStats, clearCache, refreshCacheStats } = useOfflineCache();

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${!isOnline ? 'text-yellow-600 dark:text-yellow-500' : ''}`}
        >
          {isOnline ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <span className="hidden md:inline text-xs">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-sm">Offline Cache</h3>
              <p className="text-xs text-muted-foreground">
                {isOnline ? 'Connected to internet' : 'Working offline'}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cached emails:</span>
              <span className="font-medium">{cacheStats.emails}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email details:</span>
              <span className="font-medium">{cacheStats.emailDetails}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Attachments:</span>
              <span className="font-medium">{cacheStats.attachments}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-muted-foreground font-medium">Total size:</span>
              <span className="font-semibold">{formatSize(cacheStats.totalSize)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshCacheStats}
              className="flex-1"
            >
              Refresh
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={clearCache}
              className="flex-1"
            >
              Clear Cache
            </Button>
          </div>

          {!isOnline && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                ⚠️ You're working offline. Some features may be limited.
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

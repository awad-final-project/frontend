import { useEffect, useState } from 'react';
import { emailCache } from '@/services/emailCache';
import { useQueryClient } from '@tanstack/react-query';

export function useOfflineCache() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheStats, setCacheStats] = useState({
    emails: 0,
    emailDetails: 0,
    attachments: 0,
    totalSize: 0,
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    // Initialize cache
    emailCache.init();

    // Update online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cache stats
    emailCache.getCacheStats().then(setCacheStats);

    // Clear expired cache periodically (every hour)
    const clearIntervalId = setInterval(() => {
      emailCache.clearExpiredCache();
      emailCache.getCacheStats().then(setCacheStats);
    }, 1000 * 60 * 60);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(clearIntervalId);
    };
  }, []);

  const clearCache = async () => {
    await emailCache.clearAllCache();
    setCacheStats({
      emails: 0,
      emailDetails: 0,
      attachments: 0,
      totalSize: 0,
    });
    queryClient.clear();
  };

  const refreshCacheStats = async () => {
    const stats = await emailCache.getCacheStats();
    setCacheStats(stats);
  };

  return {
    isOnline,
    cacheStats,
    clearCache,
    refreshCacheStats,
  };
}

export function useEmailCache(folder: string, enabled: boolean = true) {
  const [cachedEmails, setCachedEmails] = useState<any[] | null>(null);

  useEffect(() => {
    if (!enabled) return;

    emailCache.getCachedEmails(folder).then(setCachedEmails);
  }, [folder, enabled]);

  return cachedEmails;
}

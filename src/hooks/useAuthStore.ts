import { create } from "zustand";
import { getSecondsUntilExpiry } from "@/services/jwt";

interface AuthState {
  accessToken: string | null;
  refreshTimer: NodeJS.Timeout | null;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
  scheduleTokenRefresh: (onRefresh: () => Promise<void>) => void;
  clearRefreshTimer: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshTimer: null,
  
  setAccessToken: (token: string) => set({ accessToken: token }),
  
  clearAccessToken: () => {
    const state = get();
    if (state.refreshTimer) {
      clearTimeout(state.refreshTimer);
    }
    set({ accessToken: null, refreshTimer: null });
  },
  
  scheduleTokenRefresh: (onRefresh: () => Promise<void>) => {
    const state = get();
    
    // Clear existing timer
    if (state.refreshTimer) {
      clearTimeout(state.refreshTimer);
    }
    
    const token = state.accessToken;
    if (!token) return;
    
    const secondsUntilExpiry = getSecondsUntilExpiry(token);
    
    // Refresh 60 seconds before expiry (or immediately if less than 60s left)
    const refreshInSeconds = Math.max(0, secondsUntilExpiry - 60);
    
    if (secondsUntilExpiry > 0) {
      const timer = setTimeout(async () => {
        console.log("🔄 Silent token refresh triggered");
        await onRefresh();
      }, refreshInSeconds * 1000);
      
      set({ refreshTimer: timer });
      console.log(`⏰ Token refresh scheduled in ${refreshInSeconds}s`);
    }
  },
  
  clearRefreshTimer: () => {
    const state = get();
    if (state.refreshTimer) {
      clearTimeout(state.refreshTimer);
      set({ refreshTimer: null });
    }
  },
}));

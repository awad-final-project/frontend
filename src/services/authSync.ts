import { useAuthStore } from "@/hooks/useAuthStore";
import { clearAllTokens } from "./token";

type AuthSyncMessage = 
  | { type: "LOGOUT" }
  | { type: "LOGIN"; accessToken: string }
  | { type: "TOKEN_REFRESH"; accessToken: string };

const CHANNEL_NAME = "auth-sync-channel";

/**
 * BroadcastChannel for cross-tab authentication synchronization
 * Falls back to localStorage events for browsers that don't support BroadcastChannel
 */
class AuthSyncService {
  private channel: BroadcastChannel | null = null;
  private useStorageEvents = false;
  private storageKey = "auth-sync-event";
  
  constructor() {
    // Check if BroadcastChannel is supported
    if (typeof BroadcastChannel !== "undefined") {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        this.handleMessage(event.data);
      };
    } else {
      // Fallback to localStorage events for older browsers
      this.useStorageEvents = true;
      window.addEventListener("storage", this.handleStorageEvent);
    }
  }
  
  private handleMessage = (message: AuthSyncMessage) => {
    const store = useAuthStore.getState();
    
    switch (message.type) {
      case "LOGOUT":
        console.log("📡 [Multi-tab] Logout detected from another tab");
        store.clearAccessToken();
        store.clearRefreshTimer();
        clearAllTokens();
        // Redirect to login if we're not already there
        if (window.location.pathname !== "/log-in" && window.location.pathname !== "/sign-up") {
          window.location.href = "/log-in";
        }
        break;
        
      case "LOGIN":
        console.log("📡 [Multi-tab] Login detected from another tab");
        store.setAccessToken(message.accessToken);
        // Redirect to home if we're on auth pages
        if (window.location.pathname === "/log-in" || window.location.pathname === "/sign-up") {
          window.location.href = "/";
        }
        break;
        
      case "TOKEN_REFRESH":
        console.log("📡 [Multi-tab] Token refresh detected from another tab");
        store.setAccessToken(message.accessToken);
        break;
    }
  };
  
  private handleStorageEvent = (event: StorageEvent) => {
    if (event.key === this.storageKey && event.newValue) {
      try {
        const message = JSON.parse(event.newValue) as AuthSyncMessage;
        this.handleMessage(message);
        // Clean up the storage event trigger
        localStorage.removeItem(this.storageKey);
      } catch {
        // Ignore parse errors
      }
    }
  };
  
  /**
   * Broadcast logout to all tabs
   */
  public broadcastLogout() {
    const message: AuthSyncMessage = { type: "LOGOUT" };
    
    if (this.channel) {
      this.channel.postMessage(message);
    } else if (this.useStorageEvents) {
      // Trigger storage event for other tabs
      localStorage.setItem(this.storageKey, JSON.stringify(message));
      localStorage.removeItem(this.storageKey);
    }
  }
  
  /**
   * Broadcast login to all tabs
   */
  public broadcastLogin(accessToken: string) {
    const message: AuthSyncMessage = { type: "LOGIN", accessToken };
    
    if (this.channel) {
      this.channel.postMessage(message);
    } else if (this.useStorageEvents) {
      localStorage.setItem(this.storageKey, JSON.stringify(message));
      localStorage.removeItem(this.storageKey);
    }
  }
  
  /**
   * Broadcast token refresh to all tabs
   */
  public broadcastTokenRefresh(accessToken: string) {
    const message: AuthSyncMessage = { type: "TOKEN_REFRESH", accessToken };
    
    if (this.channel) {
      this.channel.postMessage(message);
    } else if (this.useStorageEvents) {
      localStorage.setItem(this.storageKey, JSON.stringify(message));
      localStorage.removeItem(this.storageKey);
    }
  }
  
  /**
   * Clean up event listeners
   */
  public destroy() {
    if (this.channel) {
      this.channel.close();
    } else if (this.useStorageEvents) {
      window.removeEventListener("storage", this.handleStorageEvent);
    }
  }
}

// Export a singleton instance
export const authSync = new AuthSyncService();

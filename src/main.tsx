import "./styles/globals.css";
import "./styles/prosemirror.css";

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import { getRefreshToken, refreshAccessToken } from "./services";
import { useToast } from "./hooks/use-toast";
import { useAuthStore } from "./hooks/useAuthStore";
import { ThemeProvider } from "./components/theme-provider";
import { ErrorBoundary } from "./components/ErrorBoundary";

function Boot({ children }: { children: React.ReactNode }) {
  const [booting, setBooting] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        if (getRefreshToken()) {
          const t = await refreshAccessToken();
          if (!t) {
            toast({
              title: "Session expired",
              description: "Please log in again.",
              variant: "destructive",
            });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setBooting(false);
      }
    })();

    // cross-tab logout sync: if refresh token removed in another tab, clear access token here
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "auth_refresh_token" && ev.newValue === null) {
        // clear in-memory token
        useAuthStore.getState().clearAccessToken();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [toast]);

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Starting...</div>
      </div>
    );
  }

  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <Boot>
          <App />
        </Boot>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

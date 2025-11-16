import api, { apiAuth, refreshAccessToken } from "@/services/apiClient";
import { setRefreshToken, clearAllTokens } from "./token";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getErrorMessage } from "./error";
import { authSync } from "./authSync";

export type AuthInfo = {
  accessToken: string;
  refreshToken?: string;
};

type SignInParams = {
  email: string;
  password: string;
};

type SignUpParams = {
  username: string;
  email: string;
  password: string;
};

export type AuthUser = {
  username: string;
  email: string;
  role?: string;
};

// Check if using cookie-based auth
const USE_COOKIES = import.meta.env.VITE_USE_COOKIE_AUTH === "true";

export const signIn = async (params: SignInParams) => {
  try {
    const resp = await apiAuth.post("/login", params);
    const data = resp.data as AuthInfo;
    
    // Only store refresh token if backend sends it (localStorage mode)
    if (data.refreshToken && !USE_COOKIES) {
      setRefreshToken(data.refreshToken);
    }
    
    if (data.accessToken) {
      const store = useAuthStore.getState();
      store.setAccessToken(data.accessToken);
      // Schedule silent refresh before token expires
      store.scheduleTokenRefresh(async () => {
        await refreshAccessToken();
      });
      // Broadcast login to other tabs
      authSync.broadcastLogin(data.accessToken);
    }
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Unable to sign in. Please try again."));
  }
};

export const signUp = async (params: SignUpParams) => {
  try {
    const resp = await apiAuth.post("/register", params);
    return resp.data as AuthInfo;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Unable to sign up. Please try again."));
  }
};

export const signOut = async () => {
  try {
    // optionally inform backend
    await apiAuth.post("/logout");
  } catch {
    // ignore errors during logout call
  }
  clearAllTokens();
  const store = useAuthStore.getState();
  store.clearAccessToken();
  store.clearRefreshTimer();
  // Broadcast logout to other tabs
  authSync.broadcastLogout();
  return Promise.resolve();
};

export const getUser = async () => {
  try {
    const resp = await api.get("/profile");
    return resp.data as AuthUser;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Unable to fetch profile."));
  }
};

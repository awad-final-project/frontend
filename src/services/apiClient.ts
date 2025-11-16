import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getRefreshToken, setRefreshToken, clearAllTokens } from "@/services/token";
import { toast } from "@/hooks/use-toast";
import { authSync } from "./authSync";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Support for httpOnly cookies (backend sets cookies automatically)
const USE_COOKIES = import.meta.env.VITE_USE_COOKIE_AUTH === "true";

// axios instance used for regular API requests (will attach access token)
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: USE_COOKIES, // Enable cookies for cross-origin requests
});

// plain axios for auth actions (login/refresh) to avoid interceptor loops
const apiAuth: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: USE_COOKIES, // Enable cookies for auth requests
});

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  
  // If using cookies, backend will automatically read from httpOnly cookie
  // If using localStorage, we need to send the token in the body
  if (!USE_COOKIES && !refreshToken) return null;

  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      // Send refreshToken only if not using cookies
      const payload = USE_COOKIES ? {} : { refreshToken };
      const resp = await apiAuth.post("/refresh", payload);
      const data = resp.data as { accessToken: string; refreshToken?: string };
      const accessToken = data.accessToken;
      
      // Only store refresh token if backend sends it (localStorage mode)
      if (data.refreshToken && !USE_COOKIES) {
        setRefreshToken(data.refreshToken);
      }
      
      // set in zustand store
      const store = useAuthStore.getState();
      store.setAccessToken(accessToken);
      // Schedule next silent refresh
      store.scheduleTokenRefresh(async () => {
        await refreshAccessToken();
      });
      // Broadcast token refresh to other tabs
      authSync.broadcastTokenRefresh(accessToken);
      return accessToken;
    } catch (e) {
      clearAllTokens();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Attach access token from zustand store to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    // headers is a typed collection on InternalAxiosRequestConfig
    (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: try refresh on 401 and retry original request once
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        if (!originalRequest.headers) originalRequest.headers = {};
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      }
      // refresh failed: clear tokens (logout) and notify user
      clearAllTokens();
      toast({
        title: "Session expired",
        description: "Please log in again.",
        variant: "destructive",
      });
      // redirect to login page
      window.location.href = "/log-in";
    }
    // network error (no response)
    if (!error.response) {
      toast({
        title: "Network error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    }
    return Promise.reject(error);
  }
);

export { apiAuth };
export { refreshAccessToken };
export default api;

const REFRESH_TOKEN_KEY = "auth_refresh_token";

/**
 * Get refresh token from localStorage
 * Note: If backend uses httpOnly cookies, this will return null
 * and the cookie will be sent automatically with requests
 */
export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

/**
 * Set refresh token in localStorage
 * Note: Only use this if backend doesn't use httpOnly cookies
 */
export const setRefreshToken = (token: string) => {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch {}
};

/**
 * Clear refresh token from localStorage
 */
export const clearRefreshToken = () => {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {}
};

/**
 * Clear all tokens (localStorage only, cookies are managed by backend)
 */
export const clearAllTokens = () => {
  clearRefreshToken();
};

export default {
  getRefreshToken,
  setRefreshToken,
  clearRefreshToken,
  clearAllTokens,
};

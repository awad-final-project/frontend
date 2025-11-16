import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  role?: string;
  [key: string]: any;
}

/**
 * Decode a JWT token and return its payload
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 < Date.now();
}

/**
 * Get seconds until token expires
 * Returns 0 if already expired
 */
export function getSecondsUntilExpiry(token: string): number {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return 0;
  
  const expiryTime = decoded.exp * 1000;
  const now = Date.now();
  const secondsLeft = Math.floor((expiryTime - now) / 1000);
  
  return Math.max(0, secondsLeft);
}

/**
 * Check if token will expire soon (within threshold seconds)
 * @param token - JWT token
 * @param thresholdSeconds - seconds before expiry to consider "soon" (default 60s)
 */
export function willExpireSoon(token: string, thresholdSeconds = 60): boolean {
  const secondsLeft = getSecondsUntilExpiry(token);
  return secondsLeft > 0 && secondsLeft <= thresholdSeconds;
}

/**
 * Get user role from token
 */
export function getRoleFromToken(token: string): string | null {
  const decoded = decodeToken(token);
  return decoded?.role || null;
}

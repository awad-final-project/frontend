import { useAuthStore } from "./useAuthStore";
import { getRoleFromToken } from "@/services/jwt";

export type UserRole = "admin" | "user" | "moderator" | string;

/**
 * Hook to get current user's role from access token
 */
export function useUserRole(): string | null {
  const accessToken = useAuthStore((state) => state.accessToken);
  
  if (!accessToken) return null;
  
  return getRoleFromToken(accessToken);
}

/**
 * Hook to check if user has a specific role
 */
export function useHasRole(requiredRole: UserRole): boolean {
  const currentRole = useUserRole();
  
  if (!currentRole) return false;
  
  return currentRole === requiredRole;
}

/**
 * Hook to check if user has any of the specified roles
 */
export function useHasAnyRole(roles: UserRole[]): boolean {
  const currentRole = useUserRole();
  
  if (!currentRole) return false;
  
  return roles.includes(currentRole);
}

/**
 * Check if a token has a specific role (for route guards)
 */
export function hasRole(token: string | null, requiredRole: UserRole): boolean {
  if (!token) return false;
  
  const role = getRoleFromToken(token);
  return role === requiredRole;
}

/**
 * Check if a token has any of the specified roles (for route guards)
 */
export function hasAnyRole(token: string | null, roles: UserRole[]): boolean {
  if (!token) return false;
  
  const role = getRoleFromToken(token);
  return role !== null && roles.includes(role);
}

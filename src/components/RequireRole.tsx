import { useHasRole, useHasAnyRole, type UserRole } from "@/hooks/useRole";
import type { ReactNode } from "react";

interface RequireRoleProps {
  role: UserRole;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that only renders children if user has the required role
 */
export function RequireRole({ role, children, fallback = null }: RequireRoleProps) {
  const hasRole = useHasRole(role);
  
  return hasRole ? <>{children}</> : <>{fallback}</>;
}

interface RequireAnyRoleProps {
  roles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that only renders children if user has any of the required roles
 */
export function RequireAnyRole({ roles, children, fallback = null }: RequireAnyRoleProps) {
  const hasAnyRole = useHasAnyRole(roles);
  
  return hasAnyRole ? <>{children}</> : <>{fallback}</>;
}

import { redirect } from "@tanstack/react-router";
import { getRefreshToken } from "@/services";
import { refreshAccessToken } from "@/services";
import { useAuthStore } from "@/hooks/useAuthStore";
import { hasAnyRole, type UserRole } from "./useRole";

/**
 * Attempt to ensure we have an access token. Returns true if OK.
 * If not authenticated, returns a redirect object for react-router.
 * 
 * @param requiredRoles - Optional array of roles required to access the route
 */
export async function ensureAuthForRoute(requiredRoles?: UserRole[]) {
  try {
    const state = useAuthStore.getState();
    
    // Try to get or refresh access token
    if (!state.accessToken) {
      if (getRefreshToken()) {
        const t = await refreshAccessToken();
        if (!t) {
          return redirect({ to: "/log-in" });
        }
      } else {
        return redirect({ to: "/log-in" });
      }
    }
    
    // Check role if required
    if (requiredRoles && requiredRoles.length > 0) {
      const token = useAuthStore.getState().accessToken;
      if (!hasAnyRole(token, requiredRoles)) {
        console.warn("User does not have required role(s):", requiredRoles);
        // Redirect to unauthorized page or home
        return redirect({ to: "/" });
      }
    }
    
    return true;
  } catch (e) {
    console.error("ensureAuthForRoute error", e);
    return redirect({ to: "/log-in" });
  }
}

export default ensureAuthForRoute;

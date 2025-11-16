import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import ErrorFallback from "@/components/ErrorFallback";
import { ensureAuthForRoute } from "@/hooks/useRequireAuth";

const AuthenticatedPage = () => {
  return <Outlet />;
};

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    try {
      const ok = await ensureAuthForRoute();
      if (ok !== true) return ok; // redirect object
      if (location.pathname === "/log-in" || location.pathname === "/sign-up") {
        return redirect({ to: "/" });
      }
      return true;
    } catch (e) {
      console.error(e);
      return redirect({ to: "/log-in" });
    }
  },
  pendingComponent: () => {
    return <span>Loading Protected</span>;
  },
  errorComponent: (error) => {
    console.error(error);
    return <ErrorFallback />;
  },
  component: AuthenticatedPage,
});

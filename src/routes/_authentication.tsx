import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ensureAuthForRoute } from "@/hooks/useRequireAuth";

export const Route = createFileRoute("/_authentication")({
  beforeLoad: async () => {
    try {
      // If user already authenticated, prevent entering auth pages
      const ok = await ensureAuthForRoute();
      if (ok === true) return redirect({ to: "/" });
      return true;
    } catch (e) {
      console.error(e);
      return redirect({ to: "/log-in" });
    }
  },
  component: AuthLayout,
});

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-[1fr_1fr]">
        <div className="hidden flex-col justify-between border-b border-slate-200 bg-slate-50 p-8 md:flex md:border-b-0 md:border-r">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-slate-900">User portal</h1>
            <p className="text-sm text-muted-foreground">
              Access your home dashboard, update profile information, and manage registration
              details using a focused React Router setup.
            </p>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Home page that greets you after login</li>
            <li>• Login form with validation feedback</li>
            <li>• Sign up form that submits to the API</li>
          </ul>
        </div>
        <div className="flex flex-col justify-center px-6 py-8 sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

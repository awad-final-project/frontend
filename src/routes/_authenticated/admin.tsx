import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSignOut } from "@/hooks/react-query/useAuth";
import { useUserRole } from "@/hooks/useRole";
import { ensureAuthForRoute } from "@/hooks/useRequireAuth";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    // Require 'admin' role to access this route
    const result = await ensureAuthForRoute(["admin"]);
    if (result !== true) return result;
    return true;
  },
  component: AdminPage,
});

function AdminPage() {
  const role = useUserRole();
  const signOutMutation = useSignOut();

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-semibold text-slate-900">
              Admin Dashboard
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              This page is only accessible to users with the 'admin' role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Your Role:</p>
              <p className="text-lg font-semibold text-slate-900">{role || "Unknown"}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-700">Admin Features:</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
                <li>User management</li>
                <li>System configuration</li>
                <li>Analytics and reports</li>
                <li>Role assignment</li>
              </ul>
            </div>

            <Button
              onClick={() => signOutMutation.mutate()}
              variant="outline"
              className="w-full"
            >
              Back to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

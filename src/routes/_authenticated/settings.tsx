import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ensureAuthForRoute } from "@/hooks/useRequireAuth";
import { ArrowLeft, Mail, RefreshCw, Database, User as UserIcon, Settings as SettingsIcon } from "lucide-react";
import { useSeedMockEmails } from "@/hooks/react-query/useEmails";
import { useUserProfile } from "@/hooks/react-query/useAuth";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_authenticated/settings")({
  beforeLoad: async () => {
    const result = await ensureAuthForRoute();
    if (result !== true) return result;
    return true;
  },
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const seedMutation = useSeedMockEmails();
  const { data: profile } = useUserProfile();

  const handleSeedEmails = () => {
    seedMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        {/* Header with navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/inbox' })}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-slate-200 bg-white">
                <SettingsIcon className="h-6 w-6 text-slate-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your email preferences</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Account Information</CardTitle>
            <CardDescription>Your current account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">Email Address</span>
              <span className="text-sm text-muted-foreground">{profile?.email || 'Loading...'}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">Username</span>
              <span className="text-sm text-muted-foreground">{profile?.username || 'Loading...'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Email Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-slate-700" />
              <CardTitle className="text-lg font-semibold">Email Management</CardTitle>
            </div>
            <CardDescription>Manage your emails and inbox</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-slate-700 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">Seed Mock Emails</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Generate 30 sample emails in your inbox for testing purposes. This will create mock emails with realistic content.
                  </p>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handleSeedEmails}
                    disabled={seedMutation.isPending}
                  >
                    {seedMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Seeding...
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" />
                        Seed Emails
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Email Preferences</CardTitle>
            <CardDescription>Customize your email experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive notifications for new emails</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Auto Mark as Read</p>
                <p className="text-xs text-muted-foreground">Automatically mark emails as read when viewed</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Default Folder</p>
                <p className="text-xs text-muted-foreground">Set your default inbox folder</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button 
              variant="outline"
              onClick={() => navigate({ to: '/inbox' })}
            >
              <Mail className="mr-2 h-4 w-4" />
              Back to Inbox
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate({ to: '/profile' })}
            >
              <UserIcon className="mr-2 h-4 w-4" />
              View Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

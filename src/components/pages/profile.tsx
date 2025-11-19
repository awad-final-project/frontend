import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, ArrowLeft, Shield, User as UserIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate } from "@tanstack/react-router";

import { Input } from "@/components/ui/input";
import { useSignOut, useUserProfile } from "@/hooks/react-query/useAuth";
import { useUserRole } from "@/hooks/useRole";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1, "Username must be at least 1 characters long"),
});

type FormInputs = z.infer<typeof formSchema>;

export default function ProfilePage() {
  const navigate = useNavigate();
  const form = useForm<FormInputs>({
    defaultValues: {
      email: "",
      username: "",
    },
    resolver: zodResolver(formSchema),
  });
  const signOutMutation = useSignOut();
  const { data, isError, error, isLoading, isSuccess, refetch, isFetching } = useUserProfile();
  const userRole = useUserRole();

  function onSubmit(_: FormInputs) {
    signOutMutation.mutate();
  }

  useEffect(() => {
    if (isSuccess && data) {
      form.reset(data);
    }
  }, [data, form, isSuccess]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
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
                <UserIcon className="h-6 w-6 text-slate-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                <p className="text-sm text-muted-foreground">View your account information</p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">Account Details</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Your account information is read-only
                </CardDescription>
              </div>
              {userRole && (
                <Badge 
                  variant={userRole === 'admin' ? 'default' : 'secondary'}
                >
                  {userRole === 'admin' && <Shield className="mr-1 h-3 w-3" />}
                  {userRole.toUpperCase()}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="example@gmail.com"
                            error={Boolean(form.formState.errors.email)}
                            {...field}
                            onChange={field.onChange}
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Username"
                            error={Boolean(form.formState.errors.username)}
                            {...field}
                            onChange={field.onChange}
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate({ to: '/inbox' })}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Back to Inbox
                    </Button>
                    <Button
                      type="submit"
                      variant="destructive"
                      className="flex-1"
                      disabled={signOutMutation.isPending}
                    >
                      {signOutMutation.isPending && (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      )}
                      Logout
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {isError && (
          <Card className="border border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-red-600">
                Unable to load profile
              </CardTitle>
              <CardDescription className="text-sm text-red-600/80">
                {error instanceof Error
                  ? error.message
                  : "We couldn't retrieve your details. Please try again."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? "Retrying..." : "Try again"}
              </Button>
              <Button variant="outline" onClick={() => signOutMutation.mutate()}>
                Back to login
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

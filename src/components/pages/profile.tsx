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
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
    <div className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold text-slate-900">Profile</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Your account details are read-only. Update them from the backend if needed.
            </CardDescription>
            {userRole && (
              <div className="mt-2 flex justify-center">
                <Badge variant="secondary" className="text-xs">
                  Role: {userRole}
                </Badge>
              </div>
            )}
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
                  <Button
                    type="submit"
                    variant="destructive"
                    className="w-full"
                    disabled={signOutMutation.isPending}
                  >
                    {signOutMutation.isPending && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    Log out
                  </Button>
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

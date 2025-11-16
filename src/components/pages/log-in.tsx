import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { Loader2, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Input } from "@/components/ui/input";
import { GoogleButton } from "@/components/ui/google-button";
import { Separator } from "@/components/ui/separator";
import { useSignIn } from "@/hooks/react-query/useAuth";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type FormInputs = z.infer<typeof formSchema>;

export default function LogInPage() {
  const form = useForm<FormInputs>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(formSchema),
  });
  const signInMutation = useSignIn();

  function onSubmit(data: FormInputs) {
    signInMutation.mutate(data);
  }

  return (
    <Card className="mx-auto w-full max-w-md border border-slate-200 shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold text-slate-900">Log in</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your registered email and password to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
          <GoogleButton />
          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground">
              OR
            </span>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-800">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="example@gmail.com"
                          error={Boolean(form.formState.errors.email)}
                          className="pl-10"
                          {...field}
                          onChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-800">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="••••••••"
                          error={Boolean(form.formState.errors.password)}
                          {...field}
                          type="password"
                          className="pl-10"
                          onChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={signInMutation.isPending}>
                {signInMutation.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin text-white" />
                )}
                Log in
              </Button>
            </form>
          </Form>
        </CardContent>
      <CardFooter className="text-center text-sm text-muted-foreground">
          Don't have an account?
          <Link to="/sign-up" className="ml-1 font-medium text-primary hover:underline">
            Sign up
          </Link>
        </CardFooter>
    </Card>
  );
}

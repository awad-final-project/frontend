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
import { Loader2, Lock, Mail, User } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Input } from "@/components/ui/input";
import { GoogleButton } from "@/components/ui/google-button";
import { Separator } from "@/components/ui/separator";
import { useSignUp } from "@/hooks/react-query/useAuth";

const formSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters long"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      return ctx.addIssue({
        message: "Passwords do not match",
        path: ["confirmPassword"],
        code: "custom",
      });
    }
    return true;
  });

type FormInputs = z.infer<typeof formSchema>;

export default function SignUpPage() {
  const form = useForm<FormInputs>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(formSchema),
  });
  const signUpMutation = useSignUp();

  function onSubmit(data: FormInputs) {
    signUpMutation.mutate({
      username: data.username,
      email: data.email,
      password: data.password,
    });
  }

  return (
    <Card className="mx-auto w-full max-w-md border border-slate-200 shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold text-slate-900">Create an account</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Fill in the fields below to register a new user.</CardDescription>
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
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-800">
                      Username<span className="ml-1 text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Your display name"
                          error={Boolean(form.formState.errors.username)}
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-800">
                      Email<span className="ml-1 text-destructive">*</span>
                    </FormLabel>
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
                    <FormLabel className="text-sm font-medium text-slate-800">
                      Password<span className="ml-1 text-destructive">*</span>
                    </FormLabel>
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-800">
                      Confirm password<span className="ml-1 text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Repeat your password"
                          error={Boolean(form.formState.errors.confirmPassword)}
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
              <Button type="submit" className="w-full" disabled={signUpMutation.isPending}>
                {signUpMutation.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin text-white" />
                )}
                Create account
              </Button>
            </form>
          </Form>
        </CardContent>
      <CardFooter className="text-center text-sm text-muted-foreground">
          Already have an account?
          <Link to="/log-in" className="ml-1 font-medium text-primary hover:underline">
            Log in
          </Link>
        </CardFooter>
    </Card>
  );
}

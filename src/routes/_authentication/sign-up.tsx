import { createFileRoute } from "@tanstack/react-router";

import SignUpPage from "@/components/pages/sign-up";

export const Route = createFileRoute("/_authentication/sign-up")({
  component: SignUpPage,
});

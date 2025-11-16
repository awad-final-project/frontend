import { createFileRoute } from "@tanstack/react-router";

import ProfilePage from "@/components/pages/profile";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

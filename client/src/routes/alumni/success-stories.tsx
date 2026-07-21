import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alumni/success-stories")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/admin/alumni/stories" });
  },
});
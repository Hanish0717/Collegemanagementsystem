import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alumni/mentorship")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/admin/alumni/mentorship" });
  },
});
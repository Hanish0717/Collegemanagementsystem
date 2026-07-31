import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/student/updates")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/student/notifications" });
  },
});

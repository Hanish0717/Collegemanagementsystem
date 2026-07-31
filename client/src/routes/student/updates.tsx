import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/student/updates")({
  beforeLoad: () => {
    throw redirect({ to: "/student/notifications" });
  },
});

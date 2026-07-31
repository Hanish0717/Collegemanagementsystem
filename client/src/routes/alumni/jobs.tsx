import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alumni/jobs")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/alumni/jobs" });
  },
});
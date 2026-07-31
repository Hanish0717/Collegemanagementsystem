import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alumni/events/$eventId")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/alumni/events" });
  },
});
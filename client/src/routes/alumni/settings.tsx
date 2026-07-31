import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alumni/settings")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/alumni/settings" });
  },
});
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alumni/profile/$id")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/alumni/profile" });
  },
});
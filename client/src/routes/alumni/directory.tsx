import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alumni/directory")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/alumni/directory" });
  },
});
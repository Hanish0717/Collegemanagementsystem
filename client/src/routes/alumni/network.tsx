import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alumni/network")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/alumni/networking" });
  },
});
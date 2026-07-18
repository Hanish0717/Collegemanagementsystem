import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alumni/registration")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/admin/alumni/registration" });
  },
});
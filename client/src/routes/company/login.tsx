import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/company/login")({
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
});



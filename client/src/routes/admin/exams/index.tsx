import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/exams/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/exams/schedule" });
  },
});

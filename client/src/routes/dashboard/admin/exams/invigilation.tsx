import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/admin/exams/invigilation")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/admin/exams/timetable" });
  },
});

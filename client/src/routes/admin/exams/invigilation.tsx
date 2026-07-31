import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/exams/invigilation")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/exams/timetable" });
  },
});

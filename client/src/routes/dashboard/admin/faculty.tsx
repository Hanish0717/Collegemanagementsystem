import { createFileRoute } from "@tanstack/react-router";
import { AdminFaculty } from "@/pages/admin/AdminFaculty";

export const Route = createFileRoute("/dashboard/admin/faculty")({
  component: AdminFaculty,
});

import { createFileRoute } from "@tanstack/react-router";
import { FacultyLeave } from "@/pages/faculty/FacultyLeave";

export const Route = createFileRoute("/dashboard/faculty/leave")({
  component: FacultyLeave,
});

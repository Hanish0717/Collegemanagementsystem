import { createFileRoute } from "@tanstack/react-router";
import { HostelStudents } from "@/pages/hostel/HostelStudents";

export const Route = createFileRoute("/dashboard/hostel/students")({
  component: HostelStudents,
});

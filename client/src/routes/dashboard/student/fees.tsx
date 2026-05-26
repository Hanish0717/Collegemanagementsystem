import { createFileRoute } from "@tanstack/react-router";
import { StudentFees } from "@/pages/student/StudentFees";

export const Route = createFileRoute("/dashboard/student/fees")({
  component: StudentFees,
});

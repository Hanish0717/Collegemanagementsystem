import { createFileRoute } from "@tanstack/react-router";
import { StudentNoticeBoard } from "@/pages/student/StudentNoticeBoard";

export const Route = createFileRoute("/dashboard/student/notices")({
  component: StudentNoticeBoard,
});

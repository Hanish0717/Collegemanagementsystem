import { createFileRoute } from "@tanstack/react-router";
import { CourseRegistration } from "@/pages/admin/exams/CourseRegistration";

export const Route = createFileRoute("/admin/exams/course-registration")({
  component: CourseRegistration,
});

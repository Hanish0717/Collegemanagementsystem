import { createFileRoute } from "@tanstack/react-router";
import { StudentCourseRegistration } from "@/pages/student/StudentCourseRegistration";

export const Route = createFileRoute("/dashboard/student/course-registration")({
  component: StudentCourseRegistration,
});

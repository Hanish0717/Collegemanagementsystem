import { createFileRoute } from "@tanstack/react-router";
import { StudentCourseRegistration } from "@/pages/student/StudentCourseRegistration";

export const Route = createFileRoute("/student/course-registration")({
  component: StudentCourseRegistration,
});

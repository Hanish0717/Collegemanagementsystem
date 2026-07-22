import { createFileRoute } from "@tanstack/react-router";
import { StudentPlatformUpdates } from "@/pages/student/StudentPlatformUpdates";

export const Route = createFileRoute("/dashboard/student/updates")({
  component: StudentPlatformUpdates,
});

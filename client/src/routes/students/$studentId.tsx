import { createFileRoute } from "@tanstack/react-router";
import { StudentProfilePage } from "@/pages/dashboard/StudentProfilePage";

export const Route = createFileRoute("/students/$studentId")({
  component: () => {
    const { studentId } = Route.useParams();
    return <StudentProfilePage studentId={studentId} />;
  },
});
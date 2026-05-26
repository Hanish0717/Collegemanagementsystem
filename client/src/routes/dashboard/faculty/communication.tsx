import { createFileRoute } from "@tanstack/react-router";
import { FacultyCommunication } from "@/pages/faculty/FacultyCommunication";

export const Route = createFileRoute("/dashboard/faculty/communication")({
  component: FacultyCommunication,
});

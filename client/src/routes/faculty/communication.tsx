import { createFileRoute } from "@tanstack/react-router";
import { FacultyCommunication } from "@/pages/faculty/FacultyCommunication";

export const Route = createFileRoute("/faculty/communication")({
  component: FacultyCommunication,
});

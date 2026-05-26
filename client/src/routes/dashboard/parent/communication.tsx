import { createFileRoute } from "@tanstack/react-router";
import { ParentCommunication } from "@/pages/parent/ParentCommunication";

export const Route = createFileRoute("/dashboard/parent/communication")({
  component: ParentCommunication,
});

import { createFileRoute } from "@tanstack/react-router";
import { ParentCommunication } from "@/pages/parent/ParentCommunication";

export const Route = createFileRoute("/parent/communication")({
  component: ParentCommunication,
});

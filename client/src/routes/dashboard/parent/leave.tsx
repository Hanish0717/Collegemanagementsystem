import { createFileRoute } from "@tanstack/react-router";
import { ParentLeave } from "@/pages/parent/ParentLeave";

export const Route = createFileRoute("/dashboard/parent/leave")({
  component: ParentLeave,
});

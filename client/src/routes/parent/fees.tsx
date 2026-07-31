import { createFileRoute } from "@tanstack/react-router";
import { ParentFees } from "@/pages/parent/ParentFees";

export const Route = createFileRoute("/parent/fees")({
  component: ParentFees,
});

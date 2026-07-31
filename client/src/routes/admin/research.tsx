import { createFileRoute } from "@tanstack/react-router";
import { AdminResearch } from "@/pages/admin/AdminResearch";

export const Route = createFileRoute("/admin/research")({
  component: AdminResearch,
});

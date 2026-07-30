import { createFileRoute } from "@tanstack/react-router";
import { AdminResearch } from '@/modules/admin/pages/AdminResearchPage';

export const Route = createFileRoute("/dashboard/admin/research")({
  component: AdminResearch,
});

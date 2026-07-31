import { createFileRoute } from "@tanstack/react-router";
import { FeesPage } from "@/pages/dashboard/FeesPage";

export const Route = createFileRoute("/fees")({
  component: FeesPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { AIFeaturesPage } from "@/pages/admin/alumni/AIFeaturesPage";

export const Route = createFileRoute("/dashboard/admin/alumni/ai-features")({
  component: AIFeaturesPage,
});

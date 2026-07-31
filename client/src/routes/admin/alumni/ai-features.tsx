import { createFileRoute } from "@tanstack/react-router";
import { AIFeaturesPage } from "@/pages/admin/alumni/AIFeaturesPage";

export const Route = createFileRoute("/admin/alumni/ai-features")({
  component: AIFeaturesPage,
});

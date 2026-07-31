import { createFileRoute } from "@tanstack/react-router";
import { StoriesPage } from "@/pages/admin/alumni/StoriesPage";

export const Route = createFileRoute("/admin/alumni/stories")({
  component: StoriesPage,
});

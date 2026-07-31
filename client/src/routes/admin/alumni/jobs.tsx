import { createFileRoute } from "@tanstack/react-router";
import { JobsPage } from "@/pages/admin/alumni/JobsPage";

export const Route = createFileRoute("/admin/alumni/jobs")({
  component: JobsPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { HelpPage } from "@/pages/admin/alumni/HelpPage";

export const Route = createFileRoute("/admin/alumni/help")({
  component: HelpPage,
});

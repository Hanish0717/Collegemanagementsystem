import { createFileRoute } from "@tanstack/react-router";
import { LibraryDashboard } from "@/pages/library/LibraryDashboard";

export const Route = createFileRoute("/dashboard/library")({
  component: LibraryDashboard,
});

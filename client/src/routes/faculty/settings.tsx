import { createFileRoute } from "@tanstack/react-router";
import { FacultySettings } from "@/pages/faculty/FacultySettings";

export const Route = createFileRoute("/faculty/settings")({
  component: FacultySettings,
});

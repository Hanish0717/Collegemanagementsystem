import { createFileRoute } from "@tanstack/react-router";
import { MentorshipPage } from "@/pages/admin/alumni/MentorshipPage";

export const Route = createFileRoute("/admin/alumni/mentorship")({
  component: MentorshipPage,
});

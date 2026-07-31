import { createFileRoute } from "@tanstack/react-router";
import { VerificationPage } from "@/pages/admin/alumni/VerificationPage";

export const Route = createFileRoute("/admin/alumni/verification")({
  component: VerificationPage,
});

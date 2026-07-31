import { createFileRoute } from "@tanstack/react-router";
import { AdminAccreditation } from "@/pages/admin/AdminAccreditation";

export const Route = createFileRoute("/admin/accreditation")({
  component: AdminAccreditation,
});

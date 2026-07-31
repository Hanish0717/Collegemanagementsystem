import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminAdmins } from "@/pages/superAdmin/SuperAdminAdmins";

export const Route = createFileRoute("/super-admin/admins")({
  component: SuperAdminAdmins,
});

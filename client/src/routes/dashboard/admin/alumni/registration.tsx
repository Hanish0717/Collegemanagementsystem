import { createFileRoute } from "@tanstack/react-router";
import { RegistrationPage } from '@/pages/admin/alumni/RegistrationPage';

export const Route = createFileRoute("/dashboard/admin/alumni/registration")({
  component: RegistrationPage,
});

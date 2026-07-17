import { createFileRoute } from '@tanstack/react-router';
import { LMSLogin } from '@/pages/auth/LMSLogin';

export const Route = createFileRoute('/lms-login')({
  component: LMSLogin,
});

import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/faculty/attendance-warnings')({
  beforeLoad: () => {
    throw redirect({ to: '/dashboard/faculty/attendance' });
  },
});

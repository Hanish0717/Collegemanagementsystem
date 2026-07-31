import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/faculty/attendance-warnings')({
  beforeLoad: () => {
    throw redirect({ to: '/faculty/attendance' });
  },
});

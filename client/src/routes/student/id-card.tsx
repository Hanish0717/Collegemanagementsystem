import { createFileRoute } from '@tanstack/react-router';
import { StudentIdCard } from '@/pages/student/StudentIdCard';

export const Route = createFileRoute('/student/id-card')({
  component: StudentIdCard,
});

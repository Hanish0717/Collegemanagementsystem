import { createFileRoute } from '@tanstack/react-router';
import { ExaminationControlModule } from '@/pages/exam/ExaminationControlModule';

export const Route = createFileRoute('/dashboard/exam')({
  component: ExaminationControlModule,
});

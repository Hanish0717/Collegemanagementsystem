import { createFileRoute } from '@tanstack/react-router';
import { ExaminationControlModule } from '@/pages/exam/ExaminationControlModule';

export const Route = createFileRoute('/exam')({
  component: ExaminationControlModule,
});

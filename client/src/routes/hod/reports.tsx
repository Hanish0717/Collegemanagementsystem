import { createFileRoute } from '@tanstack/react-router';
import { HODReportsPage } from '@/modules/hod/pages/HODReportsPage';
export const Route = createFileRoute('/hod/reports')({ component: HODReportsPage });

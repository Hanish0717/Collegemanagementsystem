import { createFileRoute } from '@tanstack/react-router';
import { HODAuditPage } from '@/modules/hod/pages/HODAuditPage';
export const Route = createFileRoute('/hod/audit')({ component: HODAuditPage });

import { createFileRoute } from '@tanstack/react-router';
import { HODApprovalsPage } from '@/modules/hod/pages/HODApprovalsPage';
export const Route = createFileRoute('/hod/approvals')({ component: HODApprovalsPage });

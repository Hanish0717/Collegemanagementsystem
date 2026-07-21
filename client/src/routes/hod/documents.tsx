import { createFileRoute } from '@tanstack/react-router';
import { HODDocumentsPage } from '@/modules/hod/pages/HODDocumentsPage';
export const Route = createFileRoute('/hod/documents')({ component: HODDocumentsPage });

import { createFileRoute } from '@tanstack/react-router';
import { DirectoryPage } from '@/pages/admin/alumni/DirectoryPage';

export const Route = createFileRoute('/dashboard/admin/alumni/directory')({
  component: DirectoryPage,
});

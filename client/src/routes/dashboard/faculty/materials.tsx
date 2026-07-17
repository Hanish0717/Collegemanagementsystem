import { createFileRoute } from '@tanstack/react-router';
import { FacultyMaterials } from '@/pages/faculty/FacultyMaterials';

export const Route = createFileRoute('/dashboard/faculty/materials')({
  component: FacultyMaterials,
});

import { createFileRoute } from '@tanstack/react-router';
import { HODSubModulePage } from '@/modules/hod/pages/HODSubModulePage';
import { UserCheck } from 'lucide-react';

const editStudentConfig = {
  slug: 'students-edit',
  title: 'Edit Department Student',
  subtitle: 'Update section allocation, batch info, or parent contact details for department students.',
  icon: UserCheck,
  stats: [],
  sampleData: [],
  columns: [],
};

export const Route = createFileRoute('/hod/students/edit')({
  component: () => <HODSubModulePage config={editStudentConfig} />,
});

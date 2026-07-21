import { createFileRoute } from '@tanstack/react-router';
import { HODSubModulePage } from '@/modules/hod/pages/HODSubModulePage';
import { UserPlus, Shield } from 'lucide-react';

const addStudentConfig = {
  slug: 'students-add',
  title: 'Add Department Student',
  subtitle: 'Enroll a new student profile into the isolated department database.',
  icon: UserPlus,
  stats: [],
  sampleData: [],
  columns: [],
};

export const Route = createFileRoute('/hod/students/add')({
  component: () => <HODSubModulePage config={addStudentConfig} />,
});

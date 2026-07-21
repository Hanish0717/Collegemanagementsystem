import { createFileRoute } from '@tanstack/react-router';
import { HODSubModulePage } from '@/modules/hod/pages/HODSubModulePage';
import { Clock, CalendarCheck, Building2, Layers } from 'lucide-react';

const timetableConfig = {
  slug: 'timetable',
  title: 'Department Timetable & Schedules',
  subtitle: 'Master weekly schedules, room allocations, lab slot reservations, and faculty substitute assignments.',
  icon: Clock,
  stats: [
    { label: 'Weekly Class Slots', value: 160, subtitle: 'Sem 1, 3, 5, 7 Sections', icon: Clock, color: 'blue' },
    { label: 'Lab Hours Scheduled', value: '48 hrs/wk', subtitle: '6 AI/ML specialized labs', icon: Building2, color: 'purple' },
    { label: 'Timetable Status', value: 'Approved', subtitle: 'BOS & Dean Signed', icon: CalendarCheck, color: 'emerald' },
    { label: 'Substitute Slots Logged', value: 2, subtitle: 'Faculty on leave today', icon: Layers, color: 'amber' },
  ],
  sampleData: [
    { id: 'TT-001', day: 'Monday', period: 'Period 1 (09:00 AM - 10:00 AM)', course: 'Deep Learning', sem: 'Sem 5 Sec A', room: 'LH-301', faculty: 'Dr. Ramesh Kumar' },
    { id: 'TT-002', day: 'Monday', period: 'Period 2 & 3 (10:00 AM - 12:00 PM)', course: 'Computer Vision Lab', sem: 'Sem 5 Sec B', room: 'AI Lab 2', faculty: 'Prof. Vikram Rathore' },
    { id: 'TT-003', day: 'Tuesday', period: 'Period 4 (01:00 PM - 02:00 PM)', course: 'NLP & LLMs', sem: 'Sem 5 Sec A', room: 'LH-302', faculty: 'Prof. Sneha Verma' },
  ],
  columns: [
    { key: 'day', header: 'Day', render: (i: any) => <span className="font-bold text-slate-900 dark:text-white">{i.day}</span> },
    { key: 'period', header: 'Time Slot', render: (i: any) => <span className="font-mono text-xs text-blue-600">{i.period}</span> },
    { key: 'course', header: 'Course / Lab', render: (i: any) => <span className="font-extrabold text-slate-800 dark:text-slate-200">{i.course}</span> },
    { key: 'sem', header: 'Class Cohort', render: (i: any) => <span className="font-semibold text-purple-600">{i.sem}</span> },
    { key: 'room', header: 'Room / Lab', render: (i: any) => <span className="font-bold text-emerald-600">{i.room}</span> },
    { key: 'faculty', header: 'Faculty', render: (i: any) => <span className="font-medium text-slate-600">{i.faculty}</span> },
  ],
};

export const Route = createFileRoute('/hod/timetable')({
  component: () => <HODSubModulePage config={timetableConfig} />,
});

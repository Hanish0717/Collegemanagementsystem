import { createFileRoute } from '@tanstack/react-router';
import { HODSubModulePage } from '@/modules/hod/pages/HODSubModulePage';
import { MessageSquare, Send, Bell, Users } from 'lucide-react';

const communicationConfig = {
  slug: 'communication',
  title: 'Department Communication Center',
  subtitle: 'Send official department circulars, email broadcasts to AIML students or faculty, and SMS alerts.',
  icon: MessageSquare,
  stats: [
    { label: 'Broadcast Notices Sent', value: 18, subtitle: 'This semester', icon: Send, color: 'blue' },
    { label: 'Recipient Reach', value: 504, subtitle: '480 Students + 24 Faculty', icon: Users, color: 'purple' },
    { label: 'Delivered Circulars', value: '100%', subtitle: 'Email & In-App Notification', icon: Bell, color: 'emerald' },
  ],
  sampleData: [
    { id: 'COM-001', title: 'Schedule for Mid-Term 2 Examination', target: 'All AIML Students', channel: 'Email & Portal Notice', date: '2026-07-15', status: 'Sent' },
    { id: 'COM-002', title: 'Urgent Department Faculty Meeting Notification', target: 'AIML Faculty Only', channel: 'SMS & Email', date: '2026-07-10', status: 'Sent' },
  ],
  columns: [
    { key: 'id', header: 'Circular Ref', render: (i: any) => <span className="font-mono font-bold text-blue-600">{i.id}</span> },
    { key: 'title', header: 'Notice Subject', render: (i: any) => <span className="font-extrabold text-slate-900 dark:text-white">{i.title}</span> },
    { key: 'target', header: 'Recipient Group', render: (i: any) => <span className="font-semibold text-purple-600">{i.target}</span> },
    { key: 'channel', header: 'Dispatch Channel', render: (i: any) => <span className="text-xs font-bold text-slate-600">{i.channel}</span> },
    { key: 'date', header: 'Date Broadcasted', render: (i: any) => <span className="font-medium text-slate-500">{i.date}</span> },
    { key: 'status', header: 'Status', render: (i: any) => <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">{i.status}</span> },
  ],
};

export const Route = createFileRoute('/hod/communication')({
  component: () => <HODSubModulePage config={communicationConfig} />,
});

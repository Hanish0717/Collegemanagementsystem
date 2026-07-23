import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { HODSubModulePage } from '@/modules/hod/pages/HODSubModulePage';
import { useHODDepartment } from '@/modules/hod/hooks/useHODDepartment';
import { Clock, CalendarCheck, Building2, Layers } from 'lucide-react';

function HODTimetableComponent() {
  const { departmentCode, departmentInfo } = useHODDepartment();
  const code = (departmentCode || 'AIML').toUpperCase();

  const branchTimetable: Record<string, { labSubtitle: string; data: any[] }> = {
    MECH: {
      labSubtitle: '6 Mechanical & Thermal Labs',
      data: [
        { id: 'TT-M01', day: 'Monday', period: 'Period 1 (09:00 AM - 10:00 AM)', course: 'Thermodynamics & Heat Transfer', sem: 'Sem 5 Sec A', room: 'LH-401', faculty: 'Dr. Vikram Rathore' },
        { id: 'TT-M02', day: 'Monday', period: 'Period 2 & 3 (10:00 AM - 12:00 PM)', course: 'CAD/CAM & CNC Lab', sem: 'Sem 5 Sec B', room: 'CAM Lab 1', faculty: 'Prof. R. P. Singh' },
        { id: 'TT-M03', day: 'Tuesday', period: 'Period 4 (01:00 PM - 02:00 PM)', course: 'Fluid Mechanics & Hydraulics', sem: 'Sem 5 Sec A', room: 'LH-402', faculty: 'Prof. Amit Shah' },
      ],
    },
    EEE: {
      labSubtitle: '6 High Voltage & Power Systems Labs',
      data: [
        { id: 'TT-E01', day: 'Monday', period: 'Period 1 (09:00 AM - 10:00 AM)', course: 'Power Systems & Smart Grid', sem: 'Sem 5 Sec A', room: 'LH-301', faculty: 'Dr. Suresh Varma' },
        { id: 'TT-E02', day: 'Monday', period: 'Period 2 & 3 (10:00 AM - 12:00 PM)', course: 'Electrical Machines II Lab', sem: 'Sem 5 Sec B', room: 'Machines Lab 2', faculty: 'Prof. M. K. Chawla' },
        { id: 'TT-E03', day: 'Tuesday', period: 'Period 4 (01:00 PM - 02:00 PM)', course: 'Control Systems & Automation', sem: 'Sem 5 Sec A', room: 'LH-302', faculty: 'Prof. Kavita Rao' },
      ],
    },
    ECE: {
      labSubtitle: '6 VLSI & Embedded Systems Labs',
      data: [
        { id: 'TT-EC01', day: 'Monday', period: 'Period 1 (09:00 AM - 10:00 AM)', course: 'Digital Signal Processing', sem: 'Sem 5 Sec A', room: 'LH-201', faculty: 'Dr. V. K. Sharma' },
        { id: 'TT-EC02', day: 'Monday', period: 'Period 2 & 3 (10:00 AM - 12:00 PM)', course: 'Microprocessors & Embedded Lab', sem: 'Sem 5 Sec B', room: 'Embedded Lab 1', faculty: 'Prof. Priya Nambiar' },
        { id: 'TT-EC03', day: 'Tuesday', period: 'Period 4 (01:00 PM - 02:00 PM)', course: 'Antennas & Wave Propagation', sem: 'Sem 5 Sec A', room: 'LH-202', faculty: 'Dr. S. K. Gupta' },
      ],
    },
    CSE: {
      labSubtitle: '6 Software & Systems Labs',
      data: [
        { id: 'TT-C01', day: 'Monday', period: 'Period 1 (09:00 AM - 10:00 AM)', course: 'Data Structures & Algorithms', sem: 'Sem 5 Sec A', room: 'LH-101', faculty: 'Dr. Anjali Mehra' },
        { id: 'TT-C02', day: 'Monday', period: 'Period 2 & 3 (10:00 AM - 12:00 PM)', course: 'Operating Systems Kernel Lab', sem: 'Sem 5 Sec B', room: 'OS Lab 2', faculty: 'Prof. Rajesh Kumar' },
        { id: 'TT-C03', day: 'Tuesday', period: 'Period 4 (01:00 PM - 02:00 PM)', course: 'Computer Networks & Security', sem: 'Sem 5 Sec A', room: 'LH-102', faculty: 'Prof. Sunita Reddy' },
      ],
    },
    CIVIL: {
      labSubtitle: '5 Structural & Geotechnical Labs',
      data: [
        { id: 'TT-CV01', day: 'Monday', period: 'Period 1 (09:00 AM - 10:00 AM)', course: 'Structural Analysis & Design', sem: 'Sem 5 Sec A', room: 'LH-501', faculty: 'Dr. Rajesh Gupta' },
        { id: 'TT-CV02', day: 'Monday', period: 'Period 2 & 3 (10:00 AM - 12:00 PM)', course: 'Geotechnical & Soil Testing Lab', sem: 'Sem 5 Sec B', room: 'Soil Lab 1', faculty: 'Prof. Meenakshi Sundaram' },
      ],
    },
    IT: {
      labSubtitle: '5 Cloud & DevOps Labs',
      data: [
        { id: 'TT-IT01', day: 'Monday', period: 'Period 1 (09:00 AM - 10:00 AM)', course: 'Cloud Computing & DevOps', sem: 'Sem 5 Sec A', room: 'LH-601', faculty: 'Dr. Neha Sharma' },
        { id: 'TT-IT02', day: 'Monday', period: 'Period 2 & 3 (10:00 AM - 12:00 PM)', course: 'Cyber Security & Cryptography Lab', sem: 'Sem 5 Sec B', room: 'Security Lab 1', faculty: 'Prof. Aravind Swamy' },
      ],
    },
    AIML: {
      labSubtitle: '6 AI/ML specialized labs',
      data: [
        { id: 'TT-001', day: 'Monday', period: 'Period 1 (09:00 AM - 10:00 AM)', course: 'Deep Learning & Neural Networks', sem: 'Sem 5 Sec A', room: 'LH-301', faculty: 'Dr. Ramesh Kumar' },
        { id: 'TT-002', day: 'Monday', period: 'Period 2 & 3 (10:00 AM - 12:00 PM)', course: 'Computer Vision Lab', sem: 'Sem 5 Sec B', room: 'AI Lab 2', faculty: 'Prof. Vikram Rathore' },
        { id: 'TT-003', day: 'Tuesday', period: 'Period 4 (01:00 PM - 02:00 PM)', course: 'NLP & LLMs', sem: 'Sem 5 Sec A', room: 'LH-302', faculty: 'Prof. Sneha Verma' },
      ],
    },
  };

  const branchInfo = branchTimetable[code] || branchTimetable['AIML'];

  const timetableConfig = {
    slug: 'timetable',
    title: `${departmentInfo.shortName} Timetable & Master Schedules`,
    subtitle: `Weekly class slots, lab room reservations, and faculty timetable allocations for ${departmentInfo.name}.`,
    icon: Clock,
    stats: [
      { label: 'Weekly Class Slots', value: 160, subtitle: 'Sem 1, 3, 5, 7 Sections', icon: Clock, color: 'blue' },
      { label: 'Lab Hours Scheduled', value: '48 hrs/wk', subtitle: branchInfo.labSubtitle, icon: Building2, color: 'purple' },
      { label: 'Timetable Status', value: 'Approved', subtitle: 'BOS & Dean Signed', icon: CalendarCheck, color: 'emerald' },
      { label: 'Substitute Slots Logged', value: 2, subtitle: 'Faculty on leave today', icon: Layers, color: 'amber' },
    ],
    sampleData: branchInfo.data,
    columns: [
      { key: 'day', header: 'Day', render: (i: any) => <span className="font-bold text-slate-900 dark:text-white">{i.day}</span> },
      { key: 'period', header: 'Time Slot', render: (i: any) => <span className="font-mono text-xs text-blue-600 dark:text-blue-400">{i.period}</span> },
      { key: 'course', header: 'Course / Lab', render: (i: any) => <span className="font-extrabold text-slate-800 dark:text-slate-200">{i.course}</span> },
      { key: 'sem', header: 'Class Cohort', render: (i: any) => <span className="font-semibold text-purple-600 dark:text-purple-400">{i.sem}</span> },
      { key: 'room', header: 'Room / Lab', render: (i: any) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{i.room}</span> },
      { key: 'faculty', header: 'Faculty', render: (i: any) => <span className="font-medium text-slate-700 dark:text-slate-300">{i.faculty}</span> },
    ],
  };

  return <HODSubModulePage config={timetableConfig} />;
}

export const Route = createFileRoute('/hod/timetable')({
  component: HODTimetableComponent,
});

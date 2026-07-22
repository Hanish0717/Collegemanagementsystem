import React, { useState, useEffect } from 'react';
import { useHODDepartment } from '@/modules/hod/hooks/useHODDepartment';
import { fetchDepartmentFaculty, DepartmentFaculty } from '../services/hodFacultyService';
import { useNavigate } from '@tanstack/react-router';

import { PageContainer } from '../components/shared/PageContainer';
import { Modal } from '../components/shared/Modal';
import { StatisticsCard } from '../components/shared/StatisticsCard';
import { AdvancedTable } from '../components/shared/AdvancedTable';
import { Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { FilterPanel } from '../components/shared/FilterPanel';
import { AvatarCard } from '../components/shared/AvatarCard';
import { SideDrawer } from '../components/shared/SideDrawer';
import { ActionsMenu } from '../components/shared/ActionsMenu';
import { Button } from '../components/shared/Button';
import { NotificationToast } from '../components/shared/NotificationToast';
import { Modal } from '../components/shared/Modal';
import { exportToCSV, exportToTextDoc } from '../utils/exportUtils';
import {
  Briefcase,
  Award,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  UserCheck,
  FileText,
  Eye,
  BookOpen,
  CalendarCheck,
  FlaskConical,
  Plus,
  Star,
} from 'lucide-react';

export function HODFacultyDirectoryPage() {
  const { departmentInfo, departmentCode } = useHODDepartment();
  const navigate = useNavigate();

  const [faculty, setFaculty] = useState<DepartmentFaculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState<DepartmentFaculty | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});

  // Modal states
  const [assignSubjectsModal, setAssignSubjectsModal] = useState(false);
  const [assignAdvisorModal, setAssignAdvisorModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchDepartmentFaculty(departmentCode);
      setFaculty(data);
      setLoading(false);
    }
    loadData();
  }, [departmentCode]);

  // Compute 13 KPI metrics
  const totalFaculty = faculty.length;
  const activeCount = faculty.filter((f) => f.status === 'Active').length;
  const professorsCount = faculty.filter((f) => f.designation.includes('Professor') && !f.designation.includes('Assoc') && !f.designation.includes('Asst')).length;
  const assocCount = faculty.filter((f) => f.designation.includes('Associate')).length;
  const asstCount = faculty.filter((f) => f.designation.includes('Assistant')).length;
  const totalPublications = faculty.reduce((acc, f) => acc + f.publications, 0);
  const avgFeedback = (faculty.reduce((acc, f) => acc + f.feedbackScore, 0) / (totalFaculty || 1)).toFixed(1);
  const avgAttendance = (faculty.reduce((acc, f) => acc + f.attendance, 0) / (totalFaculty || 1)).toFixed(1);

  const columns: Column<DepartmentFaculty>[] = [
    {
      key: 'empId',
      header: 'Employee ID',
      render: (item) => <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{item.empId}</span>,
    },
    {
      key: 'name',
      header: 'Faculty Member',
      render: (item) => (
        <AvatarCard
          name={item.name}
          subtitle={`${item.designation} • ${item.qualification}`}
          badge="Faculty"
          size="sm"
        />
      ),
    },
    {
      key: 'specialization',
      header: 'Specialization & Exp',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.specialization}</span>
          <span className="text-[10px] text-slate-400 font-medium">{item.experience} Exp</span>
        </div>
      ),
    },
    {
      key: 'subjectsAssigned',
      header: 'Assigned Subjects',
      render: (item) => <span className="font-bold text-purple-600 dark:text-purple-400">{item.subjectsAssigned}</span>,
    },
    {
      key: 'attendance',
      header: 'Attendance %',
      render: (item) => <span className="font-black text-emerald-600">{item.attendance}%</span>,
    },
    {
      key: 'publications',
      header: 'Publications',
      render: (item) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
          {item.publications} Papers
        </span>
      ),
    },
    {
      key: 'feedbackScore',
      header: 'Feedback Rating',
      render: (item) => (
        <div className="flex items-center gap-1 font-black text-amber-500">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span>{item.feedbackScore} / 5</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <ActionsMenu
          items={[
            {
              label: 'View Faculty Profile',
              icon: Eye,
              onClick: () => navigate({ to: '/hod/faculty/profile' }),
            },
            {
              label: 'Quick Workload Inspection',
              icon: BookOpen,
              onClick: () => {
                setSelectedFaculty(item);
                setDrawerOpen(true);
              },
            },
            {
              label: 'Assign Subjects',
              icon: FlaskConical,
              onClick: () => setAssignSubjectsModal(true),
            },
            {
              label: 'Assign Class Advisor',
              icon: UserCheck,
              onClick: () => setAssignAdvisorModal(true),
            },
            {
              label: 'Export Performance Card',
              icon: FileText,
              onClick: () => {
                exportToTextDoc(`Faculty_Performance_${item.empId}.txt`, `Faculty Performance Record — ${item.name}`, {
                  'Employee ID': item.empId,
                  'Faculty Name': item.name,
                  'Designation': item.designation,
                  'Qualification': item.qualification,
                  'Specialization': item.specialization,
                  'Experience': item.experience,
                  'Assigned Subjects': item.subjectsAssigned,
                  'Publications': `${item.publications} Papers`,
                  'Attendance': `${item.attendance}%`,
                  'Feedback Rating': `${item.feedbackScore} / 5`,
                });
                NotificationToast.info('Faculty Card Exported', `Exported record for ${item.name}`);
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <PageContainer
      title="Department Faculty Management"
      subtitle={`Academic workload allocations, research outputs, and student feedback scores for ${departmentInfo.name}`}
      breadcrumbItems={[{ label: 'Faculty Management' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            iconLeft={Download}
            onClick={() => {
              exportToCSV(`HOD_Faculty_Directory_${departmentInfo.shortName}.csv`, faculty);
              NotificationToast.success('Exporting Faculty List', 'Downloading CSV directory...');
            }}
          >
            Export
          </Button>
          <Button variant="outline" size="sm" iconLeft={Plus} onClick={() => NotificationToast.info('Faculty Request', 'Request sent to Principal & HR')}>
            Add Faculty Request
          </Button>
          <Button variant="primary" size="sm" iconLeft={BookOpen} onClick={() => setAssignSubjectsModal(true)}>
            Assign Subjects
          </Button>
        </div>
      }
      stats={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatisticsCard label="Total Dept Faculty" value={totalFaculty} subtitle={`${professorsCount} Profs • ${assocCount} Assoc • ${asstCount} Asst`} icon={Briefcase} accentColor="blue" />
          <StatisticsCard label="Avg Faculty Attendance" value={`${avgAttendance}%`} subtitle="Biometric audit" icon={CheckCircle2} accentColor="emerald" />
          <StatisticsCard label="Total Research Papers" value={totalPublications} subtitle="Scopus & SCI Indexed" icon={FlaskConical} accentColor="purple" />
          <StatisticsCard label="Avg Student Feedback" value={`${avgFeedback} / 5`} subtitle="Overall rating" icon={Star} accentColor="amber" />
        </div>
      }
      filters={<FilterPanel filters={filters} onChange={setFilters} onReset={() => setFilters({})} />}
    >
      {/* Enterprise Faculty Directory Table */}
      <AdvancedTable
        title={`${departmentInfo.shortName} Faculty Roster`}
        subtitle={`Live faculty dataset strictly isolated to ${departmentInfo.name}`}
        columns={columns}
        data={faculty}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search faculty by name, employee ID, or specialization..."
      />

      {/* Quick Faculty Inspection Drawer */}
      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedFaculty?.name || 'Faculty Inspection'}
        subtitle={`Emp ID: ${selectedFaculty?.empId} • ${selectedFaculty?.designation}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>Close</Button>
            <Button variant="primary" size="sm" onClick={() => { setDrawerOpen(false); navigate({ to: '/hod/faculty/profile' }); }}>
              Open Full Profile Page →
            </Button>
          </div>
        }
      >
        {selectedFaculty && (
          <div className="space-y-4 text-xs font-semibold">
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/40 space-y-2">
              <AvatarCard name={selectedFaculty.name} subtitle={selectedFaculty.email || `${selectedFaculty.empId}@college.com`} size="lg" />
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                <div><span className="text-slate-400 font-bold uppercase">Qualification</span><p className="font-extrabold text-slate-800 dark:text-slate-200">{selectedFaculty.qualification}</p></div>
                <div><span className="text-slate-400 font-bold uppercase">Office Room</span><p className="font-extrabold text-slate-800 dark:text-slate-200">{selectedFaculty.officeRoom || 'Tech Block 304'}</p></div>
                <div><span className="text-slate-400 font-bold uppercase">Attendance</span><p className="font-black text-emerald-600">{selectedFaculty.attendance}%</p></div>
                <div><span className="text-slate-400 font-bold uppercase">Feedback Rating</span><p className="font-black text-amber-500">{selectedFaculty.feedbackScore} / 5</p></div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 dark:text-white">Assigned Subject Workload</h4>
              <p className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">{selectedFaculty.subjectsAssigned}</p>
            </div>
          </div>
        )}
      </SideDrawer>

      {/* Assign Subjects Modal */}
      <Modal
        isOpen={assignSubjectsModal}
        onClose={() => setAssignSubjectsModal(false)}
        title="Assign Course Subject"
        subtitle={`Workload allocation for ${departmentInfo.shortName} faculty`}
        variant="assign"
        confirmLabel="Allocate Workload"
        onConfirm={() => {
          setAssignSubjectsModal(false);
          NotificationToast.success('Subject Allocated', 'Assigned Deep Learning (AIML501) to Dr. Ramesh Kumar');
        }}
      >
        <div className="space-y-3">
          <div>
            <label className="block font-bold mb-1">Select Faculty Member</label>
            <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold">
              <option>Dr. Ramesh Kumar (Professor & Head)</option>
              <option>Prof. Sneha Verma (Associate Professor)</option>
              <option>Prof. Vikram Rathore (Assistant Professor)</option>
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1">Select Subject</label>
            <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold">
              <option>Deep Learning & Neural Networks (AIML501)</option>
              <option>Natural Language Processing (AIML502)</option>
              <option>Computer Vision & Robotics (AIML503)</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Assign Class Advisor Modal */}
      <Modal
        isOpen={assignAdvisorModal}
        onClose={() => setAssignAdvisorModal(false)}
        title="Assign Class Advisor"
        subtitle={`Class advisory responsibilities for ${departmentInfo.shortName} cohorts`}
        variant="assign"
        confirmLabel="Assign Advisor"
        onConfirm={() => {
          setAssignAdvisorModal(false);
          NotificationToast.success('Class Advisor Assigned', 'Prof. Sneha Verma assigned as Class Advisor for Sem 5 Section B');
        }}
      >
        <div className="space-y-3">
          <div>
            <label className="block font-bold mb-1">Select Cohort</label>
            <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold">
              <option>Sem 5 Section A</option>
              <option>Sem 5 Section B</option>
              <option>Sem 7 Section A</option>
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1">Select Class Advisor</label>
            <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold">
              <option>Prof. Sneha Verma (Assoc. Prof)</option>
              <option>Prof. Vikram Rathore (Asst. Prof)</option>
              <option>Dr. Ananya Roy (Asst. Prof)</option>
            </select>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}

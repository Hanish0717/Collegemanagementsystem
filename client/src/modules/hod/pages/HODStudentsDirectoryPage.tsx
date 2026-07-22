import React, { useState, useEffect, useMemo } from 'react';
import { useHODDepartment } from '../hooks/useHODDepartment';
import { fetchDepartmentStudents, DepartmentStudent } from '../services/hodStudentService';
import { useNavigate } from '@tanstack/react-router';

import { PageContainer } from '../components/shared/PageContainer';
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
  Users,
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
  GraduationCap,
  Briefcase,
  AlertCircle,
  BadgeDollarSign,
} from 'lucide-react';
import { HODFilterState } from '../types';

// ── helpers ──────────────────────────────────────────────────────────────────

function FeeStatusPill({ paid, label }: { paid: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
        paid
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
      }`}
    >
      {paid ? '✓' : '✗'} {label}
    </span>
  );
}

function AdmissionTypeBadge({ type, scholarshipType }: { type: 'Scholarship' | 'Management'; scholarshipType?: string }) {
  const isScholarship = type === 'Scholarship';
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
          isScholarship
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
        }`}
      >
        {isScholarship ? '🎓' : '💼'} {type}
      </span>
      {isScholarship && scholarshipType && (
        <span className="text-[9px] font-semibold text-slate-400 pl-0.5">{scholarshipType}</span>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function HODStudentsDirectoryPage() {
  const { departmentInfo, departmentCode } = useHODDepartment();
  const navigate = useNavigate();

  const [students, setStudents] = useState<DepartmentStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<DepartmentStudent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<Partial<HODFilterState>>({
    admissionType: 'All',
    feeDefaulterFor: 'none',
  });

  // Modals state
  const [assignMentorModal, setAssignMentorModal] = useState(false);
  const [feeDefaultersModal, setFeeDefaultersModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchDepartmentStudents(departmentCode);
      setStudents(data);
      setLoading(false);
    }
    loadData();
  }, [departmentCode]);

  // ── KPI metrics ────────────────────────────────────────────────────────────
  const totalStudents = students.length;
  const maleCount = students.filter((s) => s.gender === 'Male').length;
  const femaleCount = students.filter((s) => s.gender === 'Female').length;
  const activeCount = students.filter((s) => s.status === 'Active').length;
  const lowAttCount = students.filter((s) => s.attendance < 75).length;
  const avgCgpa = (students.reduce((acc, s) => acc + s.cgpa, 0) / (totalStudents || 1)).toFixed(2);

  // Scholarship / Management counts
  const scholarshipCount = students.filter((s) => s.admissionType === 'Scholarship').length;
  const managementCount = students.filter((s) => s.admissionType === 'Management').length;

  // Fee defaulter counts
  const feeDefaulterCount = students.filter(
    (s) =>
      !s.feeStatus?.mid1Paid ||
      !s.feeStatus?.mid2Paid ||
      !s.feeStatus?.labsPaid ||
      !s.feeStatus?.semesterPaid
  ).length;

  const mid1DefaulterCount = students.filter((s) => !s.feeStatus?.mid1Paid).length;
  const mid2DefaulterCount = students.filter((s) => !s.feeStatus?.mid2Paid).length;
  const labsDefaulterCount = students.filter((s) => !s.feeStatus?.labsPaid).length;
  const semDefaulterCount = students.filter((s) => !s.feeStatus?.semesterPaid).length;

  // ── Filtered data ──────────────────────────────────────────────────────────
  const filteredStudents = useMemo(() => {
    let result = students;

    // Admission type filter
    if (filters.admissionType && filters.admissionType !== 'All') {
      result = result.filter((s) => s.admissionType === filters.admissionType);
    }

    // Fee defaulter filter
    if (filters.feeDefaulterFor && filters.feeDefaulterFor !== 'none') {
      const key = filters.feeDefaulterFor;
      result = result.filter((s) => {
        if (key === 'mid1') return !s.feeStatus?.mid1Paid;
        if (key === 'mid2') return !s.feeStatus?.mid2Paid;
        if (key === 'labs') return !s.feeStatus?.labsPaid;
        if (key === 'semester') return !s.feeStatus?.semesterPaid;
        return true;
      });
    }

    // Semester filter
    if (filters.semester) {
      result = result.filter((s) => String(s.semester) === filters.semester);
    }

    // Section filter
    if (filters.section) {
      result = result.filter((s) => s.section === filters.section);
    }

    return result;
  }, [students, filters]);

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns: Column<DepartmentStudent>[] = [
    {
      key: 'rollNumber',
      header: 'Roll & Reg No',
      render: (item) => (
        <div>
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">{item.rollNumber}</span>
          <span className="font-mono text-[10px] text-slate-400">{item.regNumber}</span>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Student Profile',
      render: (item) => (
        <AvatarCard
          name={item.name}
          subtitle={`${item.email}`}
          size="sm"
        />
      ),
    },
    {
      key: 'cohort',
      header: 'Yr / Sem / Sec',
      render: (item) => (
        <span className="font-bold text-slate-700 dark:text-slate-300">
          Yr {item.year} / Sem {item.semester} ({item.section})
        </span>
      ),
    },
    {
      key: 'admissionType',
      header: 'Admission Type',
      render: (item) => (
        <AdmissionTypeBadge type={item.admissionType} scholarshipType={item.scholarshipType} />
      ),
    },
    {
      key: 'feeStatus',
      header: 'Fee Status',
      render: (item) => (
        <div className="flex flex-wrap gap-1 max-w-[160px]">
          <FeeStatusPill paid={!!item.feeStatus?.mid1Paid} label="Mid-1" />
          <FeeStatusPill paid={!!item.feeStatus?.mid2Paid} label="Mid-2" />
          <FeeStatusPill paid={!!item.feeStatus?.labsPaid} label="Labs" />
          <FeeStatusPill paid={!!item.feeStatus?.semesterPaid} label="Sem" />
        </div>
      ),
    },
    {
      key: 'attendance',
      header: 'Attendance %',
      render: (item) => (
        <span className={`font-black ${item.attendance < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
          {item.attendance}%
        </span>
      ),
    },
    {
      key: 'cgpa',
      header: 'CGPA',
      render: (item) => <span className="font-black text-indigo-600 dark:text-indigo-400">{item.cgpa}</span>,
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
              label: 'View Detailed Profile',
              icon: Eye,
              onClick: () => navigate({ to: '/hod/students/profile' }),
            },
            {
              label: 'Quick Inspection',
              icon: BookOpen,
              onClick: () => {
                setSelectedStudent(item);
                setDrawerOpen(true);
              },
            },
            {
              label: 'Audit Attendance',
              icon: CalendarCheck,
              onClick: () => navigate({ to: '/hod/attendance' }),
            },
            {
              label: 'Generate Transcript',
              icon: FileText,
              onClick: () => {
                exportToTextDoc(`Transcript_${item.rollNumber}.txt`, `Official Student Transcript — ${item.name}`, {
                  'Roll Number': item.rollNumber,
                  'Registration Number': item.regNumber,
                  'Student Name': item.name,
                  'Department': departmentInfo.name,
                  'CGPA': item.cgpa,
                  'Attendance': `${item.attendance}%`,
                  'Admission Type': item.admissionType,
                });
                NotificationToast.info('Transcript Generated', `Exported student card for ${item.name}`);
              },
            },
          ]}
        />
      ),
    },
  ];

  // ── Active filter description ──────────────────────────────────────────────
  const activeFilterLabel = useMemo(() => {
    const parts: string[] = [];
    if (filters.admissionType && filters.admissionType !== 'All') parts.push(filters.admissionType);
    if (filters.feeDefaulterFor && filters.feeDefaulterFor !== 'none') {
      const labels: Record<string, string> = { mid1: 'Mid-1 Defaulters', mid2: 'Mid-2 Defaulters', labs: 'Lab Defaulters', semester: 'Semester Defaulters' };
      parts.push(labels[filters.feeDefaulterFor] || '');
    }
    if (filters.semester) parts.push(`Sem ${filters.semester}`);
    if (filters.section) parts.push(`Sec ${filters.section}`);
    return parts.length > 0 ? `Filtered: ${parts.join(' · ')}` : null;
  }, [filters]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageContainer
      title="Department Student Management"
      subtitle={`Enrolled student roster, fee status, attendance audits, and mentoring for ${departmentInfo.name}`}
      breadcrumbItems={[{ label: 'Student Management' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            iconLeft={Download}
            onClick={() => {
              exportToCSV(`HOD_Student_Directory_${departmentInfo.shortName}.csv`, filteredStudents);
              NotificationToast.success('Exporting CSV', 'Downloading student directory...');
            }}
          >
            Export
          </Button>
          <Button variant="outline" size="sm" iconLeft={Upload} onClick={() => NotificationToast.info('Import Workbench', 'Bulk upload tool ready')}>
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconLeft={BadgeDollarSign}
            onClick={() => setFeeDefaultersModal(true)}
          >
            Fee Defaulters Report
          </Button>
          <Button variant="primary" size="sm" iconLeft={UserCheck} onClick={() => setAssignMentorModal(true)}>
            Assign Mentor
          </Button>
        </div>
      }
      stats={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatisticsCard label="Total Dept Students" value={totalStudents} subtitle={`${maleCount} Male • ${femaleCount} Female`} icon={Users} accentColor="blue" />
          <StatisticsCard label="Scholarship Students" value={scholarshipCount} subtitle={`${managementCount} Management Quota`} icon={GraduationCap} accentColor="purple" />
          <StatisticsCard label="Fee Defaulters" value={feeDefaulterCount} subtitle="Pending any exam fee" icon={AlertCircle} accentColor="rose" />
          <StatisticsCard label="Average Dept CGPA" value={avgCgpa} subtitle="Overall average" icon={Award} accentColor="emerald" />
        </div>
      }
      filters={
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters({ admissionType: 'All', feeDefaulterFor: 'none' })}
          showAdmissionType
          showFeeDefaulter
        />
      }
    >
      {/* Active filter banner */}
      {activeFilterLabel && (
        <div className="mb-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 text-xs font-bold text-blue-700 dark:text-blue-300">
          <AlertCircle className="size-3.5 shrink-0" />
          {activeFilterLabel}
          <span className="ml-1 text-blue-400">— {filteredStudents.length} of {totalStudents} students shown</span>
        </div>
      )}

      {/* Enterprise Student Directory Table */}
      <AdvancedTable
        title={`${departmentInfo.shortName} Student Roster`}
        subtitle={`Live department dataset strictly isolated to ${departmentInfo.name}`}
        columns={columns}
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search student by name, roll number, or email..."
      />

      {/* Quick Student Inspection Drawer */}
      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedStudent?.name || 'Student Quick Inspection'}
        subtitle={`Roll Number: ${selectedStudent?.rollNumber} • ${departmentInfo.shortName} Department`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>Close</Button>
            <Button variant="primary" size="sm" onClick={() => { setDrawerOpen(false); navigate({ to: '/hod/students/profile' }); }}>
              Open Full Profile Page →
            </Button>
          </div>
        }
      >
        {selectedStudent && (
          <div className="space-y-4 text-xs font-semibold">
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/40 space-y-2">
              <AvatarCard name={selectedStudent.name} subtitle={selectedStudent.email} size="lg" />
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                <div><span className="text-slate-400 font-bold uppercase">Registration</span><p className="font-extrabold text-slate-800 dark:text-slate-200">{selectedStudent.regNumber}</p></div>
                <div><span className="text-slate-400 font-bold uppercase">Section / Batch</span><p className="font-extrabold text-slate-800 dark:text-slate-200">Sec {selectedStudent.section} ({selectedStudent.batch})</p></div>
                <div><span className="text-slate-400 font-bold uppercase">Attendance</span><p className="font-black text-emerald-600">{selectedStudent.attendance}%</p></div>
                <div><span className="text-slate-400 font-bold uppercase">Current CGPA</span><p className="font-black text-purple-600">{selectedStudent.cgpa}</p></div>
              </div>
            </div>

            {/* Admission Type */}
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 dark:text-white">Admission Category</h4>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-2">
                <AdmissionTypeBadge type={selectedStudent.admissionType} scholarshipType={selectedStudent.scholarshipType} />
              </div>
            </div>

            {/* Fee Status */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 dark:text-white">Exam Fee Payment Status</h4>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 space-y-2">
                {[
                  { label: 'Mid Exam 1', paid: !!selectedStudent.feeStatus?.mid1Paid },
                  { label: 'Mid Exam 2', paid: !!selectedStudent.feeStatus?.mid2Paid },
                  { label: 'Lab Exams', paid: !!selectedStudent.feeStatus?.labsPaid },
                  { label: 'Semester Exam', paid: !!selectedStudent.feeStatus?.semesterPaid },
                ].map(({ label, paid }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{label}</span>
                    <span className={`font-black text-[11px] ${paid ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {paid ? '✓ Paid' : '✗ Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 dark:text-white">Assigned Faculty Mentor</h4>
              <p className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">{selectedStudent.mentor}</p>
            </div>
          </div>
        )}
      </SideDrawer>

      {/* Fee Defaulters Report Modal */}
      <Modal
        isOpen={feeDefaultersModal}
        onClose={() => setFeeDefaultersModal(false)}
        title="Fee Defaulters Report"
        subtitle={`Current semester fee payment summary — ${departmentInfo.shortName}`}
        variant="info"
        confirmLabel="Export Report"
        onConfirm={() => {
          setFeeDefaultersModal(false);
          const defaulters = students.filter((s) => !s.feeStatus?.mid1Paid || !s.feeStatus?.mid2Paid || !s.feeStatus?.labsPaid || !s.feeStatus?.semesterPaid);
          exportToCSV(`HOD_Fee_Defaulters_${departmentInfo.shortName}.csv`, defaulters);
          NotificationToast.success('Report Exported', 'Fee defaulters report downloaded as CSV');
        }}
      >
        <div className="space-y-4">
          {/* Summary grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Mid Exam 1', count: mid1DefaulterCount, color: 'rose' },
              { label: 'Mid Exam 2', count: mid2DefaulterCount, color: 'amber' },
              { label: 'Lab Exams', count: labsDefaulterCount, color: 'orange' },
              { label: 'Semester Exam', count: semDefaulterCount, color: 'red' },
            ].map(({ label, count, color }) => (
              <div
                key={label}
                className={`p-3 rounded-xl border bg-${color}-50 dark:bg-${color}-950/20 border-${color}-200/80 dark:border-${color}-900/40`}
              >
                <p className={`text-[11px] font-bold text-${color}-600 dark:text-${color}-400 uppercase`}>{label}</p>
                <p className={`text-2xl font-black text-${color}-700 dark:text-${color}-300`}>{count}</p>
                <p className="text-[10px] text-slate-400 font-semibold">{count === 1 ? 'student' : 'students'} pending</p>
              </div>
            ))}
          </div>

          {/* Defaulter list */}
          <div>
            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-2">Students with Pending Fees</h4>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {students
                .filter((s) => !s.feeStatus?.mid1Paid || !s.feeStatus?.mid2Paid || !s.feeStatus?.labsPaid || !s.feeStatus?.semesterPaid)
                .map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60"
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{s.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{s.rollNumber}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {!s.feeStatus?.mid1Paid && <FeeStatusPill paid={false} label="Mid-1" />}
                      {!s.feeStatus?.mid2Paid && <FeeStatusPill paid={false} label="Mid-2" />}
                      {!s.feeStatus?.labsPaid && <FeeStatusPill paid={false} label="Labs" />}
                      {!s.feeStatus?.semesterPaid && <FeeStatusPill paid={false} label="Sem" />}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Assign Mentor Modal */}
      <Modal
        isOpen={assignMentorModal}
        onClose={() => setAssignMentorModal(false)}
        title="Assign Faculty Mentor"
        subtitle={`Select faculty mentor for ${departmentInfo.shortName} cohorts`}
        variant="assign"
        confirmLabel="Assign Mentor"
        onConfirm={() => {
          setAssignMentorModal(false);
          NotificationToast.success('Mentor Assigned', 'Assigned Dr. Ramesh Kumar to Sem 5 Section B');
        }}
      >
        <div className="space-y-3">
          <div>
            <label className="block font-bold mb-1">Select Cohort</label>
            <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold">
              <option>Sem 5 Section A</option>
              <option>Sem 5 Section B</option>
              <option>Sem 3 Section A</option>
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1">Select Faculty Member</label>
            <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold">
              <option>Dr. Ramesh Kumar (Assoc. Prof)</option>
              <option>Prof. Sneha Verma (Asst. Prof)</option>
              <option>Prof. Vikram Rathore (Asst. Prof)</option>
            </select>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}



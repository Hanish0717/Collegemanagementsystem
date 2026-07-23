import React, { useState, useEffect } from 'react';
import { useHODDepartment } from '@/modules/hod/hooks/useHODDepartment';
import { fetchDepartmentFaculty, DepartmentFaculty } from '../services/hodFacultyService';
import { hodStore } from '../services/hodStore';
import { useNavigate } from '@tanstack/react-router';

import {
  PageContainer,
  StatisticsCard,
  AdvancedTable,
  Column,
  StatusBadge,
  FilterPanel,
  AvatarCard,
  SideDrawer,
  ActionsMenu,
  Button,
  Modal,
  NotificationToast,
} from '../components/shared';
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

  // Modal & Selection States
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('Deep Learning & Neural Networks');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('AIML501');
  const [selectedCohort, setSelectedCohort] = useState<string>('Sem 5 Section A');
  const [workloadModalOpen, setWorkloadModalOpen] = useState(false);
  const [assignSubjectsModal, setAssignSubjectsModal] = useState(false);
  const [assignAdvisorModal, setAssignAdvisorModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchDepartmentFaculty(departmentCode);
      setFaculty(data);
      if (data.length > 0) {
        setSelectedFaculty(data[0]);
        setSelectedFacultyId(data[0].id);
      }
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
              onClick: () => {
                setSelectedFaculty(item);
                setDrawerOpen(true);
              },
            },
            {
              label: 'Quick Workload Inspection',
              icon: BookOpen,
              onClick: () => {
                setSelectedFaculty(item);
                setWorkloadModalOpen(true);
              },
            },
            {
              label: 'Assign Subjects',
              icon: FlaskConical,
              onClick: () => {
                setSelectedFaculty(item);
                setSelectedFacultyId(item.id);
                setAssignSubjectsModal(true);
              },
            },
            {
              label: 'Assign Class Advisor',
              icon: UserCheck,
              onClick: () => {
                setSelectedFaculty(item);
                setSelectedFacultyId(item.id);
                setAssignAdvisorModal(true);
              },
            },
            {
              label: 'Export Performance Card',
              icon: FileText,
              onClick: () => {
                exportToTextDoc(`Faculty_Performance_${item.empId}.txt`, `Faculty Performance Record — ${item.name}`, {
                  'Employee ID': item.empId,
                  'Faculty Name': item.name,
                  'Designation': item.designation,
                  'Department': item.department,
                  'Qualification': item.qualification,
                  'Specialization': item.specialization,
                  'Experience': item.experience,
                  'Assigned Subjects': item.subjectsAssigned,
                  'Assigned Classes': item.classesAssigned || 'Sem 5 Sec A',
                  'Publications': `${item.publications} Papers`,
                  'Attendance': `${item.attendance}%`,
                  'Feedback Rating': `${item.feedbackScore} / 5`,
                  'Status': item.status,
                });
                NotificationToast.success('Faculty Card Exported', `Exported record for ${item.name}`);
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

      {/* 1. Quick Faculty Inspection Drawer */}
      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedFaculty?.name || 'Faculty Profile Inspection'}
        subtitle={`Emp ID: ${selectedFaculty?.empId} • ${selectedFaculty?.designation}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>Close</Button>
            <Button variant="primary" size="sm" onClick={() => {
              setDrawerOpen(false);
              if (selectedFaculty) {
                exportToTextDoc(`Faculty_Profile_${selectedFaculty.empId}.txt`, `Faculty Official Profile — ${selectedFaculty.name}`, {
                  'Employee ID': selectedFaculty.empId,
                  'Faculty Name': selectedFaculty.name,
                  'Designation': selectedFaculty.designation,
                  'Qualification': selectedFaculty.qualification,
                  'Specialization': selectedFaculty.specialization,
                  'Assigned Subjects': selectedFaculty.subjectsAssigned,
                  'Attendance': `${selectedFaculty.attendance}%`,
                  'Feedback Rating': `${selectedFaculty.feedbackScore} / 5`,
                });
                NotificationToast.success('Profile Exported', `Downloaded full dossier for ${selectedFaculty.name}`);
              }
            }}>
              Export Full Profile →
            </Button>
          </div>
        }
      >
        {selectedFaculty && (
          <div className="space-y-4 text-xs font-semibold">
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/40 space-y-3">
              <AvatarCard name={selectedFaculty.name} subtitle={selectedFaculty.email || `${selectedFaculty.empId.toLowerCase()}@college.com`} size="lg" />
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                <div><span className="text-slate-400 font-bold uppercase">Qualification</span><p className="font-extrabold text-slate-800 dark:text-slate-200">{selectedFaculty.qualification}</p></div>
                <div><span className="text-slate-400 font-bold uppercase">Office Room</span><p className="font-extrabold text-slate-800 dark:text-slate-200">{selectedFaculty.officeRoom || 'Tech Block 304'}</p></div>
                <div><span className="text-slate-400 font-bold uppercase">Biometric Attendance</span><p className="font-black text-emerald-600">{selectedFaculty.attendance}%</p></div>
                <div><span className="text-slate-400 font-bold uppercase">Feedback Rating</span><p className="font-black text-amber-500">{selectedFaculty.feedbackScore} / 5.0 ⭐</p></div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider">Assigned Subject Workload</h4>
              <p className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900/40 font-bold text-purple-700 dark:text-purple-300">{selectedFaculty.subjectsAssigned}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider">Assigned Advisory Cohorts</h4>
              <p className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/40 font-bold text-blue-700 dark:text-blue-300">{selectedFaculty.classesAssigned || 'Sem 5 Section A'}</p>
            </div>
          </div>
        )}
      </SideDrawer>

      {/* 2. Quick Workload Inspection Modal */}
      <Modal
        isOpen={workloadModalOpen}
        onClose={() => setWorkloadModalOpen(false)}
        title={`Workload Inspection — ${selectedFaculty?.name || 'Faculty'}`}
        subtitle={`Employee ID: ${selectedFaculty?.empId} • ${selectedFaculty?.designation}`}
        variant="info"
        confirmLabel="Close Inspection"
        onConfirm={() => setWorkloadModalOpen(false)}
      >
        {selectedFaculty && (
          <div className="space-y-4 text-xs font-semibold">
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/40 flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-bold uppercase block text-[10px]">Total Weekly Teaching Load</span>
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">14 Hours / Week</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-black text-[11px]">
                Optimal Capacity
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider">Assigned Teaching Subjects</h4>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-slate-800 dark:text-slate-200 font-extrabold">
                  <span>{selectedFaculty.subjectsAssigned}</span>
                  <span className="text-xs text-purple-600 font-black">4 Credits</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Assigned Cohorts: {selectedFaculty.classesAssigned || 'Sem 5 Sec A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Student Feedback Score</span>
                <p className="font-black text-amber-500 text-sm mt-0.5">{selectedFaculty.feedbackScore} / 5.0 ⭐</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Research Publications</span>
                <p className="font-black text-purple-600 text-sm mt-0.5">{selectedFaculty.publications} Scopus Papers</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 3. Assign Subjects Modal */}
      <Modal
        isOpen={assignSubjectsModal}
        onClose={() => setAssignSubjectsModal(false)}
        title="Assign Course Subject"
        subtitle={`Workload allocation for ${departmentInfo.shortName} faculty`}
        variant="assign"
        confirmLabel="Allocate Workload"
        onConfirm={() => {
          const targetFac = faculty.find((f) => f.id === selectedFacultyId) || selectedFaculty;
          if (!targetFac) return;

          // 1. Update React state immediately
          setFaculty((prev) =>
            prev.map((f) => {
              if (f.id === targetFac.id) {
                return { ...f, subjectsAssigned: `${selectedSubject} (${selectedSubjectCode})` };
              }
              return f;
            })
          );

          // 2. Persist in hodStore & dispatch custom event for Dashboard & Academic modules
          hodStore.assignFacultySubject(targetFac.id, targetFac.name, selectedSubject, selectedSubjectCode);

          setAssignSubjectsModal(false);
          NotificationToast.success(
            'Subject Allocated Dynamically',
            `Assigned ${selectedSubject} (${selectedSubjectCode}) to ${targetFac.name}`
          );
        }}
      >
        <div className="space-y-3">
          <div>
            <label className="block font-bold mb-1">Select Faculty Member</label>
            <select
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
            >
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.designation})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1">Select Subject</label>
            <select
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
              value={selectedSubjectCode}
              onChange={(e) => {
                setSelectedSubjectCode(e.target.value);
                const names: Record<string, string> = {
                  AIML501: 'Deep Learning & Neural Networks',
                  AIML502: 'Natural Language Processing',
                  AIML503: 'Computer Vision & Robotics',
                  AIML701: 'Reinforcement Learning',
                  AIML301: 'Foundations of AI & ML',
                };
                setSelectedSubject(names[e.target.value] || 'Deep Learning & Neural Networks');
              }}
            >
              <option value="AIML501">Deep Learning & Neural Networks (AIML501)</option>
              <option value="AIML502">Natural Language Processing (AIML502)</option>
              <option value="AIML503">Computer Vision & Robotics (AIML503)</option>
              <option value="AIML701">Reinforcement Learning (AIML701)</option>
              <option value="AIML301">Foundations of AI & ML (AIML301)</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* 4. Assign Class Advisor Modal */}
      <Modal
        isOpen={assignAdvisorModal}
        onClose={() => setAssignAdvisorModal(false)}
        title="Assign Class Advisor"
        subtitle={`Class advisory responsibilities for ${departmentInfo.shortName} cohorts`}
        variant="assign"
        confirmLabel="Assign Advisor"
        onConfirm={() => {
          const targetFac = faculty.find((f) => f.id === selectedFacultyId) || selectedFaculty;
          if (!targetFac) return;

          setFaculty((prev) =>
            prev.map((f) => {
              if (f.id === targetFac.id) {
                return { ...f, classesAssigned: selectedCohort };
              }
              return f;
            })
          );

          setAssignAdvisorModal(false);
          NotificationToast.success(
            'Class Advisor Assigned',
            `${targetFac.name} assigned as Class Advisor for ${selectedCohort}`
          );
        }}
      >
        <div className="space-y-3">
          <div>
            <label className="block font-bold mb-1">Select Cohort</label>
            <select
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
            >
              <option value="Sem 5 Section A">Sem 5 Section A</option>
              <option value="Sem 5 Section B">Sem 5 Section B</option>
              <option value="Sem 5 Section C">Sem 5 Section C</option>
              <option value="Sem 7 Section A">Sem 7 Section A</option>
              <option value="Sem 7 Section B">Sem 7 Section B</option>
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1">Select Class Advisor</label>
            <select
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
            >
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.designation})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}

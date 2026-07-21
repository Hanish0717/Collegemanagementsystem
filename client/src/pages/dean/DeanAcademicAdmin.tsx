import { useState } from 'react';
import {
  Building2, BookOpen, CalendarCheck, Award, CheckCircle, Download
} from 'lucide-react';
import { Badge, Card, StatCard } from '@/components/dashboard/ui';
import { toast } from 'sonner';

export function DeanAcademicAdmin() {
  const [activeTab, setActiveTab] = useState<'depts' | 'curriculum' | 'calendar' | 'timetable' | 'approvals'>('depts');

  const [curriculumRevisions, setCurriculumRevisions] = useState([
    { id: 'CUR-2026-01', dept: 'Computer Science & Engineering', title: 'B.Tech CSE (AI & ML Specialization CBCS Framework)', status: 'Pending Dean Sanction' },
    { id: 'CUR-2026-02', dept: 'Electronics & Comm', title: 'M.Tech Embedded Systems Syllabus Update', status: 'Pending Dean Sanction' },
  ]);

  const handleSanctionCurriculum = (id: string, title: string) => {
    setCurriculumRevisions((prev) => prev.filter((c) => c.id !== id));
    toast.success(`[Dean Academic Council] Sanctioned Curriculum: ${title}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              ACADEMIC LEADERSHIP
            </span>
            <span className="text-xs text-slate-400 font-mono">Academic Administration</span>
          </div>
          <h1 className="text-2xl font-black text-white">Academic Governance & Curriculum Planning</h1>
          <p className="text-xs text-slate-400 mt-1">
            Departmental oversight across 12 academic departments, CBCS curriculum revisions, semester timetables, degree track approvals, and academic calendar publication.
          </p>
        </div>

        <button
          onClick={() => toast.success('Published Institutional Academic Calendar AY 2026-27.')}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-lg"
        >
          <CalendarCheck className="size-4" /> Publish Academic Calendar
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Academic Depts" value="12" change="Active Governance" icon={Building2} />
        <StatCard label="Degree Tracks" value="28" change="UG & PG Courses" icon={Award} />
        <StatCard label="Active Courses" value="164" change="CBCS Curriculum" icon={BookOpen} />
        <StatCard label="Academic Calendar" value="AY 26-27" change="Active & Published" icon={CalendarCheck} />
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'depts', label: 'Academic Departments (12)' },
          { id: 'curriculum', label: 'Curriculum & CBCS Revisions' },
          { id: 'calendar', label: 'Academic Calendar AY 2026-27' },
          { id: 'timetable', label: 'Master Class Timetables' },
          { id: 'approvals', label: 'Academic Board Approvals' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Departments */}
      {activeTab === 'depts' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Computer Science & Engineering', hod: 'Dr. Srinivas Rao', faculty: 38, students: 720 },
            { name: 'Electronics & Communication', hod: 'Dr. K. V. Sharma', faculty: 28, students: 540 },
            { name: 'Mechanical Engineering', hod: 'Dr. Ramesh Kumar', faculty: 24, students: 410 },
            { name: 'Electrical & Electronics', hod: 'Dr. Meena Iyer', faculty: 20, students: 380 },
            { name: 'Civil Engineering', hod: 'Dr. A. P. Singh', faculty: 18, students: 400 },
          ].map((d) => (
            <Card key={d.name} className="p-4 space-y-2">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{d.name}</h4>
              <p className="text-xs text-slate-500">HOD: <strong className="text-slate-800 dark:text-slate-200">{d.hod}</strong></p>
              <div className="flex justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Faculty: <strong>{d.faculty}</strong></span>
                <span>Students: <strong>{d.students}</strong></span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Curriculum */}
      {activeTab === 'curriculum' && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">CBCS Curriculum & Course Revisions</h3>
          <div className="space-y-3">
            {curriculumRevisions.map((c) => (
              <div key={c.id} className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
                <div>
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white">{c.title}</div>
                  <div className="text-[11px] text-slate-500">Dept: {c.dept} • Code: {c.id}</div>
                </div>

                <button
                  onClick={() => handleSanctionCurriculum(c.id, c.title)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <CheckCircle className="size-3.5" /> Sanction Revision
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Calendar */}
      {activeTab === 'calendar' && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">Institutional Academic Calendar 2026-2027</h3>
          <p className="text-xs text-slate-500">Semester commencement, mid-term examinations, sports week, and end-semester dates.</p>
        </Card>
      )}
    </div>
  );
}

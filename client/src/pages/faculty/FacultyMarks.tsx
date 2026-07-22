import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Save, Search, CheckCircle2, Clock } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import { toast } from 'sonner';
import api from '@/lib/api';

export function FacultyMarks() {
  const [department, setDepartment] = useState('CSE');
  const [year, setYear] = useState('1');
  const [semester, setSemester] = useState('1');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [search, setSearch] = useState('');
  const [studentsMarks, setStudentsMarks] = useState<any[]>([]);

  // 1. Fetch Offered Courses
  const { data: coursesList = [] } = useQuery({
    queryKey: ['courses', department, year, semester],
    queryFn: async () => {
      const { data } = await api.get('/api/exams/courses', {
        params: { department, year: Number(year), semester: Number(semester) }
      });
      const list = data.data || [];
      if (list.length > 0 && !selectedCourseId) {
        setSelectedCourseId(list[0].id);
      }
      return list;
    }
  });

  // 2. Fetch Enrolled Students with Internal Marks
  const { isLoading: isMarksLoading, refetch } = useQuery({
    queryKey: ['internal-marks', selectedCourseId, department, year, semester],
    queryFn: async () => {
      const { data } = await api.get('/api/faculty-module/internal-marks', {
        params: { course_id: selectedCourseId, department, year: Number(year), semester: Number(semester) }
      });
      const list = data.data || [];
      setStudentsMarks(list);
      return list;
    },
    enabled: !!department && !!semester
  });

  // Handle Score Input Change
  const handleScoreChange = (studentId: string, field: string, val: string) => {
    const num = Math.max(0, Number(val) || 0);
    setStudentsMarks(prev => prev.map(s => {
      if (s.student_id === studentId) {
        const updated = { ...s, [field]: num };
        const m1 = field === 'mid1_marks' ? num : Number(updated.mid1_marks || 0);
        const m2 = field === 'mid2_marks' ? num : Number(updated.mid2_marks || 0);
        const ass = field === 'assignment_marks' ? num : Number(updated.assignment_marks || 0);
        
        // Auto compute Internal Score out of 30: (Mid1 + Mid2)/2 + Assignment
        const calcInternal = Math.min(30, Math.round((((m1 + m2) / 2) + ass) * 100) / 100);
        return { ...updated, total_internal: calcInternal };
      }
      return s;
    }));
  };

  // 3. Save Internal Marks Mutation
  const saveMarksMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCourseId) throw new Error('Please select a course first');
      const payload = {
        course_id: selectedCourseId,
        semester: Number(semester),
        marks_data: studentsMarks
      };
      const { data } = await api.post('/api/faculty-module/internal-marks', payload);
      return data;
    },
    onSuccess: () => {
      refetch();
      toast.success('Internal mid marks saved successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to save marks');
    }
  });

  const filteredStudents = studentsMarks.filter(s =>
    (s.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.roll_number || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalSubmitted = studentsMarks.filter(s => s.status === 'Submitted').length;
  const totalPending = studentsMarks.length - totalSubmitted;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Internal Mid Marks Entry"
        desc="Enter Mid-1 (15M), Mid-2 (15M), and Assignment (5M) marks. System automatically computes 30M Internal Score."
      />

      {/* Filter Header */}
      <Card className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-xs font-bold text-slate-300 mb-1 block">Department</label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold"
            >
              <option value="CSE">CSE - Computer Science</option>
              <option value="ECE">ECE - Electronics & Comm</option>
              <option value="EEE">EEE - Electrical Eng</option>
              <option value="MECH">MECH - Mechanical Eng</option>
              <option value="CIVIL">CIVIL - Civil Eng</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 mb-1 block">Year & Semester</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={year}
                onChange={e => {
                  setYear(e.target.value);
                  const yr = Number(e.target.value);
                  setSemester(yr === 1 ? '1' : yr === 2 ? '3' : yr === 3 ? '5' : '7');
                }}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-2 py-2 text-xs font-semibold"
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>

              <select
                value={semester}
                onChange={e => setSemester(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-2 py-2 text-xs font-semibold"
              >
                {Number(year) === 1 && <><option value="1">Sem 1</option><option value="2">Sem 2</option></>}
                {Number(year) === 2 && <><option value="3">Sem 3</option><option value="4">Sem 4</option></>}
                {Number(year) === 3 && <><option value="5">Sem 5</option><option value="6">Sem 6</option></>}
                {Number(year) === 4 && <><option value="7">Sem 7</option><option value="8">Sem 8</option></>}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 mb-1 block">Subject Booklet / Course</label>
            <select
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-indigo-300 rounded-xl px-3 py-2 text-xs font-semibold"
            >
              <option value="">-- Choose Subject --</option>
              {coursesList.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.course_code} - {c.course_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={() => saveMarksMutation.mutate()}
              disabled={saveMarksMutation.isPending || studentsMarks.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="size-4" />
              {saveMarksMutation.isPending ? 'Saving...' : 'Save Mid Marks (30M)'}
            </button>
          </div>
        </div>
      </Card>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enrolled Cohort</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{studentsMarks.length} Students</div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">{department} - Year {year} (Sem {semester})</div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Marks Submitted</div>
          <div className="text-2xl font-black text-emerald-600 mt-1 flex items-center gap-2">
            <CheckCircle2 className="size-6 text-emerald-500" /> {totalSubmitted} / {studentsMarks.length}
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 mt-1">Ready for End-Sem Consolidation</div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Submission</div>
          <div className="text-2xl font-black text-amber-600 mt-1 flex items-center gap-2">
            <Clock className="size-6 text-amber-500" /> {totalPending}
          </div>
          <div className="text-[11px] font-semibold text-amber-600 mt-1">Requires Faculty Marks Input</div>
        </Card>
      </div>

      {/* Marks Input Table */}
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-0">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              placeholder="Search by student name or roll number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:border-indigo-600 outline-none"
            />
          </div>

          <Badge tone="info" className="text-xs font-bold">
            Internal Rule: (Mid1 + Mid2)/2 + Assignment (Max 30)
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Roll No.</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3 text-center">Mid-1 (Max 15)</th>
                <th className="px-4 py-3 text-center">Mid-2 (Max 15)</th>
                <th className="px-4 py-3 text-center">Assignment (Max 5)</th>
                <th className="px-4 py-3 text-center">Internal Score (Max 30)</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {isMarksLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">Loading student roster...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">No students found for this cohort.</td>
                </tr>
              ) : (
                filteredStudents.map(s => (
                  <tr key={s.student_id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-700">{s.roll_number}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{s.student_name}</td>
                    
                    {/* Mid 1 Input */}
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="15"
                        step="0.5"
                        value={s.mid1_marks !== undefined ? s.mid1_marks : ''}
                        onChange={e => handleScoreChange(s.student_id, 'mid1_marks', e.target.value)}
                        className="w-20 text-center font-bold border border-slate-300 rounded-lg py-1 px-2 focus:border-indigo-600 bg-slate-50/50 outline-none"
                      />
                    </td>

                    {/* Mid 2 Input */}
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="15"
                        step="0.5"
                        value={s.mid2_marks !== undefined ? s.mid2_marks : ''}
                        onChange={e => handleScoreChange(s.student_id, 'mid2_marks', e.target.value)}
                        className="w-20 text-center font-bold border border-slate-300 rounded-lg py-1 px-2 focus:border-indigo-600 bg-slate-50/50 outline-none"
                      />
                    </td>

                    {/* Assignment Input */}
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.5"
                        value={s.assignment_marks !== undefined ? s.assignment_marks : ''}
                        onChange={e => handleScoreChange(s.student_id, 'assignment_marks', e.target.value)}
                        className="w-20 text-center font-bold border border-slate-300 rounded-lg py-1 px-2 focus:border-indigo-600 bg-slate-50/50 outline-none"
                      />
                    </td>

                    {/* Calculated Internal Total */}
                    <td className="px-4 py-3 text-center font-extrabold text-sm text-indigo-900 bg-indigo-50/50">
                      {s.total_internal} / 30
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      {s.status === 'Submitted' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          ✓ Saved
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

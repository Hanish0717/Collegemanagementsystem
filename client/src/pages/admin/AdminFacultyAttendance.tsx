import { useState, useEffect } from 'react';
import {
  Calendar,
  Save,
  Search,
  PieChart as PieChartIcon,
  Trash2,
  Edit,
  X,
  RefreshCw,
} from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '@/lib/api';
import { toast } from 'sonner';

export function AdminFacultyAttendance() {
  const [activeTab, setActiveTab] = useState<'mark' | 'history'>('mark');

  const [selectedDepartment, setSelectedDepartment] = useState('CSE');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Faculty specific history search state
  const [facultySearchQuery, setFacultySearchQuery] = useState('');
  const [facultyHistoryRecords, setFacultyHistoryRecords] = useState<any[]>([]);
  const [searchingFaculty, setSearchingFaculty] = useState(false);
  const [selectedFacultyForHistory, setSelectedFacultyForHistory] = useState<any | null>(null);

  const fetchFacultyAttendanceList = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/faculty-attendance/list', {
        params: {
          department: selectedDepartment,
          date: selectedDate,
        },
      });
      if (res.data?.success && res.data?.data) {
        setFacultyList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching faculty attendance list:', err);
      setFacultyList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyAttendanceList();
  }, [selectedDepartment, selectedDate]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setFacultyList((prev) =>
      prev.map((f) => (f.faculty.id === id ? { ...f, status: newStatus } : f)),
    );
  };

  const handleRemarksChange = (id: string, newRemarks: string) => {
    setFacultyList((prev) =>
      prev.map((f) => (f.faculty.id === id ? { ...f, remarks: newRemarks } : f)),
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const dbRecords = facultyList
        .filter((f) => f.faculty?.id)
        .map((f) => ({
          facultyId: f.faculty.id,
          status: f.status,
          remarks: f.remarks,
          attendanceId: f.id || f._id,
        }));

      if (dbRecords.length === 0) {
        toast.error('No faculty records to save.');
        return;
      }

      const res = await api.post('/api/faculty-attendance/bulk-mark', {
        date: selectedDate,
        records: dbRecords,
      });

      if (res.data?.success) {
        toast.success('Faculty attendance saved successfully!');
        fetchFacultyAttendanceList();
      }
    } catch (err: any) {
      console.error('Error saving faculty attendance:', err);
      toast.error(err.response?.data?.message || 'Failed to save faculty attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacultyHistory = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setSearchingFaculty(true);
    try {
      // First find the faculty profile
      const facRes = await api.get('/api/admin/faculty', {
        params: { search: searchQuery },
      });
      const resolvedFaculty = facRes.data?.data?.[0]; // Get the first matching profile

      if (resolvedFaculty) {
        setSelectedFacultyForHistory(resolvedFaculty);
        const res = await api.get(`/api/faculty-attendance/faculty/${resolvedFaculty.id}`);
        if (res.data?.success && res.data?.data) {
          const sorted = (res.data.data.records || [])
            .map((r: any) => ({
              ...r,
              formattedDate: new Date(r.date).toISOString().split('T')[0],
              statusDisplay: r.status
                ? r.status.charAt(0).toUpperCase() + r.status.slice(1)
                : 'Present',
            }))
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setFacultyHistoryRecords(sorted);
        } else {
          setFacultyHistoryRecords([]);
        }
      } else {
        toast.error('Faculty member not found.');
        setFacultyHistoryRecords([]);
        setSelectedFacultyForHistory(null);
      }
    } catch (err) {
      console.error('Error fetching faculty history:', err);
      toast.error('Failed to load faculty history.');
    } finally {
      setSearchingFaculty(false);
    }
  };

  const handleDeleteRecord = async (recordId: string, facultyIdForReload?: string) => {
    if (!window.confirm('Are you sure you want to delete this faculty attendance record?')) return;
    try {
      const res = await api.delete(`/api/faculty-attendance/${recordId}`);
      if (res.data?.success) {
        toast.success('Record deleted successfully!');
        if (facultyIdForReload) {
          fetchFacultyHistory(facultyIdForReload);
        }
        fetchFacultyAttendanceList();
      }
    } catch (err: any) {
      console.error('Error deleting record:', err);
      toast.error(err.response?.data?.message || 'Failed to delete record.');
    }
  };

  const handleUpdateRecordStatus = async (
    recordId: string,
    newStatus: string,
    remarks: string,
    facultyIdForReload?: string,
  ) => {
    try {
      const res = await api.put(`/api/faculty-attendance/${recordId}`, {
        status: newStatus.toLowerCase(),
        remarks,
      });
      if (res.data?.success) {
        toast.success('Attendance record updated successfully!');
        if (facultyIdForReload) {
          fetchFacultyHistory(facultyIdForReload);
        }
        fetchFacultyAttendanceList();
      }
    } catch (err: any) {
      console.error('Error updating record:', err);
      toast.error(err.response?.data?.message || 'Failed to update record.');
    }
  };

  const filteredFaculty = facultyList.filter(
    (f) =>
      f.faculty.fullName.toLowerCase().includes(search.toLowerCase()) ||
      f.faculty.employeeId.toLowerCase().includes(search.toLowerCase()),
  );

  const presentCount = facultyList.filter((f) => f.status === 'Present').length;
  const absentCount = facultyList.filter((f) => f.status === 'Absent').length;
  const lateCount = facultyList.filter((f) => f.status === 'Late').length;
  const excusedCount = facultyList.filter((f) => f.status === 'Excused').length;

  const hasChartData = presentCount > 0 || absentCount > 0 || lateCount > 0 || excusedCount > 0;
  const chartData = hasChartData
    ? [
        { name: 'Present', value: presentCount, color: '#10B981' },
        { name: 'Absent', value: absentCount, color: '#EF4444' },
        { name: 'Late', value: lateCount, color: '#F59E0B' },
        { name: 'Excused', value: excusedCount, color: '#06B6D4' },
      ].filter((item) => item.value > 0)
    : [{ name: 'No marked staff', value: 1, color: '#94A3B8' }];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Attendance Control"
        desc="Mark daily faculty member logs, search individual staff histories, edit past records, and view metrics."
      />

      {/* Tabs Layout */}
      <div className="flex border-b border-muted">
        <button
          onClick={() => setActiveTab('mark')}
          className={`px-6 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'mark'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Mark Faculty Attendance
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Attendance History & Reports
        </button>
      </div>

      {activeTab === 'mark' ? (
        /* MARK FACULTY ATTENDANCE VIEW */
        <>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Faculty',
                value: facultyList.length.toString(),
                tone: 'info' as const,
              },
              { label: 'Present Today', value: presentCount.toString(), tone: 'success' as const },
              { label: 'Absent Today', value: absentCount.toString(), tone: 'danger' as const },
              { label: 'Excused Today', value: excusedCount.toString(), tone: 'warn' as const },
            ].map((stat) => (
              <Card key={stat.label}>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="text-2xl font-bold mt-2">{stat.value}</div>
                <Badge tone={stat.tone} className="mt-3">
                  Selected Date
                </Badge>
              </Card>
            ))}
          </div>

          <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Department */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none"
                >
                  {['CSE', 'AIML', 'AIDS', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 px-3 py-2.5 text-sm focus:outline-none"
                />
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  placeholder="Search faculty by name/employee ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>
          </Card>

          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-base">Faculty Marking Grid</h3>
                <div className="flex items-center gap-2">
                  <Badge tone="info">{selectedDepartment} Department</Badge>
                  <Badge tone="success">{selectedDate}</Badge>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      {[
                        'Employee ID',
                        'Faculty Name',
                        'Designation',
                        'Overall %',
                        'Attendance Status',
                        'Remarks',
                      ].map((column) => (
                        <th
                          key={column}
                          className="text-left py-3 px-4 font-semibold text-muted-foreground"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredFaculty.length > 0 ? (
                      filteredFaculty.map((f) => {
                        const shortage = (f.faculty.attendancePercentage || 100) < 80;
                        return (
                          <tr
                            key={f.faculty.id}
                            className={`hover:bg-accent/50 transition ${shortage ? 'bg-red-50/30' : ''}`}
                          >
                            <td className="py-3 px-4 font-medium text-xs">
                              <button
                                onClick={() => {
                                  setActiveTab('history');
                                  setFacultySearchQuery(f.faculty.employeeId);
                                  fetchFacultyHistory(f.faculty.employeeId);
                                }}
                                title="Click to view full history"
                                className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold transition text-left focus:outline-none"
                              >
                                {f.faculty.employeeId}
                              </button>
                            </td>
                            <td className="py-3 px-4 font-medium">{f.faculty.fullName}</td>
                            <td className="py-3 px-4 text-xs text-muted-foreground">
                              {f.faculty.designation}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`font-semibold text-xs px-2 py-0.5 rounded-full ${shortage ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}
                              >
                                {f.faculty.attendancePercentage}%
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={f.status}
                                onChange={(e) => handleStatusChange(f.faculty.id, e.target.value)}
                                className="rounded-lg border bg-background px-3 py-1.5 text-xs focus:outline-none"
                              >
                                {['Present', 'Absent', 'Late', 'Excused'].map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <input
                                value={f.remarks}
                                onChange={(e) => handleRemarksChange(f.faculty.id, e.target.value)}
                                placeholder="Add remarks"
                                className="w-full rounded-lg border bg-background px-3 py-1.5 text-xs focus:outline-none"
                              />
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-muted-foreground font-medium"
                        >
                          ⚠️ There are no active faculty members cataloged in this department.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredFaculty.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium flex items-center gap-2 glow-primary disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="size-4" /> {loading ? 'Saving...' : 'Save Attendance'}
                  </button>
                </div>
              )}
            </Card>

            {/* Attendance Chart Summary */}
            <Card className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <PieChartIcon className="size-5 text-indigo-600" />
                  <h3 className="font-semibold text-base">Attendance Split</h3>
                </div>
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} Staff Member(s)`]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-4 p-4 border rounded-xl bg-gradient-soft">
                <div className="text-xs text-muted-foreground font-semibold mb-1">Legend</div>
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>{' '}
                    Present
                  </span>
                  <span className="font-bold">{presentCount}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Absent
                  </span>
                  <span className="font-bold">{absentCount}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Late
                  </span>
                  <span className="font-bold">{lateCount}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block"></span> Excused
                  </span>
                  <span className="font-bold">{excusedCount}</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : (
        /* FACULTY HISTORY VIEW & QUERY */
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-base">Lookup Faculty History</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Search a faculty member by name or employee ID to retrieve their complete calendar
                  log.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  placeholder="Enter Employee ID or Name (e.g. FAC2020001)..."
                  value={facultySearchQuery}
                  onChange={(e) => setFacultySearchQuery(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm focus:outline-none"
                />
              </div>
              <button
                onClick={() => fetchFacultyHistory(facultySearchQuery)}
                disabled={searchingFaculty || !facultySearchQuery.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 transition"
              >
                {searchingFaculty ? 'Searching...' : 'Fetch Faculty Log'}
              </button>
              {selectedFacultyForHistory && (
                <button
                  onClick={() => {
                    setSelectedFacultyForHistory(null);
                    setFacultyHistoryRecords([]);
                    setFacultySearchQuery('');
                  }}
                  className="px-3 py-2.5 border rounded-xl hover:bg-accent text-sm font-semibold text-muted-foreground cursor-pointer transition"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </Card>

          {selectedFacultyForHistory ? (
            /* Faculty specific history log display */
            <Card>
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div>
                  <h4 className="font-bold text-lg text-foreground">
                    {selectedFacultyForHistory.full_name || selectedFacultyForHistory.fullName}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedFacultyForHistory.employee_id || selectedFacultyForHistory.employeeId}{' '}
                    | {selectedFacultyForHistory.designation} | Department of{' '}
                    {selectedFacultyForHistory.department}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    tone={
                      (selectedFacultyForHistory.attendance_percentage || 100) >= 80
                        ? 'success'
                        : 'danger'
                    }
                    className="text-sm px-3 py-1 font-bold"
                  >
                    {selectedFacultyForHistory.attendance_percentage ||
                      selectedFacultyForHistory.attendancePercentage ||
                      100}
                    % Overall
                  </Badge>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {(selectedFacultyForHistory.attendance_percentage || 100) >= 80
                      ? 'Regular Attendance'
                      : 'Attendance Shortage'}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      {['Date', 'Status', 'Remarks', 'Actions'].map((col) => (
                        <th
                          key={col}
                          className="text-left py-3 px-4 font-semibold text-muted-foreground"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {facultyHistoryRecords.length > 0 ? (
                      facultyHistoryRecords.map((rec) => (
                        <tr key={rec._id || rec.id} className="hover:bg-accent/50 transition">
                          <td className="py-3 px-4 font-mono text-xs">{rec.formattedDate}</td>
                          <td className="py-3 px-4">
                            <select
                              value={rec.statusDisplay}
                              onChange={(e) =>
                                handleUpdateRecordStatus(
                                  rec._id || rec.id,
                                  e.target.value,
                                  rec.remarks || '',
                                  selectedFacultyForHistory.employee_id ||
                                    selectedFacultyForHistory.employeeId,
                                )
                              }
                              className="rounded-lg border bg-background px-2.5 py-1 text-xs focus:outline-none"
                            >
                              {['Present', 'Absent', 'Late', 'Excused'].map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              defaultValue={rec.remarks || ''}
                              onBlur={(e) => {
                                if (e.target.value !== (rec.remarks || '')) {
                                  handleUpdateRecordStatus(
                                    rec._id || rec.id,
                                    rec.statusDisplay,
                                    e.target.value,
                                    selectedFacultyForHistory.employee_id ||
                                      selectedFacultyForHistory.employeeId,
                                  );
                                }
                              }}
                              placeholder="Add remarks (tab out to save)"
                              className="rounded-lg border bg-background px-2 py-1 text-xs w-full focus:outline-none"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() =>
                                handleDeleteRecord(
                                  rec._id || rec.id,
                                  selectedFacultyForHistory.employee_id ||
                                    selectedFacultyForHistory.employeeId,
                                )
                              }
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                              title="Delete record"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-8 text-center text-muted-foreground font-medium"
                        >
                          No historical attendance records found for this faculty member.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            /* DEPARTMENT DAILY LOG REPORT */
            <Card>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 mb-4">
                <div>
                  <h4 className="font-bold text-base text-foreground">Department Daily Logs</h4>
                  <p className="text-xs text-muted-foreground">
                    Verify and modify saved logs for all department staff on {selectedDate}.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge tone="info">{selectedDepartment} Department</Badge>
                  <Badge tone="success">{selectedDate}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-xl bg-gradient-soft">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Department</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full rounded-xl border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    {['CSE', 'AIML', 'AIDS', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-xl border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5 justify-end">
                  <button
                    onClick={fetchFacultyAttendanceList}
                    className="w-full py-2.5 border rounded-xl hover:bg-accent text-xs font-bold text-muted-foreground cursor-pointer flex items-center justify-center gap-2 transition"
                  >
                    <RefreshCw className="size-3.5" /> Reload logs
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      {[
                        'Employee ID',
                        'Faculty Name',
                        'Overall %',
                        'Current Logged Status',
                        'Remarks',
                        'Actions',
                      ].map((col) => (
                        <th
                          key={col}
                          className="text-left py-3 px-4 font-semibold text-muted-foreground"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {facultyList.length > 0 ? (
                      facultyList.map((f) => {
                        const hasRecord = !!(f.id || f._id);
                        const shortage = (f.faculty.attendancePercentage || 100) < 80;
                        return (
                          <tr
                            key={f.faculty.id}
                            className={`hover:bg-accent/50 transition ${shortage ? 'bg-red-50/30' : ''}`}
                          >
                            <td className="py-3 px-4 font-medium text-xs">
                              {f.faculty.employeeId}
                            </td>
                            <td className="py-3 px-4 font-medium">{f.faculty.fullName}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`font-semibold text-xs px-2 py-0.5 rounded-full ${shortage ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}
                              >
                                {f.faculty.attendancePercentage}%
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                                  !hasRecord
                                    ? 'bg-slate-100 text-slate-600'
                                    : f.status === 'Present'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : f.status === 'Absent'
                                        ? 'bg-red-100 text-red-800'
                                        : f.status === 'Late'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-cyan-100 text-cyan-800'
                                }`}
                              >
                                {hasRecord ? f.status : 'Not Logged'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-muted-foreground">
                              {f.remarks || '-'}
                            </td>
                            <td className="py-3 px-4 flex items-center gap-2">
                              {hasRecord ? (
                                <>
                                  <button
                                    onClick={() => {
                                      const promptStatus = window.prompt(
                                        'Enter new status (Present, Absent, Late, Excused):',
                                        f.status,
                                      );
                                      if (promptStatus) {
                                        const clean = promptStatus.trim();
                                        if (
                                          ['Present', 'Absent', 'Late', 'Excused'].includes(clean)
                                        ) {
                                          handleUpdateRecordStatus(
                                            f.id || f._id,
                                            clean,
                                            f.remarks || '',
                                          );
                                        } else {
                                          alert('Invalid status entered.');
                                        }
                                      }
                                    }}
                                    className="px-2 py-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border rounded text-xs transition"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRecord(f.id || f._id)}
                                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                                    title="Delete record"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">
                                  Use taking tab
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-muted-foreground font-medium"
                        >
                          No active logs found for this department.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

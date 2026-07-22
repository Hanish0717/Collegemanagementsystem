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
  // Added for warnings/notifications cockpit integration
  Users,
  Bell,
  Clock,
  CheckCircle2,
  Send,
  ChevronRight,
  Info,
  XCircle,
  FileText,
  User,
  Shield,
  Layers,
  Plus,
  Paperclip,
  Settings,
  HelpCircle
} from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import { PieChart, Pie, ResponsiveContainer, Tooltip } from 'recharts';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  fetchStudents as fetchWarnStudents,
  fetchRecommendations,
  fetchTemplates,
  updateTemplate,
  submitNotificationRequest,
  sendApprovedNotification,
  fetchPendingByTeacher,
  fetchApprovedRequests,
  fetchSentHistory,
  StudentWithAttendance,
  AttendanceNotificationRequest,
  AttendanceNotificationTemplate
} from '@/services/attendanceApprovalService';

export function FacultyAttendance() {
  const [activeTab, setActiveTab] = useState<'mark' | 'history' | 'notifications'>('mark');

  const [selectedDepartment, setSelectedDepartment] = useState('CSE');
  const [selectedSemester, setSelectedSemester] = useState('5');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedSubject, setSelectedSubject] = useState('Data Structures');
  const [selectedPeriod, setSelectedPeriod] = useState('1');
  const [selectedTime, setSelectedTime] = useState('09:00 AM');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Student specific history search state
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentHistoryRecords, setStudentHistoryRecords] = useState<any[]>([]);
  const [searchingStudent, setSearchingStudent] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<any | null>(null);

  // ==========================================
  // WARNINGS COCKPIT MODULE INTEGRATION
  // ==========================================
  const [notificationsTab, setNotificationsTab] = useState<
    'select_students' | 'pending_hod' | 'approved_requests' | 'send_notifications' | 'sent_history' | 'templates' | 'analytics'
  >('select_students');

  // Send Dispatch flow state
  const [activeDispatchRequest, setActiveDispatchRequest] = useState<AttendanceNotificationRequest | null>(null);
  const [dispatchRecipients, setDispatchRecipients] = useState<string[]>(['Student']);
  const [dispatchStudentIds, setDispatchStudentIds] = useState<string[]>([]);
  const [dispatchCustomSubject, setDispatchCustomSubject] = useState('');
  const [dispatchCustomBody, setDispatchCustomBody] = useState('');
  const [dispatchPreview, setDispatchPreview] = useState(false);

  // Core Lists
  const [warnStudents, setWarnStudents] = useState<StudentWithAttendance[]>([]);
  const [recommendations, setRecommendations] = useState<StudentWithAttendance[]>([]);
  const [pendingList, setPendingList] = useState<AttendanceNotificationRequest[]>([]);
  const [approvedList, setApprovedList] = useState<AttendanceNotificationRequest[]>([]);
  const [historyList, setHistoryList] = useState<AttendanceNotificationRequest[]>([]);
  const [templates, setTemplates] = useState<AttendanceNotificationTemplate[]>([]);
  const [warnSettings, setWarnSettings] = useState<{ enabled: boolean }>({ enabled: false });

  // UI States
  const [warnLoading, setWarnLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  // Bulk Actions
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [bulkComposerOpen, setBulkComposerOpen] = useState(false);

  // Composer States
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithAttendance | null>(null);
  
  // Form fields in composer
  const [selectedTemplateId, setSelectedTemplateId] = useState('warning');
  const [composerSubject, setComposerSubject] = useState('');
  const [composerBody, setComposerBody] = useState('');
  const [composerRecipients, setComposerRecipients] = useState<string[]>(['Student']);
  const [attachments, setAttachments] = useState<{ name: string; size: string }[]>([]);
  const [newAttachmentName, setNewAttachmentName] = useState('');

  // Bulk composer fields
  const [bulkTemplateId, setBulkTemplateId] = useState('warning');
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkBody, setBulkBody] = useState('');
  const [bulkRecipients, setBulkRecipients] = useState<string[]>(['Student']);

  // Edit Template State
  const [editingTemplate, setEditingTemplate] = useState<AttendanceNotificationTemplate | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  // Details Viewer Modal
  const [viewRequest, setViewRequest] = useState<AttendanceNotificationRequest | null>(null);

  const loadWarnData = async () => {
    setWarnLoading(true);
    try {
      const templatesData = await fetchTemplates();
      setTemplates(templatesData);

      if (notificationsTab === 'select_students') {
        const data = await fetchWarnStudents();
        setWarnStudents(data);
      } else if (notificationsTab === 'pending_hod') {
        const data = await fetchPendingByTeacher();
        setPendingList(data);
      } else if (notificationsTab === 'approved_requests' || notificationsTab === 'send_notifications') {
        const data = await fetchApprovedRequests();
        setApprovedList(data);
      } else if (notificationsTab === 'sent_history') {
        const data = await fetchSentHistory();
        setHistoryList(data);
      } else if (notificationsTab === 'analytics') {
        const [pending, approved, history] = await Promise.all([
          fetchPendingByTeacher(),
          fetchApprovedRequests(),
          fetchSentHistory()
        ]);
        setPendingList(pending);
        setApprovedList(approved);
        setHistoryList(history);
      }
    } catch (err) {
      console.error('Error loading notification data:', err);
      toast.error('Failed to reload notification data.');
    } finally {
      setWarnLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'notifications') {
      loadWarnData();
    }
  }, [notificationsTab, activeTab]);

  // Load selected template into composer
  useEffect(() => {
    if (!composerOpen || !selectedStudent) return;
    const template = templates.find(t => t.id === selectedTemplateId);
    if (template) {
      setComposerSubject(template.subject);
      setComposerBody(template.body);
    }
  }, [selectedTemplateId, composerOpen, selectedStudent, templates]);

  // Load selected template into bulk composer
  useEffect(() => {
    if (!bulkComposerOpen) return;
    const template = templates.find(t => t.id === bulkTemplateId);
    if (template) {
      setBulkSubject(template.subject);
      setBulkBody(template.body);
    }
  }, [bulkTemplateId, bulkComposerOpen, templates]);

  // Handle open individual composer
  const openComposer = (student: StudentWithAttendance) => {
    setSelectedStudent(student);
    const initialRecs = [...student.suggested_recipients];
    setComposerRecipients(initialRecs.length > 0 ? initialRecs : ['Student']);
    
    // Auto map recommendation slab
    let templateId = 'warning';
    if (student.overall_attendance >= 90) templateId = 'appreciation';
    else if (student.overall_attendance >= 80) templateId = 'friendly-reminder';
    else if (student.overall_attendance >= 75) templateId = 'friendly-reminder';
    else if (student.overall_attendance >= 65) templateId = 'warning';
    else templateId = 'detention-alert';

    setSelectedTemplateId(templateId);
    setAttachments([]);
    setComposerOpen(true);
  };

  // Resolve preview placeholders
  const resolvePreview = (text: string, student: StudentWithAttendance | null) => {
    if (!student) return text;
    return text
      .replace(/{student_name}/g, student.full_name)
      .replace(/{roll_number}/g, student.roll_number)
      .replace(/{attendance_percentage}/g, String(student.overall_attendance));
  };

  // Submit Request from Composer
  const handleComposerSubmit = async () => {
    if (!selectedStudent) return;

    try {
      setWarnLoading(true);
      const res = await submitNotificationRequest({
        student_id: selectedStudent.id,
        selected_recipients: composerRecipients,
        message_type: templates.find(t => t.id === selectedTemplateId)?.name || 'Custom Message',
        custom_message: composerBody,
        subject: resolvePreview(composerSubject, selectedStudent),
        message: resolvePreview(composerBody, selectedStudent),
        attachments
      });

      if (res.success) {
        toast.success(res.message);
        setComposerOpen(false);
        setSelectedStudent(null);
        loadWarnData();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit warning notice');
    } finally {
      setWarnLoading(false);
    }
  };

  // Submit Bulk Request (new: all selected students in one HOD request)
  const handleBulkSubmit = async () => {
    if (selectedStudentIds.length === 0) {
      toast.error('Please select at least one student.');
      return;
    }
    try {
      setWarnLoading(true);
      const res = await submitNotificationRequest({
        student_ids: selectedStudentIds,
        selected_recipients: ['Student'],
        message_type: 'Attendance Notification',
      });
      if (res.success) {
        toast.success(`Request for ${selectedStudentIds.length} student(s) submitted to HOD for approval.`);
        setSelectedStudentIds([]);
        setNotificationsTab('pending_hod');
        loadWarnData();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setWarnLoading(false);
    }
  };

  // Add Attachment in Composer
  const handleAddAttachment = () => {
    if (!newAttachmentName.trim()) return;
    setAttachments(prev => [...prev, { name: newAttachmentName.trim(), size: '150 KB' }]);
    setNewAttachmentName('');
  };

  // Remove Attachment
  const handleRemoveAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  // Save Modified Template
  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    try {
      setWarnLoading(true);
      const res = await updateTemplate(editingTemplate.id, {
        subject: editSubject,
        body: editBody
      });
      if (res.success) {
        toast.success(res.message);
        setEditingTemplate(null);
        loadWarnData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update email warning template');
    } finally {
      setWarnLoading(false);
    }
  };

  // Final Dispatch Approved Warning
  const handleFinalDispatch = async () => {
    if (!activeDispatchRequest) return;
    const stdIds = dispatchStudentIds.length > 0 ? dispatchStudentIds : undefined;
    try {
      setWarnLoading(true);
      toast.loading('Sending notification emails...', { id: 'final-send' });
      const res = await sendApprovedNotification({
        id: activeDispatchRequest.id,
        recipients: dispatchRecipients,
        customSubject: dispatchCustomSubject || undefined,
        customBody: dispatchCustomBody || undefined,
        studentIds: stdIds,
      });
      if (res.success) {
        toast.success('Emails dispatched successfully!', { id: 'final-send' });
        setActiveDispatchRequest(null);
        setDispatchPreview(false);
        setNotificationsTab('sent_history');
        loadWarnData();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to send emails.', { id: 'final-send' });
    } finally {
      setWarnLoading(false);
    }
  };

  // Bulk student selectors helper
  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const handleToggleAll = (list: StudentWithAttendance[]) => {
    if (selectedStudentIds.length === list.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(list.map(s => s.id));
    }
  };

  // Filters helpers
  const getFilteredStudents = (list: StudentWithAttendance[]) => {
    return list.filter(s => {
      const matchSearch =
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.roll_number.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchYear = yearFilter ? String(s.year) === yearFilter : true;
      const matchSem = semesterFilter ? String(s.semester) === semesterFilter : true;
      const matchSec = sectionFilter ? s.section.toLowerCase() === sectionFilter.toLowerCase() : true;

      return matchSearch && matchYear && matchSem && matchSec;
    });
  };

  const activeFiltered = getFilteredStudents(warnStudents);

  // Status Styling helpers
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Pending HOD Approval':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Sent':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getSlabTone = (attendance: number): 'success' | 'info' | 'warn' | 'danger' => {
    if (attendance >= 90) return 'success';
    if (attendance >= 80) return 'info';
    if (attendance >= 75) return 'warn';
    return 'danger';
  };

  const getSlabLabel = (attendance: number) => {
    if (attendance >= 90) return 'Excellent (>=90%)';
    if (attendance >= 80) return 'Good (80-89%)';
    if (attendance >= 75) return 'Reminder Slab (75-79%)';
    if (attendance >= 65) return 'Critical Slab (65-74%)';
    return 'Detention Alert (<65%)';
  };

  // Fetch subjects dynamically based on department & semester
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/api/academic/subjects', {
          params: { department: selectedDepartment },
        });
        if (res.data?.success && res.data?.data) {
          const dbSubjects = res.data.data;
          // Filter by semester
          const filtered = dbSubjects.filter((s: any) => s.semester === Number(selectedSemester));
          if (filtered.length > 0) {
            setSubjectsList(filtered);
            if (!filtered.some((sub: any) => sub.name === selectedSubject)) {
              setSelectedSubject(filtered[0].name);
            }
          } else {
            setSubjectsList(dbSubjects);
            if (
              dbSubjects.length > 0 &&
              !dbSubjects.some((sub: any) => sub.name === selectedSubject)
            ) {
              setSelectedSubject(dbSubjects[0].name);
            }
          }
        }
      } catch (err) {
        console.error('Error loading dynamic subjects:', err);
      }
    };
    fetchSubjects();
  }, [selectedDepartment, selectedSemester]);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/api/attendance/class', {
        params: {
          department: selectedDepartment,
          semester: Number(selectedSemester),
          section: selectedSection,
          subject: selectedSubject,
          date: selectedDate,
          period: Number(selectedPeriod),
          time: selectedTime,
        },
      });
      if (res.data?.success && res.data?.data) {
        const records = res.data.data;
        const hasDbStudents = records.some((r: any) => r.student && r.student._id);

        if (hasDbStudents) {
          const mapped = records.map((r: any) => ({
            id: r.student?.rollNumber || 'Unknown',
            name: r.student?.fullName || 'Unknown Student',
            department: r.student?.department || selectedDepartment,
            studentId: r.student?._id || r.student?.id,
            dbId: r.id || r._id,
            status: r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : 'Present',
            remarks: r.remarks || '',
            attendancePercentage:
              r.student?.attendancePercentage !== undefined ? r.student.attendancePercentage : 100,
          }));
          setStudents(mapped);
        } else {
          setStudents([]);
        }
      }
    } catch (err) {
      console.error('Error fetching class attendance:', err);
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [
    selectedDepartment,
    selectedSemester,
    selectedSection,
    selectedSubject,
    selectedDate,
    selectedPeriod,
    selectedTime,
  ]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
  };

  const handleRemarksChange = (id: string, newRemarks: string) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, remarks: newRemarks } : s)));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const dbRecords = students
        .filter((s) => s.studentId)
        .map((s) => ({
          studentId: s.studentId,
          status: s.status,
          remarks: s.remarks,
          attendanceId: s.dbId,
        }));

      if (dbRecords.length === 0) {
        alert('No student records to save.');
        return;
      }

      const res = await api.post('/api/attendance/bulk-mark', {
        subject: selectedSubject,
        date: selectedDate,
        department: selectedDepartment,
        semester: Number(selectedSemester),
        section: selectedSection,
        period: Number(selectedPeriod),
        time: selectedTime,
        records: dbRecords,
      });

      if (res.data?.success) {
        alert('Attendance saved successfully!');
        fetchAttendance();
      }
    } catch (err: any) {
      console.error('Error saving attendance:', err);
      alert(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentHistory = async (studentIdOrRoll: string) => {
    if (!studentIdOrRoll.trim()) return;
    setSearchingStudent(true);
    try {
      const studentRes = await api.get('/api/students', {
        params: { search: studentIdOrRoll },
      });
      const resolvedStudent = studentRes.data?.data?.students?.[0];
      if (resolvedStudent) {
        setSelectedStudentForHistory(resolvedStudent);
        const res = await api.get(
          `/api/attendance/student/${resolvedStudent._id || resolvedStudent.id}`,
        );
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
          setStudentHistoryRecords(sorted);
        } else {
          setStudentHistoryRecords([]);
        }
      } else {
        alert('Student not found.');
        setStudentHistoryRecords([]);
        setSelectedStudentForHistory(null);
      }
    } catch (err) {
      console.error('Error fetching student history:', err);
      alert('Failed to load student history.');
    } finally {
      setSearchingStudent(false);
    }
  };

  const handleDeleteRecord = async (recordId: string, studentIdForReload?: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this attendance record? This will recalculate the student's attendance percentage.",
      )
    )
      return;
    try {
      const res = await api.delete(`/api/attendance/${recordId}`);
      if (res.data?.success) {
        alert('Record deleted successfully!');
        if (studentIdForReload) {
          fetchStudentHistory(studentIdForReload);
        }
        fetchAttendance();
      }
    } catch (err: any) {
      console.error('Error deleting record:', err);
      alert(err.response?.data?.message || 'Failed to delete record.');
    }
  };

  const handleUpdateRecordStatus = async (
    recordId: string,
    newStatus: string,
    remarks: string,
    studentIdForReload?: string,
  ) => {
    try {
      const res = await api.put(`/api/attendance/${recordId}`, {
        status: newStatus.toLowerCase(),
        remarks,
      });
      if (res.data?.success) {
        alert('Attendance record updated successfully!');
        if (studentIdForReload) {
          fetchStudentHistory(studentIdForReload);
        }
        fetchAttendance();
      }
    } catch (err: any) {
      console.error('Error updating record:', err);
      alert(err.response?.data?.message || 'Failed to update record.');
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()),
  );

  const presentCount = students.filter((s) => s.status === 'Present').length;
  const absentCount = students.filter((s) => s.status === 'Absent').length;
  const lateCount = students.filter((s) => s.status === 'Late').length;
  const excusedCount = students.filter((s) => s.status === 'Excused').length;

  const hasChartData = presentCount > 0 || absentCount > 0 || lateCount > 0 || excusedCount > 0;
  const chartData = hasChartData
    ? [
        { name: 'Present', value: presentCount, color: '#10B981' },
        { name: 'Absent', value: absentCount, color: '#EF4444' },
        { name: 'Late', value: lateCount, color: '#F59E0B' },
        { name: 'Excused', value: excusedCount, color: '#06B6D4' },
      ].filter((item) => item.value > 0)
    : [{ name: 'No marked students', value: 1, color: '#94A3B8' }];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Management"
        desc={
          activeTab === 'notifications'
            ? 'Cockpit dashboard for class teachers to check overall department student percentages, compose customizable alert notifications, and manage dispatches.'
            : 'Mark daily slot attendance, query complete student logs, manage dynamic statuses and view trends.'
        }
        actions={
          activeTab === 'notifications' ? (
            <div className="flex items-center gap-2 bg-slate-100 border px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
              <Settings className="size-4 text-slate-500 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Workflow: {warnSettings.enabled ? 'HOD Approvals Required' : 'Direct Dispatch Bypassed'}</span>
            </div>
          ) : undefined
        }
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
          Mark Attendance
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
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-6 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'notifications'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Attendance Notifications
        </button>
      </div>

      {activeTab === 'mark' && (
        /* MARK ATTENDANCE VIEW */
        <>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'Total Students', value: students.length.toString(), tone: 'info' as const },
              { label: 'Present Today', value: presentCount.toString(), tone: 'success' as const },
              { label: 'Absent Today', value: absentCount.toString(), tone: 'danger' as const },
              { label: 'Excused Today', value: excusedCount.toString(), tone: 'warn' as const },
            ].map((stat) => (
              <Card key={stat.label}>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="text-2xl font-bold mt-2">{stat.value}</div>
                <Badge tone={stat.tone} className="mt-3">
                  Selected Slot
                </Badge>
              </Card>
            ))}
          </div>

          <Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {/* Department */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none"
                >
                  {['CSE', 'ECE', 'MECH', 'CIVIL', 'IT', 'EEE'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Semester</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={String(s)}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none"
                >
                  {['A', 'B', 'C'].map((s) => (
                    <option key={s} value={s}>
                      Section {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none"
                >
                  {subjectsList.length > 0
                    ? subjectsList.map((s) => (
                        <option key={s.id || s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))
                    : ['Data Structures', 'Algorithms', 'Database Systems', 'Web Technologies'].map(
                        (s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ),
                      )}
                </select>
              </div>

              {/* Period */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                    <option key={p} value={String(p)}>
                      Period {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Time</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none"
                >
                  {[
                    '09:00 AM',
                    '10:00 AM',
                    '11:00 AM',
                    '12:00 PM',
                    '01:00 PM',
                    '02:00 PM',
                    '03:00 PM',
                    '04:00 PM',
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
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
                  className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                placeholder="Search students in class list..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm focus:outline-none"
              />
            </div>
          </Card>

          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-base">Attendance Marking Grid</h3>
                <div className="flex items-center gap-2">
                  <Badge tone="info">{selectedSubject}</Badge>
                  <Badge tone="success">Period {selectedPeriod}</Badge>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      {[
                        'Roll Number',
                        'Student Name',
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
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => {
                        const shortage = student.attendancePercentage < 75;
                        return (
                          <tr
                            key={student.id}
                            className={`hover:bg-accent/50 transition ${shortage ? 'bg-red-50/30' : ''}`}
                          >
                            <td className="py-3 px-4 font-medium text-xs">
                              <button
                                onClick={() => {
                                  setActiveTab('history');
                                  setStudentSearchQuery(student.id);
                                  fetchStudentHistory(student.id);
                                }}
                                title="Click to view full history"
                                className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold transition text-left focus:outline-none"
                              >
                                {student.id}
                              </button>
                            </td>
                            <td className="py-3 px-4 font-medium">{student.name}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`font-semibold text-xs px-2 py-0.5 rounded-full ${shortage ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}
                              >
                                {student.attendancePercentage}%
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={student.status}
                                onChange={(e) => handleStatusChange(student.id, e.target.value)}
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
                                value={student.remarks}
                                onChange={(e) => handleRemarksChange(student.id, e.target.value)}
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
                          colSpan={5}
                          className="py-8 text-center text-muted-foreground font-medium"
                        >
                          ⚠️ There are no students present in this branch, semester, or section.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredStudents.length > 0 && (
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
                  <PieChartIcon className="size-5 text-indigo" />
                  <h3 className="font-semibold">Attendance Split</h3>
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
                      <Tooltip formatter={(value) => [`${value} Student(s)`]} />
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
      )}

      {activeTab === 'history' && (
        /* ATTENDANCE HISTORY VIEW & QUERY */
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-base">Lookup Attendance History</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Search a student by name/roll number to pull their individual log, or edit slot
                  details below.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  placeholder="Enter Student Roll Number or Name (e.g. 26CSE04)..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm focus:outline-none"
                />
              </div>
              <button
                onClick={() => fetchStudentHistory(studentSearchQuery)}
                disabled={searchingStudent || !studentSearchQuery.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 transition"
              >
                {searchingStudent ? 'Searching...' : 'Fetch Student Log'}
              </button>
              {selectedStudentForHistory && (
                <button
                  onClick={() => {
                    setSelectedStudentForHistory(null);
                    setStudentHistoryRecords([]);
                    setStudentSearchQuery('');
                  }}
                  className="px-3 py-2.5 border rounded-xl hover:bg-accent text-sm font-semibold text-muted-foreground cursor-pointer transition"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </Card>

          {selectedStudentForHistory ? (
            /* Student specific log display */
            <Card>
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div>
                  <h4 className="font-bold text-lg text-foreground">
                    {selectedStudentForHistory.fullName}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedStudentForHistory.rollNumber} | {selectedStudentForHistory.department}{' '}
                    | Semester {selectedStudentForHistory.semester}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    tone={
                      selectedStudentForHistory.attendancePercentage >= 75 ? 'success' : 'danger'
                    }
                    className="text-sm px-3 py-1 font-bold"
                  >
                    {selectedStudentForHistory.attendancePercentage}% Overall
                  </Badge>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {selectedStudentForHistory.attendancePercentage >= 75
                      ? 'Eligible'
                      : 'Attendance Shortage'}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      {['Date', 'Subject', 'Status', 'Remarks', 'Actions'].map((col) => (
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
                    {studentHistoryRecords.length > 0 ? (
                      studentHistoryRecords.map((rec) => (
                        <tr key={rec._id || rec.id} className="hover:bg-accent/50 transition">
                          <td className="py-3 px-4 font-mono text-xs">{rec.formattedDate}</td>
                          <td className="py-3 px-4 font-medium">{rec.subject}</td>
                          <td className="py-3 px-4">
                            <select
                              value={rec.statusDisplay}
                              onChange={(e) =>
                                handleUpdateRecordStatus(
                                  rec._id || rec.id,
                                  e.target.value,
                                  rec.remarks || '',
                                  selectedStudentForHistory.rollNumber,
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
                                    selectedStudentForHistory.rollNumber,
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
                                  selectedStudentForHistory.rollNumber,
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
                          colSpan={5}
                          className="py-8 text-center text-muted-foreground font-medium"
                        >
                          No historical attendance records found for this student.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            /* CLASS SLOT HISTORY GRID */
            <Card>
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b pb-4 mb-4">
                <div>
                  <h4 className="font-bold text-base text-foreground">Class Slot Attendance Log</h4>
                  <p className="text-xs text-muted-foreground">
                    Modify recorded slots for {selectedSubject} on {selectedDate} below.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge tone="info">
                    {selectedDepartment} Sem {selectedSemester} - {selectedSection}
                  </Badge>
                  <Badge tone="success">Period {selectedPeriod}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6 p-4 border rounded-xl bg-gradient-soft">
                {/* Re-use slot selector within history tab for clean filtering */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Department</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full rounded-xl border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    {['CSE', 'ECE', 'MECH', 'CIVIL', 'IT', 'EEE'].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Semester</label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full rounded-xl border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={String(s)}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Section</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full rounded-xl border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    {['A', 'B', 'C'].map((s) => (
                      <option key={s} value={s}>
                        Section {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full rounded-xl border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    {subjectsList.length > 0
                      ? subjectsList.map((s) => (
                          <option key={s.id || s.name} value={s.name}>
                            {s.name}
                          </option>
                        ))
                      : [
                          'Data Structures',
                          'Algorithms',
                          'Database Systems',
                          'Web Technologies',
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Period</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full rounded-xl border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                      <option key={p} value={String(p)}>
                        Period {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Time</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full rounded-xl border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    {[
                      '09:00 AM',
                      '10:00 AM',
                      '11:00 AM',
                      '12:00 PM',
                      '01:00 PM',
                      '02:00 PM',
                      '03:00 PM',
                      '04:00 PM',
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
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
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      {[
                        'Roll Number',
                        'Student Name',
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
                    {students.length > 0 ? (
                      students.map((student) => {
                        const hasRecord = !!student.dbId;
                        const shortage = student.attendancePercentage < 75;
                        return (
                          <tr
                            key={student.id}
                            className={`hover:bg-accent/50 transition ${shortage ? 'bg-red-50/30' : ''}`}
                          >
                            <td className="py-3 px-4 font-medium text-xs">{student.id}</td>
                            <td className="py-3 px-4 font-medium">{student.name}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`font-semibold text-xs px-2 py-0.5 rounded-full ${shortage ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}
                              >
                                {student.attendancePercentage}%
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                                  !hasRecord
                                    ? 'bg-slate-100 text-slate-600'
                                    : student.status === 'Present'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : student.status === 'Absent'
                                        ? 'bg-red-100 text-red-800'
                                        : student.status === 'Late'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-cyan-100 text-cyan-800'
                                }`}
                              >
                                {hasRecord ? student.status : 'Not Logged'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-muted-foreground">
                              {student.remarks || '-'}
                            </td>
                            <td className="py-3 px-4 flex items-center gap-2">
                              {hasRecord ? (
                                <>
                                  <button
                                    onClick={() => {
                                      const promptStatus = window.prompt(
                                        'Enter new status (Present, Absent, Late, Excused):',
                                        student.status,
                                      );
                                      if (promptStatus) {
                                        const clean = promptStatus.trim();
                                        if (
                                          ['Present', 'Absent', 'Late', 'Excused'].includes(clean)
                                        ) {
                                          handleUpdateRecordStatus(
                                            student.dbId,
                                            clean,
                                            student.remarks,
                                          );
                                        } else {
                                          alert(
                                            'Invalid status entered. Must be Present, Absent, Late, or Excused.',
                                          );
                                        }
                                      }
                                    }}
                                    className="p-1 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 rounded transition"
                                    title="Edit status inline"
                                  >
                                    <Edit className="size-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRecord(student.dbId)}
                                    className="p-1 hover:bg-red-50 text-red-600 hover:text-red-800 rounded transition"
                                    title="Delete record"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-muted-foreground italic">
                                  No action
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
                          No students enrolled in the selected class cohort.
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

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Sub-tabs navigation */}
          <div className="flex flex-wrap border-b border-muted">
            {[
              { id: 'select_students', label: 'Select Students', icon: Users },
              { id: 'pending_hod', label: 'Pending HOD Approval', icon: Clock },
              { id: 'approved_requests', label: 'Approved Requests', icon: CheckCircle2 },
              { id: 'send_notifications', label: 'Send Notifications', icon: Send },
              { id: 'sent_history', label: 'Sent History', icon: FileText },
              { id: 'templates', label: 'Email Templates', icon: Layers },
              { id: 'analytics', label: 'Analytics', icon: PieChartIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setNotificationsTab(tab.id as any);
                    setSelectedStudentIds([]);
                    setSearchQuery('');
                  }}
                  className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                    notificationsTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 font-extrabold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="size-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Main Container */}
          {(notificationsTab === 'select_students' || notificationsTab === 'send_notifications') && (
            <div className="space-y-4 animate-fade-in">
              {notificationsTab === 'send_notifications' && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-3">
                  <Info className="size-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-800 text-xs">Smart Notification Recommendations</h4>
                    <p className="text-[11px] text-amber-700 leading-normal mt-0.5">
                      The recommended slab lists all active students whose overall monthly attendance has slipped below the mandatory 75% limit.
                    </p>
                  </div>
                </div>
              )}

              {/* Filters cockpit */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                  <div className="relative min-w-[200px] shrink-0">
                    <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
                    <input
                      placeholder="Search student or roll number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl border bg-background text-xs outline-none focus:border-indigo-500 w-full"
                    />
                  </div>

                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="px-2.5 py-1.5 border rounded-xl bg-background text-xs outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">All Years</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>

                  <select
                    value={semesterFilter}
                    onChange={(e) => setSemesterFilter(e.target.value)}
                    className="px-2.5 py-1.5 border rounded-xl bg-background text-xs outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">All Semesters</option>
                    <option value="1">Sem 1</option>
                    <option value="2">Sem 2</option>
                    <option value="3">Sem 3</option>
                    <option value="4">Sem 4</option>
                    <option value="5">Sem 5</option>
                    <option value="6">Sem 6</option>
                    <option value="7">Sem 7</option>
                    <option value="8">Sem 8</option>
                  </select>

                  <select
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    className="px-2.5 py-1.5 border rounded-xl bg-background text-xs outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">All Sections</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setBulkComposerOpen(true)}
                    disabled={selectedStudentIds.length === 0}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Send className="size-3.5" />
                    <span>Bulk Dispatch ({selectedStudentIds.length} selected)</span>
                  </button>
                </div>
              </div>

              {/* Student Grid Table */}
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-slate-400 text-left font-bold uppercase tracking-wider bg-slate-50/50">
                        <th className="py-2.5 pl-3 w-8">
                          <input
                            type="checkbox"
                            checked={activeFiltered.length > 0 && selectedStudentIds.length === activeFiltered.length}
                            onChange={() => handleToggleAll(activeFiltered)}
                            className="rounded accent-indigo-600 cursor-pointer"
                          />
                        </th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Roll Number</th>
                        <th className="py-2.5 px-3">Class details</th>
                        <th className="py-2.5 px-3">Overall Attendance</th>
                        <th className="py-2.5 px-3">Smart Slab Recommendation</th>
                        <th className="py-2.5 px-3 text-right pr-3">Notice Composer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {warnLoading ? (
                        <tr>
                          <td colSpan={7} className="py-16 text-center text-slate-400 font-semibold">
                            Fetching students warnings panel records...
                          </td>
                        </tr>
                      ) : activeFiltered.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-16 text-center text-slate-400 font-semibold">
                            No students profiles match selected search criteria.
                          </td>
                        </tr>
                      ) : (
                        activeFiltered.map(student => {
                          const isSelected = selectedStudentIds.includes(student.id);
                          return (
                            <tr
                              key={student.id}
                              className={`hover:bg-slate-50/60 transition ${
                                isSelected ? 'bg-indigo-50/20' : ''
                              }`}
                            >
                              <td className="py-3 pl-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleStudent(student.id)}
                                  className="rounded accent-indigo-600 cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-3 font-bold text-slate-800">
                                <div className="flex items-center gap-1.5">
                                  <User className="size-3.5 text-indigo-500 shrink-0" />
                                  <span>{student.full_name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-slate-600">{student.roll_number}</td>
                              <td className="py-3 px-3 text-slate-500 font-semibold">
                                Yr {student.year} / Sem {student.semester} - {student.section} ({student.department})
                              </td>
                              <td className="py-3 px-3 font-bold">
                                <Badge tone={getSlabTone(student.overall_attendance)}>{student.overall_attendance}%</Badge>
                              </td>
                              <td className="py-3 px-3 text-slate-600 font-semibold">
                                {getSlabLabel(student.overall_attendance)}
                              </td>
                              <td className="py-3 px-3 text-right pr-3">
                                <button
                                  onClick={() => openComposer(student)}
                                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[10px] cursor-pointer transition shadow-sm"
                                >
                                  Dispatch Notice
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Pending HOD signoffs */}
          {notificationsTab === 'pending_hod' && (
            <Card className="animate-fade-in">
              <div className="border-b pb-3 mb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Clock className="size-4 text-indigo-500" />
                  <span>Pending Signoffs & HOD Revisions</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-slate-400 text-left font-bold uppercase bg-slate-50/50">
                      <th className="py-2.5 pl-3">Student</th>
                      <th className="py-2.5 px-3">Attendance %</th>
                      <th className="py-2.5 px-3">Recipients</th>
                      <th className="py-2.5 px-3">Warning Type</th>
                      <th className="py-2.5 px-3">Date Submitted</th>
                      <th className="py-2.5 px-3">Workflow Status</th>
                      <th className="py-2.5 px-3 text-right pr-3">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                          No active requests pending in HOD workflow.
                        </td>
                      </tr>
                    ) : (
                      pendingList.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 pl-3 font-bold text-slate-800">
                            {req.student_name}
                            <span className="text-[10px] text-slate-400 block font-normal font-mono">{req.roll_number}</span>
                          </td>
                          <td className="py-3.5 px-3 font-bold text-red-500">{req.attendance_percentage}%</td>
                          <td className="py-3.5 px-3 font-semibold text-slate-600">
                            {String(req.selected_recipients).replace(/[[\]"]/g, '').replace(/,/g, ', ')}
                          </td>
                          <td className="py-3.5 px-3 font-bold text-slate-700">{req.message_type}</td>
                          <td className="py-3.5 px-3 font-semibold text-slate-500">
                            {new Date(req.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeColor(req.status)}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right pr-3">
                            <button
                              onClick={() => setViewRequest(req)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border text-slate-700 rounded-lg font-bold text-[10px] cursor-pointer transition"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Approved Alerts (Waiting for dispatch) */}
          {notificationsTab === 'approved_requests' && (
            <Card className="animate-fade-in">
              <div className="border-b pb-3 mb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>Approved Warnings Ready for Dispatch</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-slate-400 text-left font-bold uppercase bg-slate-50/50">
                      <th className="py-2.5 pl-3">Student</th>
                      <th className="py-2.5 px-3">Attendance %</th>
                      <th className="py-2.5 px-3">Warning Slab</th>
                      <th className="py-2.5 px-3">Signoff HOD</th>
                      <th className="py-2.5 px-3">Approval Date</th>
                      <th className="py-2.5 px-3 text-right pr-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {approvedList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                          No approved requests waiting for dispatch.
                        </td>
                      </tr>
                    ) : (
                      approvedList.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 pl-3 font-bold text-slate-800">
                            {req.student_name}
                            <span className="text-[10px] text-slate-400 block font-normal font-mono">{req.roll_number}</span>
                          </td>
                          <td className="py-3.5 px-3 font-bold text-red-500">{req.attendance_percentage}%</td>
                          <td className="py-3.5 px-3 font-bold text-slate-700">{req.message_type}</td>
                          <td className="py-3.5 px-3 font-extrabold text-indigo-900 flex items-center gap-1 mt-2.5">
                            <Shield className="size-3.5 text-indigo-500" />
                            <span>{req.approved_by || 'HOD'}</span>
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-slate-500">
                            {req.approved_at ? new Date(req.approved_at).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-3.5 px-3 text-right pr-3">
                            <button
                              onClick={() => {
                                setActiveDispatchRequest(req);
                                handleFinalDispatch();
                              }}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] cursor-pointer transition shadow-sm"
                            >
                              Dispatch Warning
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Sent history */}
          {notificationsTab === 'sent_history' && (
            <Card className="animate-fade-in">
              <div className="border-b pb-3 mb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Send className="size-4 text-indigo-500" />
                  <span>Sent Warning Alerts History</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-slate-400 text-left font-bold uppercase bg-slate-50/50">
                      <th className="py-2.5 pl-3">Student Name</th>
                      <th className="py-2.5 px-3">Roll No.</th>
                      <th className="py-2.5 px-3">Attendance %</th>
                      <th className="py-2.5 px-3">Notice Type</th>
                      <th className="py-2.5 px-3">Recipients Logged</th>
                      <th className="py-2.5 px-3">Dispatch Date</th>
                      <th className="py-2.5 px-3 text-right pr-3">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historyList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                          No warning dispatches saved in ledger.
                        </td>
                      </tr>
                    ) : (
                      historyList.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 pl-3 font-bold text-slate-800">{req.student_name}</td>
                          <td className="py-3.5 px-3 font-mono font-bold text-slate-600">{req.roll_number}</td>
                          <td className="py-3.5 px-3 font-bold text-red-500">{req.attendance_percentage}%</td>
                          <td className="py-3.5 px-3 font-bold text-slate-700">{req.message_type}</td>
                          <td className="py-3.5 px-3 font-semibold text-slate-600">
                            {String(req.selected_recipients).replace(/[[\]"]/g, '').replace(/,/g, ', ')}
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-slate-500">
                            {req.sent_at ? new Date(req.sent_at).toLocaleString() : '-'}
                          </td>
                          <td className="py-3.5 px-3 text-right pr-3">
                            <button
                              onClick={() => setViewRequest(req)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 cursor-pointer"
                            >
                              <Info className="size-4.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Warning Templates Config */}
          {notificationsTab === 'templates' && (
            <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
              {templates.map(tmpl => (
                <Card key={tmpl.id} className="flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start border-b pb-2 mb-2">
                      <h4 className="font-extrabold text-slate-800 text-xs">{tmpl.name} Style</h4>
                      <Badge tone="info">Loaded</Badge>
                    </div>
                    <div className="text-[11px] font-bold text-slate-700 mt-1">Subject Template:</div>
                    <div className="bg-slate-50 p-2 rounded-lg font-mono text-[10px] border mt-0.5 truncate text-slate-600">
                      {tmpl.subject}
                    </div>
                    <div className="text-[11px] font-bold text-slate-700 mt-2">Message Body Template:</div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border mt-0.5 text-[10px] text-slate-600 whitespace-pre-line font-serif leading-relaxed">
                      {tmpl.body}
                    </div>
                  </div>
                  <div className="flex justify-end border-t pt-3 mt-4">
                    <button
                      onClick={() => {
                        setEditingTemplate(tmpl);
                        setEditSubject(tmpl.subject);
                        setEditBody(tmpl.body);
                      }}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold cursor-pointer transition shadow-sm flex items-center gap-1"
                    >
                      <Edit className="size-3" /> Edit Template
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Analytics tab */}
          {notificationsTab === 'analytics' && (
            <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
              <Card className="col-span-1 flex flex-col justify-between">
                <h3 className="font-bold text-slate-800 text-sm mb-3">Alerts Ledger Volume</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-1 border-b text-xs">
                    <span className="text-slate-500 font-semibold">Total Requests Logged:</span>
                    <span className="font-extrabold text-slate-800 font-mono">
                      {pendingList.length + approvedList.length + historyList.length}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b text-xs">
                    <span className="text-slate-500 font-semibold">Pending Approvals:</span>
                    <span className="font-extrabold text-amber-600 font-mono">
                      {pendingList.filter(r => r.status === 'Pending HOD Approval').length}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b text-xs">
                    <span className="text-slate-500 font-semibold">Rejected / Revision Req:</span>
                    <span className="font-extrabold text-rose-600 font-mono">
                      {pendingList.filter(r => r.status === 'Rejected').length}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b text-xs">
                    <span className="text-slate-500 font-semibold">Approved (Ready):</span>
                    <span className="font-extrabold text-emerald-600 font-mono">{approvedList.length}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b text-xs">
                    <span className="text-slate-500 font-semibold">Successfully Dispatched:</span>
                    <span className="font-extrabold text-indigo-600 font-mono">
                      {historyList.filter(r => r.status === 'Sent').length}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="col-span-2">
                <h3 className="font-bold text-slate-800 text-sm mb-3">Monthly Warning Slab Dispatches Split</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Detention Alerts (<65%)', count: historyList.filter(r => r.message_type === 'Detention Warning' || r.message_type === 'Detention Alert').length, color: 'bg-rose-500' },
                    { label: 'Critical warnings (65-74%)', count: historyList.filter(r => r.message_type === 'Critical Warning').length, color: 'bg-orange-500' },
                    { label: 'Friendly Reminders (75-79%)', count: historyList.filter(r => r.message_type === 'Friendly Reminder' || r.message_type === 'Warning').length, color: 'bg-amber-500' },
                    { label: 'Appreciations (>=90%)', count: historyList.filter(r => r.message_type === 'Appreciation').length, color: 'bg-emerald-500' }
                  ].map((item, idx) => {
                    const total = historyList.length || 1;
                    const pct = Math.round((item.count / total) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{item.label}</span>
                          <span>{item.count} alerts ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className={`${item.color} h-full rounded-full`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Edit Warning Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-2xl border border-muted p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Edit className="size-4 text-indigo-500" />
                Edit Warning Template Style
              </h4>
              <button
                onClick={() => setEditingTemplate(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">Email Subject Line:</label>
                <input
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="px-3 py-2 border rounded-xl bg-background focus:outline-none w-full font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">Email Message Body:</label>
                <textarea
                  rows={8}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="p-3 border rounded-xl bg-background focus:outline-none w-full font-serif leading-relaxed whitespace-pre-wrap"
                />
                <span className="text-[10px] text-slate-400 leading-normal mt-1 block">
                  Available tags: <code>{`{student_name}`}</code>, <code>{`{roll_number}`}</code>, <code>{`{attendance_percentage}`}</code>
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer text-muted-foreground hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={warnLoading}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                {warnLoading ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Composer Dialog Modal */}
      {composerOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full shadow-2xl border border-muted flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Bell className="size-4.5 text-indigo-500" />
                  <span>Notification Warning Composer</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  student: <strong>{selectedStudent.full_name}</strong> ({selectedStudent.roll_number}) | overall attendance:{' '}
                  <strong>{selectedStudent.overall_attendance}%</strong>
                </p>
              </div>
              <button
                onClick={() => {
                  setComposerOpen(false);
                  setSelectedStudent(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Options Panel */}
                <div className="space-y-3.5">
                  {/* Select Template */}
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">Message Warning Template Style:</label>
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="px-2.5 py-1.5 border rounded-xl bg-background focus:outline-none cursor-pointer"
                    >
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Recipients list */}
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">Recipient Channels:</label>
                    <div className="flex flex-wrap gap-3 p-2.5 rounded-xl border bg-slate-50/50">
                      {['Student', 'Parent', 'HOD', 'Teacher'].map(role => {
                        const checked = composerRecipients.includes(role);
                        return (
                          <label key={role} className="flex items-center gap-1.5 cursor-pointer font-semibold text-[11px]">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setComposerRecipients(prev =>
                                  prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
                                )
                              }
                              className="accent-indigo-600"
                            />
                            <span>{role}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Attachments panel */}
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">Notification Attachments:</label>
                    <div className="flex gap-2">
                      <input
                        placeholder="e.g. attendance_report.pdf"
                        value={newAttachmentName}
                        onChange={(e) => setNewAttachmentName(e.target.value)}
                        className="px-3 py-1.5 border rounded-xl bg-background focus:outline-none flex-1"
                      />
                      <button
                        onClick={handleAddAttachment}
                        className="px-3 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold flex items-center justify-center cursor-pointer gap-1"
                      >
                        <Plus className="size-3.5" /> Add
                      </button>
                    </div>

                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 bg-slate-100 p-2 rounded-xl">
                        {attachments.map((file, i) => (
                          <span
                            key={i}
                            className="bg-white border rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-700 flex items-center gap-1"
                          >
                            <Paperclip className="size-3 text-slate-400" />
                            <span>{file.name}</span>
                            <button
                              onClick={() => handleRemoveAttachment(i)}
                              className="text-rose-500 font-extrabold hover:text-rose-700 ml-1 cursor-pointer"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Preview Panel */}
                <div className="border rounded-xl p-4 bg-indigo-50/20 flex flex-col justify-between h-[300px]">
                  <div className="flex justify-between border-b pb-1 mb-2">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Live Preview</span>
                    <span className="text-[9px] bg-indigo-100 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full border">SMTP Output</span>
                  </div>
                  <div className="overflow-y-auto flex-1 space-y-2">
                    <div className="font-bold text-slate-800 text-[11px]">
                      Subject: <span className="font-semibold text-slate-600">{resolvePreview(composerSubject, selectedStudent)}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-serif whitespace-pre-wrap leading-relaxed border-t pt-2 mt-2">
                      {resolvePreview(composerBody, selectedStudent)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-3.5 border-t pt-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Override Subject Header:</label>
                  <input
                    value={composerSubject}
                    onChange={(e) => setComposerSubject(e.target.value)}
                    className="px-3 py-2 border rounded-xl bg-background focus:outline-none w-full font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Override Warning Body:</label>
                  <textarea
                    rows={5}
                    value={composerBody}
                    onChange={(e) => setComposerBody(e.target.value)}
                    className="p-3 border rounded-xl bg-background focus:outline-none w-full font-serif leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="px-5 py-3.5 border-t bg-slate-50/50 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => {
                  setComposerOpen(false);
                  setSelectedStudent(null);
                }}
                className="px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer text-muted-foreground hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleComposerSubmit}
                disabled={warnLoading || composerRecipients.length === 0}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-md"
              >
                {warnLoading ? 'Processing...' : warnSettings.enabled ? 'Submit for HOD Approval' : 'Send Direct Email'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Bulk Composer Modal */}
      {bulkComposerOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-xl w-full shadow-2xl border border-muted p-5 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Bulk Attendance Dispatch Composer</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Currently selected: <strong>{selectedStudentIds.length} students</strong>
                </p>
              </div>
              <button
                onClick={() => setBulkComposerOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">Select base template style:</label>
                <select
                  value={bulkTemplateId}
                  onChange={(e) => setBulkTemplateId(e.target.value)}
                  className="px-2.5 py-1.5 border rounded-xl bg-background focus:outline-none cursor-pointer"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">Recipients checklist:</label>
                <div className="flex gap-4 p-2.5 rounded-xl border bg-slate-50/50">
                  {['Student', 'Parent', 'HOD', 'Teacher'].map(role => {
                    const checked = bulkRecipients.includes(role);
                    return (
                      <label key={role} className="flex items-center gap-1.5 cursor-pointer font-semibold text-[11px]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setBulkRecipients(prev =>
                              prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
                            )
                          }
                          className="accent-indigo-600"
                        />
                        <span>{role}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">Custom email subject header:</label>
                <input
                  value={bulkSubject}
                  onChange={(e) => setBulkSubject(e.target.value)}
                  className="px-3 py-2 border rounded-xl bg-background focus:outline-none w-full font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700">Custom email warning body:</label>
                <textarea
                  rows={6}
                  value={bulkBody}
                  onChange={(e) => setBulkBody(e.target.value)}
                  className="p-3 border rounded-xl bg-background focus:outline-none w-full font-serif leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                onClick={() => setBulkComposerOpen(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer text-muted-foreground hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkSubmit}
                disabled={warnLoading || selectedStudentIds.length === 0 || bulkRecipients.length === 0}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-md"
              >
                {warnLoading ? 'Dispatched alerts...' : warnSettings.enabled ? 'Submit Requests to HOD' : 'Send Emails directly'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* View request Details Modal */}
      {viewRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-2xl border border-muted p-5 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Info className="size-4 text-indigo-500" />
                Warning Alert Details
              </h4>
              <button
                onClick={() => setViewRequest(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Student Name</div>
                  <div className="font-bold text-slate-800">{viewRequest.student_name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Roll Number</div>
                  <div className="font-mono text-slate-700 font-semibold">{viewRequest.roll_number}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Department</div>
                  <div className="font-semibold text-slate-700">{viewRequest.department}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Overall Attendance</div>
                  <div className="font-extrabold text-red-600">{viewRequest.attendance_percentage}%</div>
                </div>
              </div>

              <div className="space-y-1.5 border rounded-xl p-3">
                <div className="flex justify-between border-b pb-1 font-semibold text-slate-500">
                  <span>Workflow Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeColor(viewRequest.status)}`}>
                    {viewRequest.status}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1 font-semibold text-slate-500">
                  <span>Notice Type style:</span>
                  <span className="text-slate-800 font-bold">{viewRequest.message_type}</span>
                </div>
                <div className="flex justify-between border-b pb-1 font-semibold text-slate-500">
                  <span>Recipients list:</span>
                  <span className="text-slate-700 font-semibold">
                    {String(viewRequest.selected_recipients).replace(/[[\]"]/g, '').replace(/,/g, ', ')}
                  </span>
                </div>
                {viewRequest.approved_by && (
                  <div className="flex justify-between border-b pb-1 font-semibold text-slate-500">
                    <span>Approved By HOD:</span>
                    <span className="text-indigo-900 font-bold">{viewRequest.approved_by}</span>
                  </div>
                )}
                {viewRequest.approved_at && (
                  <div className="flex justify-between border-b pb-1 font-semibold text-slate-500">
                    <span>Approval Date:</span>
                    <span className="text-slate-700 font-semibold">{new Date(viewRequest.approved_at).toLocaleDateString()}</span>
                  </div>
                )}
                {viewRequest.sent_at && (
                  <div className="flex justify-between font-semibold text-slate-500">
                    <span>Sent Date Time:</span>
                    <span className="text-slate-700 font-semibold">{new Date(viewRequest.sent_at).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {viewRequest.remarks && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-xl">
                  <div className="text-[10px] font-bold text-red-800 uppercase tracking-wide">HOD Remarks:</div>
                  <p className="text-red-700 font-semibold leading-relaxed mt-0.5">{viewRequest.remarks}</p>
                </div>
              )}

              {viewRequest.subject && (
                <div className="bg-slate-50 p-2.5 rounded-xl border">
                  <div className="font-bold text-slate-800">Email Subject Line:</div>
                  <p className="text-slate-600 mt-0.5">{viewRequest.subject}</p>
                  <div className="font-bold text-slate-800 mt-2">Email Message Body:</div>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed font-serif mt-0.5">{viewRequest.message || viewRequest.custom_message}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t pt-3">
              <button
                onClick={() => setViewRequest(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Custom Cell component for Recharts
function Cell(props: any) {
  const { fill, ...rest } = props;
  return <path fill={fill} {...rest} />;
}

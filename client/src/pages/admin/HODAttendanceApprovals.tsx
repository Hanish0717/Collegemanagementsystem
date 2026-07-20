import { useState, useEffect } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  User,
  Clock,
  Check,
  Search,
  MessageSquare,
  Building2,
  Calendar,
} from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import {
  fetchPendingRequests,
  approveRequest,
  rejectRequest,
  fetchWorkflowHistory,
  AttendanceNotificationRequest,
} from '@/services/attendanceApprovalService';

export function HODAttendanceApprovals() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  
  // Data lists
  const [pendingList, setPendingList] = useState<AttendanceNotificationRequest[]>([]);
  const [approvedList, setApprovedList] = useState<AttendanceNotificationRequest[]>([]);
  const [rejectedList, setRejectedList] = useState<AttendanceNotificationRequest[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Revision modal state
  const [revisionRequest, setRevisionRequest] = useState<AttendanceNotificationRequest | null>(null);
  const [remarksText, setRemarksText] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const pending = await fetchPendingRequests();
        setPendingList(pending);
      } else {
        const allHistory = await fetchWorkflowHistory();
        setApprovedList(allHistory.filter(r => r.status === 'Approved' || r.status === 'Sent'));
        setRejectedList(allHistory.filter(r => r.status === 'Rejected'));
      }
    } catch (err) {
      console.error('Error loading approvals ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleApprove = async (id: string) => {
    if (!window.confirm('Are you sure you want to approve this request? This will allow the teacher to dispatch the emails.')) {
      return;
    }
    setLoading(true);
    try {
      const res = await approveRequest(id);
      if (res.success) {
        alert('Request approved successfully!');
        loadData();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to approve request.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRevisionModal = (req: AttendanceNotificationRequest) => {
    setRevisionRequest(req);
    setRemarksText('');
  };

  const handleRejectOrRequestRevision = async () => {
    if (!revisionRequest) return;
    if (!remarksText.trim()) {
      alert('Please specify the revision remarks.');
      return;
    }

    setLoading(true);
    try {
      const res = await rejectRequest(revisionRequest.id, remarksText);
      if (res.success) {
        alert('Revision request sent to the teacher successfully.');
        setRevisionRequest(null);
        loadData();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to reject request.');
    } finally {
      setLoading(false);
    }
  };

  const parseRecipients = (recField: any): string[] => {
    if (!recField) return [];
    if (typeof recField === 'string') {
      try {
        return JSON.parse(recField);
      } catch (e) {
        return [recField];
      }
    }
    return recField;
  };

  const parseSubjects = (subjField: any) => {
    if (!subjField) return [];
    if (typeof subjField === 'string') {
      try {
        return JSON.parse(subjField);
      } catch (e) {
        return [];
      }
    }
    return subjField;
  };

  // Search filter
  const getFilteredList = (list: AttendanceNotificationRequest[]) => {
    return list.filter(
      (r) =>
        r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.roll_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.teacher_name && r.teacher_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const currentList = 
    activeTab === 'pending' 
      ? pendingList 
      : activeTab === 'approved' 
        ? approvedList 
        : rejectedList;

  const filteredList = getFilteredList(currentList);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Warning Approvals"
        desc="Review, approve, and manage change requests for monthly attendance notifications created by department teachers."
      />

      {/* Tabs navigation */}
      <div className="flex border-b border-muted">
        {[
          { id: 'pending', label: 'Pending Approvals', icon: Clock, count: pendingList.length },
          { id: 'approved', label: 'Approved Ledger', icon: CheckCircle2, count: approvedList.length },
          { id: 'rejected', label: 'Changes Requested', icon: XCircle, count: rejectedList.length },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter and actions bar */}
      <div className="flex items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            placeholder="Search student or teacher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none"
          />
        </div>
      </div>

      {activeTab === 'pending' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredList.length > 0 ? (
            filteredList.map((req) => {
              const recs = parseRecipients(req.selected_recipients);
              const subjects = parseSubjects(req.short_attendance_subjects);
              return (
                <Card key={req.id} className="flex flex-col justify-between hover:shadow-lg transition border border-muted/80">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-foreground text-base">{req.student_name}</h4>
                        <div className="text-xs text-muted-foreground font-mono">{req.roll_number}</div>
                      </div>
                      <Badge tone="danger" className="font-extrabold text-xs">
                        {req.attendance_percentage}% Overall
                      </Badge>
                    </div>

                    <div className="border-t border-muted/60 pt-3 space-y-2">
                      <div className="text-xs flex items-center gap-1.5">
                        <User className="size-3.5 text-indigo-500" />
                        <span className="font-semibold text-slate-700">Requested By:</span> {req.teacher_name || 'Class Teacher'}
                      </div>
                      
                      <div className="text-xs flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-indigo-500" />
                        <span className="font-semibold text-slate-700">Dept/Class:</span> {req.department} (Sem {req.attendance_percentage < 65 ? 'Detention Risk' : 'Shortage'})
                      </div>

                      <div className="text-xs flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-indigo-500" />
                        <span className="font-semibold text-slate-700">Requested on:</span> {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Deficit Subjects */}
                    <div className="bg-slate-50 border rounded-xl p-2.5 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Deficit Subjects:</div>
                      <div className="flex flex-wrap gap-1">
                        {subjects.map((sub: any, idx: number) => (
                          <span key={idx} className="bg-white text-slate-700 text-[10px] px-2 py-0.5 rounded border font-medium">
                            {sub.subject}: {sub.percentage}%
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recipients & Warning Type */}
                    <div className="space-y-2">
                      <div className="text-xs">
                        <span className="font-semibold text-slate-700 block mb-1">Target Recipients:</span>
                        <div className="flex flex-wrap gap-1">
                          {recs.map((r, i) => (
                            <span key={i} className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded border border-indigo-100 font-semibold">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs">
                        <span className="font-semibold text-slate-700">Alert Template:</span>{' '}
                        <span className="font-bold text-slate-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {req.message_type}
                        </span>
                      </div>

                      {req.custom_message && (
                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-2 mt-2">
                          <div className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                            <MessageSquare className="size-3" /> Custom Message Text:
                          </div>
                          <p className="text-[10px] text-amber-700 mt-1 italic leading-normal font-medium">"{req.custom_message}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-muted/60 pt-4 mt-6">
                    <button
                      onClick={() => handleOpenRevisionModal(req)}
                      className="flex-1 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition"
                    >
                      <XCircle className="size-3.5" /> Request Revision
                    </button>
                    
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition shadow-sm"
                    >
                      <Check className="size-3.5" /> Approve
                    </button>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center text-muted-foreground">
              🎉 No pending attendance warning approval requests.
            </div>
          )}
        </div>
      )}

      {activeTab !== 'pending' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold text-muted-foreground">Student</th>
                  <th className="py-3 px-4 text-left font-semibold text-muted-foreground">Teacher (Creator)</th>
                  <th className="py-3 px-4 text-left font-semibold text-muted-foreground">Overall %</th>
                  <th className="py-3 px-4 text-left font-semibold text-muted-foreground">Alert Type</th>
                  <th className="py-3 px-4 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="py-3 px-4 text-left font-semibold text-muted-foreground">Recipients</th>
                  <th className="py-3 px-4 text-left font-semibold text-muted-foreground">Feedback / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredList.length > 0 ? (
                  filteredList.map((req) => {
                    const recs = parseRecipients(req.selected_recipients);
                    return (
                      <tr key={req.id} className="hover:bg-accent/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-foreground">{req.student_name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{req.roll_number}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-xs">{req.teacher_name || 'Class Teacher'}</td>
                        <td className="py-3.5 px-4 font-bold text-red-500">{req.attendance_percentage}%</td>
                        <td className="py-3.5 px-4 text-xs font-semibold">{req.message_type}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-bold border inline-block ${
                              req.status === 'Sent'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : req.status === 'Approved'
                                  ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                  : 'bg-red-100 text-red-800 border-red-200'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {recs.map((r, i) => (
                              <span key={i} className="bg-slate-100 text-slate-800 text-[10px] px-1.5 py-0.5 rounded border">
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-xs truncate" title={req.remarks || ''}>
                          {req.remarks || '-'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No records found in this ledger tab.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Revision Remarks Entry Modal */}
      {revisionRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-2xl border border-muted p-5">
            <div className="flex items-center justify-between border-b pb-2 mb-4">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <AlertTriangle className="size-4.5 text-red-600" />
                Request Warning Revision
              </h3>
              <button
                onClick={() => setRevisionRequest(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <XCircle className="size-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-xs">
                <span className="font-semibold text-slate-700">Student:</span> {revisionRequest.student_name} ({revisionRequest.roll_number})
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Remarks / Required Changes:</label>
                <textarea
                  rows={4}
                  value={remarksText}
                  onChange={(e) => setRemarksText(e.target.value)}
                  placeholder="Specify why you are requesting revision (e.g., 'Do not notify HOD yet, keep only Student and Parent warnings for now.')"
                  className="w-full text-xs rounded-xl border bg-background p-3 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4 mt-6">
              <button
                onClick={() => setRevisionRequest(null)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer text-muted-foreground hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectOrRequestRevision}
                disabled={loading || !remarksText.trim()}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50 transition shadow-sm"
              >
                Submit Revision Request
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

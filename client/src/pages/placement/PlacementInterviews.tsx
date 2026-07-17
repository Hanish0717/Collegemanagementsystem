import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Video, Edit2, Plus, Loader2, X, Star } from 'lucide-react';
import { Card, PageHeader, Badge } from '@/components/dashboard/ui';
import { fetchPlacementData, createInterview, updateInterview } from '@/services/placementService';
import { toast } from 'sonner';

interface InterviewItem {
  id: string;
  studentName: string;
  company: string;
  round: number;
  date: string;
  time: string;
  mode: string;
  venue: string;
  panelists: string[];
  status: string;
}

export function PlacementInterviews() {
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar Verification States
  const [calendarDate, setCalendarDate] = useState('');
  const [calendarTime, setCalendarTime] = useState('09:00 AM');
  const [slotCheckedResult, setSlotCheckedResult] = useState<{
    checked: boolean;
    available: boolean;
    interview?: InterviewItem;
  } | null>(null);

  // Feedback Form States
  const [feedbackStudent, setFeedbackStudent] = useState('');
  const [feedbackRating, setFeedbackRating] = useState('');
  const [feedbackOutcome, setFeedbackOutcome] = useState('');
  const [feedbackText, setFeedbackText] = useState('');

  interface FeedbackRecord {
    id: string;
    studentName: string;
    rating: number;
    outcome: string;
    comments: string;
    date: string;
  }

  const [recentFeedbacks, setRecentFeedbacks] = useState<FeedbackRecord[]>([]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackStudent.trim()) {
      toast.error('Please specify a student name!');
      return;
    }
    if (!feedbackRating) {
      toast.error('Please select a rating!');
      return;
    }
    if (!feedbackOutcome) {
      toast.error('Please select an outcome!');
      return;
    }
    if (!feedbackText.trim()) {
      toast.error('Please write feedback comments!');
      return;
    }

    const matchedInterview = interviews.find(
      (i) => i.studentName.toLowerCase() === feedbackStudent.trim().toLowerCase(),
    );

    if (!matchedInterview) {
      toast.error('No scheduled interview found for this student!');
      return;
    }

    try {
      const newStatus = feedbackOutcome === 'Hold' ? 'Pending' : 'Completed';
      const payload = {
        status: newStatus,
        feedbackComments: feedbackText.trim(),
        feedbackRating: parseInt(feedbackRating),
      };

      await updateInterview(matchedInterview.id, payload);

      const res = await fetchPlacementData();
      if (res.interviews) {
        setInterviews(res.interviews);
        const derivedFeedbacks = res.interviews
          .filter((i: any) => i.status === 'Completed' && i.feedbackComments)
          .map((i: any) => ({
            id: `FB_${i.id}`,
            studentName: i.studentName,
            rating: i.feedbackRating || 5,
            outcome: i.feedbackComments.toLowerCase().includes('select') ? 'Selected' : 'Hold',
            comments: i.feedbackComments,
            date: i.date || new Date().toISOString().split('T')[0],
          }));
        setRecentFeedbacks(derivedFeedbacks);
      }

      setFeedbackStudent('');
      setFeedbackRating('');
      setFeedbackOutcome('');
      setFeedbackText('');

      toast.success(`Feedback submitted successfully for ${feedbackStudent.trim()}!`);
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      toast.error('Failed to submit feedback.');
    }
  };

  const activeUncompletedInterviews = interviews.filter(
    (i) => i.status.toLowerCase() === 'scheduled' || i.status.toLowerCase() === 'pending',
  );

  const handleFindSlots = () => {
    if (!calendarDate) {
      toast.error('Please select a date first!');
      return;
    }
    const match = interviews.find((i) => i.date === calendarDate && i.time === calendarTime);
    if (match) {
      setSlotCheckedResult({
        checked: true,
        available: false,
        interview: match,
      });
      toast.warning(`Slot is occupied by ${match.studentName}'s interview!`);
    } else {
      setSlotCheckedResult({
        checked: true,
        available: true,
      });
      toast.success('Time slot is fully available!');
    }
  };

  const handleBookFromCalendar = () => {
    setFormStudentName('');
    setFormCompany('Google India');
    setFormRound('1');
    setFormDate(calendarDate);
    setFormTime(calendarTime);
    setFormMode('Online');
    setFormVenue('Video Call');
    setFormPanelists('Dr. Rajesh Verma, Priya Sharma');
    setFormStatus('Scheduled');
    setIsScheduleModalOpen(true);
  };

  // Panelist State Machine
  interface PanelistItem {
    id: string;
    name: string;
    company: string;
    role: string;
    scheduledCount: number;
    completedCount: number;
  }

  const [panelList, setPanelList] = useState<PanelistItem[]>([]);

  const [isPanelModalOpen, setIsPanelModalOpen] = useState(false);
  const [isPanelEditMode, setIsPanelEditMode] = useState(false);
  const [selectedPanelist, setSelectedPanelist] = useState<PanelistItem | null>(null);

  const [panelName, setPanelName] = useState('');
  const [panelCompany, setPanelCompany] = useState('');
  const [panelRole, setPanelRole] = useState('Technical Interviewer');

  const openAddPanelModal = () => {
    setIsPanelEditMode(false);
    setSelectedPanelist(null);
    setPanelName('');
    setPanelCompany('');
    setPanelRole('Technical Interviewer');
    setIsPanelModalOpen(true);
  };

  const openEditPanelModal = (panelist: PanelistItem) => {
    setIsPanelEditMode(true);
    setSelectedPanelist(panelist);
    setPanelName(panelist.name);
    setPanelCompany(panelist.company);
    setPanelRole(panelist.role);
    setIsPanelModalOpen(true);
  };

  const handlePanelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!panelName || !panelCompany || !panelRole) {
      toast.error('Please fill in all required fields!');
      return;
    }

    if (isPanelEditMode && selectedPanelist) {
      setPanelList((prev) =>
        prev.map((item) =>
          item.id === selectedPanelist.id
            ? {
                ...item,
                name: panelName,
                company: panelCompany,
                role: panelRole,
              }
            : item,
        ),
      );
      toast.success(`Successfully updated panelist details for ${panelName}!`);
    } else {
      const newPanelist: PanelistItem = {
        id: `PAN_${Date.now()}`,
        name: panelName,
        company: panelCompany,
        role: panelRole,
        scheduledCount: 0,
        completedCount: 0,
      };
      setPanelList((prev) => [...prev, newPanelist]);
      toast.success(`Successfully added ${panelName} to panels!`);
    }

    setIsPanelModalOpen(false);
  };

  // Modal Control States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<InterviewItem | null>(null);

  // Form Fields States
  const [formStudentName, setFormStudentName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formRound, setFormRound] = useState('1');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formMode, setFormMode] = useState('Online');
  const [formVenue, setFormVenue] = useState('');
  const [formPanelists, setFormPanelists] = useState('');
  const [formStatus, setFormStatus] = useState('Scheduled');

  const openScheduleModal = () => {
    setFormStudentName('');
    setFormCompany('');
    setFormRound('1');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime('10:00 AM');
    setFormMode('Online');
    setFormVenue('Video Call');
    setFormPanelists('Dr. Rajesh Verma, Priya Sharma');
    setFormStatus('Scheduled');
    setIsScheduleModalOpen(true);
  };

  const openViewModal = (interview: InterviewItem) => {
    setSelectedInterview(interview);
    setIsViewModalOpen(true);
  };

  const openEditModal = (interview: InterviewItem) => {
    setSelectedInterview(interview);
    setFormStudentName(interview.studentName);
    setFormCompany(interview.company);
    setFormRound(interview.round.toString());
    setFormDate(interview.date);
    setFormTime(interview.time);
    setFormMode(interview.mode);
    setFormVenue(interview.venue);
    setFormPanelists(
      interview.panelists ? interview.panelists.join(', ') : 'Dr. Rajesh Verma, Priya Sharma',
    );
    setFormStatus(interview.status);
    setIsEditModalOpen(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentName || !formCompany || !formDate || !formTime || !formVenue) {
      toast.error('Please fill in all required fields!');
      return;
    }

    try {
      const payload = {
        studentName: formStudentName,
        company: formCompany,
        round: parseInt(formRound) || 1,
        date: formDate,
        time: formTime,
        mode: formMode,
        venue: formVenue,
        status: formStatus,
      };

      const scheduledItem = await createInterview(payload);
      setInterviews((prev) => [scheduledItem, ...prev]);
      setIsScheduleModalOpen(false);
      toast.success(`Successfully scheduled interview for ${formStudentName}!`);
    } catch (err: any) {
      console.error('Error scheduling interview:', err);
      toast.error('Failed to schedule interview.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;
    if (!formStudentName || !formCompany || !formDate || !formTime || !formVenue) {
      toast.error('Please fill in all required fields!');
      return;
    }

    try {
      const payload = {
        studentName: formStudentName,
        company: formCompany,
        round: parseInt(formRound) || 1,
        date: formDate,
        time: formTime,
        mode: formMode,
        venue: formVenue,
        status: formStatus,
      };

      const updatedItem = await updateInterview(selectedInterview.id, payload);
      setInterviews((prev) =>
        prev.map((item) => (item.id === selectedInterview.id ? updatedItem : item)),
      );
      setIsEditModalOpen(false);
      toast.success(`Successfully updated interview details for ${formStudentName}!`);
    } catch (err: any) {
      console.error('Error updating interview:', err);
      toast.error('Failed to update interview details.');
    }
  };

  useEffect(() => {
    fetchPlacementData()
      .then((res) => {
        if (res.interviews) {
          setInterviews(res.interviews);

          const derivedFeedbacks = res.interviews
            .filter((i: any) => i.status === 'Completed' && i.feedbackComments)
            .map((i: any) => ({
              id: `FB_${i.id}`,
              studentName: i.studentName,
              rating: i.feedbackRating || 5,
              outcome: i.feedbackComments.toLowerCase().includes('select') ? 'Selected' : 'Hold',
              comments: i.feedbackComments,
              date: i.date || new Date().toISOString().split('T')[0],
            }));
          setRecentFeedbacks(derivedFeedbacks);

          const panelistNames = new Set<string>();
          res.interviews.forEach((i: any) => {
            if (i.panelists) {
              i.panelists.forEach((p: string) => panelistNames.add(p));
            }
          });

          const derivedPanels =
            panelistNames.size > 0
              ? Array.from(panelistNames).map((name, idx) => ({
                  id: `PAN_${idx}`,
                  name,
                  company: 'Recruiting Panel',
                  role: 'Interviewer',
                  scheduledCount: res.interviews.filter(
                    (i: any) =>
                      i.panelists && i.panelists.includes(name) && i.status === 'Scheduled',
                  ).length,
                  completedCount: res.interviews.filter(
                    (i: any) =>
                      i.panelists && i.panelists.includes(name) && i.status === 'Completed',
                  ).length,
                }))
              : [
                  {
                    id: 'PAN_1',
                    name: 'Dr. Rajesh Verma',
                    company: 'Google India',
                    role: 'Technical Interviewer',
                    scheduledCount: res.interviews.filter((i: any) => i.status === 'Scheduled')
                      .length,
                    completedCount: res.interviews.filter((i: any) => i.status === 'Completed')
                      .length,
                  },
                  {
                    id: 'PAN_2',
                    name: 'Priya Sharma',
                    company: 'Microsoft India',
                    role: 'HR Interviewer',
                    scheduledCount: 0,
                    completedCount: 0,
                  },
                ];
          setPanelList(derivedPanels);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch live interviews:', err);
        toast.error('Failed to fetch interviews list.');
        setLoading(false);
      });
  }, []);

  const scheduled = interviews.filter((i) => i.status.toLowerCase() === 'scheduled');
  const pending = interviews.filter((i) => i.status.toLowerCase() === 'pending');
  const completed = interviews.filter((i) => i.status.toLowerCase() === 'completed');

  const interviewStats = [
    { label: 'Total Interviews', value: interviews.length, color: 'bg-blue-500' },
    { label: 'Scheduled', value: scheduled.length, color: 'bg-amber-500' },
    { label: 'Pending', value: pending.length, color: 'bg-purple-500' },
    { label: 'Completed', value: completed.length, color: 'bg-emerald-500' },
  ];

  const InterviewCard = ({ interview }: { interview: InterviewItem }) => (
    <Card className="hover:-translate-y-1 transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm">{interview.studentName}</h3>
          <p className="text-xs text-muted-foreground mt-1">{interview.company}</p>
        </div>
        <Badge tone={interview.status.toLowerCase() === 'scheduled' ? 'success' : 'warn'}>
          {interview.status}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="size-8 rounded-lg bg-blue-100 text-blue-600 grid place-items-center font-bold text-xs shrink-0">
            {interview.round}
          </div>
          <span className="text-muted-foreground">
            Round {interview.round} • {interview.mode}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {new Date(interview.date).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">{interview.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {interview.mode.toLowerCase() === 'online' ? (
            <Video className="size-4 text-muted-foreground" />
          ) : (
            <MapPin className="size-4 text-muted-foreground" />
          )}
          <span className="text-muted-foreground">{interview.venue}</span>
        </div>
      </div>

      <div className="mb-3 p-2 bg-gradient-soft rounded-lg">
        <div className="text-xs text-muted-foreground mb-1">Panelists</div>
        <div className="text-xs font-medium space-y-0.5">
          {(interview.panelists || ['Technical Lead']).map((p) => (
            <div key={p}>{p}</div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => openViewModal(interview)}
          className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent cursor-pointer transition"
        >
          View
        </button>
        <button
          onClick={() => openEditModal(interview)}
          className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent cursor-pointer transition"
        >
          <Edit2 className="size-3 inline mr-1" /> Edit
        </button>
      </div>
    </Card>
  );

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Interview Scheduling"
          desc="Manage interview calendars, panel assignments and timelines."
          actions={
            <button
              onClick={openScheduleModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-95 transition"
            >
              <Plus className="size-4" /> Schedule Interview
            </button>
          }
        />

        {loading && (
          <Card className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-8 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Loading scheduled interviews...</span>
            </div>
          </Card>
        )}

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {interviewStats.map((stat) => (
              <Card key={stat.label} className="text-center">
                <div
                  className={`size-12 rounded-xl ${stat.color} text-white grid place-items-center mx-auto mb-2 font-bold`}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        )}

        {/* Interview Calendar */}
        {!loading && (
          <Card>
            <h3 className="font-semibold mb-4">Interview Calendar</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-left">Select Date</label>
                <input
                  type="date"
                  value={calendarDate}
                  onChange={(e) => {
                    setCalendarDate(e.target.value);
                    setSlotCheckedResult(null);
                  }}
                  className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-left">Select Time Slot</label>
                <select
                  value={calendarTime}
                  onChange={(e) => {
                    setCalendarTime(e.target.value);
                    setSlotCheckedResult(null);
                  }}
                  className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleFindSlots}
              className="w-full px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary cursor-pointer hover:opacity-95 transition"
            >
              Find Available Slots
            </button>

            {/* Slot Check Result Banners */}
            {slotCheckedResult && slotCheckedResult.checked && (
              <div className="mt-4 p-4 rounded-xl border border-slate-100 bg-slate-50/20 animate-in fade-in slide-in-from-top-2 duration-200">
                {slotCheckedResult.available ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-1 rounded-lg text-emerald-800">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
                      <span className="text-xs font-semibold text-left">
                        Slot is fully available on {new Date(calendarDate).toLocaleDateString()} @{' '}
                        {calendarTime}!
                      </span>
                    </div>
                    <button
                      onClick={handleBookFromCalendar}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      ⚡ Book Slot
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 text-rose-800 text-left">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-rose-500 shrink-0"></span>
                      <span className="text-xs font-semibold">Slot Occupied (Busy)</span>
                    </div>
                    <p className="text-[11px] text-rose-700/90 leading-relaxed pl-4">
                      {slotCheckedResult.interview?.studentName} has a scheduled{' '}
                      <strong>Round {slotCheckedResult.interview?.round}</strong> interview with{' '}
                      <strong>{slotCheckedResult.interview?.company}</strong> at this time. Please
                      pick another slot.
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Scheduled Interviews */}
        {!loading && scheduled.length > 0 && (
          <div>
            <h3 className="font-semibold mb-4">Scheduled Interviews ({scheduled.length})</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduled.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          </div>
        )}

        {/* Pending Interviews */}
        {!loading && pending.length > 0 && (
          <div>
            <h3 className="font-semibold mb-4">Pending Interviews ({pending.length})</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pending.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          </div>
        )}

        {/* Interview Details Table */}
        {!loading && (
          <Card>
            <h3 className="font-semibold mb-4">All Interviews Overview</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      Student
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      Company
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                      Round
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                      Date & Time
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                      Mode
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      Venue
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {interviews.map((interview) => (
                    <tr key={interview.id} className="hover:bg-accent/50 transition">
                      <td className="py-3 px-4 font-medium">{interview.studentName}</td>
                      <td className="py-3 px-4">{interview.company}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge tone="info">Round {interview.round}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                        {new Date(interview.date).toLocaleDateString()} {interview.time}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          tone={interview.mode.toLowerCase() === 'online' ? 'info' : 'success'}
                        >
                          {interview.mode}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{interview.venue}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          tone={
                            interview.status.toLowerCase() === 'scheduled'
                              ? 'success'
                              : interview.status.toLowerCase() === 'pending'
                                ? 'warn'
                                : 'info'
                          }
                        >
                          {interview.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Panel Management */}
        {!loading && (
          <Card>
            <h3 className="font-semibold mb-4">Panel Management</h3>
            <div className="space-y-3">
              {panelList.map((panelist) => (
                <div
                  key={panelist.id}
                  className="p-4 rounded-lg border flex items-start justify-between hover:bg-accent/50 transition"
                >
                  <div className="text-left">
                    <div className="font-medium text-slate-800">{panelist.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {panelist.company} • {panelist.role}
                    </div>
                    <div className="text-xs mt-2 text-slate-500 font-medium">
                      📅 {panelist.scheduledCount} interviews scheduled • ✓{' '}
                      {panelist.completedCount} completed
                    </div>
                  </div>
                  <button
                    onClick={() => openEditPanelModal(panelist)}
                    className="px-3 py-1 rounded-lg text-xs text-blue-600 hover:bg-blue-50 font-semibold cursor-pointer transition font-semibold"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={openAddPanelModal}
              className="mt-3 w-full px-4 py-2.5 rounded-xl border text-sm font-semibold hover:bg-indigo-50/20 hover:border-indigo-200 hover:text-indigo-600 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Plus className="size-4" /> Add Panelist
            </button>
          </Card>
        )}

        {/* Interview Rounds */}
        <Card>
          <h3 className="font-semibold mb-4">Interview Round Types</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { round: 1, name: 'Online Assessment', desc: 'Aptitude, coding, logical reasoning' },
              { round: 2, name: 'Technical Round', desc: 'In-depth technical discussion' },
              { round: 3, name: 'HR Round', desc: 'HR discussion and cultural fit' },
              { round: 4, name: 'Final Round', desc: 'Management / Leadership discussion' },
              { round: 5, name: 'Group Discussion', desc: 'Soft skills and group interaction' },
            ].map((r) => (
              <div key={r.round} className="p-3 rounded-lg border bg-gradient-soft">
                <div className="font-medium text-sm mb-1">
                  Round {r.round}: {r.name}
                </div>
                <div className="text-xs text-muted-foreground">{r.desc}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Interview Feedback Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Form */}
          <Card>
            <h3 className="font-semibold mb-4 text-left">Interview Feedback Form</h3>
            <form
              onSubmit={handleFeedbackSubmit}
              className="space-y-4 p-4 border rounded-xl bg-gradient-soft"
            >
              <div>
                <label className="text-sm font-medium block mb-2 text-left">Student Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter student name"
                  value={feedbackStudent}
                  onChange={(e) => setFeedbackStudent(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
                {activeUncompletedInterviews.length > 0 && (
                  <div className="mt-2 text-left">
                    <span className="text-[10px] text-muted-foreground block mb-1">
                      Quick Select Active Candidate:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeUncompletedInterviews.map((i) => (
                        <button
                          key={i.id}
                          type="button"
                          onClick={() => setFeedbackStudent(i.studentName)}
                          className="px-2 py-1 rounded-md text-[10px] bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 cursor-pointer transition border border-slate-200"
                        >
                          {i.studentName} ({i.company})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2 text-left">Rating (1-5) *</label>
                  <select
                    required
                    value={feedbackRating}
                    onChange={(e) => setFeedbackRating(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm cursor-pointer outline-none focus:border-indigo-500"
                  >
                    <option value="">Select rating</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Below Average</option>
                    <option value="3">3 - Average</option>
                    <option value="4">4 - Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2 text-left">Outcome *</label>
                  <select
                    required
                    value={feedbackOutcome}
                    onChange={(e) => setFeedbackOutcome(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm cursor-pointer outline-none focus:border-indigo-500"
                  >
                    <option value="">Select outcome</option>
                    <option value="Selected">Selected</option>
                    <option value="Hold">Hold</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2 text-left">Feedback *</label>
                <textarea
                  required
                  placeholder="Enter interview feedback details..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500"
                  rows={4}
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium cursor-pointer hover:opacity-95 transition"
              >
                Submit Feedback
              </button>
            </form>
          </Card>

          {/* Right Column: Recent Feedbacks Log */}
          <Card className="flex flex-col h-full">
            <h3 className="font-semibold mb-4 text-left">Recent Feedback Submissions</h3>
            <div className="space-y-3 overflow-y-auto flex-1 max-h-[460px] pr-1">
              {recentFeedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="p-4 rounded-xl border border-slate-100 bg-white shadow-2xs hover:shadow-xs transition duration-200 text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800">{fb.studentName}</h4>
                      <span className="text-[10px] text-muted-foreground">{fb.date}</span>
                    </div>
                    <Badge
                      tone={
                        fb.outcome === 'Selected'
                          ? 'success'
                          : fb.outcome === 'Hold'
                            ? 'warn'
                            : 'danger'
                      }
                    >
                      {fb.outcome}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`size-3.5 ${star <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-50 italic leading-relaxed">
                    "{fb.comments}"
                  </p>
                </div>
              ))}
              {recentFeedbacks.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No feedback submitted yet.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-lg p-6 my-8 animate-in fade-in zoom-in-95 duration-150 relative">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                Schedule New Interview
              </h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer transition p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={formStudentName}
                  onChange={(e) => setFormStudentName(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Company Name *
                  </label>
                  <select
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    required
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Select Company
                    </option>
                    <option value="Google India">Google India</option>
                    <option value="Microsoft India">Microsoft India</option>
                    <option value="Amazon India">Amazon India</option>
                    <option value="Goldman Sachs">Goldman Sachs</option>
                    <option value="Accenture">Accenture</option>
                    <option value="TCS">TCS</option>
                    <option value="Infosys">Infosys</option>
                    <option value="Oracle">Oracle</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Interview Round *
                  </label>
                  <select
                    value={formRound}
                    onChange={(e) => setFormRound(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="1">Round 1 (Assessment)</option>
                    <option value="2">Round 2 (Technical)</option>
                    <option value="3">Round 3 (HR)</option>
                    <option value="4">Round 4 (Final)</option>
                    <option value="5">Round 5 (GD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Time Slot *</label>
                  <select
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Interview Mode *
                  </label>
                  <select
                    value={formMode}
                    onChange={(e) => {
                      setFormMode(e.target.value);
                      setFormVenue(
                        e.target.value === 'Online' ? 'Video Call' : 'Conference Hall A',
                      );
                    }}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="Online">Online (Video Call)</option>
                    <option value="In-Person">In-Person (On Campus)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Venue / Link *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Video Call or Seminar Hall"
                    value={formVenue}
                    onChange={(e) => setFormVenue(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Assigned Panelists * (Comma-separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Verma, Priya Sharma"
                  value={formPanelists}
                  onChange={(e) => setFormPanelists(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Hiring Status *
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Schedule Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Interview Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-lg p-6 my-8 animate-in fade-in zoom-in-95 duration-150 relative">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                Edit Interview Details
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer transition p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={formStudentName}
                  onChange={(e) => setFormStudentName(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Company Name *
                  </label>
                  <select
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    required
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="Google India">Google India</option>
                    <option value="Microsoft India">Microsoft India</option>
                    <option value="Amazon India">Amazon India</option>
                    <option value="Goldman Sachs">Goldman Sachs</option>
                    <option value="Accenture">Accenture</option>
                    <option value="TCS">TCS</option>
                    <option value="Infosys">Infosys</option>
                    <option value="Oracle">Oracle</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Interview Round *
                  </label>
                  <select
                    value={formRound}
                    onChange={(e) => setFormRound(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="1">Round 1 (Assessment)</option>
                    <option value="2">Round 2 (Technical)</option>
                    <option value="3">Round 3 (HR)</option>
                    <option value="4">Round 4 (Final)</option>
                    <option value="5">Round 5 (GD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Time Slot *</label>
                  <select
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Interview Mode *
                  </label>
                  <select
                    value={formMode}
                    onChange={(e) => {
                      setFormMode(e.target.value);
                      setFormVenue(
                        e.target.value === 'Online' ? 'Video Call' : 'Conference Hall A',
                      );
                    }}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="Online">Online (Video Call)</option>
                    <option value="In-Person">In-Person (On Campus)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Venue / Link *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Video Call or Seminar Hall"
                    value={formVenue}
                    onChange={(e) => setFormVenue(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Assigned Panelists * (Comma-separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Verma, Priya Sharma"
                  value={formPanelists}
                  onChange={(e) => setFormPanelists(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Hiring Status *
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Interview Modal */}
      {isViewModalOpen && selectedInterview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-6 my-8 animate-in fade-in zoom-in-95 duration-150 relative">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                Interview Brief Overview
              </h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer transition p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg text-slate-800">
                    {selectedInterview.studentName}
                  </h4>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    {selectedInterview.company}
                  </p>
                </div>
                <Badge
                  tone={selectedInterview.status.toLowerCase() === 'scheduled' ? 'success' : 'warn'}
                >
                  {selectedInterview.status}
                </Badge>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 grid place-items-center font-bold text-xs shrink-0">
                    {selectedInterview.round}
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                      Round Details
                    </span>
                    <span className="font-bold text-slate-700">
                      Round {selectedInterview.round} • {selectedInterview.mode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 grid place-items-center shrink-0">
                    <Calendar className="size-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                      Date & Time
                    </span>
                    <span className="font-bold text-slate-700">
                      {new Date(selectedInterview.date).toLocaleDateString()} @{' '}
                      {selectedInterview.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 grid place-items-center shrink-0">
                    {selectedInterview.mode.toLowerCase() === 'online' ? (
                      <Video className="size-4" />
                    ) : (
                      <MapPin className="size-4" />
                    )}
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                      Location / Platform
                    </span>
                    <span className="font-bold text-slate-700">{selectedInterview.venue}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-gradient-soft space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Assigned Panelists:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedInterview.panelists || ['Technical Lead']).map((p) => (
                    <Badge key={p} tone="info">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  openEditModal(selectedInterview);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit2 className="size-3" /> Edit Interview Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panelist Add/Edit Modal */}
      {isPanelModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-6 my-8 animate-in fade-in zoom-in-95 duration-150 relative">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                {isPanelEditMode ? 'Edit Panelist Details' : 'Add New Panelist'}
              </h3>
              <button
                onClick={() => setIsPanelModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer transition p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handlePanelSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Panelist Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Verma"
                  value={panelName}
                  onChange={(e) => setPanelName(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Affiliated Company / Institution *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google India or Microsoft"
                  value={panelCompany}
                  onChange={(e) => setPanelCompany(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Interviewing Role *
                </label>
                <select
                  value={panelRole}
                  onChange={(e) => setPanelRole(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                >
                  <option value="Technical Interviewer">Technical Interviewer</option>
                  <option value="HR Interviewer">HR Interviewer</option>
                  <option value="System Architect">System Architect</option>
                  <option value="Interviewer Panel Lead">Interviewer Panel Lead</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsPanelModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isPanelEditMode ? 'Save Changes' : 'Add Panelist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

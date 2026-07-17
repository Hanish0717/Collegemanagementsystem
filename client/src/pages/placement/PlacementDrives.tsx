import { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Users, Clock, Loader2, X } from 'lucide-react';
import { Card, PageHeader, Badge } from '@/components/dashboard/ui';
import {
  fetchPlacementData,
  createDrive,
  updateDrive,
  DriveItem,
  CompanyItem,
} from '@/services/placementService';
import { getCompanyLogo } from './PlacementCompanies';
import { toast } from 'sonner';

export function PlacementDrives() {
  const [drives, setDrives] = useState<DriveItem[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'ongoing' | 'completed'>('upcoming');

  // Dynamic recruitment calendar configurations for the present month
  const today = new Date();
  const calendarYear = today.getFullYear();
  const calendarMonth = today.getMonth(); // 0-indexed (e.g. 6 is July)
  const calendarMonthName = today.toLocaleString('en-US', { month: 'long' });

  // Days in current month
  const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();

  // Get index of 1st day of the month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  // Shift to align: 0 = Mon, 1 = Tue, ..., 6 = Sun
  const firstDayIndexRaw = new Date(calendarYear, calendarMonth, 1).getDay();
  const firstDayIndex = firstDayIndexRaw === 0 ? 6 : firstDayIndexRaw - 1;

  // Drive Modals & Saving state
  const [isAddDriveModalOpen, setIsAddDriveModalOpen] = useState(false);
  const [isViewDriveModalOpen, setIsViewDriveModalOpen] = useState(false);
  const [isEditDriveModalOpen, setIsEditDriveModalOpen] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState<DriveItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Drive Form States
  const [driveCompany, setDriveCompany] = useState('');
  const [driveRole, setDriveRole] = useState('');
  const [driveDate, setDriveDate] = useState('');
  const [driveVenue, setDriveVenue] = useState('');
  const [driveDeadline, setDriveDeadline] = useState('');
  const [driveStatus, setDriveStatus] = useState('Upcoming');
  const [drivePackageMin, setDrivePackageMin] = useState('6.0');
  const [drivePackageMax, setDrivePackageMax] = useState('8.0');
  const [driveMinCgpa, setDriveMinCgpa] = useState('7.0');
  const [driveDepartments, setDriveDepartments] = useState<string[]>(['CSE', 'ECE']);

  useEffect(() => {
    fetchPlacementData()
      .then((res) => {
        setDrives(res.drives || []);
        setCompanies(res.companies || []);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to fetch live drives list:', err);
        setLoading(false);
      });
  }, []);

  const resetDriveForm = () => {
    setDriveCompany(companies[0]?.name || '');
    setDriveRole('');
    setDriveDate('');
    setDriveVenue('');
    setDriveDeadline('');
    setDriveStatus('Upcoming');
    setDrivePackageMin('6.0');
    setDrivePackageMax('8.0');
    setDriveMinCgpa('7.0');
    setDriveDepartments(['CSE', 'ECE']);
  };

  const openViewDriveModal = (drive: DriveItem) => {
    setSelectedDrive(drive);
    setIsViewDriveModalOpen(true);
  };

  const openEditDriveModal = (drive: DriveItem) => {
    setSelectedDrive(drive);
    setDriveCompany(drive.company);
    setDriveRole(drive.role);
    setDriveDate(drive.date);
    setDriveVenue(drive.venue);
    setDriveDeadline(drive.applicationDeadline);
    setDriveStatus(drive.status);
    const comp = companies.find((c) => c.name === drive.company);
    const pAmt = comp?.package ? parseFloat(comp.package.replace(/[^0-9.]/g, '')) : 8.0;
    setDrivePackageMin((pAmt * 0.75).toFixed(1));
    setDrivePackageMax(pAmt.toFixed(1));
    setDriveMinCgpa('7.0');
    setDriveDepartments(['CSE', 'ECE']);
    setIsEditDriveModalOpen(true);
  };

  const handleAddDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveCompany || !driveRole.trim()) {
      toast.error('Company and job role are required');
      return;
    }
    setIsSaving(true);

    try {
      await createDrive({
        company: driveCompany,
        role: driveRole,
        date: driveDate || new Date().toISOString().split('T')[0],
        venue: driveVenue || 'Virtual',
        applicationDeadline: driveDeadline || new Date().toISOString().split('T')[0],
        status: driveStatus,
        packageMin: parseFloat(drivePackageMin) || 6.0,
        packageMax: parseFloat(drivePackageMax) || 8.0,
        eligibilityMinCgpa: parseFloat(driveMinCgpa) || 7.0,
        eligibilityDepartments: driveDepartments,
      } as any);

      const res = await fetchPlacementData();
      setDrives(res.drives || []);

      toast.success('Drive added successfully!');
      setIsAddDriveModalOpen(false);
      resetDriveForm();
    } catch (err: any) {
      console.error('Failed to create drive:', err);
      toast.error(err.message || 'Failed to create drive.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrive) return;
    if (!driveCompany || !driveRole.trim()) {
      toast.error('Company and job role are required');
      return;
    }
    setIsSaving(true);

    try {
      await updateDrive(selectedDrive.id, {
        company: driveCompany,
        role: driveRole,
        date: driveDate,
        venue: driveVenue,
        applicationDeadline: driveDeadline,
        status: driveStatus,
        packageMin: parseFloat(drivePackageMin) || 6.0,
        packageMax: parseFloat(drivePackageMax) || 8.0,
        eligibilityMinCgpa: parseFloat(driveMinCgpa) || 7.0,
        eligibilityDepartments: driveDepartments,
      } as any);

      const res = await fetchPlacementData();
      setDrives(res.drives || []);

      toast.success('Drive updated successfully!');
      setIsEditDriveModalOpen(false);
      resetDriveForm();
    } catch (err: any) {
      console.error('Failed to update drive:', err);
      toast.error(err.message || 'Failed to update drive.');
    } finally {
      setIsSaving(false);
    }
  };

  const upcoming = drives.filter((d) => d.status.toLowerCase() === 'upcoming');
  const ongoing = drives.filter((d) => d.status.toLowerCase() === 'ongoing');
  const completed = drives.filter((d) => d.status.toLowerCase() === 'completed');

  const DriveCard = ({ drive }: { drive: DriveItem }) => (
    <Card className="hover:-translate-y-1 transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold">{drive.company}</h3>
          <p className="text-sm text-muted-foreground mt-1">{drive.role}</p>
        </div>
        <Badge
          tone={
            drive.status.toLowerCase() === 'upcoming'
              ? 'info'
              : drive.status.toLowerCase() === 'ongoing'
                ? 'warn'
                : 'success'
          }
        >
          {drive.status}
        </Badge>
      </div>

      <div className="space-y-2.5 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Drive Date:</span>
          <span className="font-medium">{new Date(drive.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Venue:</span>
          <span className="font-medium">{drive.venue}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Deadline:</span>
          <span className="font-medium">
            {new Date(drive.applicationDeadline).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Applications:</span>
          <span className="font-medium">{drive.studentCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-2.5 bg-gradient-soft rounded-lg mb-4">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Rounds</div>
          <div className="font-bold text-lg">{drive.rounds || 3}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Applicants</div>
          <div className="font-bold text-lg">{drive.studentCount}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => openViewDriveModal(drive)}
          className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition cursor-pointer"
        >
          Details
        </button>
        <button
          onClick={() => openEditDriveModal(drive)}
          className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition cursor-pointer"
        >
          Edit
        </button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Drive Management"
        desc="Manage recruitment drives, schedules and timelines."
        actions={
          <button
            onClick={() => {
              resetDriveForm();
              setIsAddDriveModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-95 transition"
          >
            <Plus className="size-4" /> Create Drive
          </button>
        }
      />

      {loading && (
        <Card className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Loading recruitment drives...</span>
          </div>
        </Card>
      )}

      {/* Tabs */}
      {!loading && (
        <div className="flex items-center gap-2 border-b">
          <button
            onClick={() => setSelectedTab('upcoming')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              selectedTab === 'upcoming'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Upcoming ({upcoming.length})
          </button>
          <button
            onClick={() => setSelectedTab('ongoing')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              selectedTab === 'ongoing'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Ongoing ({ongoing.length})
          </button>
          <button
            onClick={() => setSelectedTab('completed')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              selectedTab === 'completed'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Completed ({completed.length})
          </button>
        </div>
      )}

      {/* Upcoming Drives */}
      {!loading && selectedTab === 'upcoming' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcoming.map((drive) => (
            <DriveCard key={drive.id} drive={drive} />
          ))}
        </div>
      )}

      {/* Ongoing Drives */}
      {!loading && selectedTab === 'ongoing' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ongoing.map((drive) => (
            <DriveCard key={drive.id} drive={drive} />
          ))}
        </div>
      )}

      {/* Completed Drives */}
      {!loading && selectedTab === 'completed' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {completed.map((drive) => (
            <DriveCard key={drive.id} drive={drive} />
          ))}
        </div>
      )}

      {/* Calendar-style Schedule */}
      {!loading && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gradient">
                {calendarMonthName} {calendarYear} Calendar Schedule
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Timezone-safe dynamic recruitment calendar
              </p>
            </div>
            <Badge tone="info">
              {
                drives.filter((d) => {
                  if (!d.date || d.date === 'TBD') return false;
                  const parts = d.date.split('-');
                  if (parts.length === 3) {
                    return (
                      parseInt(parts[0], 10) === calendarYear &&
                      parseInt(parts[1], 10) === calendarMonth + 1
                    );
                  }
                  const dateObj = new Date(d.date);
                  return (
                    dateObj.getUTCFullYear() === calendarYear &&
                    dateObj.getUTCMonth() === calendarMonth
                  );
                }).length
              }{' '}
              drives
            </Badge>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-muted-foreground">
            <div className="py-1 rounded bg-slate-50 border border-slate-100/50">Mon</div>
            <div className="py-1 rounded bg-slate-50 border border-slate-100/50">Tue</div>
            <div className="py-1 rounded bg-slate-50 border border-slate-100/50">Wed</div>
            <div className="py-1 rounded bg-slate-50 border border-slate-100/50">Thu</div>
            <div className="py-1 rounded bg-slate-50 border border-slate-100/50">Fri</div>
            <div className="py-1 rounded bg-slate-50 border border-slate-100/50 text-indigo-600">
              Sat
            </div>
            <div className="py-1 rounded bg-slate-50 border border-slate-100/50 text-indigo-600">
              Sun
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Empty padding cells for start-of-month alignment */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="min-h-24 rounded-xl border border-dashed border-slate-100/40 bg-slate-50/10 opacity-30"
              />
            ))}

            {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
              // Parse date strictly as YYYY-MM-DD to avoid timezone shifting
              const dayDrives = drives.filter((d) => {
                if (!d.date || d.date === 'TBD' || d.date === 'Closed') return false;
                const parts = d.date.split('-');
                if (parts.length === 3) {
                  const year = parseInt(parts[0], 10);
                  const month = parseInt(parts[1], 10);
                  const dayVal = parseInt(parts[2], 10);
                  return year === calendarYear && month === calendarMonth + 1 && dayVal === day;
                }
                const dateObj = new Date(d.date);
                return (
                  dateObj.getUTCFullYear() === calendarYear &&
                  dateObj.getUTCMonth() === calendarMonth &&
                  dateObj.getUTCDate() === day
                );
              });

              const isWeekend = (firstDayIndex + day - 1) % 7 >= 5;

              return (
                <div
                  key={day}
                  className={`min-h-24 rounded-xl border p-2 transition flex flex-col justify-between ${
                    dayDrives.length > 0
                      ? 'bg-indigo-50/20 border-indigo-200 shadow-sm'
                      : isWeekend
                        ? 'bg-slate-50/50 border-slate-100/60'
                        : 'bg-background/60 border-slate-100 hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[11px] font-bold ${
                        dayDrives.length > 0
                          ? 'text-indigo-600'
                          : isWeekend
                            ? 'text-muted-foreground/60'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {day}
                    </span>
                    {dayDrives.length > 0 && (
                      <span className="size-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    )}
                  </div>
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-16 scrollbar-none">
                    {dayDrives.length === 0 ? (
                      <div className="text-[10px] text-muted-foreground/40 italic mt-1">
                        No drives
                      </div>
                    ) : (
                      dayDrives.map((drive) => (
                        <div
                          key={drive.id}
                          className="rounded-lg bg-white border border-indigo-100 p-1.5 shadow-2xs hover:border-indigo-300 transition"
                        >
                          <div className="text-[10px] font-bold text-slate-800 truncate">
                            {drive.company}
                          </div>
                          <div className="text-[9px] text-muted-foreground truncate">
                            {drive.role}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Timeline View */}
      {!loading && (
        <Card>
          <h3 className="font-semibold mb-6">Drive Timeline</h3>
          <div className="space-y-4">
            {drives.map((drive, idx) => (
              <div key={drive.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`size-10 rounded-lg grid place-items-center font-bold text-sm text-white ${
                      drive.status.toLowerCase() === 'upcoming'
                        ? 'bg-blue-500'
                        : drive.status.toLowerCase() === 'ongoing'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  {idx < drives.length - 1 && <div className="w-1 h-8 bg-muted mt-2" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{drive.company}</div>
                      <div className="text-sm text-muted-foreground mt-1">{drive.role}</div>
                      <div className="text-xs text-muted-foreground mt-2 space-y-1">
                        <div>📅 {new Date(drive.date).toLocaleDateString()}</div>
                        <div>📍 {drive.venue}</div>
                        <div>👥 {drive.studentCount} applications</div>
                      </div>
                    </div>
                    <Badge
                      tone={
                        drive.status.toLowerCase() === 'upcoming'
                          ? 'info'
                          : drive.status.toLowerCase() === 'ongoing'
                            ? 'warn'
                            : 'success'
                      }
                    >
                      {drive.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Drive Details Table */}
      {!loading && (
        <Card>
          <h3 className="font-semibold mb-4">All Drives Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Company
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Deadline
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Applications
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Rounds
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {drives.map((drive) => (
                  <tr key={drive.id} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-medium">{drive.company}</td>
                    <td className="py-3 px-4">{drive.role}</td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">
                      {new Date(drive.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">
                      {new Date(drive.applicationDeadline).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center font-medium">{drive.studentCount}</td>
                    <td className="py-3 px-4">
                      <Badge tone="info">{drive.rounds || 3} rounds</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-center">
                        <Badge
                          tone={
                            drive.status.toLowerCase() === 'upcoming'
                              ? 'info'
                              : drive.status.toLowerCase() === 'ongoing'
                                ? 'warn'
                                : 'success'
                          }
                        >
                          {drive.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => openViewDriveModal(drive)}
                          className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openEditDriveModal(drive)}
                          className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Drive Modal */}
      {isAddDriveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-lg p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-gradient">Create Recruiting Drive</h3>
              <button
                onClick={() => setIsAddDriveModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleAddDrive} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Select Company *
                </label>
                <select
                  value={driveCompany}
                  onChange={(e) => setDriveCompany(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Job Role / Position *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack Developer"
                  value={driveRole}
                  onChange={(e) => setDriveRole(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Drive Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={driveDate}
                    onChange={(e) => setDriveDate(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Registration Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={driveDeadline}
                    onChange={(e) => setDriveDeadline(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Venue *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Virtual or Audi-1"
                    value={driveVenue}
                    onChange={(e) => setDriveVenue(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Drive Status *
                  </label>
                  <select
                    value={driveStatus}
                    onChange={(e) => setDriveStatus(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Min Package (LPA)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={drivePackageMin}
                    onChange={(e) => setDrivePackageMin(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Max Package (LPA)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={drivePackageMax}
                    onChange={(e) => setDrivePackageMax(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={driveMinCgpa}
                    onChange={(e) => setDriveMinCgpa(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddDriveModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="size-4 animate-spin" /> : 'Create Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Drive Modal */}
      {isEditDriveModalOpen && selectedDrive && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-lg p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-gradient">Edit Recruiting Drive</h3>
              <button
                onClick={() => setIsEditDriveModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleEditDrive} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Select Company *
                </label>
                <select
                  value={driveCompany}
                  onChange={(e) => setDriveCompany(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Job Role / Position *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack Developer"
                  value={driveRole}
                  onChange={(e) => setDriveRole(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Drive Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={driveDate}
                    onChange={(e) => setDriveDate(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Registration Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={driveDeadline}
                    onChange={(e) => setDriveDeadline(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Venue *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Virtual or Audi-1"
                    value={driveVenue}
                    onChange={(e) => setDriveVenue(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Drive Status *
                  </label>
                  <select
                    value={driveStatus}
                    onChange={(e) => setDriveStatus(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Min Package (LPA)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={drivePackageMin}
                    onChange={(e) => setDrivePackageMin(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Max Package (LPA)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={drivePackageMax}
                    onChange={(e) => setDrivePackageMax(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={driveMinCgpa}
                    onChange={(e) => setDriveMinCgpa(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditDriveModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="size-4 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Drive Modal */}
      {isViewDriveModalOpen && selectedDrive && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-lg p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-gradient">Drive Details</h3>
              <button
                onClick={() => setIsViewDriveModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-soft border">
                <div className="size-16 flex-shrink-0">{getCompanyLogo(selectedDrive.company)}</div>
                <div>
                  <h4 className="font-bold text-lg">{selectedDrive.company}</h4>
                  <p className="text-sm font-semibold text-primary">{selectedDrive.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-xl bg-background/50">
                  <span className="text-xs text-muted-foreground block">Salary Package</span>
                  <span className="font-bold text-sm text-emerald-600">
                    {companies.find((c) => c.name === selectedDrive.company)?.package || '8.0 LPA'}
                  </span>
                </div>
                <div className="p-3 border rounded-xl bg-background/50">
                  <span className="text-xs text-muted-foreground block">Drive Status</span>
                  <Badge
                    tone={
                      selectedDrive.status === 'Upcoming'
                        ? 'info'
                        : selectedDrive.status === 'Ongoing'
                          ? 'warn'
                          : 'success'
                    }
                    className="mt-1"
                  >
                    {selectedDrive.status}
                  </Badge>
                </div>
              </div>

              <div className="p-4 border rounded-xl bg-background/30 space-y-2.5">
                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Drive Logistics
                </h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Drive Date</span>
                    <span className="font-medium">
                      {new Date(selectedDrive.date).toLocaleDateString(undefined, {
                        dateStyle: 'medium',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Registration Deadline
                    </span>
                    <span className="font-medium">
                      {new Date(selectedDrive.applicationDeadline).toLocaleDateString(undefined, {
                        dateStyle: 'medium',
                      })}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground block">Venue</span>
                    <span className="font-medium">{selectedDrive.venue}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-xl bg-background/30 space-y-2.5">
                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Eligibility Criteria
                </h5>
                <div className="flex gap-2 flex-wrap">
                  <Badge tone="info">CGPA 7.0+</Badge>
                  <Badge tone="info">No active backlogs</Badge>
                  <Badge tone="info">CSE / AIML / AIDS / ECE</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-xl text-center">
                  <span className="text-xs text-muted-foreground block">Registered Applicants</span>
                  <span className="font-bold text-base mt-1 block">
                    {selectedDrive.studentCount}
                  </span>
                </div>
                <div className="p-3 border rounded-xl text-center">
                  <span className="text-xs text-muted-foreground block">Selection Rounds</span>
                  <span className="font-bold text-base mt-1 block">
                    {selectedDrive.rounds} Rounds
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button
                  onClick={() => setIsViewDriveModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary cursor-pointer hover:opacity-95 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

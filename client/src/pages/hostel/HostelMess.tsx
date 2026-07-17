import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Outlet, useRouterState } from '@tanstack/react-router';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Utensils,
  Plus,
  Search,
  Calendar,
  Clock,
  Star,
  MessageSquare,
  ShieldAlert,
  FileDown,
  CreditCard,
} from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import { useAuth } from '@/contexts/AuthContext';
import * as messService from '@/services/messService';
import { toast } from 'sonner';

const formatLocalDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export function HostelMess() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // If we are on a child route (e.g. /menus, /residents, /fees), delegate rendering to the sub-page
  if (pathname !== '/dashboard/hostel/mess' && pathname !== '/dashboard/hostel/mess/') {
    return <Outlet />;
  }

  const [activeTab, setActiveTab] = useState<'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner'>(
    'Breakfast',
  );
  const [selectedDate, setSelectedDate] = useState(formatLocalDate(new Date()));

  // Student Feedback Form State
  const [feedbackMealType, setFeedbackMealType] = useState<
    'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner'
  >('Breakfast');
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState('');

  // Report Export Form State
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'fees' | 'feedback'>('daily');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [reportDate, setReportDate] = useState(formatLocalDate(new Date()));
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  // Pay Fee Modal State
  const [payFeeId, setPayFeeId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');

  // Fetch Live Data (Common)
  const { data: menus = [] } = useQuery({
    queryKey: ['mess-menus'],
    queryFn: () => messService.fetchMenus(),
  });

  const { data: residents = [] } = useQuery({
    queryKey: ['mess-residents'],
    queryFn: messService.fetchMessResidents,
    enabled: user?.role !== 'student',
  });

  const { data: fees = [] } = useQuery({
    queryKey: ['mess-fees'],
    queryFn: messService.fetchMessFees,
  });

  const { data: feedback = [] } = useQuery({
    queryKey: ['mess-feedback'],
    queryFn: messService.fetchFeedback,
  });

  // Mutations
  const submitFeedbackMutation = useMutation({
    mutationFn: messService.submitFeedback,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mess-feedback'] });
      toast.success('Thank you for your feedback!');
      setFeedbackText('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.message || 'Failed to submit feedback');
    },
  });

  const payFeeMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      messService.payMessFee(id, amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mess-fees'] });
      toast.success('Payment recorded successfully!');
      setPayFeeId(null);
      setPayAmount('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.message || 'Failed to process payment');
    },
  });

  // Helper: check if student is active mess subscriber
  const studentResidentRecord = useMemo(() => {
    if (user?.role !== 'student') return null;
    // match email or name or user_id if present
    return residents.find(
      (r: any) => r.resident_id === user._id || r.resident_name === user.fullName,
    );
  }, [residents, user]);

  // Derived Analytics Data for Warden Dashboard
  const stats = useMemo(() => {
    const totalMembers = residents.length;

    // Today's menus
    const todayStr = formatLocalDate(new Date());
    const todayMenus = menus.filter((m: any) => m.meal_date === todayStr);
    const mealsServedToday = totalMembers * todayMenus.length;

    // Monthly Mess Revenue
    const curMonth = new Date().getMonth();
    const curYear = new Date().getFullYear();
    const monthlyRevenue = fees.reduce((sum: number, f: any) => {
      const pDate = f.payment_date ? new Date(f.payment_date) : null;
      if (pDate && pDate.getMonth() === curMonth && pDate.getFullYear() === curYear) {
        return sum + Number(f.paid_amount || 0);
      }
      return sum;
    }, 0);

    // Pending Mess Fees
    const pendingFees = fees.reduce(
      (sum: number, f: any) => sum + Number(f.pending_amount || 0),
      0,
    );

    // Average Food Rating
    const avgRating = feedback.length
      ? (
          feedback.reduce((sum: number, f: any) => sum + (f.rating || 0), 0) / feedback.length
        ).toFixed(1)
      : 'N/A';

    return { totalMembers, mealsServedToday, monthlyRevenue, pendingFees, avgRating };
  }, [residents, menus, fees, feedback]);

  // Filter Today's Menu list by selected date and meal type
  const menuItemsForDay = useMemo(() => {
    const items = menus.find((m: any) => m.meal_date === selectedDate && m.meal_type === activeTab);
    return items?.food_items || [];
  }, [menus, selectedDate, activeTab]);

  // Weekly Menu specials or details
  const weeklySchedule = useMemo(() => {
    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const today = new Date();

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - today.getDay() + i); // Start from Sunday
      const dateStr = formatLocalDate(d);
      const dayName = daysOfWeek[d.getDay()];

      // Find any menus scheduled for this date
      const dayMenus = menus.filter((m: any) => m.meal_date === dateStr);
      let special = 'No Menu Scheduled';
      if (dayMenus.length > 0) {
        // Show main food items of Lunch/Dinner as special
        const mainMeal = dayMenus.find(
          (m: any) => m.meal_type === 'Lunch' || m.meal_type === 'Dinner',
        );
        if (mainMeal && mainMeal.food_items && mainMeal.food_items.length > 0) {
          special = mainMeal.food_items[0];
        } else if (dayMenus[0].food_items && dayMenus[0].food_items.length > 0) {
          special = dayMenus[0].food_items[0];
        }
      }

      return { day: dayName, date: dateStr, special };
    });
  }, [menus]);

  // Chart Data: count rating distribution
  const ratingChartData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // 1 to 5 stars
    feedback.forEach((f: any) => {
      if (f.rating >= 1 && f.rating <= 5) {
        counts[f.rating - 1]++;
      }
    });
    return [
      { name: '1 Star', count: counts[0], fill: '#EF4444' },
      { name: '2 Stars', count: counts[1], fill: '#F59E0B' },
      { name: '3 Stars', count: counts[2], fill: '#10B981' },
      { name: '4 Stars', count: counts[3], fill: '#06B6D4' },
      { name: '5 Stars', count: counts[4], fill: '#4F46E5' },
    ];
  }, [feedback]);

  // Export Report triggers
  const handleExport = async () => {
    try {
      let blobData;
      let filename = '';

      if (reportType === 'daily') {
        blobData = await messService.exportDailyReport({ date: reportDate, format: reportFormat });
        filename = `daily-meal-report-${reportDate}.${reportFormat === 'pdf' ? 'pdf' : 'xlsx'}`;
      } else if (reportType === 'monthly') {
        blobData = await messService.exportMonthlyRevenue({
          month: reportMonth,
          year: reportYear,
          format: reportFormat,
        });
        filename = `mess-revenue-report-${reportMonth}-${reportYear}.${reportFormat === 'pdf' ? 'pdf' : 'xlsx'}`;
      } else if (reportType === 'fees') {
        blobData = await messService.exportFeeCollectionReport({ format: reportFormat });
        filename = `mess-fee-collection-report.${reportFormat === 'pdf' ? 'pdf' : 'xlsx'}`;
      } else if (reportType === 'feedback') {
        blobData = await messService.exportFeedbackReport({ format: reportFormat });
        filename = `mess-food-feedback-report.${reportFormat === 'pdf' ? 'pdf' : 'xlsx'}`;
      }

      if (blobData) {
        const url = window.URL.createObjectURL(new Blob([blobData]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success(`Report exported successfully as ${filename.toUpperCase()}`);
      }
    } catch (err: any) {
      console.error('Export failed:', err);
      toast.error('Failed to generate and export report');
    }
  };

  const handlePayFeeSubmit = () => {
    if (!payFeeId) return;
    const amountNum = Number(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    payFeeMutation.mutate({ id: payFeeId, amount: amountNum });
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim()) {
      toast.error('Please provide feedback comments');
      return;
    }

    const payload = {
      resident_id: user?._id,
      resident_name: user?.fullName || 'Student',
      meal_type: feedbackMealType,
      rating: feedbackRating,
      feedback: feedbackText.trim(),
    };

    submitFeedbackMutation.mutate(payload);
  };

  const isStudent = user?.role === 'student' || user?.role === 'Student';

  // ── RENDER STUDENT VIEW ───────────────────────────────────────────────────
  if (isStudent) {
    // Find matching fee for this student
    const studentFees = fees.filter((f: any) => f.resident_id === user._id);
    const totalPending = studentFees.reduce(
      (sum: number, f: any) => sum + Number(f.pending_amount || 0),
      0,
    );
    const totalPaid = studentFees.reduce(
      (sum: number, f: any) => sum + Number(f.paid_amount || 0),
      0,
    );

    return (
      <div className="space-y-6">
        <PageHeader
          title="Mess & Food Portal"
          desc="Check daily menus, track mess fee dues, and submit feedback."
        />

        {/* Student Quick Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-100 dark:border-indigo-950/40 rounded-2xl p-4">
            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
              Subscription Status
            </div>
            <div className="text-2xl font-extrabold mt-2 text-indigo-600 dark:text-indigo-400">
              Subscribed
            </div>
            <Badge tone="success" className="mt-3">
              Active
            </Badge>
          </Card>

          <Card className="bg-gradient-to-br from-rose-500/10 to-rose-600/5 border-rose-100 dark:border-rose-950/40 rounded-2xl p-4">
            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
              Pending Dues
            </div>
            <div className="text-2xl font-extrabold mt-2 text-rose-600 dark:text-rose-400">
              ₹{totalPending.toLocaleString('en-IN')}
            </div>
            <Badge tone={totalPending > 0 ? 'warn' : 'success'} className="mt-3">
              {totalPending > 0 ? 'Payment Due' : 'No Dues'}
            </Badge>
          </Card>

          <Card className="bg-gradient-to-br from-teal-500/10 to-teal-600/5 border-teal-100 dark:border-teal-950/40 rounded-2xl p-4">
            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
              Total Paid (This Term)
            </div>
            <div className="text-2xl font-extrabold mt-2 text-teal-600 dark:text-teal-400">
              ₹{totalPaid.toLocaleString('en-IN')}
            </div>
            <Badge tone="success" className="mt-3">
              Paid
            </Badge>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-100 dark:border-cyan-950/40 rounded-2xl p-4">
            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
              Average Rating
            </div>
            <div className="text-2xl font-extrabold mt-2 text-cyan-600 dark:text-cyan-400">
              {feedback.length
                ? (
                    feedback.reduce((sum: number, f: any) => sum + f.rating, 0) / feedback.length
                  ).toFixed(1)
                : 'N/A'}
            </div>
            <Badge tone="info" className="mt-3">
              Weekly Avg
            </Badge>
          </Card>
        </div>

        {/* Menu & Feedback section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-background border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                Daily Mess Menu
              </h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs bg-background/50 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 mb-4">
              {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === tab
                      ? 'bg-gradient-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {menuItemsForDay.length === 0 ? (
              <div className="p-8 text-center border border-dashed rounded-2xl text-muted-foreground text-sm">
                No menu items scheduled for {activeTab} on {selectedDate}.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {menuItemsForDay.map((item: string, index: number) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-gradient-soft border hover:bg-accent/50 transition text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {item}
                      </span>
                      <Badge tone="info">Available</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <Clock className="size-3" />
                      {activeTab === 'Breakfast'
                        ? '7:30 AM - 9:00 AM'
                        : activeTab === 'Lunch'
                          ? '12:30 PM - 2:00 PM'
                          : activeTab === 'Snacks'
                            ? '4:30 PM - 5:30 PM'
                            : '7:30 PM - 9:00 PM'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Submit Feedback */}
          <Card className="bg-background border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left">
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 mb-4">
              Rate Today's Meal
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Meal
                </label>
                <select
                  value={feedbackMealType}
                  onChange={(e) => setFeedbackMealType(e.target.value as any)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs bg-background/50 focus:outline-none"
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Snacks</option>
                  <option>Dinner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Rating
                </label>
                <div className="flex gap-1.5 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`size-6 ${
                          star <= feedbackRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Feedback Comments
                </label>
                <textarea
                  placeholder="Share your thoughts on the food quality, taste, or service..."
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs bg-background/50 focus:outline-none"
                />
              </div>

              <button
                onClick={handleFeedbackSubmit}
                disabled={submitFeedbackMutation.isPending}
                className="w-full py-2.5 bg-gradient-primary text-white text-xs font-semibold rounded-xl hover:opacity-95 transition"
              >
                {submitFeedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </Card>
        </div>

        {/* Weekly Schedule & Student Fee Payments */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Schedule */}
          <Card className="bg-background border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="size-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                Weekly Menu Schedule
              </h3>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {weeklySchedule.map((schedule) => (
                <div
                  key={schedule.date}
                  className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition"
                >
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                      {schedule.day}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{schedule.date}</span>
                  </div>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-[200px]">
                    {schedule.special}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Student Mess Fees Card */}
          <Card className="bg-background border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="size-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                Mess Fee Records
              </h3>
            </div>
            {studentFees.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
                No mess fee bills recorded for your account.
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {studentFees.map((fee: any) => (
                  <div
                    key={fee.id}
                    className="p-3 border rounded-xl flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-900/30 transition"
                  >
                    <div>
                      <div className="font-semibold text-sm">
                        Mess Charge (₹{Number(fee.mess_fee).toFixed(0)})
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Pending: ₹{Number(fee.pending_amount).toFixed(0)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Badge tone={fee.payment_status === 'Paid' ? 'success' : 'warn'}>
                        {fee.payment_status || 'Pending'}
                      </Badge>
                      {Number(fee.pending_amount) > 0 && (
                        <button
                          onClick={() => {
                            setPayFeeId(fee.id);
                            setPayAmount(String(fee.pending_amount));
                          }}
                          className="px-3 py-1.5 bg-gradient-primary text-white text-xs font-semibold rounded-lg hover:opacity-95"
                        >
                          Pay Dues
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Pay Dues Dialog */}
        {payFeeId && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
            <Card className="w-full max-w-sm p-6 text-left relative bg-background border border-slate-200 dark:border-slate-800 rounded-3xl">
              <h3 className="text-lg font-bold mb-4">Pay Mess Fees</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Payment Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-background/50 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setPayFeeId(null);
                      setPayAmount('');
                    }}
                    className="px-4 py-2 border rounded-xl text-xs hover:bg-accent font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePayFeeSubmit}
                    disabled={payFeeMutation.isPending}
                    className="px-4 py-2 bg-gradient-primary text-white text-xs font-semibold rounded-xl hover:opacity-95 transition"
                  >
                    {payFeeMutation.isPending ? 'Paying...' : 'Submit Payment'}
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // ── RENDER WARDEN / ADMIN VIEW ───────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mess Management"
        desc="Manage daily mess menu, meal attendance, payments, and food schedule."
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => navigate({ to: '/dashboard/hostel/mess/menus' })}
              className="px-4 py-2.5 bg-gradient-primary text-white text-xs font-semibold rounded-xl hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer shadow-soft hover:scale-[1.02]"
            >
              <Plus className="size-4" /> Add Menu Item
            </button>
          </div>
        }
      />

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Mess Members', value: stats.totalMembers, tone: 'info' as const },
          { label: 'Meals Served Today', value: stats.mealsServedToday, tone: 'success' as const },
          {
            label: 'Monthly Revenue',
            value: `₹${stats.monthlyRevenue.toLocaleString('en-IN')}`,
            tone: 'success' as const,
          },
          {
            label: 'Pending Mess Fees',
            value: `₹${stats.pendingFees.toLocaleString('en-IN')}`,
            tone: 'danger' as const,
          },
          { label: 'Avg Food Rating', value: `${stats.avgRating} / 5.0`, tone: 'info' as const },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="p-4 text-center bg-gradient-soft border rounded-2xl flex flex-col justify-center"
          >
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {stat.label}
            </div>
            <div className="text-xl font-extrabold mt-2 text-slate-800 dark:text-slate-200">
              {stat.value}
            </div>
            <Badge tone={stat.tone} className="mt-3 mx-auto">
              Today
            </Badge>
          </Card>
        ))}
      </div>

      {/* Daily Menu & Quick Links */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-background border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
              Daily Mess Menu
            </h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs bg-background/50 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 mb-4">
            {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === tab
                    ? 'bg-gradient-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {menuItemsForDay.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-2xl text-muted-foreground text-sm">
              No menu items scheduled for {activeTab} on {selectedDate}.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {menuItemsForDay.map((item: string, index: number) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-gradient-soft border hover:bg-accent/50 transition text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {item}
                    </span>
                    <Badge tone="info">Available</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Clock className="size-3" />
                    {activeTab === 'Breakfast'
                      ? '7:30 AM - 9:00 AM'
                      : activeTab === 'Lunch'
                        ? '12:30 PM - 2:00 PM'
                        : activeTab === 'Snacks'
                          ? '4:30 PM - 5:30 PM'
                          : '7:30 PM - 9:00 PM'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Links Card */}
        <Card className="bg-background border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left">
          <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 mb-4">
            Quick Management Actions
          </h3>
          <div className="space-y-3">
            {[
              {
                label: 'Mess Menu Planner',
                desc: 'Add, Edit, and Delete weekly menus',
                tone: 'info' as const,
                to: '/dashboard/hostel/mess/menus',
              },
              {
                label: 'Mess Fee Collections',
                desc: 'Collect payments, track outstanding fees',
                tone: 'warn' as const,
                to: '/dashboard/hostel/mess/fees',
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate({ to: item.to })}
                className="w-full flex flex-col p-3 rounded-xl bg-gradient-soft border hover:bg-accent/50 transition cursor-pointer text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {item.label}
                  </span>
                  <Badge tone={item.tone}>Manage</Badge>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">{item.desc}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Schedule & Chart Analytics */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Schedule */}
        <Card className="bg-background border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="size-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
              Weekly Menu Schedule
            </h3>
          </div>
          <div className="space-y-2 pr-1">
            {weeklySchedule.map((schedule) => (
              <div
                key={schedule.date}
                className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                    {schedule.day}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{schedule.date}</span>
                </div>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-[150px]">
                  {schedule.special}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Meal Rating Analytics Chart */}
        <Card className="lg:col-span-2 bg-background border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left">
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="size-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
              Food Rating Distribution
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={ratingChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                <Bar dataKey="count" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Reports Card & Feedbacks Card */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reports & Exports Panel */}
        <Card className="bg-background border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left">
          <div className="flex items-center gap-2 mb-4">
            <FileDown className="size-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
              Reports & Exports
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs bg-background/50 focus:outline-none"
                >
                  <option value="daily">Daily Meal Report</option>
                  <option value="monthly">Monthly Revenue Report</option>
                  <option value="fees">Mess Fee Collection</option>
                  <option value="feedback">Food Feedback Report</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Format
                </label>
                <select
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs bg-background/50 focus:outline-none"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="excel">Excel Spreadsheet</option>
                </select>
              </div>
            </div>

            {/* Dynamic Report Parameters */}
            {reportType === 'daily' && (
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Report Date
                </label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs bg-background/50 focus:outline-none"
                />
              </div>
            )}

            {reportType === 'monthly' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Month
                  </label>
                  <select
                    value={reportMonth}
                    onChange={(e) => setReportMonth(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs bg-background/50 focus:outline-none"
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Year
                  </label>
                  <select
                    value={reportYear}
                    onChange={(e) => setReportYear(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs bg-background/50 focus:outline-none"
                  >
                    {[2024, 2025, 2026, 2027].map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              onClick={handleExport}
              className="w-full py-2.5 bg-gradient-primary text-white text-xs font-semibold rounded-xl hover:opacity-95 transition shadow-soft flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <FileDown className="size-4" /> Download Report
            </button>
          </div>
        </Card>

        {/* Feedback Reviews List */}
        <Card className="bg-background border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="size-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
              Student Reviews
            </h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {feedback.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground border border-dashed rounded-2xl">
                No food feedback comments recorded yet.
              </div>
            ) : (
              feedback.map((fb: any, index: number) => (
                <div key={fb.id || index} className="p-3 rounded-xl border bg-gradient-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {fb.resident_name || 'Anonymous Student'}
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${
                            i < fb.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1">
                    <span>
                      Meal Type:{' '}
                      <strong className="text-indigo-600 dark:text-indigo-400">
                        {fb.meal_type}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>{fb.created_at ? new Date(fb.created_at).toLocaleDateString() : ''}</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium bg-background/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    "{fb.feedback}"
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

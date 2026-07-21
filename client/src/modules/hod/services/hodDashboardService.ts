import { DepartmentCode } from '../types';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  FlaskConical,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  Heart,
  TrendingUp,
  FileText,
  Clock,
  Layers,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export interface KPICardData {
  id: string;
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  subtitle: string;
  icon: any;
  accent: 'blue' | 'indigo' | 'emerald' | 'purple' | 'amber' | 'rose';
  sparkline: number[];
}

export function getDepartmentDashboardData(deptCode: DepartmentCode) {
  const code = (deptCode || 'AIML').toUpperCase();

  // Multiplier for slight variations per department
  const factor = code === 'CSE' ? 1.4 : code === 'ECE' ? 1.1 : code === 'EEE' ? 0.8 : 1.0;

  // 20 Animated KPI Cards
  const kpiCards: KPICardData[] = [
    { id: 'total-students', title: 'Total Students', value: Math.round(480 * factor), change: '+4.2% YoY', isPositive: true, subtitle: 'Enrolled in Sem 1 to 8', icon: Users, accent: 'blue', sparkline: [420, 440, 455, 460, 472, 480] },
    { id: 'total-faculty', title: 'Total Faculty', value: Math.round(24 * factor), change: '100% Onboarded', isPositive: true, subtitle: 'Professors & Assoc Profs', icon: GraduationCap, accent: 'indigo', sparkline: [20, 21, 22, 22, 23, 24] },
    { id: 'total-subjects', title: 'Total Subjects', value: 32, change: 'R23 Curriculum', isPositive: true, subtitle: 'Core & Elective courses', icon: BookOpen, accent: 'purple', sparkline: [28, 30, 30, 32, 32, 32] },
    { id: 'active-courses', title: 'Active Courses', value: 16, change: 'Running this sem', isPositive: true, subtitle: 'Theory & Practical labs', icon: Layers, accent: 'emerald', sparkline: [14, 15, 16, 16, 16, 16] },
    { id: 'today-attendance', title: "Today's Attendance %", value: '92.4%', change: '+1.2% vs yesterday', isPositive: true, subtitle: 'Student biometric log', icon: CalendarCheck, accent: 'emerald', sparkline: [88, 90, 89, 91, 91, 92.4] },
    { id: 'faculty-attendance', title: 'Faculty Attendance %', value: '98.5%', change: '35/36 Present', isPositive: true, subtitle: 'Biometric verified', icon: GraduationCap, accent: 'blue', sparkline: [96, 97, 98, 98, 98.5, 98.5] },
    { id: 'avg-gpa', title: 'Average CGPA', value: '8.42', change: '+0.15 vs last sem', isPositive: true, subtitle: 'Max GPA: 9.94', icon: Award, accent: 'purple', sparkline: [8.1, 8.2, 8.3, 8.35, 8.4, 8.42] },
    { id: 'pass-percentage', title: 'Pass Percentage', value: '94.2%', change: '+2.1% End Sem', isPositive: true, subtitle: 'Overall pass rate', icon: CheckCircle2, accent: 'emerald', sparkline: [90, 91, 92, 93, 93.5, 94.2] },
    { id: 'placement-percentage', title: 'Placement %', value: '91.8%', change: '110/120 Placed', isPositive: true, subtitle: 'Target: 95%', icon: TrendingUp, accent: 'indigo', sparkline: [82, 85, 88, 89, 90, 91.8] },
    { id: 'research-publications', title: 'Research Publications', value: Math.round(38 * factor), change: 'Scopus & IEEE', isPositive: true, subtitle: 'AY 2025-2026', icon: BookOpen, accent: 'purple', sparkline: [20, 24, 28, 32, 35, 38] },
    { id: 'patents', title: 'Patents Filed', value: Math.round(6 * factor), change: '2 Granted', isPositive: true, subtitle: 'IPR Cell Registered', icon: Award, accent: 'amber', sparkline: [2, 3, 3, 4, 5, 6] },
    { id: 'research-projects', title: 'Research Grants', value: `₹${(48 * factor).toFixed(0)} L`, change: 'DST & SERB', isPositive: true, subtitle: 'Funded projects', icon: FlaskConical, accent: 'emerald', sparkline: [30, 35, 38, 42, 45, 48] },
    { id: 'dept-events', title: 'Dept Events', value: Math.round(12 * factor), change: 'Seminars & Symposia', isPositive: true, subtitle: '3 Upcoming this Q3', icon: Sparkles, accent: 'blue', sparkline: [6, 8, 9, 10, 11, 12] },
    { id: 'pending-leaves', title: 'Pending Leave Requests', value: 3, change: 'HOD Action', isPositive: false, subtitle: 'Faculty leave signoffs', icon: ClipboardList, accent: 'amber', sparkline: [5, 4, 3, 4, 2, 3] },
    { id: 'pending-approvals', title: 'Pending Approvals', value: 4, change: 'Action required', isPositive: false, subtitle: 'Marks & Event budgets', icon: Clock, accent: 'rose', sparkline: [6, 5, 4, 3, 5, 4] },
    { id: 'mentoring-sessions', title: 'Mentoring Sessions', value: Math.round(142 * factor), change: '100% Mentees met', isPositive: true, subtitle: 'Advisory logs', icon: Heart, accent: 'purple', sparkline: [100, 115, 125, 130, 138, 142] },
    { id: 'low-attendance-students', title: 'Low Attendance (<75%)', value: 14, change: 'Notice Dispatched', isPositive: false, subtitle: 'Requires HOD warning', icon: AlertTriangle, accent: 'rose', sparkline: [22, 19, 16, 15, 14, 14] },
    { id: 'backlog-students', title: 'Backlog Students', value: 18, change: 'Remedial classes', isPositive: false, subtitle: 'Clearing exams', icon: FileText, accent: 'amber', sparkline: [25, 23, 21, 20, 19, 18] },
    { id: 'at-risk-students', title: 'At-Risk Students', value: 8, change: 'Assigned Mentors', isPositive: false, subtitle: 'Academic counseling', icon: AlertTriangle, accent: 'rose', sparkline: [12, 11, 10, 9, 8, 8] },
    { id: 'outstanding-achievements', title: 'Department Awards', value: 9, change: 'National Competitions', isPositive: true, subtitle: 'Smart India Hackathon', icon: Award, accent: 'emerald', sparkline: [4, 5, 6, 7, 8, 9] },
  ];

  // Enrollment & Academic Charts Data
  const enrollmentTrend = [
    { year: '2021', students: Math.round(360 * factor), male: Math.round(200 * factor), female: Math.round(160 * factor) },
    { year: '2022', students: Math.round(400 * factor), male: Math.round(220 * factor), female: Math.round(180 * factor) },
    { year: '2023', students: Math.round(430 * factor), male: Math.round(235 * factor), female: Math.round(195 * factor) },
    { year: '2024', students: Math.round(455 * factor), male: Math.round(245 * factor), female: Math.round(210 * factor) },
    { year: '2025', students: Math.round(480 * factor), male: Math.round(255 * factor), female: Math.round(225 * factor) },
  ];

  const sectionDistribution = [
    { name: 'Sem 5 Sec A', value: 120 },
    { name: 'Sem 5 Sec B', value: 120 },
    { name: 'Sem 3 Sec A', value: 120 },
    { name: 'Sem 3 Sec B', value: 120 },
  ];

  // Attendance Analytics Charts
  const dailyAttendanceData = [
    { day: 'Mon', student: 94, faculty: 98 },
    { day: 'Tue', student: 91, faculty: 100 },
    { day: 'Wed', student: 95, faculty: 97 },
    { day: 'Thu', student: 89, faculty: 98 },
    { day: 'Fri', student: 92, faculty: 96 },
    { day: 'Sat', student: 88, faculty: 95 },
  ];

  // Results Analytics
  const passPercentageBySem = [
    { sem: 'Sem 1', passRate: 92, avgGpa: 8.1 },
    { sem: 'Sem 2', passRate: 91, avgGpa: 8.2 },
    { sem: 'Sem 3', passRate: 94, avgGpa: 8.35 },
    { sem: 'Sem 4', passRate: 95, avgGpa: 8.5 },
    { sem: 'Sem 5', passRate: 96, avgGpa: 8.6 },
  ];

  // Faculty Workloads
  const facultyWorkloadData = [
    { name: 'Dr. Anjali M.', workload: 14, researchScore: 95, rating: 4.8 },
    { name: 'Dr. Ramesh K.', workload: 18, researchScore: 90, rating: 4.7 },
    { name: 'Prof. Vikram R.', workload: 20, researchScore: 82, rating: 4.6 },
    { name: 'Prof. Sneha V.', workload: 16, researchScore: 88, rating: 4.9 },
    { name: 'Prof. Rajesh G.', workload: 18, researchScore: 78, rating: 4.5 },
  ];

  // Low Attention Alerts
  const alerts = [
    { id: 'ALT-01', title: 'Chirag Reddy (Roll 23091A4203)', category: 'Attendance Drop', metric: '68% Attendance', priority: 'High', action: 'Issue HOD Warning Notice' },
    { id: 'ALT-02', title: 'Karthik Raja (Roll 23091A4212)', category: 'Attendance Drop', metric: '71% Attendance', priority: 'High', action: 'Schedule Mentor Advisory' },
    { id: 'ALT-03', title: 'Deep Learning & Neural Nets (AIML501)', category: 'Lesson Plan Status', metric: 'Week 8 Plan Pending', priority: 'Medium', action: 'Notify Faculty Incharge' },
    { id: 'ALT-04', title: 'NBA Criterion 5 Proof Submission', category: 'Accreditation Deadline', metric: 'Due in 5 Days', priority: 'High', action: 'Open Accreditation Vault' },
  ];

  // Pending Approvals
  const pendingApprovals = [
    { id: 'APP-101', title: 'Faculty Leave - Dr. Ramesh Kumar', applicant: 'Associate Professor', date: '2026-07-20', type: 'Leave', status: 'Pending' },
    { id: 'APP-102', title: 'Industrial Visit Requisition - ISRO', applicant: 'Prof. Anjali Sharma', date: '2026-07-19', type: 'Event', status: 'Pending' },
    { id: 'APP-103', title: 'Lab Equipment Budget Requisition', applicant: 'Tech Lab Incharge', date: '2026-07-18', type: 'Budget', status: 'Pending' },
    { id: 'APP-104', title: 'Mid-2 Internal Marks Verification', applicant: 'Exam Coordinator', date: '2026-07-17', type: 'Marks', status: 'Pending' },
  ];

  return {
    deptCode: code,
    kpiCards,
    enrollmentTrend,
    sectionDistribution,
    dailyAttendanceData,
    passPercentageBySem,
    facultyWorkloadData,
    alerts,
    pendingApprovals,
  };
}

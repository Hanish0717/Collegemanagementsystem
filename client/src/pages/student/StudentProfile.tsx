import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  Award,
  BookOpen,
  Calendar,
  FileText,
  FileCheck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  User,
  GraduationCap,
  Building,
  Eye,
  CheckSquare,
} from "lucide-react";
import api from "@/lib/api";

interface FieldProps {
  label: string;
  value?: string | number;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export interface SubjectItem {
  code: string;
  name: string;
  grade?: string;
  credits?: string | number;
  status?: string;
  internals?: string;
}

export interface SemesterRecord {
  sem: number;
  sgpa?: string | number;
  cgpa?: string | number;
  subjects?: SubjectItem[];
}

export interface AcademicPerformanceData {
  currentCgpa: string | number;
  latestSgpa: string | number;
  creditsEarned: number;
  totalBacklogs: number;
  backlogsList: any[];
  semesters: SemesterRecord[];
}

export interface JourneySemester {
  sem: number;
  status: string;
  isCurrent?: boolean;
  batch: string;
  programme: string;
  classroom: string;
  courseReg: string;
}

export interface JourneyExam {
  sem: number;
  monthYear: string;
  examType: string;
  status: string;
}

export interface AttendanceSubject {
  name: string;
  percentage: number;
  classes: string;
}

export interface CertificateItem {
  name: string;
  status: string;
  file: string;
}

function ReadOnlyField({ label, value, placeholder, required, className = "" }: FieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block leading-tight">
        {required && <span className="text-red-500 mr-0.5">*</span>}
        {label}
      </label>
      <div className="w-full bg-[#f4f5f7] dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-medium min-h-[36px] flex items-center select-none cursor-default">
        {value !== undefined && value !== "" ? (
          <span>{value}</span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 font-normal">{placeholder || ""}</span>
        )}
      </div>
    </div>
  );
}

function ReadOnlySelect({ label, value, placeholder, className = "" }: FieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block leading-tight">
        {label}
      </label>
      <div className="w-full bg-[#f4f5f7] dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-medium min-h-[36px] flex items-center justify-between select-none cursor-default">
        {value ? (
          <span>{value}</span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 font-normal">{placeholder || "Select an option..."}</span>
        )}
        <ChevronDown className="size-3 text-slate-400 shrink-0 ml-1" />
      </div>
    </div>
  );
}

function ReadOnlyDateField({ label, value, placeholder }: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block leading-tight">
        {label}
      </label>
      <div className="w-full bg-[#f4f5f7] dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-medium min-h-[36px] flex items-center justify-between select-none cursor-default">
        {value ? (
          <span>{value}</span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 font-normal">{placeholder || "Pick a date"}</span>
        )}
        <Calendar className="size-3.5 text-slate-400 shrink-0 ml-1" />
      </div>
    </div>
  );
}

function ReadOnlyPhoneField({
  label,
  code = "+91 India",
  number,
  required,
}: {
  label: string;
  code?: string;
  number?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block leading-tight">
        {required && <span className="text-red-500 mr-0.5">*</span>}
        {label}
      </label>
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-4 bg-[#f4f5f7] dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded-lg px-2.5 py-2 text-xs text-slate-800 dark:text-slate-200 font-medium flex items-center justify-between select-none cursor-default">
          <span className="truncate">{code}</span>
          <ChevronDown className="size-3 text-slate-400 shrink-0" />
        </div>
        <div className="col-span-8 bg-[#f4f5f7] dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-medium flex items-center select-none cursor-default">
          {number || ""}
        </div>
      </div>
    </div>
  );
}

function ReadOnlyCheckbox({ label, checked = false }: { label: string; checked?: boolean }) {
  return (
    <div className="flex items-center gap-2 select-none cursor-default py-1">
      <div
        className={`size-4 rounded border flex items-center justify-center ${
          checked
            ? "bg-indigo-600 border-indigo-600 text-white"
            : "border-slate-300 dark:border-slate-600 bg-[#f4f5f7] dark:bg-slate-800"
        }`}
      >
        {checked && <CheckCircle2 className="size-3 stroke-[3]" />}
      </div>
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
    </div>
  );
}

function EmptyStateGraphic({ message }: { message: string }) {
  return (
    <div className="py-8 flex flex-col items-center justify-center space-y-3 select-none">
      <div className="relative size-16 flex items-center justify-center">
        <div className="w-14 h-12 bg-rose-600 rounded-xl shadow-lg transform -rotate-6 flex items-center justify-center relative">
          <div className="w-10 h-8 bg-rose-700 rounded-lg" />
          <div className="absolute -top-3 -right-2 bg-indigo-950 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-md border border-indigo-400">
            0
          </div>
        </div>
      </div>
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{message}</p>
    </div>
  );
}

// Initial Data Fallbacks
const initialPerformanceData: AcademicPerformanceData = {
  currentCgpa: "8.13",
  latestSgpa: "7.95",
  creditsEarned: 0,
  totalBacklogs: 0,
  backlogsList: [],
  semesters: [
    { sem: 7, sgpa: "-", cgpa: "-", subjects: [] },
    {
      sem: 6,
      sgpa: "7.95",
      cgpa: "8.13",
      subjects: [
        { code: "R23MSCST015", name: "Web Technologies", grade: "-", credits: "-", status: "-", internals: "-" },
        { code: "R23MSCST016", name: "OOAD and Design Patterns", grade: "-", credits: "-", status: "-", internals: "-" },
        { code: "R23MSCST017", name: "Microprocessors and Interfacing", grade: "-", credits: "-", status: "-", internals: "-" },
        { code: "R23MBMCT006", name: "Business Analysis", grade: "-", credits: "-", status: "-", internals: "-" },
        { code: "R23MSCST020", name: "Statistical and Predictive Analytics", grade: "-", credits: "-", status: "-", internals: "-" },
        { code: "R23MSCSL008", name: "Web Technologies Lab", grade: "-", credits: "-", status: "-", internals: "-" },
        { code: "R23MBMCL004", name: "Business Analytics Lab", grade: "-", credits: "-", status: "-", internals: "-" },
        { code: "R23MSCST019", name: "Data Warehousing and Data Mining", grade: "-", credits: "-", status: "-", internals: "-" },
      ],
    },
    { sem: 5, sgpa: "8.15", cgpa: "8.16", subjects: [] },
    { sem: 4, sgpa: "8.38", cgpa: "8.16", subjects: [] },
    { sem: 3, sgpa: "8.00", cgpa: "8.08", subjects: [] },
    { sem: 2, sgpa: "8.21", cgpa: "8.13", subjects: [] },
    { sem: 1, sgpa: "8.05", cgpa: "8.05", subjects: [] },
  ],
};

const initialJourneySemesters: JourneySemester[] = [
  { sem: 7, status: "Active • Current", isCurrent: true, batch: "2023 - 2024", programme: "CSE(DS)", classroom: "CSE(DS)-A", courseReg: "Completed" },
  { sem: 6, status: "Promoted", batch: "2023 - 2024", programme: "CSE(DS)", classroom: "CSE(DS)-A", courseReg: "Completed" },
  { sem: 5, status: "Promoted", batch: "2023 - 2024", programme: "CSE(DS)", classroom: "CSE(DS)-A", courseReg: "Pending" },
  { sem: 4, status: "Promoted", batch: "2023 - 2024", programme: "CSE(DS)", classroom: "CSE(DS)-A", courseReg: "Pending" },
  { sem: 3, status: "Promoted", batch: "2023 - 2024", programme: "CSE(DS)", classroom: "CSE(DS)-A", courseReg: "Pending" },
  { sem: 2, status: "Promoted", batch: "2023 - 2024", programme: "CSE(DS)", classroom: "CSE(DS)-A", courseReg: "Pending" },
  { sem: 1, status: "Promoted", batch: "2023 - 2024", programme: "CSE(DS)", classroom: "CSE(DS)-A", courseReg: "Pending" },
];

const initialJourneyExams: JourneyExam[] = [
  { sem: 2, monthYear: "JUNE 2024", examType: "R", status: "Active" },
  { sem: 3, monthYear: "NOVEMBER 2024", examType: "R", status: "Active" },
  { sem: 1, monthYear: "JANUARY 2024", examType: "R", status: "Active" },
  { sem: 4, monthYear: "APRIL 2025", examType: "R", status: "Active" },
  { sem: 5, monthYear: "NOVEMBER 2025", examType: "R", status: "Active" },
  { sem: 6, monthYear: "APRIL 2026", examType: "R", status: "Active" },
];

const initialAttendanceSubjects: AttendanceSubject[] = [
  { name: "Software Engineering", percentage: 0.0, classes: "0/0" },
  { name: "Data Analytics and Tools", percentage: 40.0, classes: "2/5" },
  { name: "Time Series Analysis in Data Science", percentage: 0.0, classes: "0/0" },
  { name: "Mini Project", percentage: 0.0, classes: "0/0" },
];

const initialCertificatesList: CertificateItem[] = [
  { name: "Aadhaar Card", status: "Originals Not Submitted", file: "No file uploaded" },
  { name: "SSC / 10th Marks Card", status: "Originals Not Submitted", file: "No file uploaded" },
  { name: "12th / Intermediate Marks Card", status: "Originals Not Submitted", file: "No file uploaded" },
  { name: "UG Original Degree", status: "Originals Not Submitted", file: "No file uploaded" },
  { name: "UG Marks Card", status: "Originals Not Submitted", file: "No file uploaded" },
  { name: "Study / Conduct Certificate", status: "Originals Not Submitted", file: "No file uploaded" },
  { name: "Transfer Certificate", status: "Originals Not Submitted", file: "No file uploaded" },
  { name: "Migration Certificate", status: "Originals Not Submitted", file: "No file uploaded" },
  { name: "NSS Certificate", status: "Originals Not Submitted", file: "No file uploaded" },
  { name: "NCC Certificate", status: "Originals Not Submitted", file: "No file uploaded" },
  { name: "Sports Certificate", status: "Originals Not Submitted", file: "No file uploaded" },
  { name: "Ex-Serviceman Certificate", status: "Originals Not Submitted", file: "No file uploaded" },
  { name: "Caste Certificate", status: "Originals Not Submitted", file: "No file uploaded" },
  { name: "Economically Backward Certificate", status: "Originals Not Submitted", file: "No file uploaded" },
];

function EditableField({ label, value, placeholder, required, onChange }: { label: string; value: string; placeholder?: string; required?: boolean; onChange: (val: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block leading-tight">
        {required && <span className="text-red-500 mr-0.5">*</span>}
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-200 font-semibold min-h-[36px] focus:outline-none focus:ring-1 focus:ring-slate-400"
      />
    </div>
  );
}

function EditableSelect({ label, value, options, placeholder, onChange }: { label: string; value: string; options: string[]; placeholder?: string; onChange: (val: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block leading-tight">
        {label}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-200 font-semibold min-h-[36px] focus:outline-none focus:ring-1 focus:ring-slate-400"
      >
        <option value="">{placeholder || "Select an option..."}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function EditableDateField({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block leading-tight">
        {label}
      </label>
      <input
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-slate-200 font-semibold min-h-[36px] focus:outline-none focus:ring-1 focus:ring-slate-400"
      />
    </div>
  );
}

export function StudentProfile() {
  const [activeTab, setActiveTab] = useState<
    "basic" | "performance" | "journey" | "attendance" | "memos" | "certificates"
  >("basic");

  // Collapsible cards state for Basic Info
  const [admissionOpen, setAdmissionOpen] = useState(true);
  const [personalOpen, setPersonalOpen] = useState(true);
  const [parentOpen, setParentOpen] = useState(true);
  const [qualifyingOpen, setQualifyingOpen] = useState(true);
  const [educationOpen, setEducationOpen] = useState(true);

  // Dynamic states fetched from backend
  const [performanceData, setPerformanceData] = useState<AcademicPerformanceData>(initialPerformanceData);
  const [profileData, setProfileData] = useState<any>(null);
  const [journeySemesters, setJourneySemesters] = useState<JourneySemester[]>(initialJourneySemesters);
  const [journeyExams, setJourneyExams] = useState<JourneyExam[]>(initialJourneyExams);
  const [selectedAttendanceSem, setSelectedAttendanceSem] = useState<number>(7);
  const [attendanceSubjects, setAttendanceSubjects] = useState<AttendanceSubject[]>(initialAttendanceSubjects);
  const [certificates, setCertificates] = useState<CertificateItem[]>(initialCertificatesList);

  const updateProfileField = (key: string, value: any) => {
    setProfileData((prev: any) => ({
      ...(prev || {}),
      [key]: value
    }));
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCertificates(prev =>
      prev.map((c, i) => (i === index ? { ...c, status: "Submitted", file: file.name } : c))
    );
  };

  const handleClearFile = (index: number) => {
    setCertificates(prev =>
      prev.map((c, i) => (i === index ? { ...c, status: "Originals Not Submitted", file: "No file uploaded" } : c))
    );
  };

  // Collapsible cards state for Academic Performance
  const [backlogsOpen, setBacklogsOpen] = useState(true);
  const [openSemesters, setOpenSemesters] = useState<Record<number, boolean>>({
    7: true,
    6: true,
    5: false,
    4: false,
    3: false,
    2: false,
    1: false,
  });

  const toggleSemester = (sem: number) => {
    setOpenSemesters((prev) => ({ ...prev, [sem]: !prev[sem] }));
  };

  // Safe accessor variables
  const semestersList = Array.isArray(performanceData?.semesters)
    ? performanceData.semesters
    : initialPerformanceData.semesters;

  const backlogsList = Array.isArray(performanceData?.backlogsList)
    ? performanceData.backlogsList
    : [];

  // Fetch performance & profile data from backend with mount tracking
  useEffect(() => {
    let isMounted = true;
    const fetchBackendData = async () => {
      try {
        const perfRes = await api.get("/api/student-module/academic-performance");
        if (isMounted && perfRes.data?.success && perfRes.data?.data) {
          setPerformanceData(perfRes.data.data);
        }
      } catch (err) {}

      try {
        const profRes = await api.get("/api/student-module/profile");
        if (isMounted && profRes.data?.success && profRes.data?.data) {
          setProfileData(profRes.data.data);
        }
      } catch (err) {}
    };

    fetchBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">

        <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <Sparkles className="size-3.5 text-indigo-500" />
          <span>Ask AI</span>
        </button>
      </div>

      {/* Top Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs font-medium scrollbar-none">
        <button
          onClick={() => setActiveTab("basic")}
          className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
            activeTab === "basic"
              ? "bg-[#e0f2fe] text-[#0284c7] font-bold"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Basic Info
        </button>
        <button
          onClick={() => setActiveTab("performance")}
          className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
            activeTab === "performance"
              ? "bg-[#e0f2fe] text-[#0284c7] font-bold"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Academic Performance
        </button>
        <button
          onClick={() => setActiveTab("journey")}
          className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
            activeTab === "journey"
              ? "bg-[#e0f2fe] text-[#0284c7] font-bold"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Academic Journey
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
            activeTab === "attendance"
              ? "bg-[#e0f2fe] text-[#0284c7] font-bold"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Attendance
        </button>
        <button
          onClick={() => setActiveTab("memos")}
          className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
            activeTab === "memos"
              ? "bg-[#e0f2fe] text-[#0284c7] font-bold"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Memos
        </button>
        <button
          onClick={() => setActiveTab("certificates")}
          className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
            activeTab === "certificates"
              ? "bg-[#e0f2fe] text-[#0284c7] font-bold"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Certificates
        </button>
      </div>

      {/* Main Profile Hero Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <img
              src={profileData?.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"}
              alt={profileData?.fullName || "ADABALA AMRUTHA"}
              className="size-24 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shadow"
            />
            <div className="space-y-3 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {profileData?.fullName || "ADABALA AMRUTHA"}
                </h1>
                <span className="bg-[#52c41a] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {profileData?.status || "Active"}
                </span>
                <span className="bg-[#faad14] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  Scholarship
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{profileData?.rollNumber || "23331A4401"}</p>

              {/* Data attributes grid bar */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-xs pt-1">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-medium">COURSE</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{profileData?.course || "B.TECH"}</span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-medium">BRANCH</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{profileData?.branch || "CSE(DS)"}</span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-medium">BATCH</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{profileData?.batch || "2023 - 2024"}</span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-medium">YEAR / SEM</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Year {profileData?.year || "4"} · Sem {profileData?.semester || "7"}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-medium">SECTION</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{profileData?.section || "CSE(DS)-A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Signature Box */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 text-xs gap-1.5 w-32 shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <FileText className="size-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-400">No signature</span>
          </div>
        </div>
      </div>

      {/* TAB 1: BASIC INFO */}
      {activeTab === "basic" && (
        <div className="space-y-4">
          {/* SECTION 1: ADMISSION DETAILS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => setAdmissionOpen(!admissionOpen)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 transition"
            >
              <span>Admission Details</span>
              {admissionOpen ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
            </button>

            {admissionOpen && (
              <div className="p-5 space-y-6">
                {/* Information Banner */}
                <div className="bg-[#e0f2fe]/60 border border-[#bae6fd] text-[#0369a1] text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 font-medium">
                  <Info className="size-4 shrink-0 text-[#0284c7]" />
                  <span>Admission details are managed by your institution. Contact the academic office for corrections.</span>
                </div>

                {/* Sub-header: Academic Identity */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Academic Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ReadOnlyField label="Admission ID" value={profileData?.admissionId || "2339"} />
                    <ReadOnlyField label="Enrollment Number" value={profileData?.enrollmentNumber || ""} />
                    <ReadOnlyField label="Roll Number" value={profileData?.rollNumber || "23331A4401"} required />
                  </div>
                </div>

                {/* Sub-header: Programme Details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Programme Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ReadOnlyField label="Level" value={profileData?.level || "UNDER GRADUATE"} />
                    <ReadOnlyField label="Degree" value={profileData?.degree || "B.TECH"} />
                    <ReadOnlyField label="Program" value={profileData?.program || "COMPUTER SCIENCE AND ENGINEERING (DATA SCIENCE)"} />
                    <ReadOnlyField label="Admitted Batch" value={profileData?.admittedBatch || "2023 - 2024"} />
                    <ReadOnlyField label="Master Batch" value={profileData?.masterBatch || ""} />
                    <ReadOnlyField label="Current Year" value={profileData?.currentYear || "4"} />
                    <ReadOnlyField label="Current Semester" value={profileData?.currentSemester || "7"} />
                    <ReadOnlyField label="Section" value={profileData?.section || "A"} />
                  </div>
                </div>

                {/* Sub-header: Admission Info */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Admission Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ReadOnlyField label="Date of Join" value={profileData?.dateOfJoin || "25-09-2023"} />
                    <ReadOnlyField label="Confirmed Date" value={profileData?.confirmedDate || "10-01-2025"} />
                    <ReadOnlyField label="Admission Type" value={profileData?.admissionType || ""} />
                    <ReadOnlyField label="Lateral Entry" value={profileData?.lateralEntry || "No"} />
                    <ReadOnlyField label="Spot Admission" value={profileData?.spotAdmission || "No"} />
                    <ReadOnlyField label="Quota" value={profileData?.quota || "CONVENER"} />
                    <ReadOnlyField label="Referred By" value={profileData?.referredBy || ""} />
                    <ReadOnlyField label="Status" value={profileData?.admissionStatus || "ADMITTED"} />
                    <ReadOnlyField label="Phase" value={profileData?.phase || "ACTIVE"} />
                  </div>
                </div>

                {/* Sub-header: Scholarship */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Scholarship</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ReadOnlyCheckbox label="Has Scholarship" checked={profileData?.hasScholarship ?? true} />
                    <ReadOnlyField label="Scholarship Amount" value={profileData?.scholarshipAmount || ""} />
                    <ReadOnlyField label="Eligible for Laptop" value={profileData?.eligibleForLaptop || "No"} />
                    <ReadOnlyField label="Reimbursement Eligible" value={profileData?.reimbursementEligible || "No"} />
                    <ReadOnlyField label="Entrance Exam Scholarship Eligible" value={profileData?.entranceExamScholarshipEligible || "No"} />
                  </div>
                </div>

                {/* Sub-header: Enrollment Status */}
                <div className="space-y-3 pt-1">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Enrollment Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ReadOnlySelect label="Status" value={profileData?.enrollmentStatus || "Active"} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: PERSONAL DETAILS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => setPersonalOpen(!personalOpen)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 transition"
            >
              <span>Personal Details</span>
              {personalOpen ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
            </button>

            {personalOpen && (
              <div className="p-5 space-y-6">
                {/* Basic Information */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ReadOnlyField label="First Name" value={profileData?.firstName || "ADABALA"} />
                    <ReadOnlyField label="Last Name" value={profileData?.lastName || "AMRUTHA"} />
                    <ReadOnlyField label="Name as per Aadhaar" value={profileData?.nameAsPerAadhaar || ""} />
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ReadOnlyPhoneField label="Mobile Number" code="+91 India" number={profileData?.phone || "8331022277"} required />
                    <ReadOnlyPhoneField label="Alternate Mobile" code="+91 India" number={profileData?.alternateMobile || ""} />
                    <ReadOnlyField label="Email Address" value={profileData?.email || "23331a4401@mvgrce.edu.in"} />
                    <ReadOnlyField label="Alternate Email" value={profileData?.alternateEmail || ""} />
                    <ReadOnlyField label="Password" value="••••••••" />
                  </div>
                </div>

                {/* Identity & Documents */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Identity & Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ReadOnlyField label="Aadhaar Number" value={profileData?.aadhaarNumber || ""} placeholder="12-digit Aadhaar" />
                    <ReadOnlyField label="APAAR ID" value={profileData?.apaarId || "249303063687"} />
                    <ReadOnlyField label="NIC (National ID)" value={profileData?.nicId || ""} placeholder="National ID" />
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ReadOnlyField label="Date of Birth" value={profileData?.dateOfBirth || "04-07-2006"} />
                    <ReadOnlySelect label="Gender" value={profileData?.gender || "Female"} />
                    <ReadOnlySelect label="Blood Group" value={profileData?.bloodGroup || ""} placeholder="Select an option..." />
                    <ReadOnlySelect label="Differently Abled" value={profileData?.differentlyAbled || "No"} />
                    <ReadOnlySelect label="Mother Tongue" value={profileData?.motherTongue || ""} placeholder="Select an option..." />
                    <ReadOnlySelect label="Languages Known" value={profileData?.languagesKnown || ""} placeholder="Select an option..." />
                    <ReadOnlyField label="Identification Mark-1" value={profileData?.identificationMark1 || ""} />
                    <ReadOnlyField label="Identification Mark-2" value={profileData?.identificationMark2 || ""} />
                  </div>
                </div>

                {/* Category & Reservation */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Category & Reservation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ReadOnlyField label="Nationality" value={profileData?.nationality || ""} />
                    <ReadOnlySelect label="Religion" value={profileData?.religion || ""} placeholder="Select an option..." />
                    <ReadOnlySelect label="Caste" value={profileData?.caste || "OC"} />
                    <ReadOnlySelect label="Sub Caste" value={profileData?.subCaste || "OC"} />
                    <ReadOnlyField label="Claimed Category" value={profileData?.claimedCategory || ""} />
                    <ReadOnlyField label="Allotted Caste Category" value={profileData?.allottedCasteCategory || ""} />
                  </div>
                </div>

                {/* Communication Address */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Communication Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ReadOnlyField label="Address Line 1" value={profileData?.commAddressLine1 || ""} />
                    <ReadOnlyField label="Address Line 2" value={profileData?.commAddressLine2 || ""} />
                    <ReadOnlyField label="Pincode" value={profileData?.commPincode || ""} />
                    <ReadOnlyField label="City" value={profileData?.commCity || ""} />
                    <ReadOnlyField label="District" value={profileData?.commDistrict || ""} />
                    <ReadOnlySelect label="State" value={profileData?.commState || ""} placeholder="Select an option..." />
                    <ReadOnlySelect label="Country" value={profileData?.commCountry || ""} placeholder="Select an option..." />
                  </div>
                </div>

                {/* Permanent Address */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Permanent Address</h3>
                  <ReadOnlyCheckbox label="Same as Current Address" checked={profileData?.sameAsCurrentAddress ?? false} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    <ReadOnlyField label="Address Line 1" value={profileData?.permAddressLine1 || ""} />
                    <ReadOnlyField label="Address Line 2" value={profileData?.permAddressLine2 || ""} />
                    <ReadOnlyField label="Pincode" value={profileData?.permPincode || ""} />
                    <ReadOnlyField label="City" value={profileData?.permCity || ""} />
                    <ReadOnlyField label="District" value={profileData?.permDistrict || ""} />
                    <ReadOnlySelect label="State" value={profileData?.permState || ""} placeholder="Select an option..." />
                    <ReadOnlySelect label="Country" value={profileData?.permCountry || ""} placeholder="Select an option..." />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: PARENT & GUARDIAN DETAILS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => setParentOpen(!parentOpen)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 transition"
            >
              <span>Parent &amp; Guardian Details</span>
              {parentOpen ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
            </button>

            {parentOpen && (
              <div className="p-5 space-y-6">
                {/* Father's Details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Father's Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ReadOnlyField label="Father Name" value={profileData?.fatherName || "ADABALA SATYA SAI SRINU KUMAR"} />
                    <ReadOnlyPhoneField label="Father Mobile" code="+91 India" number={profileData?.fatherMobile || "9440322277"} />
                    <ReadOnlyField label="Father Email" value={profileData?.fatherEmail || ""} />
                    <ReadOnlyField label="Father Occupation" value={profileData?.fatherOccupation || ""} />
                    <ReadOnlyField label="Father Income" value={profileData?.fatherIncome || ""} />
                    <ReadOnlyField label="Father Aadhaar" value={profileData?.fatherAadhaar || ""} placeholder="12-digit Aadhaar" />
                  </div>
                </div>

                {/* Mother's Details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Mother's Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ReadOnlyField label="Mother Name" value={profileData?.motherName || ""} />
                    <ReadOnlyPhoneField label="Mother Mobile" code="+91 India" number={profileData?.motherMobile || ""} />
                    <ReadOnlyField label="Mother Email" value={profileData?.motherEmail || ""} />
                    <ReadOnlyField label="Mother Occupation" value={profileData?.motherOccupation || ""} />
                    <ReadOnlyField label="Mother Aadhaar" value={profileData?.motherAadhaar || ""} placeholder="12-digit Aadhaar" />
                  </div>
                </div>

                {/* Guardian Information */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Guardian Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ReadOnlyField label="Guardian Name" value={profileData?.guardianName || ""} />
                    <ReadOnlyPhoneField label="Guardian Mobile" code="+91 India" number={profileData?.guardianMobile || ""} />
                    <ReadOnlyField label="Guardian Email" value={profileData?.guardianEmail || ""} />
                    <ReadOnlyField label="Guardian Occupation" value={profileData?.guardianOccupation || ""} />
                    <ReadOnlySelect label="Guardian Relation" value={profileData?.guardianRelation || ""} placeholder="Select an option..." />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: QUALIFYING EXAMINATION DETAILS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => setQualifyingOpen(!qualifyingOpen)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 transition"
            >
              <span>Qualifying Examination Details</span>
              {qualifyingOpen ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
            </button>

            {qualifyingOpen && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ReadOnlySelect label="Entrance Examination" value={profileData?.entranceExam || ""} placeholder="Select an option..." />
                  <ReadOnlyField label="Hall Ticket Number" value={profileData?.entranceHallTicket || ""} />
                  <ReadOnlyField label="Rank" value={profileData?.entranceRank || ""} />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5: EDUCATIONAL QUALIFICATIONS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => setEducationOpen(!educationOpen)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 transition"
            >
              <span>Educational Qualifications</span>
              {educationOpen ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
            </button>

            {educationOpen && (
              <div className="p-5 space-y-6">
                {/* SSC / 10th */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">SSC / 10th</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <EditableField label="Your Name" value={profileData?.sscName || ""} onChange={(val) => updateProfileField("sscName", val)} />
                    <EditableField label="Hall Ticket Number" value={profileData?.sscHallTicket || ""} onChange={(val) => updateProfileField("sscHallTicket", val)} />
                    <EditableField label="School Name" value={profileData?.sscSchool || ""} onChange={(val) => updateProfileField("sscSchool", val)} />
                    <EditableSelect label="Board" value={profileData?.sscBoard || ""} options={["CBSE", "ICSE", "State Board", "AP Board", "TS Board"]} placeholder="Select an option..." onChange={(val) => updateProfileField("sscBoard", val)} />
                    <EditableDateField label="Month & Year of Passing" value={profileData?.sscPassingDate || ""} onChange={(val) => updateProfileField("sscPassingDate", val)} />
                    <EditableSelect label="Score Type" value={profileData?.sscScoreType || ""} options={["CGPA", "Percentage"]} placeholder="Select an option..." onChange={(val) => updateProfileField("sscScoreType", val)} />
                    <EditableField label="Total Marks" value={profileData?.sscTotalMarks || ""} placeholder="e.g. 500" onChange={(val) => updateProfileField("sscTotalMarks", val)} />
                    <EditableField label="Secured Marks" value={profileData?.sscSecuredMarks || ""} placeholder="e.g. 425" onChange={(val) => updateProfileField("sscSecuredMarks", val)} />
                    <EditableField label="School Address" value={profileData?.sscAddress || ""} onChange={(val) => updateProfileField("sscAddress", val)} />
                    <EditableField label="School City" value={profileData?.sscCity || ""} onChange={(val) => updateProfileField("sscCity", val)} />
                    <EditableSelect label="School State" value={profileData?.sscState || ""} options={["Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Maharashtra"]} placeholder="Select an option..." onChange={(val) => updateProfileField("sscState", val)} />
                  </div>
                </div>

                {/* Intermediate / 12th */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Intermediate / 12th</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <EditableField label="School Name" value={profileData?.interSchool || ""} onChange={(val) => updateProfileField("interSchool", val)} />
                    <EditableSelect label="Board" value={profileData?.interBoard || ""} options={["BIEAP", "BIETS", "CBSE", "ICSE", "State Board"]} placeholder="Select an option..." onChange={(val) => updateProfileField("interBoard", val)} />
                    <EditableDateField label="Month & Year of Passing" value={profileData?.interPassingDate || ""} onChange={(val) => updateProfileField("interPassingDate", val)} />
                    <EditableSelect label="Score Type" value={profileData?.interScoreType || ""} options={["CGPA", "Percentage"]} placeholder="Select an option..." onChange={(val) => updateProfileField("interScoreType", val)} />
                    <EditableField label="Total Marks" value={profileData?.interTotalMarks || ""} placeholder="e.g. 1000" onChange={(val) => updateProfileField("interTotalMarks", val)} />
                    <EditableField label="Secured Marks" value={profileData?.interSecuredMarks || ""} placeholder="e.g. 850" onChange={(val) => updateProfileField("interSecuredMarks", val)} />
                    <EditableField label="Group Marks" value={profileData?.interGroupMarks || ""} placeholder="e.g. 480" onChange={(val) => updateProfileField("interGroupMarks", val)} />
                    <EditableField label="Group Marks %" value={profileData?.interGroupMarksPercent || ""} placeholder="Auto-computed" onChange={(val) => updateProfileField("interGroupMarksPercent", val)} />
                    <EditableField label="Language Marks" value={profileData?.interLanguageMarks || ""} placeholder="e.g. 85" onChange={(val) => updateProfileField("interLanguageMarks", val)} />
                    <EditableField label="School Address" value={profileData?.interAddress || ""} onChange={(val) => updateProfileField("interAddress", val)} />
                    <EditableField label="School City" value={profileData?.interCity || ""} onChange={(val) => updateProfileField("interCity", val)} />
                    <EditableSelect label="School State" value={profileData?.interState || ""} options={["Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Maharashtra"]} placeholder="Select an option..." onChange={(val) => updateProfileField("interState", val)} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC PERFORMANCE */}
      {activeTab === "performance" && (
        <div className="space-y-4">
          {/* Header & 4 Stats Cards */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Semester {semestersList?.[0]?.sem || 7} Stats
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                <span className="text-xs text-slate-500 font-medium block">Current CGPA</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {performanceData?.currentCgpa ?? "8.13"}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                <span className="text-xs text-slate-500 font-medium block">Latest SGPA</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {performanceData?.latestSgpa ?? "7.95"}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                <span className="text-xs text-slate-500 font-medium block">Credits Earned</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {performanceData?.creditsEarned ?? 0}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                <span className="text-xs text-slate-500 font-medium block">Total Backlogs</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {performanceData?.totalBacklogs ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Backlogs Collapsible Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => setBacklogsOpen(!backlogsOpen)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 transition"
            >
              <span>Backlogs</span>
              {backlogsOpen ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
            </button>

            {backlogsOpen && (
              <div className="p-4">
                {backlogsList.length === 0 ? (
                  <EmptyStateGraphic message="No backlogs found" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                          <th className="p-3">Subject Code</th>
                          <th className="p-3">Subject Name</th>
                          <th className="p-3">Semester</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {backlogsList.map((bg: any, idx: number) => (
                          <tr key={idx}>
                            <td className="p-3 font-semibold">{bg.code}</td>
                            <td className="p-3">{bg.name}</td>
                            <td className="p-3">Sem {bg.sem}</td>
                            <td className="p-3 text-rose-500 font-semibold">{bg.status || "Pending"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dynamic Semesters Accordion List */}
          {semestersList.map((semData) => {
            const isSemOpen = openSemesters[semData.sem] ?? (semData.sem >= 6);
            const hasSubjects = Array.isArray(semData.subjects) && semData.subjects.length > 0;

            return (
              <div
                key={semData.sem}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleSemester(semData.sem)}
                  className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 transition"
                >
                  <span>Semester {semData.sem}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 font-normal">
                      SGPA: <span className="font-semibold text-slate-900 dark:text-white">{semData.sgpa ?? "-"}</span>
                      &nbsp;&nbsp; CGPA: <span className="font-semibold text-slate-900 dark:text-white">{semData.cgpa ?? "-"}</span>
                    </span>
                    {isSemOpen ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
                  </div>
                </button>

                {isSemOpen && (
                  <div className="p-4 overflow-x-auto">
                    {hasSubjects ? (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                            <th className="p-3">Subject Code</th>
                            <th className="p-3">Subject Name</th>
                            <th className="p-3">Grade</th>
                            <th className="p-3">Credits</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Internals</th>
                            <th className="p-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {semData.subjects!.map((sub, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                              <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{sub.code}</td>
                              <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{sub.name}</td>
                              <td className="p-3 text-slate-500">{sub.grade || "-"}</td>
                              <td className="p-3 text-slate-500">{sub.credits || "-"}</td>
                              <td className="p-3 text-slate-500">{sub.status || "-"}</td>
                              <td className="p-3 text-slate-500">{sub.internals || "-"}</td>
                              <td className="p-3 text-center">
                                <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition" title="View details">
                                  <Eye className="size-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <EmptyStateGraphic message="No data for this semester" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: ACADEMIC JOURNEY */}
      {activeTab === "journey" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Academic Journey</h2>

          {/* Dotted Timeline */}
          <div className="relative pl-6 space-y-6">
            <div className="absolute left-[13px] top-3 bottom-3 w-0.5 border-l-2 border-dashed border-slate-200 dark:border-slate-700" />
            {journeySemesters.map((item) => (
              <div key={item.sem} className="relative flex items-start gap-4">
                {/* Node Circle */}
                <div
                  className={`size-7 rounded-full flex items-center justify-center -ml-9 bg-white dark:bg-slate-900 border ${
                    item.isCurrent
                      ? "border-slate-400 text-slate-800 dark:text-white"
                      : "border-slate-300 text-slate-500"
                  } shrink-0`}
                >
                  {item.isCurrent ? (
                    <CheckSquare className="size-3.5" />
                  ) : (
                    <Info className="size-3.5" />
                  )}
                </div>

                <div className="space-y-1.5 pt-0.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Semester {item.sem}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{item.status}</p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Batch: {item.batch}
                    </span>
                    <span className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Programme: {item.programme}
                    </span>
                    <span className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Classroom: {item.classroom}
                    </span>
                    <span className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Course Reg: {item.courseReg}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ATTENDANCE */}
      {activeTab === "attendance" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Attendance</h2>

            {/* Semester Pill Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[1, 2, 3, 4, 5, 6, 7].map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedAttendanceSem(sem)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                    selectedAttendanceSem === sem
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  Semester {sem}
                </button>
              ))}
            </div>

            {/* Attendance Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (Stats + Subject Table) */}
              <div className="lg:col-span-8 space-y-6">
                {/* 4 Summary Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">FINAL ATTENDANCE</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">40.0%</span>
                  </div>
                  <div className="bg-[#f4f5f7] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">PRIMARY ATTENDANCE</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">40.0%</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">CLASS AVERAGE</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">39.1%</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">TOTAL CLASSES</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">2/5</span>
                  </div>
                </div>

                {/* Subject Attendance Breakdown Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3">Subject</th>
                        <th className="p-3 w-1/2">Attendance</th>
                        <th className="p-3 text-right">Classes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {attendanceSubjects.map((sub, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{sub.name}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    sub.percentage >= 75
                                      ? "bg-emerald-500"
                                      : sub.percentage > 0
                                      ? "bg-emerald-500"
                                      : "bg-transparent"
                                  }`}
                                  style={{ width: `${sub.percentage}%` }}
                                />
                              </div>
                              <span className="bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shrink-0">
                                {sub.percentage.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-right text-slate-500 font-medium">{sub.classes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Month Calendar Widget */}
              <div className="lg:col-span-4 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4 bg-white dark:bg-slate-900 shadow-sm">
                <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                  <span>July 2026</span>
                  <div className="flex items-center gap-1 text-slate-400">
                    <button className="p-1 hover:text-slate-700 dark:hover:text-white">&lt;</button>
                    <button className="p-1 hover:text-slate-700 dark:hover:text-white">&gt;</button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 pt-1">
                  <span>S</span>
                  <span>M</span>
                  <span>T</span>
                  <span>W</span>
                  <span>T</span>
                  <span>F</span>
                  <span>S</span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-700 dark:text-slate-300 pt-1">
                  <span className="text-slate-300 dark:text-slate-600">28</span>
                  <span className="text-slate-300 dark:text-slate-600">29</span>
                  <span className="text-slate-300 dark:text-slate-600">30</span>
                  <span>1 <span className="block size-1 bg-emerald-500 rounded-full mx-auto mt-0.5" /></span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>

                  <span>5</span>
                  <span>6</span>
                  <span>7 <span className="block size-1 bg-amber-500 rounded-full mx-auto mt-0.5" /></span>
                  <span>8</span>
                  <span>9</span>
                  <span>10</span>
                  <span>11</span>

                  <span>12</span>
                  <span>13</span>
                  <span>14 <span className="block size-1 bg-emerald-500 rounded-full mx-auto mt-0.5" /></span>
                  <span>15</span>
                  <span>16</span>
                  <span>17</span>
                  <span>18</span>

                  <span>19</span>
                  <span>20</span>
                  <span className="size-6 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-full flex items-center justify-center mx-auto font-bold">21</span>
                  <span>22</span>
                  <span>23</span>
                  <span>24</span>
                  <span>25</span>

                  <span>26</span>
                  <span>27</span>
                  <span>28</span>
                  <span>29</span>
                  <span>30</span>
                  <span>31</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MEMOS */}
      {activeTab === "memos" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">Semester</th>
                  <th className="p-3">Month/Year</th>
                  <th className="p-3">Exam Type</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {journeyExams.map((ex, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{ex.sem}</td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{ex.monthYear}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{ex.examType}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{ex.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: CERTIFICATES */}
      {activeTab === "certificates" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">Certificate</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Uploaded File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {certificates.map((cert, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{cert.name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cert.status === "Submitted"
                          ? "bg-[#e2f0d9] text-[#385723]"
                          : "text-slate-550 font-semibold text-slate-500"
                      }`}>
                        {cert.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {cert.file === "No file uploaded" ? (
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-normal">{cert.file}</span>
                          <label className="px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-extrabold cursor-pointer hover:opacity-90 transition shadow-xs">
                            Upload
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileChange(idx, e)}
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 font-semibold text-slate-855">
                          <span className="truncate max-w-[150px] font-mono text-[11px] text-indigo-650 font-bold">{cert.file}</span>
                          <button
                            onClick={() => handleClearFile(idx)}
                            className="text-red-500 hover:text-red-750 font-extrabold transition text-xs"
                            title="Remove file"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

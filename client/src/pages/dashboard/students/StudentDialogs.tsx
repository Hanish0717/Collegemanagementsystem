import { useEffect, useState, useRef } from "react";
import { X, User, IdCard, Mail, Phone, GraduationCap, Award, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/dashboard/ui";
import { fetchStudents, type DepartmentOption, type StudentPayload, type StudentRecord } from "@/services/studentService";
import { fetchHostels, fetchHostelBlocks, fetchRoomsForBlock } from "@/services/hostelService";

interface StudentFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  student: any;
  departments: DepartmentOption[];
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  isHostelWarden?: boolean;
}

interface StudentFilterModalProps {
  open: boolean;
  departments: DepartmentOption[];
  initialFilters: {
    department: string;
    year: string;
    status: string;
    attendance: string;
    cgpa: string;
  };
  onClose: () => void;
  onApply: (filters: StudentFilterModalProps["initialFilters"]) => void;
  onReset: () => void;
}

interface StudentDeleteAlertProps {
  open: boolean;
  studentName: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const defaultForm = (student: any, departments: DepartmentOption[]) => ({
  fullName: student?.fullName ?? "",
  rollNumber: student?.rollNumber ?? "",
  admissionNumber: student?.admissionNumber ?? "",
  email: student?.email ?? "",
  phoneNumber: student?.phoneNumber ?? "",
  gender: student?.gender ?? "Male",
  dateOfBirth: student?.dateOfBirth ?? "",
  department: student?.department ?? departments[0]?.code ?? "",
  year: String(student?.year ?? 1),
  semester: String(student?.semester ?? 1),
  section: student?.section ?? "A",
  parentName: student?.parentName ?? "",
  parentPhone: student?.parentPhone ?? "",
  parentEmail: student?.parentEmail ?? "",
  attendancePercentage: String(student?.attendancePercentage ?? 100),
  cgpa: String(student?.cgpa ?? ""),
  profileImage: student?.profileImage ?? "",
  hostelId: student?.hostelId ?? "",
  blockId: student?.blockId ?? "",
  roomId: student?.roomId ?? "",
  bedNumber: String(student?.bedNumber ?? "1"),
  academicYear: student?.academicYear ?? "2026-2027",
  status: student?.status ?? "Active",
});

const FormField = ({
  label,
  required,
  type,
  value,
  onChange,
  onBlur,
  disabled
}: {
  label: string;
  required?: boolean;
  type: string;
  value: string;
  onChange: (val: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={`Enter ${label.toLowerCase()}`}
      autoComplete="off"
      className="w-full px-4 py-3 text-base rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    />
  </div>
);

const FormSelect = ({ label, required, value, onChange, children }: { label: string; required?: boolean; value: string; onChange: (val: string) => void; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <select
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 text-base rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 transition-all cursor-pointer"
    >
      {children}
    </select>
  </div>
);

const SectionHeader = ({ title, icon }: { title: string; icon?: string }) => (
  <div className="col-span-full">
    <div className="flex items-center gap-3 pb-4">
      <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
      <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-wide">{title}</h3>
    </div>
    <div className="h-px bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-900" />
  </div>
);

export function StudentFormModal({
  open,
  mode,
  student,
  departments,
  submitting = false,
  onClose,
  onSubmit,
  isHostelWarden = false,
}: StudentFormModalProps) {
  const [form, setForm] = useState(() => defaultForm(student, departments));
  const [hostelsList, setHostelsList] = useState<any[]>([]);
  const [blocksList, setBlocksList] = useState<any[]>([]);
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [checkingRoll, setCheckingRoll] = useState(false);
  const [rollStatus, setRollStatus] = useState<"idle" | "checking" | "found" | "not_found">("idle");

  // Simplified Add Student (Search/Verify) states
  const [searchRoll, setSearchRoll] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchingStudent, setSearchingStudent] = useState(false);
  const [foundStudent, setFoundStudent] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const checkRollNumber = async (roll: string) => {
    if (!roll.trim() || mode !== "create") return;
    
    setCheckingRoll(true);
    setRollStatus("checking");
    try {
      const response = await fetchStudents({ search: roll.trim(), limit: 10 });
      const found = response.students.find(
        (s) => s.rollNumber.toLowerCase() === roll.trim().toLowerCase()
      );
      
      if (found) {
        setRollStatus("found");
        setForm((curr) => ({
          ...curr,
          fullName: found.fullName || curr.fullName,
          department: found.department || curr.department,
          admissionNumber: found.admissionNumber || curr.admissionNumber,
          email: found.email || curr.email,
          phoneNumber: found.phoneNumber || curr.phoneNumber,
          gender: found.gender || curr.gender,
          dateOfBirth: found.dateOfBirth || curr.dateOfBirth,
          year: String(found.year ?? curr.year),
          semester: String(found.semester ?? curr.semester),
          section: found.section || curr.section,
          parentName: found.parentName || curr.parentName,
          parentPhone: found.parentPhone || curr.parentPhone,
          parentEmail: found.parentEmail || curr.parentEmail,
          attendancePercentage: String(found.attendancePercentage ?? curr.attendancePercentage),
          cgpa: String(found.cgpa ?? curr.cgpa),
        }));
        toast.success(`Student details auto-filled from database for Roll Number: ${roll.trim()}`);
      } else {
        setRollStatus("not_found");
      }
    } catch (err) {
      console.error("Error auto-checking roll number:", err);
      setRollStatus("idle");
    } finally {
      setCheckingRoll(false);
    }
  };

  const handleCheckStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRoll.trim() && !searchName.trim()) {
      toast.error("Please enter either Student ID or Student Name");
      return;
    }

    setSearchingStudent(true);
    setFoundStudent(null);
    setSearchError(null);
    try {
      const response = await fetchStudents({ 
        search: (searchRoll.trim() || searchName.trim()), 
        limit: 20 
      });
      
      let found = null;
      if (searchRoll.trim() && searchName.trim()) {
        found = response.students.find(
          (s) => s.rollNumber.toLowerCase() === searchRoll.trim().toLowerCase() &&
                 s.fullName.toLowerCase().includes(searchName.trim().toLowerCase())
        );
      } else if (searchRoll.trim()) {
        found = response.students.find(
          (s) => s.rollNumber.toLowerCase() === searchRoll.trim().toLowerCase()
        );
      } else {
        found = response.students.find(
          (s) => s.fullName.toLowerCase().includes(searchName.trim().toLowerCase())
        );
      }

      if (found) {
        setFoundStudent(found);
        toast.success("Success: Student record found!");
      } else {
        setSearchError("No student record matches the entered Roll Number / Name in the registry.");
        toast.error("Student not found");
      }
    } catch (err: any) {
      setSearchError(err.message || "Failed to search student record");
      toast.error("Student check failed");
    } finally {
      setSearchingStudent(false);
    }
  };

  useEffect(() => {
    if (open) {
      setForm(defaultForm(student, departments));
      setCheckingRoll(false);
      setRollStatus("idle");
      setSearchRoll("");
      setSearchName("");
      setFoundStudent(null);
      setSearchError(null);
      setSearchingStudent(false);
    }
  }, [open, student, departments]);

  useEffect(() => {
    if (open && isHostelWarden) {
      fetchHostels().then(setHostelsList).catch(console.error);
    }
  }, [open, isHostelWarden]);

  useEffect(() => {
    if (isHostelWarden && form.hostelId) {
      fetchHostelBlocks(form.hostelId).then(setBlocksList).catch(console.error);
    } else {
      setBlocksList([]);
    }
  }, [form.hostelId, isHostelWarden]);

  useEffect(() => {
    if (isHostelWarden && form.blockId) {
      fetchRoomsForBlock(form.blockId).then(setRoomsList).catch(console.error);
    } else {
      setRoomsList([]);
    }
  }, [form.blockId, isHostelWarden]);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    if (open) {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    return;
  }, [open, onClose]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.fullName.trim()) errors.fullName = "Full name is required";
    if (!form.rollNumber.trim()) errors.rollNumber = "Roll number is required";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Invalid email format";
    if (!form.department) errors.department = "Department is required";
    if (!form.year || Number.isNaN(Number(form.year))) errors.year = "Year is required";
    if (form.cgpa && Number(form.cgpa) < 0) errors.cgpa = "CGPA cannot be negative";
    if (form.cgpa && Number(form.cgpa) > 10) errors.cgpa = "CGPA cannot be greater than 10";
    if (form.attendancePercentage && (Number(form.attendancePercentage) < 0 || Number(form.attendancePercentage) > 100))
      errors.attendancePercentage = "Attendance must be between 0 and 100";
    if (!form.parentName.trim()) errors.parentName = "Parent name is required";
    if (!form.parentPhone.trim()) errors.parentPhone = "Parent phone is required";
    else if (!/^[0-9()+\-\s]{6,20}$/.test(form.parentPhone)) errors.parentPhone = "Invalid phone number";
    if (!form.parentEmail.trim()) errors.parentEmail = "Parent email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parentEmail)) errors.parentEmail = "Invalid parent email";

    if (isHostelWarden) {
      if (!form.hostelId) errors.hostelId = "Hostel allocation is required";
      if (!form.blockId) errors.blockId = "Block allocation is required";
      if (!form.roomId) errors.roomId = "Room allocation is required";
    }

    return errors;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length) {
      console.debug("StudentForm validation errors:", errors);
      const firstKey = Object.keys(errors)[0];
      const map: Record<string, string> = {
        fullName: 'input[placeholder="Enter full name"]',
        rollNumber: 'input[placeholder="Enter roll number"]',
        email: 'input[placeholder="Enter email address"]',
        department: 'select',
        year: 'select',
        parentName: 'input[placeholder="Enter parent name"]',
        parentPhone: 'input[placeholder="Enter parent phone"]',
        parentEmail: 'input[placeholder="Enter parent email"]',
      };
      const sel = map[firstKey];
      try {
        const el = document.querySelector(sel || 'input');
        (el as HTMLElement | null)?.focus();
      } catch (e) {
        /* ignore */
      }
      toast.error(Object.values(errors)[0]);
      return;
    }

    const payload = {
      fullName: form.fullName,
      rollNumber: form.rollNumber,
      admissionNumber: form.admissionNumber,
      email: form.email,
      phoneNumber: form.phoneNumber,
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      department: form.department,
      year: Number(form.year),
      semester: Number(form.semester),
      section: form.section.toUpperCase(),
      parentName: form.parentName,
      parentPhone: form.parentPhone,
      parentEmail: form.parentEmail,
      attendancePercentage: form.attendancePercentage ? Number(form.attendancePercentage) : null,
      cgpa: form.cgpa ? Number(form.cgpa) : null,
      profileImage: form.profileImage || null,
      // Hostel allocations payload
      hostelId: form.hostelId,
      blockId: form.blockId,
      roomId: form.roomId,
      bedNumber: Number(form.bedNumber),
      academicYear: form.academicYear,
      status: form.status,
    };

    console.debug("StudentForm current state:", form);
    console.debug("StudentForm submission payload:", payload);

    onSubmit(payload);
  };

  if (!open) return null;

  const title = mode === "create" ? "Search Student" : "Edit Student";
  const primaryText = mode === "create" ? "Create Student" : "Save Changes";

  const getInitials = (name: string) => {
    if (!name) return "ST";
    return name
      .split(" ")
      .filter(Boolean)
      .map((val) => val[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getDeptName = (code: string) => {
    return departments.find((d) => d.code === code)?.name || code;
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-start justify-center z-50 p-2 md:p-4 overflow-y-auto">
      <div className={`w-full ${mode === "create" && foundStudent ? "max-w-2xl" : "max-w-4xl"} bg-white dark:bg-gray-950 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 my-4 md:my-8`}>
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 dark:from-blue-900 dark:via-blue-800 dark:to-purple-900 px-6 md:px-8 py-6 md:py-8">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h2>
              <p className="text-blue-100 dark:text-blue-200 text-sm md:text-base">
                {mode === "create" 
                  ? (foundStudent ? "Verified student record found in database" : "Enter student details to verify their registry record")
                  : "Update the student information below"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition text-white flex-shrink-0"
              aria-label="Close student form"
            >
              <X className="size-6" />
            </button>
          </div>
        </div>

        {mode === "create" ? (
          /* Simplify create mode to only Name and ID check */
          <div className="p-6 md:p-8">
            {!foundStudent ? (
              <form onSubmit={handleCheckStudent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Student Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                        <User className="size-5" />
                      </span>
                      <input
                        type="text"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        placeholder="Enter student's full name"
                        autoComplete="off"
                        className="w-full pl-10 pr-4 py-3 text-base rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Student ID / Roll Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                        <IdCard className="size-5" />
                      </span>
                      <input
                        type="text"
                        required
                        value={searchRoll}
                        onChange={(e) => setSearchRoll(e.target.value)}
                        placeholder="Enter roll number (e.g. CS2026101)"
                        autoComplete="off"
                        className="w-full pl-10 pr-4 py-3 text-base rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 transition-all uppercase"
                      />
                    </div>
                  </div>
                </div>

                {searchError && (
                  <div className="p-4 rounded-xl text-sm border bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-300 flex items-start gap-2.5">
                    <X className="size-5 flex-shrink-0 text-red-500 mt-0.5" />
                    <div>
                      <div className="font-bold mb-0.5">Verification Failed</div>
                      <p className="text-xs opacity-90">{searchError}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6 pt-5 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={searchingStudent}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {searchingStudent ? "Checking..." : "Check Student"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Profile Card Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50">
                  <div className="size-20 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                    {getInitials(foundStudent.fullName)}
                  </div>
                  <div className="text-center sm:text-left flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{foundStudent.fullName}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        foundStudent.status === "Active"
                          ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50"
                          : foundStudent.status === "Warning"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800/50"
                          : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50"
                      }`}>
                        {foundStudent.status || "Active"}
                      </span>
                    </div>
                    <p className="text-sm font-mono text-gray-500 dark:text-gray-400">ID: {foundStudent.rollNumber}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Admission No: <span className="font-semibold">{foundStudent.admissionNumber || "N/A"}</span>
                    </p>
                  </div>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Academic Information */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide uppercase flex items-center gap-1.5 border-b pb-1.5 border-gray-100 dark:border-gray-800">
                      <GraduationCap className="size-4 text-blue-500" /> Academic Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                        <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-0.5">Branch</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white block truncate" title={getDeptName(foundStudent.department)}>
                          {getDeptName(foundStudent.department)}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                        <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-0.5">Year & Sem</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          Year {foundStudent.year} (Sem {foundStudent.semester})
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                        <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-0.5">Section</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          Section {foundStudent.section || "A"}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                        <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-0.5">Gender</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {foundStudent.gender || "Male"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide uppercase flex items-center gap-1.5 border-b pb-1.5 border-gray-100 dark:border-gray-800">
                      <Award className="size-4 text-purple-500" /> Academic Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                        <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-0.5">CGPA</span>
                        <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                          {foundStudent.cgpa !== null ? Number(foundStudent.cgpa).toFixed(2) : "N/A"}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                        <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-1">Attendance</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {foundStudent.attendancePercentage ?? 0}%
                          </span>
                          <div className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <div
                              className={`h-full ${
                                (foundStudent.attendancePercentage ?? 0) >= 75
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${foundStudent.attendancePercentage ?? 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3 md:col-span-2">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide uppercase flex items-center gap-1.5 border-b pb-1.5 border-gray-100 dark:border-gray-800">
                      <Mail className="size-4 text-teal-500" /> Contact & Info
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <a
                        href={`mailto:${foundStudent.email}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50/50 dark:bg-gray-900/40 dark:hover:bg-blue-950/20 border border-gray-100 dark:border-gray-800/50 transition group"
                      >
                        <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition">
                          <Mail className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500 block">Email Address</span>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white block truncate">{foundStudent.email}</span>
                        </div>
                      </a>
                      <a
                        href={foundStudent.phoneNumber ? `tel:${foundStudent.phoneNumber}` : "#"}
                        className={`flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 dark:border-gray-800/50 transition group ${
                          foundStudent.phoneNumber
                            ? "hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                            : "opacity-60 cursor-not-allowed"
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition">
                          <Phone className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500 block">Phone Number</span>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white block truncate">
                            {foundStudent.phoneNumber || "N/A"}
                          </span>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Parent Information */}
                  <div className="space-y-3 md:col-span-2">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide uppercase flex items-center gap-1.5 border-b pb-1.5 border-gray-100 dark:border-gray-800">
                      <User className="size-4 text-orange-500" /> Parent / Guardian Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                        <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-0.5">Parent Name</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white block truncate">
                          {foundStudent.parentName || "N/A"}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                        <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-0.5">Parent Phone</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white block truncate">
                          {foundStudent.parentPhone || "N/A"}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                        <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-0.5">Parent Email</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white block truncate">
                          {foundStudent.parentEmail || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-5 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => { setFoundStudent(null); setSearchName(""); setSearchRoll(""); setSearchError(null); }}
                    className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 transition flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="size-4" /> Check Another Student
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition text-center"
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Keep original edit form exactly as it is */
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="space-y-8">
              {/* Personal Information Section */}
              <div>
                <SectionHeader title="👤 Personal Information" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
                  <FormField label="Full Name" required type="text" value={form.fullName} onChange={(val) => updateField("fullName", val)} />
                  <div>
                    <FormField
                      label="Roll Number"
                      required
                      type="text"
                      value={form.rollNumber}
                      onChange={(val) => {
                        updateField("rollNumber", val);
                        if (rollStatus !== "idle") setRollStatus("idle");
                      }}
                      onBlur={(e) => checkRollNumber(e.target.value)}
                    />
                  </div>
                  <FormField label="Admission Number" type="text" value={form.admissionNumber} onChange={(val) => updateField("admissionNumber", val)} />
                  <FormSelect label="Gender" value={form.gender} onChange={(val) => updateField("gender", val)}>
                    {['Male', 'Female', 'Other'].map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </FormSelect>
                  <FormField label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(val) => updateField("dateOfBirth", val)} />
                </div>
              </div>

              {/* Contact Information Section */}
              <div>
                <SectionHeader title="📧 Contact Information" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                  <FormField label="Email Address" required type="email" value={form.email} onChange={(val) => updateField("email", val)} />
                  <FormField label="Phone Number" type="tel" value={form.phoneNumber} onChange={(val) => updateField("phoneNumber", val)} />
                </div>
              </div>

              {/* Academic Information Section */}
              <div>
                <SectionHeader title="🎓 Academic Details" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
                  <FormSelect label="Branch" required value={form.department} onChange={(val) => updateField("department", val)}>
                    <option value="">Select Branch</option>
                    {(departments || []).map((department) => (
                      <option key={department.code} value={department.code}>
                        {department.name}
                      </option>
                    ))}
                  </FormSelect>
                  <FormSelect label="Year" required value={form.year} onChange={(val) => updateField("year", val)}>
                    {[1, 2, 3, 4].map((value) => (
                      <option key={value} value={value}>Year {value}</option>
                    ))}
                  </FormSelect>
                  <FormSelect label="Semester" required value={form.semester} onChange={(val) => updateField("semester", val)}>
                    {Array.from({ length: 8 }, (_, index) => index + 1).map((value) => (
                      <option key={value} value={value}>Semester {value}</option>
                    ))}
                  </FormSelect>
                    <FormField label="Section" required type="text" value={form.section} onChange={(val) => updateField("section", val)} />
                  <FormField label="Attendance %" type="number" value={form.attendancePercentage} onChange={(val) => updateField("attendancePercentage", val)} />
                  <FormField label="CGPA" type="number" value={form.cgpa} onChange={(val) => updateField("cgpa", val)} />
                </div>
              </div>

              {/* Parent Information Section */}
              <div>
                <SectionHeader title="👨‍👩‍👦 Parent/Guardian Information" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
                  <FormField label="Parent Name" required type="text" value={form.parentName} onChange={(val) => updateField("parentName", val)} />
                  <FormField label="Parent Phone" required type="tel" value={form.parentPhone} onChange={(val) => updateField("parentPhone", val)} />
                  <FormField label="Parent Email" required type="email" value={form.parentEmail} onChange={(val) => updateField("parentEmail", val)} />
                </div>
              </div>

              {/* Hostel Room Allocation Section */}
              {isHostelWarden && (
                <div>
                  <SectionHeader title="🏠 Hostel Room Allocation" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4 animate-in fade-in duration-200">
                    <FormSelect label="Hostel" required value={form.hostelId} onChange={(val) => updateField("hostelId", val)}>
                      <option value="">Select Hostel</option>
                      {hostelsList.map((h: any) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </FormSelect>
                    <FormSelect label="Block" required value={form.blockId} onChange={(val) => updateField("blockId", val)}>
                      <option value="">Select Block</option>
                      {blocksList.map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </FormSelect>
                    <FormSelect label="Room" required value={form.roomId} onChange={(val) => updateField("roomId", val)}>
                      <option value="">Select Room</option>
                      {roomsList.map((r: any) => (
                        <option key={r.id} value={r.id}>{r.room_number || r.roomNumber} ({r.type}, Occ: {r.occupants}/{r.capacity})</option>
                      ))}
                    </FormSelect>
                    <FormSelect label="Bed Number" required value={form.bedNumber} onChange={(val) => updateField("bedNumber", val)}>
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={String(n)}>Bed {n}</option>
                      ))}
                    </FormSelect>
                    <FormField label="Academic Year" required type="text" value={form.academicYear} onChange={(val) => updateField("academicYear", val)} />
                    <FormSelect label="Allocation Status" required value={form.status} onChange={(val) => updateField("status", val)}>
                      {["Active", "Vacated", "Suspended"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </FormSelect>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 transition duration-200 text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-base"
              >
                {submitting ? "Saving..." : primaryText}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const FilterFormSelect = ({ label, value, onChange, children }: { label: string; value: string; onChange: (val: string) => void; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm font-medium focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition duration-200 cursor-pointer"
    >
      {children}
    </select>
  </div>
);

export function StudentFilterModal({
  open,
  departments,
  initialFilters,
  onClose,
  onApply,
  onReset,
}: StudentFilterModalProps) {
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    if (open) {
      setFilters(initialFilters);
    }
  }, [open, initialFilters]);

  const update = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-start justify-center z-50 p-2 md:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-950 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 my-4 md:my-8">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-900 dark:to-teal-900 px-6 md:px-8 py-6 md:py-8">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">🔍 Filter Students</h2>
              <p className="text-green-100 dark:text-green-200 text-sm md:text-base">
                Refine your student search with advanced filters
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition text-white flex-shrink-0"
              aria-label="Close filters"
            >
              <X className="size-6" />
            </button>
          </div>
        </div>

        {/* Filter content */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FilterFormSelect label="Branch" value={filters.department} onChange={(val) => update("department", val)}>
              <option value="All">All Branches</option>
              {(departments || []).map((department) => (
                <option key={department.code} value={department.code}>
                  {department.name}
                </option>
              ))}
            </FilterFormSelect>
            <FilterFormSelect label="Year" value={filters.year} onChange={(val) => update("year", val)}>
              <option value="All">All Years</option>
              {[1, 2, 3, 4].map((value) => (
                <option key={value} value={value}>
                  Year {value}
                </option>
              ))}
            </FilterFormSelect>
            <FilterFormSelect label="Status" value={filters.status} onChange={(val) => update("status", val)}>
              {['All', 'Active', 'Warning', 'Inactive'].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </FilterFormSelect>
            <FilterFormSelect label="Attendance" value={filters.attendance} onChange={(val) => update("attendance", val)}>
              {['All', '90%+', '75-89%', 'Below 75%'].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </FilterFormSelect>
            <FilterFormSelect label="CGPA" value={filters.cgpa} onChange={(val) => update("cgpa", val)}>
              {['All', '9.0+', '8.0-8.9', 'Below 8.0'].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </FilterFormSelect>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onReset}
              className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 transition duration-200 text-base"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={() => onApply(filters)}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-700 dark:to-teal-700 text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 transition duration-200 text-base"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentDeleteAlert({
  open,
  studentName,
  loading = false,
  onClose,
  onConfirm,
}: StudentDeleteAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={(value) => !value && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete student</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove {studentName} from the student registry and refresh the current view.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-rose-600 text-white hover:bg-rose-700"
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface StudentVerifyModalProps {
  open: boolean;
  departments: DepartmentOption[];
  onClose: () => void;
  onVerify: (rollNumber: string, fullName?: string) => Promise<any>;
}

export function StudentVerifyModal({
  open,
  departments,
  onClose,
  onVerify,
}: StudentVerifyModalProps) {
  const [rollNumber, setRollNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    if (open) {
      setRollNumber("");
      setFullName("");
      setResult(null);
    }
  }, [open]);

  if (!open) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber.trim() && !fullName.trim()) {
      toast.error("Please enter either Student ID or Student Name");
      return;
    }

    setVerifying(true);
    setResult(null);
    try {
      const data = await onVerify(rollNumber.trim(), fullName.trim() || undefined);
      setResult({ success: true, data });
      toast.success("Success: Student record found!");
    } catch (err: any) {
      setResult({ success: false, error: err?.response?.data?.message || err.message || "Student not found" });
      toast.error("Student check failed or not found");
    } finally {
      setVerifying(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "ST";
    return name
      .split(" ")
      .filter(Boolean)
      .map((val) => val[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getDeptName = (code: string) => {
    return departments.find((d) => d.code === code)?.name || code;
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4 overflow-y-auto">
      <div className={`w-full ${result?.success ? "max-w-2xl" : "max-w-md"} bg-white dark:bg-gray-950 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-800`}>
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 text-white">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="text-xl font-bold mb-1">Check Student Registry</h2>
              <p className="text-blue-100 text-sm">
                Search and view verified student profile details
              </p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition text-white">
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!result?.success ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Student Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                    <User className="size-5" />
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter student's full name"
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-3 text-base rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Student ID / Roll Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                    <IdCard className="size-5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="Enter roll number (e.g., CS2026101)"
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-3 text-base rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 transition-all uppercase"
                  />
                </div>
              </div>

              {result && !result.success && (
                <div className="p-4 rounded-xl text-sm border bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-300 flex items-start gap-2.5">
                  <X className="size-5 flex-shrink-0 text-red-500 mt-0.5" />
                  <div>
                    <div className="font-bold mb-0.5">Verification Failed</div>
                    <p className="text-xs opacity-90">{result.error}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6 pt-5 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {verifying ? "Checking..." : "Check Student"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50">
                <div className="size-20 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                  {getInitials(result.data.fullName)}
                </div>
                <div className="text-center sm:text-left flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{result.data.fullName}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      result.data.status === "Active"
                        ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50"
                        : result.data.status === "Warning"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800/50"
                        : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50"
                    }`}>
                      {result.data.status || "Active"}
                    </span>
                  </div>
                  <p className="text-sm font-mono text-gray-500 dark:text-gray-400">ID: {result.data.rollNumber}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Admission No: <span className="font-semibold">{result.data.admissionNumber || "N/A"}</span>
                  </p>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Academic Information */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide uppercase flex items-center gap-1.5 border-b pb-1.5 border-gray-100 dark:border-gray-800">
                    <GraduationCap className="size-4 text-blue-500" /> Academic Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-0.5">Branch</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white block truncate" title={getDeptName(result.data.department)}>
                        {getDeptName(result.data.department)}
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-0.5">Year & Sem</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        Year {result.data.year} (Sem {result.data.semester})
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-0.5">Section</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        Section {result.data.section || "A"}
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-0.5">Gender</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {result.data.gender || "Male"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide uppercase flex items-center gap-1.5 border-b pb-1.5 border-gray-100 dark:border-gray-800">
                    <Award className="size-4 text-purple-500" /> Academic Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-0.5">CGPA</span>
                      <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                        {result.data.cgpa !== null ? Number(result.data.cgpa).toFixed(2) : "N/A"}
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-1">Attendance</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {result.data.attendancePercentage ?? 0}%
                        </span>
                        <div className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <div
                            className={`h-full ${
                              (result.data.attendancePercentage ?? 0) >= 75
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${result.data.attendancePercentage ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3 md:col-span-2">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide uppercase flex items-center gap-1.5 border-b pb-1.5 border-gray-100 dark:border-gray-800">
                    <Mail className="size-4 text-teal-500" /> Contact & Info
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={`mailto:${result.data.email}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50/50 dark:bg-gray-900/40 dark:hover:bg-blue-950/20 border border-gray-100 dark:border-gray-800/50 transition group"
                    >
                      <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition">
                        <Mail className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500 block">Email Address</span>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white block truncate">{result.data.email}</span>
                      </div>
                    </a>
                    <a
                      href={result.data.phoneNumber ? `tel:${result.data.phoneNumber}` : "#"}
                      className={`flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 dark:border-gray-800/50 transition group ${
                        result.data.phoneNumber
                          ? "hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                          : "opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition">
                        <Phone className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500 block">Phone Number</span>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white block truncate">
                          {result.data.phoneNumber || "N/A"}
                        </span>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Parent Information */}
                <div className="space-y-3 md:col-span-2">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide uppercase flex items-center gap-1.5 border-b pb-1.5 border-gray-100 dark:border-gray-800">
                    <User className="size-4 text-orange-500" /> Parent / Guardian Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-0.5">Parent Name</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white block truncate">
                        {result.data.parentName || "N/A"}
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-0.5">Parent Phone</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white block truncate">
                        {result.data.parentPhone || "N/A"}
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-0.5">Parent Email</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white block truncate">
                        {result.data.parentEmail || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-5 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="size-4" /> Check Another Student
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition"
                >
                  Close Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
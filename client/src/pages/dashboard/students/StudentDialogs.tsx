import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
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
import type { DepartmentOption, StudentPayload, StudentRecord } from "@/services/studentService";
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

const FormField = ({ label, required, type, value, onChange }: { label: string; required?: boolean; type: string; value: string; onChange: (val: string) => void }) => (
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
      placeholder={`Enter ${label.toLowerCase()}`}
      autoComplete="off"
      className="w-full px-4 py-3 text-base rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 transition-all"
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

  useEffect(() => {
    if (open) {
      setForm(defaultForm(student, departments));
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

  const title = mode === "create" ? "Add Student" : "Edit Student";
  const primaryText = mode === "create" ? "Create Student" : "Save Changes";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-start justify-center z-50 p-2 md:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-950 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 my-4 md:my-8">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 dark:from-blue-900 dark:via-blue-800 dark:to-purple-900 px-6 md:px-8 py-6 md:py-8">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h2>
              <p className="text-blue-100 dark:text-blue-200 text-sm md:text-base">
                {mode === "create" ? "Fill in the details to add a new student to the system" : "Update the student information below"}
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

        {/* Form content */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="space-y-8">
            {/* Personal Information Section */}
            <div>
              <SectionHeader title="👤 Personal Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
                <FormField label="Full Name" required type="text" value={form.fullName} onChange={(val) => updateField("fullName", val)} />
                <FormField label="Roll Number" required type="text" value={form.rollNumber} onChange={(val) => updateField("rollNumber", val)} />
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
                <FormSelect label="Department" required value={form.department} onChange={(val) => updateField("department", val)}>
                  <option value="">Select Department</option>
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
                      <option key={r.id} value={r.id}>{r.roomNumber} ({r.type}, Occ: {r.occupants}/{r.capacity})</option>
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
            <FilterFormSelect label="Department" value={filters.department} onChange={(val) => update("department", val)}>
              <option value="All">All Departments</option>
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
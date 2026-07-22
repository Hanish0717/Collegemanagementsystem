import { useState } from "react";
import { Sparkles, MoreVertical, ArrowLeft } from "lucide-react";

interface PreviousSemesterRegistration {
  semester: string;
  batch: string;
  status: string;
}

interface CourseDetail {
  name: string;
  code: string;
  credits: string | number;
  type: string;
  status: string;
}

export function StudentCourseRegistration() {
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const previousSemesters: PreviousSemesterRegistration[] = [
    { semester: "I SEMESTER", batch: "2023 - 2024", status: "Previous" },
    { semester: "II SEMESTER", batch: "2023 - 2024", status: "Previous" },
    { semester: "III SEMESTER", batch: "2023 - 2024", status: "Previous" },
    { semester: "IV SEMESTER", batch: "2023 - 2024", status: "Previous" },
    { semester: "V SEMESTER", batch: "2023 - 2024", status: "Previous" },
    { semester: "VI SEMESTER", batch: "2023 - 2024", status: "Previous" },
  ];

  // Realistic course details populated per semester selection
  const semesterCoursesMap: Record<string, CourseDetail[]> = {
    "I SEMESTER": [
      { name: "Linear Algebra and Calculus", code: "R23MBSMT001", credits: "3", type: "Core Theory", status: "Approved" },
      { name: "Applied Physics", code: "R23MBSPH001", credits: "3", type: "Core Theory", status: "Approved" },
      { name: "Basic Electrical & Electronics Engineering", code: "R23MEEST001", credits: "3", type: "Core Theory", status: "Approved" },
      { name: "Engineering Graphics Lab", code: "R23MMECL001", credits: "3", type: "Core Lab", status: "Approved" },
      { name: "Applied Physics Lab", code: "R23MBSPL001", credits: "1.5", type: "Core Lab", status: "Approved" },
      { name: "Basic Electrical Lab", code: "R23MEESL001", credits: "1.5", type: "Core Lab", status: "Approved" },
    ],
    "II SEMESTER": [
      { name: "Differential Equations and Vector Calculus", code: "R23MBSMT002", credits: "3", type: "Core Theory", status: "Approved" },
      { name: "Engineering Chemistry", code: "R23MBSCH001", credits: "3", type: "Core Theory", status: "Approved" },
      { name: "Introduction to Programming", code: "R23MSCST001", credits: "3", type: "Core Theory", status: "Approved" },
      { name: "Engineering Chemistry Lab", code: "R23MBSCL001", credits: "1.5", type: "Core Lab", status: "Approved" },
      { name: "Programming Lab", code: "R23MSCSL001", credits: "1.5", type: "Core Lab", status: "Approved" },
    ],
    "III SEMESTER": [
      { name: "Discrete Mathematical Structures", code: "R23MSCST005", credits: "3", type: "Core Theory", status: "Approved" },
      { name: "Data Structures", code: "R23MSCST006", credits: "3", type: "Core Theory", status: "Approved" },
      { name: "Computer Organization and Architecture", code: "R23MSCST007", credits: "3", type: "Core Theory", status: "Approved" },
      { name: "Data Structures Lab", code: "R23MSCSL003", credits: "1.5", type: "Core Lab", status: "Approved" },
    ],
    "IV SEMESTER": [
      { name: "Probability and Statistics", code: "R23MBSMT009", credits: "3", type: "Core Theory", status: "Approved" },
      { name: "Database Management Systems", code: "R23MSCST009", credits: "3", type: "Core Theory", status: "Approved" },
      { name: "Design and Analysis of Algorithms", code: "R23MSCST010", credits: "3", type: "Core Theory", status: "Approved" },
      { name: "DBMS Lab", code: "R23MSCSL005", credits: "1.5", type: "Core Lab", status: "Approved" },
    ],
    "V SEMESTER": [
      { name: "Software Engineering", code: "R23MSCST012", credits: "3", type: "Core Theory", status: "Approved" },
      { name: "Computer Networks", code: "R23MSCST013", credits: "3", type: "Core Theory", status: "Approved" },
      { name: "Artificial Intelligence", code: "R23MSCST014", credits: "3", type: "Core Theory", status: "Approved" },
      { name: "Networks Lab", code: "R23MSCSL006", credits: "1.5", type: "Core Lab", status: "Approved" },
    ],
    "VI SEMESTER": [
      { name: "Web Technologies", code: "R23MSCST015", credits: "3", type: "Core Theory", status: "Approved" },
      { name: "OOAD and Design Patterns", code: "R23MSCST016", credits: "3", type: "Core Theory", status: "Approved" },
      { name: "Business Analysis", code: "R23MBMCT006", credits: "3", type: "Core Theory", status: "Approved" },
      { name: "Web Technologies Lab", code: "R23MSCSL008", credits: "1.5", type: "Core Lab", status: "Approved" },
    ]
  };

  const selectedCourses = selectedSemester ? (semesterCoursesMap[selectedSemester] || []) : [];

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">

        <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <Sparkles className="size-3.5 text-indigo-500" />
          <span>Ask AI</span>
        </button>
      </div>

      {!selectedSemester ? (
        <>
          {/* Page Description */}
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Register for courses in the current semester or view your previous registrations.
          </p>

          {/* Main List Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Previous Semesters
            </h2>

            {/* Previous Semesters Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4 font-bold text-slate-900 dark:text-white">Semester</th>
                      <th className="p-4 font-bold text-slate-900 dark:text-white">Batch</th>
                      <th className="p-4 font-bold text-slate-900 dark:text-white">Status</th>
                      <th className="p-4 font-bold text-slate-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {previousSemesters.map((sem, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="p-4 font-extrabold text-slate-900 dark:text-white tracking-wide">
                          {sem.semester}
                        </td>
                        <td className="p-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {sem.batch}
                        </td>
                        <td className="p-4">
                          <span className="bg-[#fef3c7] text-[#d97706] font-bold px-3 py-1 rounded text-[10px] tracking-wide select-none">
                            {sem.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => setSelectedSemester(sem.semester)}
                            className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Semester Detail View */}
          <div className="flex items-center gap-2 pt-1 relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
            >
              <MoreVertical className="size-4" />
            </button>

            {showDropdown && (
              <div className="absolute left-0 top-12 z-10 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-1.5 text-xs font-semibold">
                <button
                  onClick={() => {
                    setSelectedSemester(null);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 text-left transition"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Back to Semesters</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setSelectedSemester(null)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold shadow-sm hover:bg-slate-50 transition"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back</span>
            </button>
          </div>

          {/* Registered Courses Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 font-bold text-slate-900 dark:text-white">Subject Name</th>
                    <th className="p-4 font-bold text-slate-900 dark:text-white">Subject Code</th>
                    <th className="p-4 font-bold text-slate-900 dark:text-white">Credits</th>
                    <th className="p-4 font-bold text-slate-900 dark:text-white">Type</th>
                    <th className="p-4 font-bold text-slate-900 dark:text-white">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedCourses.map((course, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {course.name}
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {course.code}
                      </td>
                      <td className="p-4 font-black text-slate-900 dark:text-white">
                        {course.credits}
                      </td>
                      <td className="p-4 font-semibold text-slate-500">
                        {course.type}
                      </td>
                      <td className="p-4">
                        <span className="bg-[#e2f0d9] text-[#385723] font-bold px-3 py-1 rounded text-[10px] tracking-wide select-none">
                          {course.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

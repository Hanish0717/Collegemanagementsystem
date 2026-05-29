import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, BookOpen, Users, CheckCircle, HelpCircle } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { fetchFaculty, fetchSubjects, assignSectionsSubjects } from "@/services/adminService";
import { toast } from "sonner";

export function FacultyAssignments() {
  const queryClient = useQueryClient();
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [customSection, setCustomSection] = useState("");
  const [sections, setSections] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Queries
  const { data: facultyList = [], isLoading: isFacultyLoading } = useQuery({
    queryKey: ["faculty"],
    queryFn: fetchFaculty,
  });

  // Get currently selected faculty details
  const selectedFaculty = useMemo(() => {
    return facultyList.find((f) => f._id === selectedFacultyId);
  }, [facultyList, selectedFacultyId]);

  // Fetch subjects for selected faculty's department
  const { data: subjects = [], isLoading: isSubjectsLoading } = useQuery({
    queryKey: ["subjects", selectedFaculty?.department?._id],
    queryFn: () => fetchSubjects(selectedFaculty?.department?._id),
    enabled: !!selectedFaculty?.department?._id,
  });

  // Mutation
  const assignMutation = useMutation({
    mutationFn: assignSectionsSubjects,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
      toast.success("Faculty assignments updated & students auto-linked!");
      // Reset assignment UI state
      setCustomSection("");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update assignments");
    },
  });

  // Set initial state when faculty changes
  const handleFacultyChange = (id: string) => {
    setSelectedFacultyId(id);
    const fac = facultyList.find((f) => f._id === id);
    if (fac) {
      setSections(fac.assignedSections || []);
      setSelectedSubjects(fac.assignedSubjects?.map((s) => s._id) || []);
    } else {
      setSections([]);
      setSelectedSubjects([]);
    }
  };

  const handleAddSection = () => {
    const trimmed = customSection.trim().toUpperCase();
    if (!trimmed) return;
    if (sections.includes(trimmed)) {
      toast.warning("Section is already added");
      return;
    }
    setSections([...sections, trimmed]);
    setCustomSection("");
  };

  const handleRemoveSection = (section: string) => {
    setSections(sections.filter((s) => s !== section));
  };

  const handleToggleSubject = (subjectId: string) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter((id) => id !== subjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
  };

  const handleSaveAssignments = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacultyId) {
      toast.error("Please select a faculty member first");
      return;
    }
    if (sections.length === 0) {
      toast.error("Please assign at least one section");
      return;
    }
    if (selectedSubjects.length === 0) {
      toast.error("Please assign at least one subject");
      return;
    }

    assignMutation.mutate({
      facultyId: selectedFacultyId,
      assignedSections: sections,
      assignedSubjects: selectedSubjects,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Assignments"
        desc="Assign teaching sections and academic subjects to faculty members. Unassigned students in matching sections are auto-linked."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Step 1: Select Faculty */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="h-full">
            <h3 className="font-semibold mb-4 text-gradient flex items-center gap-2">
              <Users className="size-4 text-primary" />
              1. Select Faculty
            </h3>
            {isFacultyLoading ? (
              <div className="flex items-center gap-2 py-6">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Loading faculty...</span>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-[450px] pr-1">
                {facultyList.map((fac) => (
                  <button
                    key={fac._id}
                    onClick={() => handleFacultyChange(fac._id)}
                    className={`w-full text-left p-3 rounded-xl border transition text-xs flex flex-col gap-1.5 cursor-pointer ${
                      selectedFacultyId === fac._id
                        ? "border-primary bg-primary/5 text-foreground"
                        : "hover:bg-accent/40 bg-card"
                    }`}
                  >
                    <div className="font-bold">{fac.fullName}</div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground w-full">
                      <span>{fac.employeeId}</span>
                      <Badge tone="info" className="scale-90 origin-right">
                        {fac.department?.code || "No Dept"}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Step 2 & 3: Configure Assignments */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            {!selectedFaculty ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground gap-3">
                <HelpCircle className="size-12 text-muted-foreground/45" />
                <div>
                  <p className="font-medium">No Faculty Selected</p>
                  <p className="text-xs max-w-xs mt-1">
                    Select a faculty member from the left panel to configure their subject and
                    section assignments.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveAssignments} className="space-y-6">
                {/* Faculty Info Header */}
                <div className="p-4 border rounded-2xl bg-gradient-soft flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">
                      {selectedFaculty.fullName}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {selectedFaculty.designation} • Dept: {selectedFaculty.department?.name}
                    </p>
                  </div>
                  <Badge tone={selectedFaculty.status === "active" ? "success" : "warn"}>
                    {selectedFaculty.status}
                  </Badge>
                </div>

                {/* Sections Config */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-xs text-muted-foreground flex items-center gap-1.5">
                    2. Teaching Sections
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. CSE-A"
                      value={customSection}
                      onChange={(e) => setCustomSection(e.target.value)}
                      className="rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:border-primary transition uppercase flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="px-3 py-2 rounded-xl bg-accent text-foreground hover:bg-accent/80 transition text-xs font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="size-3" /> Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 border rounded-xl bg-background/50">
                    {sections.length === 0 ? (
                      <span className="text-[10px] text-muted-foreground self-center pl-1">
                        No sections assigned. Enter one above (e.g. CSE-A) and click Add.
                      </span>
                    ) : (
                      sections.map((sec) => (
                        <div
                          key={sec}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium"
                        >
                          {sec}
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(sec)}
                            className="text-primary hover:text-rose-600 transition cursor-pointer font-bold text-[10px] pl-1"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Subjects Config */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-xs text-muted-foreground flex items-center gap-1.5">
                    3. Subjects Specialize
                  </h4>
                  {isSubjectsLoading ? (
                    <div className="flex items-center gap-2 py-4">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Loading subjects...</span>
                    </div>
                  ) : subjects.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 pl-1">
                      No subjects found for this faculty's department in the database.
                    </p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {subjects.map((sub) => {
                        const isChecked = selectedSubjects.includes(sub._id);
                        return (
                          <button
                            type="button"
                            key={sub._id}
                            onClick={() => handleToggleSubject(sub._id)}
                            className={`flex items-center justify-between p-3 rounded-xl border text-xs text-left cursor-pointer transition ${
                              isChecked
                                ? "border-primary bg-primary/5 font-semibold"
                                : "hover:bg-accent/40"
                            }`}
                          >
                            <div>
                              <div>{sub.name}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {sub.code}
                              </div>
                            </div>
                            {isChecked && <CheckCircle className="size-4 text-primary shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={assignMutation.isPending}
                  className="w-full px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold glow-primary hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {assignMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Save & Link Assignments"
                  )}
                </button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

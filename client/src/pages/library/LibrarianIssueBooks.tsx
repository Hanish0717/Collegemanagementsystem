import { useState, useEffect } from "react";
import { Calendar, CheckCircle2, Loader2 } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import {
  fetchBooks,
  issueBook,
  fetchIssuedBooks,
  deleteIssueRecord,
  type BookItem,
  type IssuedBookItem,
} from "@/services/libraryService";
import api from "@/lib/api";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface StudentListItem {
  _id: string;
  fullName: string;
  rollNumber: string;
  department: string;
  section?: string;
}

export function LibrarianIssueBooks() {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [books, setBooks] = useState<BookItem[]>([]);
  const [issuedHistory, setIssuedHistory] = useState<IssuedBookItem[]>([]);
  const [returnedHistory, setReturnedHistory] = useState<IssuedBookItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(() => {
    const fourteenDaysLater = new Date();
    fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14);
    return fourteenDaysLater.toISOString().split("T")[0];
  });
  const [submitting, setSubmitting] = useState(false);

  const sections = Array.from(new Set(students.map((student) => student.section).filter(Boolean))) as string[];
  const tags = Array.from(new Set(books.map((book) => book.category).filter(Boolean))) as string[];

  const selectedStudentData = students.find((student) => student._id === selectedStudent);
  const selectedBookData = books.find((book) => book._id === selectedBook);

  const loadData = async () => {
    setLoading(true);
    try {
      const [booksData, historyData, studentsRes] = await Promise.all([
        fetchBooks({ limit: 1000 }),
        fetchIssuedBooks(),
        api.get<{ success: boolean; data: { students: StudentListItem[] } }>("/api/students", {
          params: { limit: 1000 },
        }),
      ]);
      setBooks(booksData);
      setIssuedHistory(historyData.filter((issue) => issue.status === "issued" || issue.status === "overdue"));
      setReturnedHistory(historyData.filter((issue) => issue.status === "returned"));
      setStudents(studentsRes.data.data.students);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data from live database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedBook || !dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await issueBook({
        studentId: selectedStudent,
        bookId: selectedBook,
        dueDate,
      });
      toast.success("Book successfully issued and recorded in database!");
      setSelectedStudent("");
      setSelectedBook("");
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to issue book";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setSelectedStudent("");
    setSelectedBook("");
    setIssueDate(new Date().toISOString().split("T")[0]);
    const fourteenDaysLater = new Date();
    fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14);
    setDueDate(fourteenDaysLater.toISOString().split("T")[0]);
    toast.info("Issue form reset.");
  };

  const handleDeleteReturnedRecord = async (issueId: string) => {
    if (!confirm("Delete this returned record from history?")) return;
    try {
      await deleteIssueRecord(issueId);
      toast.success("Returned record deleted.");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete record");
    }
  };

  const availableBooks = books.filter((b) => b.availableCopies > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issue Book 📖"
        desc="Allocate books to students and track issue dates (Live Database Connected)."
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Synchronizing database assets...</p>
        </div>
      ) : (
        <>
          {/* Issue Form */}
          <Card>
            <h3 className="font-semibold mb-4 text-gradient">New Book Issue</h3>
            <form onSubmit={handleIssueBook} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Select Student *
                  </label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    required
                    className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  >
                    <option value="">Choose student...</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.fullName} ({s.rollNumber}){s.section ? ` - Section ${s.section}` : ""}
                      </option>
                    ))}
                  </select>
                  {selectedStudentData && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2.5 py-1 rounded-full border bg-gradient-soft text-muted-foreground">
                        Section: {selectedStudentData.section || "N/A"}
                      </span>
                      <span className="px-2.5 py-1 rounded-full border bg-gradient-soft text-muted-foreground">
                        Dept: {selectedStudentData.department}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Select Book *
                  </label>
                  <select
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    required
                    className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  >
                    <option value="">Choose book...</option>
                    {availableBooks.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.title} (ISBN: {b.isbn}){b.category ? ` - ${b.category}` : ""}
                      </option>
                    ))}
                  </select>
                  {selectedBookData && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2.5 py-1 rounded-full border bg-gradient-soft text-muted-foreground">
                        Category: {selectedBookData.category}
                      </span>
                      <span className="px-2.5 py-1 rounded-full border bg-gradient-soft text-muted-foreground">
                        Available: {selectedBookData.availableCopies}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-gradient-soft">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">All Sections</div>
                  <div className="flex flex-wrap gap-2">
                    {sections.length === 0 ? (
                      <span className="text-xs text-muted-foreground">No section data loaded</span>
                    ) : (
                      sections.map((section) => (
                        <span key={section} className="px-2.5 py-1 rounded-full bg-background border text-xs">
                          {section}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-gradient-soft">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Book Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {tags.length === 0 ? (
                      <span className="text-xs text-muted-foreground">No book tags loaded</span>
                    ) : (
                      tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-full bg-background border text-xs">
                          {tag}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Issue Date</label>
                  <div className="relative mt-2">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={issueDate}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm opacity-75 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Due Date *</label>
                  <div className="relative mt-2">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-primary text-white font-medium glow-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  Issue Book
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-3 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </form>
          </Card>

          {/* Recently Issued & Summary */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <h3 className="font-semibold mb-4">Recently Issued Books</h3>
              {issuedHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No active book loans currently.
                </p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {issuedHistory.slice(0, 10).map((issue) => {
                    const studentName =
                      typeof issue.student === "object" ? issue.student?.fullName : "Student";
                    const roll = typeof issue.student === "object" ? issue.student?.rollNumber : "";
                    const title = typeof issue.book === "object" ? issue.book?.title : "Book";
                    return (
                      <div key={issue._id} className="p-3 rounded-xl border bg-gradient-soft">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="font-medium text-sm">{title}</div>
                            <div className="text-xs text-muted-foreground">
                              {studentName} ({roll})
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge tone={issue.status === "returned" ? "success" : "danger"}>
                              {issue.status}
                            </Badge>
                            <button
                              type="button"
                              onClick={() => handleDeleteReturnedRecord(issue._id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition text-[11px] font-medium cursor-pointer"
                              title="Delete this issued record"
                            >
                              <Trash2 className="size-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] mb-2">
                          <span className="px-2 py-1 rounded-full border bg-background text-muted-foreground">
                            Books taken: 1
                          </span>
                          <span className="px-2 py-1 rounded-full border bg-background text-muted-foreground">
                            Deadline: {new Date(issue.dueDate).toLocaleDateString()}
                          </span>
                          <span className="px-2 py-1 rounded-full border bg-background text-muted-foreground">
                            Section: {typeof issue.student === "object" ? issue.student?.section || "N/A" : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Issued: {new Date(issue.issueDate).toLocaleDateString()}</span>
                          <span>Due: {new Date(issue.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card>
              <h3 className="font-semibold mb-4">Issue Summary</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-soft border">
                  <div className="text-xs text-muted-foreground mb-1">Total Active Loans</div>
                  <div className="text-3xl font-bold">
                    {
                      issuedHistory.filter((i) => i.status === "issued" || i.status === "overdue")
                        .length
                    }
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Books currently in circulation
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-soft border">
                  <div className="text-xs text-muted-foreground mb-1">Overdue Books</div>
                  <div className="text-3xl font-bold text-rose-600">
                    {issuedHistory.filter((i) => i.status === "overdue").length}
                  </div>
                  <div className="text-xs text-rose-600 mt-1">⚠ Require follow-up</div>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="font-semibold mb-4">Returned Records</h3>
            {returnedHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No returned records yet.
              </p>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {returnedHistory.map((issue) => {
                  const studentName =
                    typeof issue.student === "object" ? issue.student?.fullName : "Student";
                  const roll = typeof issue.student === "object" ? issue.student?.rollNumber : "";
                  const title = typeof issue.book === "object" ? issue.book?.title : "Book";

                  return (
                    <div key={issue._id} className="p-3 rounded-xl border bg-gradient-soft">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="font-medium text-sm">{title}</div>
                          <div className="text-xs text-muted-foreground">
                            {studentName} ({roll})
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteReturnedRecord(issue._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition text-xs font-medium cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                          Delete Record
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        <span className="px-2 py-1 rounded-full border bg-background text-muted-foreground">
                          Returned: {issue.returnDate ? new Date(issue.returnDate).toLocaleDateString() : "N/A"}
                        </span>
                        <span className="px-2 py-1 rounded-full border bg-background text-muted-foreground">
                          Deadline: {new Date(issue.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Issue Guidelines */}
          <Card>
            <h3 className="font-semibold mb-4">Issue Guidelines</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-soft border">
                <div className="text-sm font-medium mb-2">📅 Standard Duration</div>
                <div className="text-xs text-muted-foreground">
                  14 days from issue date. Can be extended by 7 more days.
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-soft border">
                <div className="text-sm font-medium mb-2">💰 Fine Rate</div>
                <div className="text-xs text-muted-foreground">
                  ₹5 per day for overdue books. Maximum ₹500 per book.
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-soft border">
                <div className="text-sm font-medium mb-2">📚 Limit</div>
                <div className="text-xs text-muted-foreground">
                  Max 5 books per student at a time. No more if fines pending.
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

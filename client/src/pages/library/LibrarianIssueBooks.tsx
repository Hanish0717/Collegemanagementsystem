import { useState, useEffect } from "react";
import { Calendar, CheckCircle2, Loader2, Search, X, BookOpen, UserCheck, ShieldCheck } from "lucide-react";
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
  admissionNumber?: string;
  department: string;
  section?: string;
  email?: string;
}

export function LibrarianIssueBooks() {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [books, setBooks] = useState<BookItem[]>([]);
  const [issuedHistory, setIssuedHistory] = useState<IssuedBookItem[]>([]);
  const [returnedHistory, setReturnedHistory] = useState<IssuedBookItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search Inputs (No default dropdown lists shown when empty)
  const [studentSearch, setStudentSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");

  // Selection state
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(() => {
    const fourteenDaysLater = new Date();
    fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14);
    return fourteenDaysLater.toISOString().split("T")[0];
  });
  const [submitting, setSubmitting] = useState(false);

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
      setStudents(studentsRes.data.data.students || []);
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
      toast.error("Please search and select a valid student and available book");
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
      setStudentSearch("");
      setBookSearch("");
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
    setStudentSearch("");
    setBookSearch("");
    setIssueDate(new Date().toISOString().split("T")[0]);
    const fourteenDaysLater = new Date();
    fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14);
    setDueDate(fourteenDaysLater.toISOString().split("T")[0]);
    toast.info("Form cleared.");
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

  // Student Search Filtering (Only when user types search string)
  const matchingStudents = studentSearch.trim()
    ? students.filter((s) => {
        const q = studentSearch.trim().toLowerCase();
        return (
          s.fullName.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q) ||
          (s.admissionNumber && s.admissionNumber.toLowerCase().includes(q)) ||
          s.department.toLowerCase().includes(q)
        );
      })
    : [];

  // Book Search Filtering (Only when user types search string)
  const availableBooks = books.filter((b) => b.availableCopies > 0);
  const matchingBooks = bookSearch.trim()
    ? availableBooks.filter((b) => {
        const q = bookSearch.trim().toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          (b.author && b.author.toLowerCase().includes(q)) ||
          (b.isbn && b.isbn.toLowerCase().includes(q)) ||
          (b.category && b.category.toLowerCase().includes(q))
        );
      })
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Issue Book 📖"
        desc="Search student & book records directly without dropdown lists (Live Database Connected)."
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
            <form onSubmit={handleIssueBook} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                {/* 1. Student Search Field */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Search Student *
                  </label>

                  {!selectedStudent ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Type student name, Roll No, ID (e.g. CS100001, Student Demo)..."
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none transition"
                        />
                      </div>

                      {/* Prompt when empty */}
                      {!studentSearch.trim() && (
                        <p className="text-[11px] text-muted-foreground italic px-1">
                          🔍 Enter student name or ID above to display matching student records.
                        </p>
                      )}

                      {/* Matching Student Results */}
                      {studentSearch.trim() !== "" && (
                        <div className="border rounded-xl bg-background max-h-52 overflow-y-auto divide-y shadow-sm">
                          {matchingStudents.length === 0 ? (
                            <div className="p-3 text-xs text-muted-foreground text-center">
                              No student records match "{studentSearch}"
                            </div>
                          ) : (
                            matchingStudents.map((s) => (
                              <button
                                type="button"
                                key={s._id}
                                onClick={() => {
                                  setSelectedStudent(s._id);
                                  setStudentSearch("");
                                }}
                                className="w-full text-left p-3 hover:bg-gradient-soft transition flex items-center justify-between group cursor-pointer"
                              >
                                <div>
                                  <div className="font-semibold text-sm text-foreground group-hover:text-primary transition">
                                    {s.fullName}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Roll: <span className="font-mono text-foreground font-medium">{s.rollNumber}</span> • Dept: {s.department} {s.section ? `(${s.section})` : ""}
                                  </div>
                                </div>
                                <Badge tone="info">Select</Badge>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Selected Student Summary Card */
                    <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-blue-600 text-white grid place-items-center font-bold text-sm">
                          <UserCheck className="size-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground">{selectedStudentData?.fullName}</div>
                          <div className="text-xs text-muted-foreground">
                            Roll: <span className="font-mono font-medium text-foreground">{selectedStudentData?.rollNumber}</span> • Dept: {selectedStudentData?.department}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedStudent("")}
                        className="px-2.5 py-1 rounded-lg border bg-background text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer flex items-center gap-1"
                      >
                        <X className="size-3" /> Change
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Book Search Field */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Search Book *
                  </label>

                  {!selectedBook ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Type book title, author or ISBN..."
                          value={bookSearch}
                          onChange={(e) => setBookSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none transition"
                        />
                      </div>

                      {/* Prompt when empty */}
                      {!bookSearch.trim() && (
                        <p className="text-[11px] text-muted-foreground italic px-1">
                          🔍 Enter book title or ISBN above to display matching available books.
                        </p>
                      )}

                      {/* Matching Book Results */}
                      {bookSearch.trim() !== "" && (
                        <div className="border rounded-xl bg-background max-h-52 overflow-y-auto divide-y shadow-sm">
                          {matchingBooks.length === 0 ? (
                            <div className="p-3 text-xs text-muted-foreground text-center">
                              No available books match "{bookSearch}"
                            </div>
                          ) : (
                            matchingBooks.map((b) => (
                              <button
                                type="button"
                                key={b._id}
                                onClick={() => {
                                  setSelectedBook(b._id);
                                  setBookSearch("");
                                }}
                                className="w-full text-left p-3 hover:bg-gradient-soft transition flex items-center justify-between group cursor-pointer"
                              >
                                <div>
                                  <div className="font-semibold text-sm text-foreground group-hover:text-primary transition">
                                    {b.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Author: {b.author || "N/A"} • ISBN: <span className="font-mono text-foreground font-medium">{b.isbn}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge tone="success">{b.availableCopies} available</Badge>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Selected Book Summary Card */
                    <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-purple-600 text-white grid place-items-center font-bold text-sm">
                          <BookOpen className="size-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground">{selectedBookData?.title}</div>
                          <div className="text-xs text-muted-foreground">
                            Author: {selectedBookData?.author} • ISBN: <span className="font-mono font-medium text-foreground">{selectedBookData?.isbn}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedBook("")}
                        className="px-2.5 py-1 rounded-lg border bg-background text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer flex items-center gap-1"
                      >
                        <X className="size-3" /> Change
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates Row */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
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

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={submitting || !selectedStudent || !selectedBook}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-primary text-white font-medium glow-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                      <div
                        key={issue._id}
                        className="p-3 rounded-xl border bg-background flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm truncate">{title}</div>
                          <div className="text-xs text-muted-foreground">
                            Issued to: <span className="text-foreground font-medium">{studentName}</span> {roll ? `(${roll})` : ""}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            Due: {new Date(issue.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge tone={issue.status === "overdue" ? "warn" : "info"}>
                          {issue.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="flex flex-col justify-between">
              <div>
                <h3 className="font-semibold mb-4">Issue Summary</h3>
                <div className="p-4 rounded-xl bg-gradient-soft border text-center">
                  <div className="text-xs text-muted-foreground">Total Active Loans</div>
                  <div className="text-3xl font-bold text-primary mt-1">
                    {issuedHistory.length}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Books currently in circulation
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-center pt-4">
                Note: Standard loan period is 14 days. Fines accrue at ₹10/day for overdue returns.
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

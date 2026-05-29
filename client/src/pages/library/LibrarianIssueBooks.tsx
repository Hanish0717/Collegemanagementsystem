import { useState, useEffect } from "react";
import { Calendar, CheckCircle2, Loader2 } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import {
  fetchBooks,
  issueBook,
  fetchIssuedBooks,
  type BookItem,
  type IssuedBookItem,
} from "@/services/libraryService";
import api from "@/lib/api";
import { toast } from "sonner";

interface StudentListItem {
  _id: string;
  fullName: string;
  rollNumber: string;
  department: string;
}

export function LibrarianIssueBooks() {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [books, setBooks] = useState<BookItem[]>([]);
  const [issuedHistory, setIssuedHistory] = useState<IssuedBookItem[]>([]);
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

  const loadData = async () => {
    setLoading(true);
    try {
      const [booksData, historyData, studentsRes] = await Promise.all([
        fetchBooks(),
        fetchIssuedBooks(),
        api.get<{ success: boolean; data: { students: StudentListItem[] } }>("/api/students"),
      ]);
      setBooks(booksData);
      setIssuedHistory(historyData);
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
                        {s.fullName} ({s.rollNumber})
                      </option>
                    ))}
                  </select>
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
                        {b.title} (ISBN: {b.isbn})
                      </option>
                    ))}
                  </select>
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
                          <Badge tone={issue.status === "returned" ? "success" : "danger"}>
                            {issue.status}
                          </Badge>
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

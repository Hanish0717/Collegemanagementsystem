import { useState } from "react";
import { Calendar, CheckCircle2 } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { students, bookInventory, issuedBooksHistory } from "@/mock/mockData";
import { toast } from "sonner";

export function LibrarianIssueBooks() {
  const [localBooks, setLocalBooks] = useState(bookInventory);
  const [issuesList, setIssuesList] = useState(issuedBooksHistory);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const availableBooks = localBooks.filter((b) => b.available > 0);

  const handleClear = () => {
    setSelectedStudent("");
    setSelectedBook("");
    setIssueDate("");
    setReturnDate("");
    toast.info("Issue form reset.");
  };

  const handleIssueBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedBook || !issueDate || !returnDate) {
      toast.error("Please fill in all the required form fields.");
      return;
    }

    const studentObj = students.find((s) => s.id === selectedStudent);
    const bookObj = localBooks.find((b) => b.id === selectedBook);

    if (!studentObj || !bookObj) {
      toast.error("Invalid student or book selection.");
      return;
    }

    if (bookObj.available <= 0) {
      toast.error("Selected book is currently out of stock.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Decrement availability
      setLocalBooks(
        localBooks.map((b) => {
          if (b.id === selectedBook) {
            return {
              ...b,
              issued: b.issued + 1,
              available: b.available - 1,
            };
          }
          return b;
        }),
      );

      // Create new issue record
      const newIssue = {
        id: `ISS-2026-${String(issuesList.length + 1).padStart(3, "0")}`,
        studentId: selectedStudent,
        studentName: studentObj.name,
        bookId: selectedBook,
        bookTitle: bookObj.title,
        issueDate: issueDate,
        dueDate: returnDate,
        status: "Active",
      };

      setIssuesList([newIssue, ...issuesList]);
      setIsLoading(false);
      toast.success(`"${bookObj.title}" successfully allocated to ${studentObj.name}!`);

      // Reset
      setSelectedStudent("");
      setSelectedBook("");
      setIssueDate("");
      setReturnDate("");
    }, 600);
  };

  // Calculations for stats
  const activeLoans = issuesList.filter((i) => i.status === "Active").length;
  const overdueLoans = issuesList.filter((i) => i.status === "Overdue").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Issue Book" desc="Allocate books to students and track issue dates." />

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
                className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
              >
                <option value="">Choose student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Select Book *</label>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
              >
                <option value="">Choose book...</option>
                {availableBooks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.available} copies available)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Issue Date *</label>
              <div className="relative mt-2">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Return Due Date (14 days default) *
              </label>
              <div className="relative mt-2">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button
              type="submit"
              disabled={isLoading || !selectedStudent || !selectedBook || !issueDate || !returnDate}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-primary text-white font-medium glow-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? (
                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              {isLoading ? "Processing..." : "Issue Book"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-6 py-3 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition cursor-pointer"
            >
              Clear
            </button>
          </div>
        </form>
      </Card>

      {/* Recently Issued */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4 text-gradient">Recently Issued Books</h3>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {issuesList.map((issue) => (
              <div
                key={issue.id}
                className="p-3 rounded-xl border bg-gradient-soft flex flex-col justify-between gap-1"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-sm line-clamp-1">{issue.bookTitle}</div>
                    <div className="text-xs text-muted-foreground">
                      {issue.studentName} ({issue.studentId})
                    </div>
                  </div>
                  <Badge tone={issue.status === "Active" ? "success" : "danger"}>
                    {issue.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2 mt-1">
                  <span>Issued: {issue.issueDate}</span>
                  <span>Due: {issue.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4 text-gradient">Issue Summary</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-xs text-muted-foreground mb-1">Total Issues Logs</div>
              <div className="text-3xl font-bold">{issuesList.length}</div>
              <div className="text-xs text-emerald-600 mt-1">+12.5% vs last month</div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-xs text-muted-foreground mb-1">Active Loans</div>
              <div className="text-3xl font-bold">{activeLoans}</div>
              <div className="text-xs text-muted-foreground mt-1">Books currently outstanding</div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-xs text-muted-foreground mb-1">Overdue Loans</div>
              <div
                className={`text-3xl font-bold ${overdueLoans > 0 ? "text-rose-600 animate-pulse" : "text-muted-foreground"}`}
              >
                {overdueLoans}
              </div>
              <div className="text-xs text-rose-600 mt-1">⚠️ Require follow-up notices</div>
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
    </div>
  );
}

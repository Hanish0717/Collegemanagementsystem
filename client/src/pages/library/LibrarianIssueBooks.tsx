import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, CheckCircle2 } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { students, bookInventory, issuedBooksHistory } from "@/mock/mockData";



export function LibrarianIssueBooks() {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const availableBooks = bookInventory.filter(b => b.available > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issue Book"
        desc="Allocate books to students and track issue dates."
      />

      {/* Issue Form */}
      <Card>
        <h3 className="font-semibold mb-4">New Book Issue</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm"
            >
              <option value="">Choose student...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Select Book</label>
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm"
            >
              <option value="">Choose book...</option>
              {availableBooks.map(b => (
                <option key={b.id} value={b.id}>{b.title} ({b.available} available)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Issue Date</label>
            <div className="relative mt-2">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Return Due Date (14 days default)</label>
            <div className="relative mt-2">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button className="flex-1 px-4 py-3 rounded-xl bg-gradient-primary text-white font-medium glow-primary flex items-center justify-center gap-2">
            <CheckCircle2 className="size-4" /> Issue Book
          </button>
          <button className="px-4 py-3 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition">
            Clear
          </button>
        </div>
      </Card>

      {/* Recently Issued */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Recently Issued Books</h3>
          <div className="space-y-3">
            {issuedBooksHistory.map(issue => (
              <div key={issue.id} className="p-3 rounded-xl border bg-gradient-soft">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="font-medium text-sm">{issue.bookTitle}</div>
                    <div className="text-xs text-muted-foreground">{issue.studentName}</div>
                  </div>
                  <Badge tone={issue.status === "Active" ? "success" : "danger"}>{issue.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{issue.issueDate}</span>
                  <span>Due: {issue.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Issue Summary</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-xs text-muted-foreground mb-1">Total Issues This Month</div>
              <div className="text-3xl font-bold">342</div>
              <div className="text-xs text-emerald-600 mt-1">+12.5% vs last month</div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-xs text-muted-foreground mb-1">Active Loans</div>
              <div className="text-3xl font-bold">156</div>
              <div className="text-xs text-muted-foreground mt-1">Books currently issued</div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-xs text-muted-foreground mb-1">Overdue Books</div>
              <div className="text-3xl font-bold text-rose-600">8</div>
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
            <div className="text-xs text-muted-foreground">14 days from issue date. Can be extended by 7 more days.</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-soft border">
            <div className="text-sm font-medium mb-2">💰 Fine Rate</div>
            <div className="text-xs text-muted-foreground">₹5 per day for overdue books. Maximum ₹500 per book.</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-soft border">
            <div className="text-sm font-medium mb-2">📚 Limit</div>
            <div className="text-xs text-muted-foreground">Max 5 books per student at a time. No more if fines pending.</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

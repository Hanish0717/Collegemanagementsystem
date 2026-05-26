import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, CheckCircle2, DollarSign } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { issuedBooksHistory } from "@/mock/mockData";



export function LibrarianReturn() {
  const [selectedIssue, setSelectedIssue] = useState("");
  const [returnCondition, setReturnCondition] = useState("good");
  const [damage, setDamage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const overdueBooks = issuedBooksHistory.filter(b => b.status === "Overdue");
  const selectedBook = issuedBooksHistory.find(b => b.id === selectedIssue);

  const calculateFine = () => {
    if (!selectedBook) return 0;
    if (selectedBook.status !== "Overdue") return 0;

    const dueDate = new Date(selectedBook.dueDate);
    const today = new Date();
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    let fine = daysOverdue * 5;
    if (damage === "damaged") fine += 500;
    if (damage === "lost") fine = 2000;

    return Math.min(fine, 2500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Return Book"
        desc="Process book returns and manage fines."
      />

      {/* Return Form */}
      <Card>
        <h3 className="font-semibold mb-4">Process Return</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Select Book to Return</label>
            <select
              value={selectedIssue}
              onChange={(e) => setSelectedIssue(e.target.value)}
              className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm"
            >
              <option value="">Choose book...</option>
              {issuedBooksHistory.map(b => (
                <option key={b.id} value={b.id}>
                  {b.bookTitle} - {b.studentName} {b.status === "Overdue" ? "⚠️ Overdue" : ""}
                </option>
              ))}
            </select>
          </div>

          {selectedBook && (
            <div className="p-4 rounded-xl bg-gradient-soft border">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Book</div>
                  <div className="font-semibold">{selectedBook.bookTitle}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Student</div>
                  <div className="font-semibold">{selectedBook.studentName}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Issue Date</div>
                  <div className="font-medium text-sm">{selectedBook.issueDate}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Due Date</div>
                  <div className="font-medium text-sm">{selectedBook.dueDate}</div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground">Book Condition</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { value: "good", label: "Good", icon: "✅" },
                { value: "damaged", label: "Damaged", icon: "⚠️" },
                { value: "lost", label: "Lost", icon: "❌" },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDamage(opt.value)}
                  className={`p-3 rounded-xl border font-medium text-sm transition ${
                    damage === opt.value
                      ? "bg-gradient-primary text-white border-primary"
                      : "bg-background hover:border-primary"
                  }`}
                >
                  <div>{opt.icon}</div>
                  <div className="text-xs mt-1">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Additional notes (optional)..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowConfirm(true)}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-primary text-white font-medium glow-primary flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="size-4" /> Confirm Return
          </button>
          <button className="px-4 py-3 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition">
            Cancel
          </button>
        </div>
      </Card>

      {/* Fine Calculation */}
      {selectedBook && calculateFine() > 0 && (
        <Card className="border-l-4 border-l-rose-500">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-rose-100 text-rose-600 grid place-items-center">
              <DollarSign className="size-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Fine Amount Due</h3>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-xs text-muted-foreground">Overdue Days</div>
                  <div className="text-xl font-bold">
                    {Math.floor((new Date().getTime() - new Date(selectedBook.dueDate).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Daily Rate</div>
                  <div className="text-xl font-bold">₹5</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Total Fine</div>
                  <div className="text-2xl font-bold text-rose-600">₹{calculateFine()}</div>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-gradient-primary text-white text-sm font-medium glow-primary">
                Collect Fine & Process Return
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Overdue Books Alert */}
      {overdueBooks.length > 0 && (
        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="size-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold">Overdue Books Alert</h3>
              <p className="text-xs text-muted-foreground mt-1">{overdueBooks.length} books overdue</p>
            </div>
          </div>
          <div className="space-y-2">
            {overdueBooks.map(book => (
              <div key={book.id} className="flex items-center justify-between p-2 rounded-lg bg-gradient-soft border">
                <div className="flex-1">
                  <div className="text-sm font-medium">{book.bookTitle}</div>
                  <div className="text-xs text-muted-foreground">{book.studentName}</div>
                </div>
                <Badge tone="danger">Overdue</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Return Confirmation Modal */}
      {showConfirm && selectedBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <h3 className="font-semibold text-lg mb-4">Confirm Return</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Book:</span>
                <span className="font-medium">{selectedBook.bookTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student:</span>
                <span className="font-medium">{selectedBook.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Condition:</span>
                <span className="font-medium">{damage === "good" ? "Good" : damage === "damaged" ? "Damaged" : "Lost"}</span>
              </div>
              {calculateFine() > 0 && (
                <div className="flex justify-between border-t pt-3">
                  <span className="text-muted-foreground">Fine Collected:</span>
                  <span className="font-bold text-rose-600">₹{calculateFine()}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary">
                Confirm Return
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

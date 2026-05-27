import { useState } from "react";
import { AlertCircle, CheckCircle2, DollarSign } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { issuedBooksHistory, bookInventory } from "@/mock/mockData";
import { toast } from "sonner";

export function LibrarianReturn() {
  const [issues, setIssues] = useState(issuedBooksHistory);
  const [selectedIssue, setSelectedIssue] = useState("");
  const [damageCondition, setDamageCondition] = useState("good");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const selectedBook = issues.find((b) => b.id === selectedIssue);
  const overdueBooks = issues.filter((b) => b.status === "Overdue");

  const calculateFine = () => {
    if (!selectedBook) return 0;

    let fine = 0;
    if (selectedBook.status === "Overdue") {
      const dueDate = new Date(selectedBook.dueDate);
      const today = new Date();
      const diffTime = today.getTime() - dueDate.getTime();
      const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
      fine = daysOverdue * 5;
    }

    if (damageCondition === "damaged") fine += 500;
    if (damageCondition === "lost") fine = 2000;

    return Math.min(fine, 2500); // capped at 2500
  };

  const handleCancel = () => {
    setSelectedIssue("");
    setDamageCondition("good");
    setAdditionalNotes("");
    setShowConfirm(false);
    toast.info("Return processing cancelled.");
  };

  const handleConfirmReturnSubmit = () => {
    if (!selectedBook) return;

    const fineAmount = calculateFine();

    // Mark as returned in dynamic state
    setIssues(
      issues.map((i) => {
        if (i.id === selectedIssue) {
          return {
            ...i,
            status: "Returned",
          };
        }
        return i;
      }),
    );

    toast.success(
      `Successfully processed return of "${selectedBook.bookTitle}"!${
        fineAmount > 0 ? ` Collected fine of ₹${fineAmount}.` : ""
      }`,
    );

    // Reset fields
    setSelectedIssue("");
    setDamageCondition("good");
    setAdditionalNotes("");
    setShowConfirm(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Return Book" desc="Process book returns and manage fines." />

      {/* Return Form */}
      <Card>
        <h3 className="font-semibold mb-4 text-gradient">Process Return</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Select Book/Record to Return *
            </label>
            <select
              value={selectedIssue}
              onChange={(e) => {
                setSelectedIssue(e.target.value);
                setDamageCondition("good");
              }}
              className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
            >
              <option value="">Choose issued record...</option>
              {issues
                .filter((b) => b.status !== "Returned")
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bookTitle} (Borrowed by {b.studentName}){" "}
                    {b.status === "Overdue" ? "⚠️ OVERDUE" : ""}
                  </option>
                ))}
            </select>
          </div>

          {selectedBook && (
            <div className="p-4 rounded-xl bg-gradient-soft border animate-in fade-in duration-200">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Book Name</div>
                  <div className="font-semibold">{selectedBook.bookTitle}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Borrower (Student)</div>
                  <div className="font-semibold">{selectedBook.studentName}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Issued Date</div>
                  <div className="font-medium text-sm">{selectedBook.issueDate}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Due Date</div>
                  <div className="font-medium text-sm flex items-center gap-1.5">
                    {selectedBook.dueDate}
                    {selectedBook.status === "Overdue" && (
                      <Badge tone="danger" className="text-[10px]">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedBook && (
            <div className="animate-in fade-in duration-200 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Returned Book Condition
                </label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { value: "good", label: "Good Condition", icon: "✅" },
                    { value: "damaged", label: "Damaged Book", icon: "⚠️" },
                    { value: "lost", label: "Lost Book", icon: "❌" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDamageCondition(opt.value)}
                      className={`p-3 rounded-xl border font-medium text-sm transition cursor-pointer flex flex-col items-center justify-center ${
                        damageCondition === opt.value
                          ? "bg-gradient-primary text-white border-primary glow-primary"
                          : "bg-background hover:border-primary text-foreground"
                      }`}
                    >
                      <div className="text-lg">{opt.icon}</div>
                      <div className="text-[11px] mt-1">{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Condition / Return Remarks (Optional)
                </label>
                <textarea
                  placeholder="e.g. Scuffed back cover page, slight page fold..."
                  rows={3}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t">
          <button
            onClick={() => {
              if (!selectedIssue) {
                toast.error("Please select a borrowing record first.");
                return;
              }
              setShowConfirm(true);
            }}
            disabled={!selectedIssue}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-primary text-white font-medium glow-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
          >
            <CheckCircle2 className="size-4" /> Confirm Return
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-3 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition cursor-pointer text-sm"
          >
            Cancel
          </button>
        </div>
      </Card>

      {/* Fine Calculation */}
      {selectedBook && calculateFine() > 0 && (
        <Card className="border-l-4 border-l-rose-500 animate-in slide-in-from-left duration-200">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-rose-100 text-rose-600 grid place-items-center shrink-0">
              <DollarSign className="size-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Overdue Penalty / Fine Calculation</h3>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-xs text-muted-foreground">Days Overdue</div>
                  <div className="text-xl font-bold">
                    {selectedBook.status === "Overdue"
                      ? Math.max(
                          0,
                          Math.floor(
                            (new Date().getTime() - new Date(selectedBook.dueDate).getTime()) /
                              (1000 * 60 * 60 * 24),
                          ),
                        )
                      : 0}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Late Rate / Condition penalty</div>
                  <div className="text-xl font-bold">
                    {damageCondition === "good"
                      ? "₹5/day"
                      : damageCondition === "damaged"
                        ? "₹5/day + ₹500"
                        : "₹2000"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Total Charge Due</div>
                  <div className="text-2xl font-bold text-rose-600">₹{calculateFine()}</div>
                </div>
              </div>
              <button
                onClick={() => setShowConfirm(true)}
                className="px-4 py-2 rounded-lg bg-gradient-primary text-white text-xs font-semibold glow-primary cursor-pointer hover:opacity-90 transition"
              >
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
            <AlertCircle className="size-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold">Pending Overdue Warnings</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {overdueBooks.length} books are currently overdue
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {overdueBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => setSelectedIssue(book.id)}
                className="flex items-center justify-between p-2 rounded-lg bg-gradient-soft border hover:border-amber-500 cursor-pointer transition"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">{book.bookTitle}</div>
                  <div className="text-xs text-muted-foreground">
                    Issued to {book.studentName} (Due: {book.dueDate})
                  </div>
                </div>
                <Badge tone="danger">Overdue</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Return Confirmation Modal */}
      {showConfirm && selectedBook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-semibold text-lg mb-4 text-gradient">Confirm Book Return</h3>
            <div className="space-y-3 mb-6 border-y py-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Book Name:</span>
                <span className="font-semibold truncate max-w-[240px]">
                  {selectedBook.bookTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Borrower Student:</span>
                <span className="font-medium">{selectedBook.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Return Condition:</span>
                <Badge
                  tone={
                    damageCondition === "good"
                      ? "success"
                      : damageCondition === "damaged"
                        ? "warn"
                        : "danger"
                  }
                >
                  {damageCondition === "good"
                    ? "Good"
                    : damageCondition === "damaged"
                      ? "Damaged"
                      : "Lost"}
                </Badge>
              </div>
              {additionalNotes.trim() && (
                <div className="flex flex-col gap-1 border-t pt-2 mt-2">
                  <span className="text-muted-foreground text-xs">Remarks/Notes:</span>
                  <p className="bg-gradient-soft p-2 rounded-lg text-xs italic">
                    {additionalNotes}
                  </p>
                </div>
              )}
              {calculateFine() > 0 && (
                <div className="flex justify-between border-t pt-3 mt-2">
                  <span className="text-muted-foreground font-semibold">
                    Fine Amount Collected:
                  </span>
                  <span className="font-bold text-rose-600 text-lg">₹{calculateFine()}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmReturnSubmit}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-90 transition"
              >
                Confirm Return
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

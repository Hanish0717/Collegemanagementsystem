import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, DollarSign, Loader2 } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { fetchIssuedBooks, returnBook, type IssuedBookItem } from "@/services/libraryService";
import { toast } from "sonner";

export function LibrarianReturn() {
  const [issuedBooks, setIssuedBooks] = useState<IssuedBookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState("");
  const [returnCondition, setReturnCondition] = useState("good");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadIssued = () => {
    setLoading(true);
    fetchIssuedBooks()
      .then((data) => {
        // Only show books that are not yet returned
        setIssuedBooks(data.filter((b) => b.status === "issued" || b.status === "overdue"));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load active book loans");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadIssued();
  }, []);

  const selectedBook = issuedBooks.find((b) => b._id === selectedIssue);

  const calculateFine = () => {
    if (!selectedBook) return 0;
    if (selectedBook.status !== "overdue") return 0;

    const dueDate = new Date(selectedBook.dueDate);
    const today = new Date();
    const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysOverdue <= 0) return 0;

    let fine = daysOverdue * 10; // Match backend rate ($10/day)
    if (returnCondition === "damaged") fine += 500;
    if (returnCondition === "lost") fine = 2000;

    return Math.min(fine, 2500);
  };

  const handleReturnConfirm = async () => {
    if (!selectedIssue) return;
    setSubmitting(true);
    try {
      await returnBook(selectedIssue);
      toast.success("Book returned successfully and database updated!");
      setShowConfirm(false);
      setSelectedIssue("");
      loadIssued();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to process return";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const overdueBooks = issuedBooks.filter((b) => b.status === "overdue");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Return Book ↩"
        desc="Process book returns and calculate fines automatically (Live Database Connected)."
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Fetching issued books from database...</p>
        </div>
      ) : (
        <>
          {/* Return Form */}
          <Card>
            <h3 className="font-semibold mb-4">Process Return</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Select Book to Return *</label>
                <select
                  value={selectedIssue}
                  onChange={(e) => setSelectedIssue(e.target.value)}
                  className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Choose book...</option>
                  {issuedBooks.map((b) => {
                    const studentName = typeof b.student === "object" ? b.student?.fullName : "Student";
                    const title = typeof b.book === "object" ? b.book?.title : "Book";
                    return (
                      <option key={b._id} value={b._id}>
                        {title} - Issued to {studentName} {b.status === "overdue" ? "⚠️ Overdue" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedBook && (
                <div className="p-4 rounded-xl bg-gradient-soft border">
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Book Title</div>
                      <div className="font-semibold">{typeof selectedBook.book === "object" ? selectedBook.book?.title : "Book"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Student Name</div>
                      <div className="font-semibold">{typeof selectedBook.student === "object" ? selectedBook.student?.fullName : "Student"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Issue Date</div>
                      <div className="font-medium">{new Date(selectedBook.issueDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Due Date</div>
                      <div className="font-medium">{new Date(selectedBook.dueDate).toLocaleDateString()}</div>
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
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setReturnCondition(opt.value)}
                      className={`p-3 rounded-xl border font-medium text-sm transition ${
                        returnCondition === opt.value
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
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  if (!selectedIssue) {
                    toast.error("Please select a book to return first.");
                    return;
                  }
                  setShowConfirm(true);
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-primary text-white font-medium glow-primary flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="size-4" /> Confirm Return
              </button>
              <button
                onClick={() => setSelectedIssue("")}
                className="px-4 py-3 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition"
              >
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
                <div className="flex-1 text-sm">
                  <h3 className="font-semibold mb-2 text-base">Fine Amount Due</h3>
                  <div className="grid sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Due Date</div>
                      <div className="text-sm font-semibold">{new Date(selectedBook.dueDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Overdue Penalty</div>
                      <div className="text-sm font-semibold">₹10 / day</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Total Fine</div>
                      <div className="text-2xl font-bold text-rose-600">₹{calculateFine()}</div>
                    </div>
                  </div>
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
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {overdueBooks.map((book) => {
                  const studentName = typeof book.student === "object" ? book.student?.fullName : "Student";
                  const title = typeof book.book === "object" ? book.book?.title : "Book";
                  return (
                    <div key={book._id} className="flex items-center justify-between p-2 rounded-lg bg-gradient-soft border">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{title}</div>
                        <div className="text-xs text-muted-foreground">Issued to: {studentName}</div>
                      </div>
                      <Badge tone="danger">Overdue</Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Return Confirmation Modal */}
          {showConfirm && selectedBook && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md relative">
                <h3 className="font-semibold text-lg mb-4">Confirm Return</h3>
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Book:</span>
                    <span className="font-medium">{typeof selectedBook.book === "object" ? selectedBook.book?.title : "Book"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Student:</span>
                    <span className="font-medium">{typeof selectedBook.student === "object" ? selectedBook.student?.fullName : "Student"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Condition:</span>
                    <span className="font-medium capitalize">{returnCondition}</span>
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
                  <button
                    onClick={handleReturnConfirm}
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary flex items-center justify-center gap-1.5"
                  >
                    {submitting && <Loader2 className="size-4 animate-spin" />}
                    Confirm Return
                  </button>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

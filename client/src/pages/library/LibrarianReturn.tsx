import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import {
  fetchBooks,
  fetchIssuedBooks,
  returnBook,
  deleteIssueRecord,
  type BookItem,
  type IssuedBookItem,
} from "@/services/libraryService";
import { toast } from "sonner";

export function LibrarianReturn() {
  const [issuedBooks, setIssuedBooks] = useState<IssuedBookItem[]>([]);
  const [catalogBooks, setCatalogBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState("");
  const [returnCondition, setReturnCondition] = useState("good");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [returnedBooks, setReturnedBooks] = useState<IssuedBookItem[]>([]);
  const [useCustomFine, setUseCustomFine] = useState(false);
  const [customFineInput, setCustomFineInput] = useState("");

  const loadIssued = () => {
    setLoading(true);
    Promise.all([fetchIssuedBooks(), fetchBooks({ limit: 1000 })])
      .then(([issuedData, booksData]) => {
        setIssuedBooks(issuedData.filter((b) => b.status === "issued" || b.status === "overdue"));
        setReturnedBooks(issuedData.filter((b) => b.status === "returned"));
        setCatalogBooks(booksData);
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
  const selectedCatalogBook = catalogBooks.find((book) => {
    const selectedBookId = typeof selectedBook?.book === "object" ? selectedBook.book._id : selectedBook?.book;
    return book._id === selectedBookId;
  });

  const getIssueLabel = (issue: IssuedBookItem) => {
    const studentName = typeof issue.student === "object" ? issue.student?.fullName : "Student";
    const issueBookId = typeof issue.book === "object" ? issue.book._id : issue.book;
    const catalogBook = catalogBooks.find((book) => book._id === issueBookId);
    const title =
      catalogBook?.title ||
      (typeof issue.book === "object" ? issue.book?.title : "") ||
      "Unknown Book";
    const author =
      catalogBook?.author ||
      (typeof issue.book === "object" ? issue.book?.author : "") ||
      "";

    return author ? `${title} by ${author} — Issued by ${studentName}` : `${title} — Issued by ${studentName}`;
  };

  const calculateFine = () => {
    if (!selectedBook) return 0;
    if (selectedBook.status !== "overdue") return 0;

    const dueDate = new Date(selectedBook.dueDate);
    const today = new Date();
    const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysOverdue <= 0) return 0;

    let fine = daysOverdue * 10; // Rate is ₹10/day
    if (returnCondition === "damaged") fine += 500;
    if (returnCondition === "lost") fine = 2000;

    return Math.min(fine, 2500);
  };

  // Returns the final fine that will actually be applied
  const getEffectiveFine = () => {
    if (useCustomFine) {
      const parsed = parseFloat(customFineInput);
      return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    }
    return calculateFine();
  };

  const handleReturnConfirm = async () => {
    if (!selectedIssue) return;
    setSubmitting(true);
    try {
      const effectiveFine = getEffectiveFine();
      await returnBook(selectedIssue, effectiveFine);
      toast.success("Book returned successfully and database updated!");
      setShowConfirm(false);
      setSelectedIssue("");
      setUseCustomFine(false);
      setCustomFineInput("");
      loadIssued();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to process return";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReturnedRecord = async (issueId: string) => {
    if (!confirm("Delete this returned issue record? This removes it from history only.")) return;
    setDeletingId(issueId);
    try {
      await deleteIssueRecord(issueId);
      toast.success("Returned issue record deleted.");
      loadIssued();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete record");
    } finally {
      setDeletingId("");
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
            <h3 className="font-semibold mb-4 text-gradient">Process Return</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Select Book to Return *
                </label>
                <select
                  value={selectedIssue}
                  onChange={(e) => setSelectedIssue(e.target.value)}
                  className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                >
                  <option value="">Choose issued book...</option>
                  {issuedBooks.map((b) => {
                    const issueBookId = typeof b.book === "object" ? b.book._id : b.book;
                    const catalogBook = catalogBooks.find((book) => book._id === issueBookId);
                    const title =
                      catalogBook?.title ||
                      (typeof b.book === "object" ? b.book?.title : "") ||
                      "Unknown Book";
                    const author =
                      catalogBook?.author ||
                      (typeof b.book === "object" ? b.book?.author : "") ||
                      "";
                    const studentName = typeof b.student === "object" ? b.student?.fullName : "Student";
                    const dueDate = new Date(b.dueDate).toLocaleDateString();

                    return (
                      <option key={b._id} value={b._id}>
                        {title}{author ? ` by ${author}` : ""} — {studentName} — Due {dueDate}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedBook && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">
                        Book Condition
                      </label>
                      <select
                        value={returnCondition}
                        onChange={(e) => setReturnCondition(e.target.value)}
                        className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                      >
                        <option value="good">Good / Normal</option>
                        <option value="damaged">Damaged (Fine Applied)</option>
                        <option value="lost">Lost (Full Replacement Fine)</option>
                      </select>
                    </div>

                    <div className="p-4 rounded-xl border bg-gradient-soft flex flex-col justify-center">
                      <span className="text-xs text-muted-foreground">Auto-Calculated Penalty</span>
                      <span className="text-xl font-bold text-gradient mt-1">₹{calculateFine()}</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {selectedBook.status === "overdue" ? "Based on overdue days" : "No overdue fine"}
                      </span>
                    </div>
                  </div>

                  {/* Manual Penalty Override */}
                  <div className="p-4 rounded-xl border bg-background space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Custom Penalty Amount</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Override the auto-calculated fine with a specific amount
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUseCustomFine(!useCustomFine);
                          if (!useCustomFine) setCustomFineInput(String(calculateFine()));
                          else setCustomFineInput("");
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                          useCustomFine ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            useCustomFine ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {useCustomFine && (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
                        <span className="text-lg font-bold text-muted-foreground">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={customFineInput}
                          onChange={(e) => setCustomFineInput(e.target.value)}
                          placeholder="Enter penalty amount"
                          className="flex-1 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <div className="flex gap-1.5">
                          {[0, 100, 250, 500].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setCustomFineInput(String(amt))}
                              className="px-2.5 py-1.5 rounded-lg border text-xs font-medium hover:bg-gradient-soft transition cursor-pointer"
                            >
                              ₹{amt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${
                      getEffectiveFine() > 0
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-green-50 text-green-700 border border-green-200"
                    }`}>
                      <span>Final Penalty to be Applied:</span>
                      <span className="text-base">₹{getEffectiveFine()}</span>
                      {useCustomFine && (
                        <span className="ml-auto text-xs opacity-75">(manual override)</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
                disabled={!selectedIssue}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-primary text-white font-medium glow-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="size-4" /> Process Return
              </button>
              <button
                onClick={() => {
                  setSelectedIssue("");
                  setReturnCondition("good");
                  setShowConfirm(false);
                  setUseCustomFine(false);
                  setCustomFineInput("");
                }}
                className="px-4 py-3 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition cursor-pointer"
              >
                Clear
              </button>
            </div>
          </Card>

          {/* Active Loans & Summary */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <h3 className="font-semibold mb-4">Active & Overdue Book Loans</h3>
              {issuedBooks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No books currently issued.
                </p>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {issuedBooks.map((issue) => {
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
                          <Badge tone={issue.status === "overdue" ? "warn" : "info"}>
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
              <h3 className="font-semibold mb-4">Return Stats</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-soft border">
                  <div className="text-xs text-muted-foreground mb-1">Total Active Loans</div>
                  <div className="text-3xl font-bold">{issuedBooks.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Books currently with students
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-soft border">
                  <div className="text-xs text-muted-foreground mb-1">Overdue Returns</div>
                  <div className="text-3xl font-bold text-amber-600">{overdueBooks.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">Require immediate return</div>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="font-semibold mb-4">Returned Books History</h3>
            {returnedBooks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No returned books recorded yet.
              </p>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {returnedBooks.map((issue) => {
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
                          <Badge tone="success">returned</Badge>
                          <button
                            type="button"
                            onClick={() => handleDeleteReturnedRecord(issue._id)}
                            disabled={deletingId === issue._id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition text-xs font-medium disabled:opacity-60"
                          >
                            {deletingId === issue._id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                            Delete Record
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Returned: {issue.returnDate ? new Date(issue.returnDate).toLocaleDateString() : "N/A"}</span>
                        <span>Due: {new Date(issue.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Confirm Modal */}
          {showConfirm && selectedBook && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                  <h3 className="font-semibold text-lg text-gradient">Confirm Book Return</h3>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="text-muted-foreground hover:text-foreground text-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50/50">
                    <AlertCircle className="size-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800 leading-relaxed">
                      You are about to record the return of{" "}
                      <strong>
                        {selectedCatalogBook?.title || (typeof selectedBook.book === "object" ? selectedBook.book?.title : "Book")}
                      </strong>
                      . Please ensure the book details match.
                    </div>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Student Name</span>
                      <span className="font-medium">
                        {typeof selectedBook.student === "object"
                          ? selectedBook.student?.fullName
                          : "Student"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Roll Number</span>
                      <span className="font-medium">
                        {typeof selectedBook.student === "object"
                          ? selectedBook.student?.rollNumber
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Due Date</span>
                      <span className="font-medium">
                        {new Date(selectedBook.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Condition</span>
                      <span className="font-medium capitalize">{returnCondition}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Fine Applied</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-600">₹{getEffectiveFine()}</span>
                        {useCustomFine && (
                          <span className="text-xs text-amber-600 font-medium">(custom)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleReturnConfirm}
                      disabled={submitting}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-1.5"
                    >
                      {submitting && <Loader2 className="size-4 animate-spin" />}
                      Confirm Return
                    </button>
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="px-4 py-2.5 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

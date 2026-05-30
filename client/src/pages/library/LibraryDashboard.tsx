import { useState } from "react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { Search, BookOpen, Clock, DollarSign, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchBooks, fetchIssuedBooks } from "@/services/libraryService";
import { toast } from "sonner";

export function LibraryDashboard() {
  const [activeTab, setActiveTab] = useState<"catalog" | "borrowed">("catalog");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [category, setCategory] = useState("");

  const { data: books, isLoading: isBooksLoading } = useQuery({
    queryKey: ["books", searchVal, category],
    queryFn: () => fetchBooks({ search: searchVal, category, limit: 1000 }),
  });

  const { data: borrowedBooks, isLoading: isBorrowedLoading } = useQuery({
    queryKey: ["myBorrowedBooks"],
    queryFn: () => fetchIssuedBooks(),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchVal(searchTerm);
  };

  const handleRequestIssue = (book: any) => {
    toast.info(
      `To issue "${book.title}", please visit the Library desk. (ISBN: ${book.isbn || "N/A"}, Shelf: ${book.shelfNumber || "N/A"})`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Central Library 📚"
        desc="Search library books, view shelf locations, and track your checkouts."
      />

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b pb-3">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
            activeTab === "catalog"
              ? "bg-gradient-primary text-white glow-primary"
              : "bg-gradient-soft border text-muted-foreground hover:text-foreground"
          }`}
        >
          Book Catalog
        </button>
        <button
          onClick={() => setActiveTab("borrowed")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
            activeTab === "borrowed"
              ? "bg-gradient-primary text-white glow-primary"
              : "bg-gradient-soft border text-muted-foreground hover:text-foreground"
          }`}
        >
          My Borrowed Books ({borrowedBooks?.length || 0})
        </button>
      </div>

      {activeTab === "catalog" ? (
        <>
          {/* Catalog Filter Controls */}
          <Card>
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, author, or ISBN…"
                  className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-xl border bg-background px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
                >
                  <option value="">All Categories</option>
                  <option value="Computer">Computer Science</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business">Business</option>
                  <option value="Science">Science & Tech</option>
                  <option value="General">General Knowledge</option>
                </select>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary cursor-pointer hover:opacity-90 transition"
                >
                  Search
                </button>
              </div>
            </form>
          </Card>

          {/* Book Catalog List */}
          {isBooksLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="h-64 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : !books || books.length === 0 ? (
            <Card className="text-center py-12">
              <BookOpen className="size-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground font-medium">No books match your criteria.</p>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((b) => {
                const total = b.totalCopies !== undefined ? b.totalCopies : 1;
                const available = b.availableCopies !== undefined ? b.availableCopies : 1;

                return (
                  <Card key={b._id} className="hover:-translate-y-1 transition duration-200 flex flex-col justify-between">
                    <div>
                      <div className="aspect-[3/2] rounded-xl bg-gradient-primary text-white grid place-items-center mb-4 relative overflow-hidden">
                        <BookOpen className="size-12 opacity-80" />
                        <div className="absolute inset-0 grid-bg opacity-30" />
                        {b.shelfNumber && (
                          <div className="absolute bottom-2.5 right-2.5 text-[10px] bg-black/45 px-2 py-0.5 rounded font-mono">
                            Shelf: {b.shelfNumber}
                          </div>
                        )}
                      </div>
                      <div className="font-semibold text-sm line-clamp-1">{b.title}</div>
                      <div className="text-xs text-muted-foreground mb-2">{b.author}</div>
                      <div className="flex items-center justify-between mt-3">
                        <Badge tone="info">{b.category || "General"}</Badge>
                        <Badge tone={available > 0 ? "success" : "danger"}>
                          {available > 0 ? `${available}/${total} Available` : "Unavailable"}
                        </Badge>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRequestIssue(b)}
                      className="mt-5 w-full rounded-xl bg-gradient-primary text-white text-xs font-semibold py-2.5 glow-primary transition"
                    >
                      {available > 0 ? "How to Borrow" : "Notify Availability"}
                    </button>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* My Borrowed Books List */
        <>
          {isBorrowedLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="h-20 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : !borrowedBooks || borrowedBooks.length === 0 ? (
            <Card className="text-center py-12">
              <Clock className="size-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground font-medium">You have no active or historical checkouts.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {borrowedBooks.map((item) => {
                const bTitle = typeof item.book === "object" && item.book ? item.book.title : "Library Book";
                const bAuthor = typeof item.book === "object" && item.book ? item.book.author : "Author";
                const isOverdue = item.status === "overdue";
                const isReturned = item.status === "returned";

                return (
                  <Card key={item._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-soft border ${isOverdue ? "text-rose-600" : "text-primary"}`}>
                        <BookOpen className="size-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{bTitle}</div>
                        <div className="text-xs text-muted-foreground">{bAuthor}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Borrowed On</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Calendar className="size-3.5 text-muted-foreground" />
                          {item.issueDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">{isReturned ? "Returned On" : "Due Date"}</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Clock className="size-3.5 text-muted-foreground" />
                          {isReturned ? item.returnDate : item.dueDate}
                        </span>
                      </div>
                      {item.fineAmount !== undefined && item.fineAmount > 0 && (
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Fine Balance</span>
                          <span className="font-semibold text-rose-600 flex items-center gap-0.5">
                            ₹{item.fineAmount}
                          </span>
                        </div>
                      )}
                      <div className="col-span-2 sm:col-span-1 flex items-center">
                        <Badge tone={isOverdue ? "danger" : isReturned ? "success" : "info"}>
                          {item.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

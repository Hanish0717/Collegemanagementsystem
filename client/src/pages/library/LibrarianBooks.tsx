import { useState, useEffect } from "react";
import { Search, Plus, BookOpen, Grid, List, Loader2, X } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { fetchBooks, createBook, type BookItem } from "@/services/libraryService";
import { toast } from "sonner";

export function LibrarianBooks() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Book Form state
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Computer Science");
  const [isbn, setIsbn] = useState("");
  const [publisher, setPublisher] = useState("");
  const [totalCopies, setTotalCopies] = useState("10");
  const [shelfNumber, setShelfNumber] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    "All",
    "Computer Science",
    "Software Engineering",
    "Mathematics",
    "Physics",
    "Electronics",
    "Engineering",
    "General Knowledge"
  ];

  const loadBooks = () => {
    setLoading(true);
    fetchBooks()
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load books from live database");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !isbn) {
      toast.error("Please fill in required fields");
      return;
    }
    setSubmitting(true);
    try {
      await createBook({
        title,
        author,
        category,
        isbn,
        publisher,
        totalCopies: parseInt(totalCopies) || 1,
        shelfNumber,
        description,
      });
      toast.success("Book successfully saved to database!");
      setShowAddModal(false);
      // Reset form
      setTitle("");
      setAuthor("");
      setCategory("Computer Science");
      setIsbn("");
      setPublisher("");
      setTotalCopies("10");
      setShelfNumber("");
      setDescription("");
      // Reload list
      loadBooks();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to save book";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book Management 📚"
        desc="Manage library inventory, track availability, and organize catalog (Live Database Connected)."
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2"
          >
            <Plus className="size-4" /> Add Book
          </button>
        }
      />

      {/* Search and Filter Section */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                placeholder="Search by title, author or ISBN…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2 border rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition ${
                  viewMode === "grid" ? "bg-gradient-primary text-white" : "text-muted-foreground"
                }`}
              >
                <Grid className="size-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition ${
                  viewMode === "table" ? "bg-gradient-primary text-white" : "text-muted-foreground"
                }`}
              >
                <List className="size-4" />
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-gradient-primary text-white"
                    : "bg-background border text-muted-foreground hover:border-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading books from database...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <Card className="text-center p-12">
          <BookOpen className="size-12 mx-auto text-muted-foreground/60 mb-3" />
          <h3 className="font-semibold text-lg">No books found</h3>
          <p className="text-sm text-muted-foreground mt-1">Try matching other keywords or add a new book.</p>
        </Card>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBooks.map((book) => (
                <Card key={book._id} className="hover:-translate-y-1 transition flex flex-col justify-between">
                  <div>
                    <div className="aspect-[3/2] rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white grid place-items-center mb-4 relative overflow-hidden">
                      <BookOpen className="size-12 opacity-80" />
                      <div className="absolute inset-0 grid-bg opacity-30" />
                    </div>
                    <div>
                      <div className="font-semibold line-clamp-2">{book.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">By {book.author}</div>
                      <div className="text-xs text-muted-foreground">ISBN: {book.isbn}</div>

                      <div className="mt-4 flex items-center justify-between">
                        <Badge tone="info">{book.category}</Badge>
                        <Badge tone={book.availableCopies > 0 ? "success" : "danger"}>
                          {book.availableCopies > 0 ? `${book.availableCopies} available` : "Out of Stock"}
                        </Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 p-2 bg-gradient-soft rounded-lg">
                        <div className="text-center">
                          <div className="text-[10px] text-muted-foreground">Total</div>
                          <div className="text-sm font-semibold">{book.totalCopies}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-muted-foreground">Issued</div>
                          <div className="text-sm font-semibold">{book.totalCopies - book.availableCopies}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-muted-foreground">Avail</div>
                          <div className="text-sm font-semibold text-emerald-600">{book.availableCopies}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <div className="text-xs text-muted-foreground self-center">
                      Shelf: {book.shelfNumber || "N/A"}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-4 py-3 font-semibold text-muted-foreground">ISBN</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Title</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Author</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Category</th>
                      <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Total</th>
                      <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Available</th>
                      <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Shelf</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map((book) => (
                      <tr key={book._id} className="border-b hover:bg-gradient-soft transition">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{book.isbn}</td>
                        <td className="px-4 py-3 font-medium">{book.title}</td>
                        <td className="px-4 py-3 text-sm">{book.author}</td>
                        <td className="px-4 py-3">
                          <Badge tone="info">{book.category}</Badge>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold">{book.totalCopies}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge tone={book.availableCopies > 0 ? "success" : "danger"}>{book.availableCopies}</Badge>
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{book.shelfNumber || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Add Book Modal Form */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
            <h3 className="font-bold text-lg mb-4">Add New Book to Catalog</h3>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold">Book Title *</label>
                  <input
                    placeholder="Enter book title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Author *</label>
                  <input
                    placeholder="Enter author name"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold">ISBN *</label>
                  <input
                    placeholder="Enter unique ISBN"
                    required
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm"
                  >
                    {categories.slice(1).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold">Publisher</label>
                  <input
                    placeholder="Publisher"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Total Copies</label>
                  <input
                    type="number"
                    min="1"
                    value={totalCopies}
                    onChange={(e) => setTotalCopies(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Shelf Number</label>
                  <input
                    placeholder="e.g. A-12"
                    value={shelfNumber}
                    onChange={(e) => setShelfNumber(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold">Description</label>
                <textarea
                  placeholder="Short book description..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border text-sm font-medium hover:bg-gradient-soft"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  Save Book
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

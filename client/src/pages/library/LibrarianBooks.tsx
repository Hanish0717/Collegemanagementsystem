import { useState, useEffect } from "react";
import { Search, Plus, BookOpen, Grid, List, Loader2, X, Edit, Eye, Trash2 } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { fetchBooks, createBook, updateBook, deleteBook, type BookItem } from "@/services/libraryService";
import { toast } from "sonner";

export function LibrarianBooks() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);

  // Form states
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

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setCategory("Computer Science");
    setIsbn("");
    setPublisher("");
    setTotalCopies("10");
    setShelfNumber("");
    setDescription("");
  };

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
      setIsAddModalOpen(false);
      resetForm();
      loadBooks();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to save book";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;
    if (!title || !author || !isbn) {
      toast.error("Please fill in required fields");
      return;
    }
    setSubmitting(true);
    try {
      await updateBook(selectedBook._id, {
        title,
        author,
        category,
        isbn,
        publisher,
        totalCopies: parseInt(totalCopies) || 1,
        shelfNumber,
        description,
      });
      toast.success("Book successfully updated in database!");
      setIsEditModalOpen(false);
      resetForm();
      setSelectedBook(null);
      loadBooks();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update book";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      await deleteBook(id);
      toast.success("Book successfully deleted!");
      loadBooks();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete book");
    }
  };

  const openEditModal = (book: BookItem) => {
    setSelectedBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setCategory(book.category);
    setIsbn(book.isbn);
    setPublisher(book.publisher || "");
    setTotalCopies(String(book.totalCopies));
    setShelfNumber(book.shelfNumber || "");
    setDescription(book.description || "");
    setIsEditModalOpen(true);
  };

  const openDetailsModal = (book: BookItem) => {
    setSelectedBook(book);
    setIsDetailsModalOpen(true);
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
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-90 transition"
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
                className={`p-2 rounded-lg transition cursor-pointer ${
                  viewMode === "grid" ? "bg-gradient-primary text-white" : "text-muted-foreground hover:bg-gradient-soft"
                }`}
              >
                <Grid className="size-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  viewMode === "table" ? "bg-gradient-primary text-white" : "text-muted-foreground hover:bg-gradient-soft"
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
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition cursor-pointer ${
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
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="size-10 animate-spin text-primary mb-3" />
          <p className="text-muted-foreground text-sm">Fetching catalog from live database...</p>
        </div>
      ) : (
        <>
          {/* Empty State */}
          {filteredBooks.length === 0 && (
            <Card className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="size-16 text-muted-foreground/40 mb-4 stroke-1 animate-pulse" />
              <h3 className="text-lg font-semibold">No Books Found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                We couldn't find any books matching your search query or category filter.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="mt-4 px-4 py-2 rounded-xl border text-sm font-medium hover:bg-gradient-soft transition cursor-pointer"
              >
                Clear Filters
              </button>
            </Card>
          )}

          {/* Grid View */}
          {viewMode === "grid" && filteredBooks.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBooks.map((book) => (
                <Card key={book._id} className="hover:-translate-y-1 transition flex flex-col justify-between">
                  <div>
                    <div className="aspect-[3/2] rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white grid place-items-center mb-4 relative overflow-hidden">
                      <BookOpen className="size-12 opacity-80" />
                      <div className="absolute inset-0 grid-bg opacity-30" />
                      <div className="absolute top-2 left-2">
                        <Badge tone="info" className="text-xs font-mono">
                          {book.isbn}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-base line-clamp-1">{book.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">By {book.author}</p>
                      <div className="mt-3 flex items-center justify-between text-xs border-t pt-3">
                        <div>
                          <div className="text-[10px] text-muted-foreground">Total</div>
                          <div className="font-semibold">{book.totalCopies}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-muted-foreground">Avail</div>
                          <div className="font-semibold text-emerald-600">{book.availableCopies}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-muted-foreground">Shelf</div>
                          <div className="font-semibold text-muted-foreground">{book.shelfNumber || "N/A"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <button
                      onClick={() => openEditModal(book)}
                      className="flex-1 px-3 py-2 rounded-xl border text-xs font-medium hover:bg-gradient-soft transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit className="size-3" /> Edit
                    </button>
                    <button
                      onClick={() => openDetailsModal(book)}
                      className="flex-1 px-3 py-2 rounded-xl bg-gradient-primary text-white text-xs font-medium glow-primary flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="size-3" /> View
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book._id)}
                      className="px-3 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === "table" && filteredBooks.length > 0 && (
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
                      <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map((book) => (
                      <tr key={book._id} className="border-b hover:bg-gradient-soft transition">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{book.isbn}</td>
                        <td className="px-4 py-3 font-medium">{book.title.substring(0, 45)}</td>
                        <td className="px-4 py-3 text-sm">{book.author}</td>
                        <td className="px-4 py-3">
                          <Badge tone="info">{book.category}</Badge>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold">{book.totalCopies}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge tone={book.availableCopies > 0 ? "success" : "danger"}>
                            {book.availableCopies}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{book.shelfNumber || "N/A"}</td>
                        <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(book)}
                            className="p-1.5 rounded-lg border text-muted-foreground hover:bg-gradient-soft transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="size-3.5" />
                          </button>
                          <button
                            onClick={() => openDetailsModal(book)}
                            className="p-1.5 rounded-lg bg-gradient-primary text-white glow-primary cursor-pointer hover:opacity-90 transition"
                            title="View"
                          >
                            <Eye className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book._id)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Add Book Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold text-lg text-gradient">Add New Book</h3>
            </div>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clean Architecture"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Author *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Robert C. Martin"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">ISBN *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9780132350884"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  >
                    {categories.slice(1).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Publisher</label>
                  <input
                    type="text"
                    placeholder="e.g. Prentice Hall"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Total Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={totalCopies}
                    onChange={(e) => setTotalCopies(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Shelf Number</label>
                  <input
                    type="text"
                    placeholder="e.g. A-12"
                    value={shelfNumber}
                    onChange={(e) => setShelfNumber(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <textarea
                  placeholder="Short book description..."
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  Save Book
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Book Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold text-lg text-gradient">Edit Book Catalog</h3>
            </div>
            <form onSubmit={handleEditBook} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Book Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Author *</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">ISBN *</label>
                  <input
                    type="text"
                    required
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  >
                    {categories.slice(1).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Publisher</label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Total Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={totalCopies}
                    onChange={(e) => setTotalCopies(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Shelf Number</label>
                  <input
                    type="text"
                    value={shelfNumber}
                    onChange={(e) => setShelfNumber(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Book Details Modal */}
      {isDetailsModalOpen && selectedBook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setIsDetailsModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold text-lg text-gradient">Book Specifications</h3>
            </div>
            <div className="space-y-4">
              <div className="aspect-[3/2] rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white grid place-items-center relative overflow-hidden">
                <BookOpen className="size-16 opacity-80" />
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="absolute top-2 right-2">
                  <Badge tone="info" className="text-xs font-mono">
                    {selectedBook.isbn}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold">{selectedBook.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">Written by: {selectedBook.author}</p>
                <p className="text-xs text-muted-foreground">Published by: {selectedBook.publisher || "N/A"}</p>
              </div>
              {selectedBook.description && (
                <div className="text-xs text-muted-foreground bg-background p-2.5 rounded-lg border">
                  {selectedBook.description}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 border-y py-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs block">Category</span>
                  <span className="font-semibold">{selectedBook.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Availability</span>
                  <span className={`font-semibold ${selectedBook.availableCopies > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {selectedBook.availableCopies > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-gradient-soft p-3 rounded-xl text-center">
                <div>
                  <div className="text-xs text-muted-foreground">Total Stock</div>
                  <div className="text-lg font-bold">{selectedBook.totalCopies}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Issued Copies</div>
                  <div className="text-lg font-bold">{selectedBook.totalCopies - selectedBook.availableCopies}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Available</div>
                  <div className="text-lg font-bold text-emerald-600">{selectedBook.availableCopies}</div>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-90 transition text-sm"
              >
                Close View
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

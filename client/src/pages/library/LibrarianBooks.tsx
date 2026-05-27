import { useState } from "react";
import { Search, Plus, BookOpen, Grid, List } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { bookInventory } from "@/mock/mockData";
import { toast } from "sonner";

export function LibrarianBooks() {
  const [books, setBooks] = useState(bookInventory);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formPublisher, setFormPublisher] = useState("");
  const [formCategory, setFormCategory] = useState("Computer Science");
  const [formTotal, setFormTotal] = useState("10");

  const categories = [
    "All",
    "Computer Science",
    "Engineering",
    "Business",
    "History & Literature",
    "General Knowledge",
    "Science",
  ];

  const filteredBooks = books.filter(
    (book) =>
      (selectedCategory === "All" || book.category === selectedCategory) &&
      (book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.id.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const resetForm = () => {
    setFormTitle("");
    setFormAuthor("");
    setFormPublisher("");
    setFormCategory("Computer Science");
    setFormTotal("10");
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAuthor.trim() || !formPublisher.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const newBook = {
      id: `BK${String(books.length + 1).padStart(3, "0")}`,
      title: formTitle,
      author: formAuthor,
      publisher: formPublisher,
      category: formCategory,
      total: parseInt(formTotal) || 10,
      issued: 0,
      available: parseInt(formTotal) || 10,
    };
    setBooks([newBook, ...books]);
    toast.success(`Successfully added "${formTitle}" to catalog!`);
    setIsAddModalOpen(false);
    resetForm();
  };

  const openEditModal = (book: any) => {
    setSelectedBook(book);
    setFormTitle(book.title);
    setFormAuthor(book.author);
    setFormPublisher(book.publisher);
    setFormCategory(book.category);
    setFormTotal(String(book.total));
    setIsEditModalOpen(true);
  };

  const handleEditBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAuthor.trim() || !formPublisher.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setBooks(
      books.map((b) => {
        if (b.id === selectedBook.id) {
          const totalVal = parseInt(formTotal) || 10;
          const availableVal = Math.max(0, totalVal - b.issued);
          return {
            ...b,
            title: formTitle,
            author: formAuthor,
            publisher: formPublisher,
            category: formCategory,
            total: totalVal,
            available: availableVal,
          };
        }
        return b;
      }),
    );
    toast.success(`Successfully updated "${formTitle}"!`);
    setIsEditModalOpen(false);
    setSelectedBook(null);
    resetForm();
  };

  const openDetailsModal = (book: any) => {
    setSelectedBook(book);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book Management"
        desc="Manage library inventory, track availability and organize catalog."
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
                className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
              />
            </div>
            <div className="flex items-center gap-2 border rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-gradient-primary text-white"
                    : "text-muted-foreground hover:bg-gradient-soft"
                }`}
              >
                <Grid className="size-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  viewMode === "table"
                    ? "bg-gradient-primary text-white"
                    : "text-muted-foreground hover:bg-gradient-soft"
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
            <Card key={book.id} className="hover:-translate-y-1 transition flex flex-col">
              <div className="aspect-[3/2] rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white grid place-items-center mb-4 relative overflow-hidden">
                <BookOpen className="size-12 opacity-80" />
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="absolute top-2 left-2">
                  <Badge tone="info" className="text-xs">
                    {book.id}
                  </Badge>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="font-semibold line-clamp-2">{book.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{book.author}</div>
                  <div className="text-xs text-muted-foreground">{book.publisher}</div>

                  <div className="mt-4 flex items-center justify-between">
                    <Badge tone="info">{book.category}</Badge>
                    <Badge tone={book.available > 0 ? "success" : "danger"}>
                      {book.available > 0 ? `${book.available} avail` : "Out"}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 p-2 bg-gradient-soft rounded-lg">
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground">Total</div>
                    <div className="text-sm font-semibold">{book.total}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground">Issued</div>
                    <div className="text-sm font-semibold">{book.issued}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground">Avail</div>
                    <div
                      className={`text-sm font-semibold ${book.available > 0 ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {book.available}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openEditModal(book)}
                  className="flex-1 px-3 py-2 rounded-xl border text-sm font-medium hover:bg-gradient-soft transition cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDetailsModal(book)}
                  className="flex-1 px-3 py-2 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary cursor-pointer hover:opacity-90 transition"
                >
                  View Details
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
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Book ID
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Author
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Category
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                    Issued
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                    Available
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="border-b hover:bg-gradient-soft transition">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{book.id}</td>
                    <td className="px-4 py-3 font-medium">{book.title.substring(0, 45)}</td>
                    <td className="px-4 py-3 text-sm">{book.author}</td>
                    <td className="px-4 py-3">
                      <Badge tone="info">{book.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">{book.total}</td>
                    <td className="px-4 py-3 text-center font-semibold">{book.issued}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge tone={book.available > 0 ? "success" : "danger"}>
                        {book.available}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(book)}
                        className="px-2.5 py-1.5 rounded-lg text-xs border text-muted-foreground hover:bg-gradient-soft transition cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDetailsModal(book)}
                        className="px-2.5 py-1.5 rounded-lg text-xs bg-gradient-primary text-white glow-primary cursor-pointer hover:opacity-90 transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Book Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold text-lg text-gradient">Add New Book</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clean Architecture"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
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
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Publisher *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prentice Hall"
                    value={formPublisher}
                    onChange={(e) => setFormPublisher(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
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
                  <label className="text-xs font-semibold text-muted-foreground">
                    Total Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formTotal}
                    onChange={(e) => setFormTotal(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
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
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-90 transition"
                >
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
          <Card className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold text-lg text-gradient">Edit Book Catalog</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditBook} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Book Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Author *</label>
                  <input
                    type="text"
                    required
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Publisher *</label>
                  <input
                    type="text"
                    required
                    value={formPublisher}
                    onChange={(e) => setFormPublisher(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
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
                  <label className="text-xs font-semibold text-muted-foreground">
                    Total Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formTotal}
                    onChange={(e) => setFormTotal(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
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
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-90 transition"
                >
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
          <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold text-lg text-gradient">Book Specifications</h3>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="aspect-[3/2] rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white grid place-items-center relative overflow-hidden">
                <BookOpen className="size-16 opacity-80 animate-bounce" />
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="absolute top-2 right-2">
                  <Badge tone="info" className="text-xs">
                    {selectedBook.id}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold">{selectedBook.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Written by: {selectedBook.author}
                </p>
                <p className="text-xs text-muted-foreground">
                  Published by: {selectedBook.publisher || "N/A"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 border-y py-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs block">Category</span>
                  <span className="font-semibold">{selectedBook.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Availability</span>
                  <span
                    className={`font-semibold ${selectedBook.available > 0 ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {selectedBook.available > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-gradient-soft p-3 rounded-xl text-center">
                <div>
                  <div className="text-xs text-muted-foreground">Total Stock</div>
                  <div className="text-lg font-bold">{selectedBook.total}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Issued Copies</div>
                  <div className="text-lg font-bold">{selectedBook.issued}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Available</div>
                  <div className="text-lg font-bold text-emerald-600">{selectedBook.available}</div>
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

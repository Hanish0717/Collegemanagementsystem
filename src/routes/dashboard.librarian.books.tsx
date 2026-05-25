import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus, BookOpen, Grid, List } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { bookInventory } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/librarian/books")({
  component: BookManagement,
});

function BookManagement() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Computer Science", "Engineering", "Business", "History & Literature", "General Knowledge", "Science"];

  const filteredBooks = bookInventory.filter(book =>
    (selectedCategory === "All" || book.category === selectedCategory) &&
    (book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book Management"
        desc="Manage library inventory, track availability and organize catalog."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
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
                className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 border rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-gradient-primary text-white" : "text-muted-foreground"}`}
              >
                <Grid className="size-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition ${viewMode === "table" ? "bg-gradient-primary text-white" : "text-muted-foreground"}`}
              >
                <List className="size-4" />
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
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

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map(book => (
            <Card key={book.id} className="hover:-translate-y-1 transition flex flex-col">
              <div className="aspect-[3/2] rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white grid place-items-center mb-4 relative overflow-hidden">
                <BookOpen className="size-12 opacity-80" />
                <div className="absolute inset-0 grid-bg opacity-30" />
              </div>
              <div className="flex-1">
                <div className="font-semibold line-clamp-2">{book.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{book.author}</div>
                <div className="text-xs text-muted-foreground">{book.publisher}</div>

                <div className="mt-4 flex items-center justify-between">
                  <Badge tone="info">{book.category}</Badge>
                  <Badge tone={book.available > 0 ? "success" : "danger"}>
                    {book.available > 0 ? `${book.available} avail` : "Out"}
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 p-2 bg-gradient-soft rounded-lg">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Total</div>
                    <div className="text-sm font-semibold">{book.total}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Issued</div>
                    <div className="text-sm font-semibold">{book.issued}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Available</div>
                    <div className="text-sm font-semibold text-emerald-600">{book.available}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-3 py-2 rounded-xl border text-sm font-medium hover:bg-gradient-soft transition">
                  Edit
                </button>
                <button className="flex-1 px-3 py-2 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary">
                  View Details
                </button>
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
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Book ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Author</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Issued</th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Available</th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map(book => (
                  <tr key={book.id} className="border-b hover:bg-gradient-soft transition">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{book.id}</td>
                    <td className="px-4 py-3 font-medium">{book.title.substring(0, 30)}</td>
                    <td className="px-4 py-3 text-sm">{book.author}</td>
                    <td className="px-4 py-3"><Badge tone="info">{book.category}</Badge></td>
                    <td className="px-4 py-3 text-center font-semibold">{book.total}</td>
                    <td className="px-4 py-3 text-center font-semibold">{book.issued}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge tone={book.available > 0 ? "success" : "danger"}>{book.available}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="px-3 py-1.5 rounded-lg text-xs bg-gradient-primary text-white glow-primary">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

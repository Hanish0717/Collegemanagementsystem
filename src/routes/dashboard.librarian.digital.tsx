import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, FileText, Download, Eye } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { eBooks } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/librarian/digital")({
  component: DigitalLibraryPage,
});

function DigitalLibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const categories = ["All", "Computer Science", "Business", "Mathematics", "Science"];
  const filteredEbooks = eBooks.filter(e =>
    (selectedCategory === "All" || e.category === selectedCategory) &&
    (e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digital Library"
        desc="Access e-books, PDFs and digital resources."
      />

      {/* Search and Filter */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                placeholder="Search e-books, PDFs or resources…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm"
              />
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

      {/* E-books Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEbooks.map(ebook => (
          <Card key={ebook.id} className="hover:-translate-y-1 transition flex flex-col">
            <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white grid place-items-center mb-4 relative overflow-hidden">
              <FileText className="size-20 opacity-80" />
              <div className="absolute inset-0 grid-bg opacity-30" />
              <div className="absolute top-2 right-2">
                <Badge tone="info" className="text-xs">
                  {ebook.format}
                </Badge>
              </div>
            </div>

            <div className="flex-1 mb-4">
              <div className="font-semibold line-clamp-2">{ebook.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{ebook.author}</div>
              <div className="text-xs text-muted-foreground">{ebook.category}</div>

              <div className="mt-3 p-2 bg-gradient-soft rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-medium">{ebook.size}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-muted-foreground">Downloads:</span>
                  <span className="font-bold text-emerald-600">{ebook.downloads}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedBook(ebook)}
                className="flex-1 px-3 py-2 rounded-xl border text-sm font-medium hover:bg-gradient-soft transition flex items-center justify-center gap-2"
              >
                <Eye className="size-4" /> Preview
              </button>
              <button className="flex-1 px-3 py-2 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary flex items-center justify-center gap-2">
                <Download className="size-4" /> Download
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Preview Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">{selectedBook.title}</h3>
                <p className="text-muted-foreground">by {selectedBook.author}</p>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2 rounded-lg border text-muted-foreground hover:bg-gradient-soft transition"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gradient-soft border">
                <div className="text-xs text-muted-foreground mb-1">Category</div>
                <div className="font-semibold">{selectedBook.category}</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-soft border">
                <div className="text-xs text-muted-foreground mb-1">Format</div>
                <div className="font-semibold">{selectedBook.format}</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-soft border">
                <div className="text-xs text-muted-foreground mb-1">File Size</div>
                <div className="font-semibold">{selectedBook.size}</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-soft border">
                <div className="text-xs text-muted-foreground mb-1">Total Downloads</div>
                <div className="font-semibold text-emerald-600">{selectedBook.downloads}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-soft border mb-6">
              <h4 className="font-semibold mb-2">Document Preview</h4>
              <div className="aspect-video rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                <FileText className="size-20 text-white/50" />
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-3 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition">
                Cancel
              </button>
              <button className="flex-1 px-4 py-3 rounded-xl bg-gradient-primary text-white font-medium glow-primary flex items-center justify-center gap-2">
                <Download className="size-4" /> Download {selectedBook.title}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Resource Categories */}
      <Card>
        <h3 className="font-semibold mb-4">Popular Resources</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Python Programming", docs: 12, color: "from-blue-500" },
            { title: "Web Development", docs: 18, color: "from-purple-500" },
            { title: "Data Science", docs: 15, color: "from-pink-500" },
            { title: "Business Management", docs: 9, color: "from-cyan-500" },
          ].map((cat, i) => (
            <div key={i} className={`p-4 rounded-xl bg-gradient-to-br ${cat.color} to-transparent text-white border`}>
              <div className="text-sm font-semibold">{cat.title}</div>
              <div className="text-2xl font-bold mt-2">{cat.docs}</div>
              <div className="text-xs opacity-80 mt-1">Resources available</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

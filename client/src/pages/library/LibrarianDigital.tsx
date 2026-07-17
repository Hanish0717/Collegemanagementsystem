import { useState } from 'react';
import { Search, FileText, Download, Eye, Plus, Trash2 } from 'lucide-react';
import { Card, PageHeader, Badge } from '@/components/dashboard/ui';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEBooks,
  downloadEBook,
  createEBook,
  deleteEBook,
  EBookItem,
} from '@/services/libraryService';

export function LibrarianDigital() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBook, setSelectedBook] = useState<EBookItem | null>(null);

  // Add Resource Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [format, setFormat] = useState('PDF');
  const [size, setSize] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const categories = ['All', 'Computer Science', 'Business', 'Mathematics', 'Science'];

  // Fetch all ebooks to compute domain/category totals
  const { data: allEBooks } = useQuery({
    queryKey: ['allEbooks'],
    queryFn: () => fetchEBooks(),
  });

  // Fetch filtered ebooks
  const { data: ebooks = [], isLoading } = useQuery({
    queryKey: ['ebooks', searchTerm, selectedCategory],
    queryFn: () =>
      fetchEBooks({
        search: searchTerm || undefined,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
      }),
  });

  const downloadMutation = useMutation({
    mutationFn: (bookId: string) => downloadEBook(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ebooks'] });
      queryClient.invalidateQueries({ queryKey: ['allEbooks'] });
    },
  });

  const addMutation = useMutation({
    mutationFn: (payload: any) => createEBook(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ebooks'] });
      queryClient.invalidateQueries({ queryKey: ['allEbooks'] });
      toast.success('Digital resource added successfully!');
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error('Failed to add resource.');
      console.error(err);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ebooks'] });
      queryClient.invalidateQueries({ queryKey: ['allEbooks'] });
      toast.success('Digital resource deleted successfully!');
    },
    onError: (err) => {
      toast.error('Failed to delete resource.');
      console.error(err);
    },
  });

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setCategory('Computer Science');
    setFormat('PDF');
    setSize('');
    setFileUrl('');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !size) {
      toast.error('Please fill in all required fields.');
      return;
    }
    addMutation.mutate({
      title,
      author,
      category,
      format,
      size,
      fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownload = (bookId: string, title: string, customUrl?: string) => {
    toast.loading(`Downloading "${title}"...`);

    downloadMutation.mutate(bookId, {
      onSuccess: () => {
        toast.dismiss();
        toast.success(`Successfully downloaded "${title}"!`);
        const urlToOpen =
          customUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        window.open(urlToOpen, '_blank');
      },
      onError: (err) => {
        toast.dismiss();
        toast.error('Failed to register download.');
        console.error(err);
      },
    });
  };

  const getDomainCount = (keyword: string) => {
    if (!allEBooks) return 0;
    const kw = keyword.toLowerCase();
    return allEBooks.filter(
      (e) => e.title.toLowerCase().includes(kw) || e.category.toLowerCase().includes(kw),
    ).length;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Digital Library"
        desc="Access e-books, PDFs and digital resources."
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-90 transition"
          >
            <Plus className="size-4" /> Add Resource
          </button>
        }
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
                className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
              />
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
                    ? 'bg-gradient-primary text-white'
                    : 'bg-background border text-muted-foreground hover:border-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* E-books Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="h-72 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : !ebooks || ebooks.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="size-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground font-medium">
            No digital resources found matching your criteria.
          </p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ebooks.map((ebook) => (
            <Card
              key={ebook.id}
              className="hover:-translate-y-1 transition flex flex-col justify-between"
            >
              <div>
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
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedBook(ebook)}
                  className="flex-1 px-3 py-2 rounded-xl border text-sm font-medium hover:bg-gradient-soft transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Eye className="size-4" /> Preview
                </button>
                <button
                  onClick={() => handleDownload(ebook.id, ebook.title, ebook.fileUrl)}
                  className="px-3 py-2 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition"
                >
                  <Download className="size-4" /> Download
                </button>
                <button
                  onClick={() => handleDelete(ebook.id, ebook.title)}
                  className="px-3 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition cursor-pointer flex items-center justify-center"
                  title="Delete Resource"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-6 border-b pb-3">
              <div>
                <h3 className="text-xl font-bold text-gradient">{selectedBook.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Written by: {selectedBook.author}
                </p>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="text-muted-foreground hover:text-foreground text-lg cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-soft border text-sm">
                <div className="text-xs text-muted-foreground mb-1">Resource Category</div>
                <div className="font-semibold">{selectedBook.category}</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-soft border text-sm">
                <div className="text-xs text-muted-foreground mb-1">File Format</div>
                <div className="font-semibold">{selectedBook.format}</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-soft border text-sm">
                <div className="text-xs text-muted-foreground mb-1">Document Size</div>
                <div className="font-semibold">{selectedBook.size}</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-soft border text-sm">
                <div className="text-xs text-muted-foreground mb-1">Total Downloads</div>
                <div className="font-semibold text-emerald-600">{selectedBook.downloads}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-soft border mb-6">
              <h4 className="font-semibold text-xs text-muted-foreground mb-2">Document Preview</h4>
              <iframe
                src={
                  selectedBook.fileUrl ||
                  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
                }
                className="w-full aspect-video rounded-lg border bg-slate-950"
                title={selectedBook.title}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => setSelectedBook(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition cursor-pointer text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const b = selectedBook;
                  setSelectedBook(null);
                  handleDownload(b.id, b.title, b.fileUrl);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition text-sm"
              >
                <Download className="size-4" /> Download PDF File
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Add Resource Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer text-lg"
            >
              ✕
            </button>
            <h3 className="font-semibold text-lg mb-4 text-gradient">Add New Digital Resource</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React Guide Book"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Author Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robin Wieruch"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary transition"
                  >
                    {categories.slice(1).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">File Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary transition"
                  >
                    <option value="PDF">PDF</option>
                    <option value="EPUB">EPUB</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">File Size *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15 MB"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    PDF Link / URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://domain.com/book.pdf"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl border text-muted-foreground hover:bg-gradient-soft transition cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-90 transition text-sm disabled:opacity-50"
                >
                  {addMutation.isPending ? 'Adding...' : 'Add Resource'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Resource Categories */}
      <Card>
        <h3 className="font-semibold mb-4 text-gradient">Popular Digital Domains</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Python Programming', docs: getDomainCount('python'), color: 'from-blue-500' },
            { title: 'Web Development', docs: getDomainCount('web'), color: 'from-purple-500' },
            {
              title: 'Data Science',
              docs:
                getDomainCount('data science') +
                getDomainCount('machine learning') +
                getDomainCount('ai &'),
              color: 'from-pink-500',
            },
            {
              title: 'Business Management',
              docs: getDomainCount('business') + getDomainCount('marketing'),
              color: 'from-cyan-500',
            },
          ].map((cat, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl bg-gradient-to-br ${cat.color} to-transparent text-white border`}
            >
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

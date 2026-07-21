import { useState } from "react";
import { BookOpen, Plus, Search, Award, Bookmark, Trash2, Calendar } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { LineChart, Line, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

export function FacultyPublications() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const [publications, setPublications] = useState([
    { id: "PUB001", title: "A Deep Reinforcement Learning Framework for Autonomous Collision Avoidance in Multi-UAV Systems", venue: "IEEE Transactions on Intelligent Transportation Systems", authors: "J. Smith, A. Patel, M. Rossi", year: "2024", type: "Journal", metrics: "IF: 9.55 | Citations: 12" },
    { id: "PUB002", title: "Hybrid Consensus Mechanisms for Scalable Energy Transactions in Smart Microgrids", venue: "ACM Transactions on Cyber-Physical Systems", authors: "J. Smith, R. Kumar", year: "2023", type: "Journal", metrics: "IF: 4.88 | Citations: 28" },
    { id: "PUB003", title: "Robust Face Detection on Low-Power IoT Devices via Neural Network Binarization", venue: "International Conference on Computer Vision (ICCV)", authors: "A. Khan, J. Smith", year: "2023", type: "Conference", metrics: "H5-index: 156 | Citations: 45" },
    { id: "PUB004", title: "Smart Contracts for Federated Decentralized Ledger in Logistics Operations", venue: "Springer Lecture Notes in Computer Science", authors: "J. Smith, L. Wang", year: "2022", type: "Book Chapter", metrics: "Citations: 8" }
  ]);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [newAuthors, setNewAuthors] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newType, setNewType] = useState("Journal");
  const [newMetrics, setNewMetrics] = useState("");

  const handleAddPublication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newVenue || !newAuthors || !newYear) {
      toast.error("Please fill in all details.");
      return;
    }

    const newPub = {
      id: `PUB00${publications.length + 1}`,
      title: newTitle,
      venue: newVenue,
      authors: newAuthors,
      year: newYear,
      type: newType,
      metrics: newMetrics || "Citations: 0"
    };

    setPublications(prev => [...prev, newPub]);
    toast.success("Publication record registered successfully!");

    // Reset Form
    setNewTitle("");
    setNewVenue("");
    setNewAuthors("");
    setNewYear("");
    setNewMetrics("");
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this publication record?")) return;
    setPublications(prev => prev.filter(p => p.id !== id));
    toast.success("Publication record removed.");
  };

  const filteredPublications = publications.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.venue.toLowerCase().includes(search.toLowerCase()) ||
                          p.authors.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === "All" || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const citationChartData = [
    { year: "2020", citations: 15 },
    { year: "2021", citations: 32 },
    { year: "2022", citations: 58 },
    { year: "2023", citations: 86 },
    { year: "2024", citations: 93 }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scholarly Publications"
        desc="Manage your research journals, conference proceedings, books, and citations dashboard."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Publications", value: String(publications.length), tone: "info" as const },
          { label: "Journal Papers (SCI/Scopus)", value: String(publications.filter(p => p.type === "Journal").length), tone: "success" as const },
          { label: "Conference Papers", value: String(publications.filter(p => p.type === "Conference").length), tone: "warn" as const },
          { label: "Google Scholar Citations", value: "93", tone: "success" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Scholar Core
            </Badge>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-semibold text-base">Scholarly Works Bibliography</h3>
            <div className="flex gap-2">
              {["All", "Journal", "Conference", "Book Chapter"].map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    typeFilter === type 
                      ? "bg-indigo-600 text-white" 
                      : "border bg-background hover:bg-accent"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              placeholder="Search publications by title, authors, journal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2 text-sm focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {["Publication ID & Title", "Venue & Journal", "Authors", "Type", "Metrics", "Actions"].map(col => (
                    <th key={col} className="text-left py-3 px-4 font-semibold text-muted-foreground">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPublications.length > 0 ? (
                  filteredPublications.map(p => (
                    <tr key={p.id} className="hover:bg-accent/40 transition">
                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-semibold text-xs text-indigo-600 font-mono mb-1">{p.id}</div>
                        <div className="font-medium text-sm leading-snug">{p.title}</div>
                        <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="size-3" /> Published Year: {p.year}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-muted-foreground">{p.venue}</td>
                      <td className="py-4 px-4 text-xs italic">{p.authors}</td>
                      <td className="py-4 px-4">
                        <Badge tone={p.type === "Journal" ? "success" : p.type === "Conference" ? "warn" : "info"}>
                          {p.type}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold">{p.metrics}</td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No publication records matches found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          {/* Add Publication Form */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Plus className="size-5 text-indigo-600" />
              <h3 className="font-semibold text-base">Register Publication</h3>
            </div>
            <form onSubmit={handleAddPublication} className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Paper / Book Title</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Federated Learning for Smart Systems..."
                  className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="Journal">Journal Article</option>
                  <option value="Conference">Conference Proceeding</option>
                  <option value="Book Chapter">Book Chapter</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Journal / Conference Name</label>
                <input
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  placeholder="e.g. IEEE Transactions on Smart Microgrids..."
                  className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Authors List</label>
                <input
                  value={newAuthors}
                  onChange={(e) => setNewAuthors(e.target.value)}
                  placeholder="e.g. J. Smith, A. Kumar (comma separated)..."
                  className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Year</label>
                  <input
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="e.g. 2024"
                    className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Impact Factor / Indexing</label>
                  <input
                    value={newMetrics}
                    onChange={(e) => setNewMetrics(e.target.value)}
                    placeholder="e.g. IF: 5.8 or Citations: 4"
                    className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer transition"
              >
                <Plus className="size-4" /> Add Publication
              </button>
            </form>
          </Card>

          {/* Citations Progress */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Bookmark className="size-5 text-indigo-600" />
              <h3 className="font-semibold text-base">Citations Progress (Scopus/Scholar)</h3>
            </div>
            <div className="h-44 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={citationChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="year" stroke="#94A3B8" fontSize={9} />
                  <YAxis stroke="#94A3B8" fontSize={9} />
                  <Tooltip />
                  <Line type="monotone" dataKey="citations" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

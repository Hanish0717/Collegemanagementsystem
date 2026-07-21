import { useState } from "react";
import { Search, Sparkles, Plus, X } from "lucide-react";

interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: string;
}

export function StudentComplaints() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New feedback form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Academic");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const newItem: FeedbackItem = {
      id: `fb_${Date.now()}`,
      title,
      description,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      type,
    };

    setFeedbacks([newItem, ...feedbacks]);
    setTitle("");
    setDescription("");
    setType("Academic");
    setIsModalOpen(false);
  };

  const filteredFeedbacks = feedbacks.filter(
    (fb) =>
      fb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">

        <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <Sparkles className="size-3.5 text-indigo-500" />
          <span>Ask AI</span>
        </button>
      </div>

      {/* Action/Search Bar Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search feedbacks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f4f5f7] dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded-xl pl-3 pr-10 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-sm hover:opacity-90 transition shrink-0"
        >
          <Plus className="size-3.5 stroke-[3]" />
          <span>New</span>
        </button>
      </div>

      {/* Feedbacks Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 font-bold text-slate-900 dark:text-white">Title</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white">Description</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white">Start Date</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white">End Date</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white">Type</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold text-xs">
                    No results.
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((fb) => (
                  <tr key={fb.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{fb.title}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 font-medium max-w-xs truncate">{fb.description}</td>
                    <td className="p-4 font-mono font-semibold text-slate-700 dark:text-slate-300">{fb.startDate}</td>
                    <td className="p-4 font-mono font-semibold text-slate-700 dark:text-slate-300">{fb.endDate}</td>
                    <td className="p-4 font-semibold text-slate-500">{fb.type}</td>
                    <td className="p-4 text-center">
                      <button className="text-indigo-600 font-bold hover:underline">View Details</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog for New Feedback Request */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Submit New Feedback</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold">Feedback Title</label>
                <input
                  type="text"
                  placeholder="Enter a brief title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#f4f5f7] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold">Feedback Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-[#f4f5f7] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-medium"
                >
                  <option value="Academic">Academic</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Canteen">Canteen</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold">Detailed Description</label>
                <textarea
                  placeholder="Write your feedback details here..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#f4f5f7] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-medium"
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

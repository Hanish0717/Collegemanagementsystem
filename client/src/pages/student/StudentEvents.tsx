import { useState } from "react";
import { Sparkles, MessageSquare, Search, Plus, X, Paperclip } from "lucide-react";

interface PostItem {
  id: string;
  course: string;
  title: string;
  content: string;
  date: string;
}

export function StudentEvents() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedSort, setSelectedSort] = useState("Most Recent");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Post Form State
  const [course, setCourse] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !title || !content) return;

    const newPost: PostItem = {
      id: `post_${Date.now()}`,
      course,
      title,
      content,
      date: new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    setPosts([newPost, ...posts]);
    setCourse("");
    setTitle("");
    setContent("");
    setIsModalOpen(false);
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase())
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

      {/* Posts Tab Pill */}
      <div className="flex items-center">
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#e0f2fe] text-[#0284c7] font-bold text-xs shadow-sm">
          <MessageSquare className="size-3.5 stroke-[2.5]" />
          <span>Posts</span>
        </div>
      </div>

      {/* Action / Search Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search Posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f4f5f7] dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded-xl pl-3 pr-10 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="bg-[#f4f5f7] dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none"
        >
          <option value="All Subjects">All Subjects</option>
          <option value="Web Technologies">Web Technologies</option>
          <option value="OOAD">OOAD</option>
          <option value="Business Analysis">Business Analysis</option>
        </select>

        <select
          value={selectedSort}
          onChange={(e) => setSelectedSort(e.target.value)}
          className="bg-[#f4f5f7] dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none"
        >
          <option value="Most Recent">Most Recent</option>
          <option value="Top Voted">Top Voted</option>
        </select>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-sm hover:opacity-90 transition shrink-0"
        >
          <Plus className="size-3.5 stroke-[3]" />
          <span>Create Post</span>
        </button>
      </div>

      {/* Main Forum Posts Body */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[300px]">
        {filteredPosts.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-500 font-semibold text-xs">
            No posts found. Be the first to start the discussion!
          </div>
        ) : (
          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
            {filteredPosts.map((post, idx) => (
              <div key={post.id} className={`pt-4 ${idx === 0 ? "pt-0" : ""}`}>
                <div className="flex items-center gap-2">
                  <span className="bg-[#e0f2fe] text-[#0284c7] font-bold px-2.5 py-0.5 rounded text-[10px]">
                    {post.course}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold font-mono">{post.date}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{post.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-1 whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create New Post Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white">Create New Post</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-650">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold">
                  <span className="text-red-500 mr-0.5">*</span>Course
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full bg-[#f4f5f7] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-medium"
                  required
                >
                  <option value="">Select a course</option>
                  <option value="Web Technologies">Web Technologies</option>
                  <option value="OOAD and Design Patterns">OOAD and Design Patterns</option>
                  <option value="Business Analysis">Business Analysis</option>
                  <option value="Statistical Analytics">Statistical Analytics</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-bold">
                    Title<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono font-medium">{title.length}/200</span>
                </div>
                <input
                  type="text"
                  maxLength={200}
                  placeholder="Enter post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#f4f5f7] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold">
                  Content<span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {/* Rich Text Editor Style Formatting Bar */}
                  <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <button type="button" className="font-extrabold hover:text-slate-800 dark:hover:text-white">B</button>
                    <button type="button" className="italic hover:text-slate-800 dark:hover:text-white">I</button>
                    <button type="button" className="hover:text-slate-800 dark:hover:text-white font-mono">1.</button>
                    <button type="button" className="hover:text-slate-800 dark:hover:text-white font-mono">•</button>
                    <button type="button" className="hover:text-slate-800 dark:hover:text-white font-mono">🔗</button>
                  </div>
                  <textarea
                    placeholder="Enter content..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 text-xs bg-white dark:bg-slate-900 focus:outline-none text-slate-900 dark:text-white font-medium"
                    rows={5}
                    required
                  />
                </div>
              </div>

              {/* Attachment link */}
              <button
                type="button"
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white transition font-bold"
              >
                <Paperclip className="size-3.5" />
                <span>Add Attachments</span>
              </button>

              {/* Footer */}
              <div className="flex justify-start items-center gap-4 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold"
                >
                  Create Post
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-500 hover:text-slate-700 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

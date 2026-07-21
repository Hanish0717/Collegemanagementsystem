import { useState, useEffect } from "react";
import { Search, Filter, Sparkles, Calendar, AlertTriangle, ThumbsUp, Heart, Smile, HelpCircle, FolderX, Send, CheckCircle2, ChevronRight } from "lucide-react";
import { Badge, Card } from "@/components/dashboard/ui";
import api from "@/lib/api";

export function StudentNoticeBoard() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);

  // AI Assistant Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Reaction State Tracker
  const [userReactions, setUserReactions] = useState<Record<string, Record<string, boolean>>>({});
  const [noticeReactions, setNoticeReactions] = useState<Record<string, { likes: number; hearts: number; smiles: number; questions: number }>>({});

  // Poll Voting Tracker
  const [pollVotes, setPollVotes] = useState<Record<string, string>>({});

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/student-module/notices");
      if (res.data?.success && res.data?.data) {
        const rawNotices = res.data.data;
        setNotices(rawNotices);

        // Initialize reaction counts
        const initialReactions: Record<string, any> = {};
        rawNotices.forEach((n: any) => {
          initialReactions[n.id] = n.reactions || { likes: 12, hearts: 5, smiles: 8, questions: 2 };
        });
        setNoticeReactions(initialReactions);
      }
    } catch (err) {
      console.error("Error fetching notices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const tabs = ["All", "Posts", "Announcements", "Polls", "Urgent Notices"];

  const filteredNotices = notices.filter(n => {
    const query = search.toLowerCase();
    const matchesSearch =
      n.title.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query) ||
      (n.author && n.author.toLowerCase().includes(query));

    let matchesTab = true;
    if (activeTab === "Posts") matchesTab = n.type === "Posts" || n.category === "General";
    else if (activeTab === "Announcements") matchesTab = n.type === "Announcements" || n.category === "Announcement";
    else if (activeTab === "Polls") matchesTab = n.type === "Polls" || n.category === "Poll";
    else if (activeTab === "Urgent Notices") matchesTab = n.type === "Urgent Notices" || n.priority === "High" || n.category === "Urgent";

    return matchesSearch && matchesTab;
  });

  const toggleReaction = (noticeId: string, reactionType: "likes" | "hearts" | "smiles" | "questions") => {
    const isAlreadyReacted = userReactions[noticeId]?.[reactionType];

    setUserReactions(prev => ({
      ...prev,
      [noticeId]: {
        ...(prev[noticeId] || {}),
        [reactionType]: !isAlreadyReacted
      }
    }));

    setNoticeReactions(prev => ({
      ...prev,
      [noticeId]: {
        ...prev[noticeId],
        [reactionType]: Math.max(0, (prev[noticeId]?.[reactionType] || 0) + (isAlreadyReacted ? -1 : 1))
      }
    }));
  };

  const handleVote = (noticeId: string, optionId: string) => {
    setPollVotes(prev => ({ ...prev, [noticeId]: optionId }));
    setNotices(prev =>
      prev.map(n => {
        if (n.id === noticeId && n.poll) {
          const updatedOptions = n.poll.options.map((opt: any) =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          );
          return { ...n, poll: { ...n.poll, options: updatedOptions, userVoted: optionId } };
        }
        return n;
      })
    );
  };

  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiAnswer(null);

    setTimeout(() => {
      const queryLower = aiQuery.toLowerCase();
      if (queryLower.includes("drive") || queryLower.includes("soft suave") || queryLower.includes("placement")) {
        setAiAnswer("📢 **Soft Suave Campus Drive Update**:\nScheduled for 20th & 21st September 2025 for all final-year registered students. Reporting time: 9:00 AM at the Placement Cell Auditorium.");
      } else if (queryLower.includes("exam") || queryLower.includes("admit card") || queryLower.includes("hall ticket")) {
        setAiAnswer("🎟️ **Exam & Hall Ticket Update**:\nEnd-Semester Regular Exams commence in November. Admit cards will be released on Sept 25th upon fee clearance.");
      } else if (queryLower.includes("project") || queryLower.includes("submission")) {
        setAiAnswer("📚 **Project Submission Deadline**:\nDr P Rsantosh Naidu requested PDF documentation and GitHub repo links to be uploaded on LMS by July 10th.");
      } else {
        setAiAnswer(`✨ Found 3 recent notices matching "${aiQuery}". All active circulars are listed below with official dates and dean approval.`);
      }
      setAiLoading(false);
    }, 800);
  };

  // High priority notices for right sidebar
  const highPriorityNotices = notices.filter(n => n.priority === "High" || n.category === "Urgent");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-slate-800">
      {/* Top Breadcrumb & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">

        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="size-4 text-amber-400" />
          <span>Ask AI</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-3 text-sm bg-white border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/20 shadow-xs"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        </div>

        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-xs shrink-0 cursor-pointer">
          <Filter className="size-4 text-slate-500" />
          <span>Filters</span>
        </button>
      </div>

      {/* Category Pills Bar */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <h2 className="text-sm font-bold text-slate-800 tracking-tight">Important Notices</h2>
      </div>

      {/* Main Grid: Feed (Left) & Widgets (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Notice Feed Cards */}
        <div className="lg:col-span-8 space-y-4">
          {loading ? (
            [1, 2, 3].map((n) => (
              <div key={n} className="h-44 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
            ))
          ) : filteredNotices.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 space-y-2">
              <FolderX className="size-10 mx-auto text-slate-300" />
              <p className="text-sm font-medium text-slate-600">No notices found</p>
              <p className="text-xs">Try searching for a different keyword or switching filter tabs.</p>
            </div>
          ) : (
            filteredNotices.map((notice) => {
              const isExpanded = expandedNoticeId === notice.id;
              const reactions = noticeReactions[notice.id] || notice.reactions || { likes: 0, hearts: 0, smiles: 0, questions: 0 };
              const uReact = userReactions[notice.id] || {};

              return (
                <div
                  key={notice.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs transition hover:border-slate-300 relative"
                >
                  {/* Header: Author Avatar & Category Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-slate-200 text-slate-700 font-bold text-xs grid place-items-center shrink-0">
                        {notice.avatarInitials || (notice.author ? notice.author.slice(0, 2).toUpperCase() : "DM")}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">{notice.author || "Dr M Sunil Prakash"}</span>
                          {notice.designation && (
                            <>
                              <span className="text-slate-300 font-light">|</span>
                              <span className="text-[11px] font-medium text-slate-500 tracking-wide uppercase">
                                {notice.designation}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{notice.date}</div>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 rounded-full text-xs font-semibold shrink-0">
                      {notice.category || "Announcement"}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="mt-4 space-y-2">
                    <h3 className="font-semibold text-sm text-slate-900 leading-snug">
                      {notice.title}
                    </h3>

                    <p className={`text-xs text-slate-600 leading-relaxed whitespace-pre-line ${!isExpanded ? "line-clamp-3" : ""}`}>
                      {notice.content}
                    </p>

                    {notice.content && notice.content.length > 140 && (
                      <button
                        onClick={() => setExpandedNoticeId(isExpanded ? null : notice.id)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer inline-block pt-1"
                      >
                        {isExpanded ? "Show less" : "Read more"}
                      </button>
                    )}
                  </div>

                  {/* Interactive Poll Section if applicable */}
                  {notice.poll && (
                    <div className="mt-4 p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <span>📊 Interactive Student Poll</span>
                      </div>
                      <div className="space-y-2">
                        {notice.poll.options.map((opt: any) => {
                          const totalVotes = notice.poll.options.reduce((sum: number, o: any) => sum + o.votes, 0);
                          const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                          const isVoted = pollVotes[notice.id] === opt.id || notice.poll.userVoted === opt.id;

                          return (
                            <div
                              key={opt.id}
                              onClick={() => handleVote(notice.id, opt.id)}
                              className={`p-3 rounded-lg border text-xs cursor-pointer transition relative overflow-hidden ${
                                isVoted ? "border-slate-900 bg-white" : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <div
                                className="absolute left-0 top-0 bottom-0 bg-slate-100/90 transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                              <div className="relative z-10 flex justify-between items-center font-medium">
                                <span className="flex items-center gap-2">
                                  {isVoted && <CheckCircle2 className="size-3.5 text-slate-900 shrink-0" />}
                                  {opt.text}
                                </span>
                                <span className="font-bold text-slate-700 ml-2">{pct}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Reaction Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-6 text-slate-500 text-xs">
                    <button
                      onClick={() => toggleReaction(notice.id, "likes")}
                      className={`flex items-center gap-1.5 transition cursor-pointer hover:text-slate-900 ${
                        uReact.likes ? "text-slate-900 font-bold" : ""
                      }`}
                    >
                      <ThumbsUp className={`size-4 ${uReact.likes ? "fill-slate-900 text-slate-900" : ""}`} />
                      <span>{reactions.likes}</span>
                    </button>

                    <button
                      onClick={() => toggleReaction(notice.id, "hearts")}
                      className={`flex items-center gap-1.5 transition cursor-pointer hover:text-rose-500 ${
                        uReact.hearts ? "text-rose-500 font-bold" : ""
                      }`}
                    >
                      <Heart className={`size-4 ${uReact.hearts ? "fill-rose-500 text-rose-500" : ""}`} />
                      <span>{reactions.hearts}</span>
                    </button>

                    <button
                      onClick={() => toggleReaction(notice.id, "smiles")}
                      className={`flex items-center gap-1.5 transition cursor-pointer hover:text-amber-500 ${
                        uReact.smiles ? "text-amber-500 font-bold" : ""
                      }`}
                    >
                      <Smile className={`size-4 ${uReact.smiles ? "text-amber-500" : ""}`} />
                      <span>{reactions.smiles}</span>
                    </button>

                    <button
                      onClick={() => toggleReaction(notice.id, "questions")}
                      className={`flex items-center gap-1.5 transition cursor-pointer hover:text-blue-500 ${
                        uReact.questions ? "text-blue-500 font-bold" : ""
                      }`}
                    >
                      <HelpCircle className={`size-4 ${uReact.questions ? "text-blue-500" : ""}`} />
                      <span>{reactions.questions}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Widgets */}
        <div className="lg:col-span-4 space-y-4">
          {/* Widget 1: Upcoming Deadlines */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800 mb-4">
              <Calendar className="size-4 text-slate-600" />
              <span>Upcoming Deadlines</span>
            </div>

            <div className="py-8 text-center text-slate-400 space-y-2">
              <div className="size-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                📁✖️
              </div>
              <p className="text-xs text-slate-500 font-medium mt-2">No upcoming deadlines</p>
            </div>
          </div>

          {/* Widget 2: High Priority */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800 mb-4">
              <AlertTriangle className="size-4 text-rose-500" />
              <span>High Priority</span>
            </div>

            {highPriorityNotices.length > 0 ? (
              <div className="space-y-3">
                {highPriorityNotices.map((hp) => (
                  <div key={hp.id} className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1">
                    <div className="text-xs font-bold text-rose-900 leading-snug">{hp.title}</div>
                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>{hp.author}</span>
                      <span className="font-semibold text-rose-600">{hp.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <div className="size-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                  📁✖️
                </div>
                <p className="text-xs text-slate-500 font-medium mt-2">No high priority notices</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Sparkles className="size-5 text-amber-500" />
                <span>Notice Board AI Assistant</span>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold rounded-lg p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Ask anything about circulars, campus placement drives, exam schedules, or submission deadlines!
            </p>

            <form onSubmit={handleAskAi} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. When is the Soft Suave campus drive?"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900 text-white rounded-xl text-xs hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="size-3.5" />
                </button>
              </div>
            </form>

            {aiLoading && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500 animate-pulse text-center">
                ✨ Scanning notice board circulars...
              </div>
            )}

            {aiAnswer && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                {aiAnswer}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

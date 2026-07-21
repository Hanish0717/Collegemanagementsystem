import { useState } from "react";
import { Sparkles, Search, Filter, MoreVertical, Info, ClipboardCheck, Download } from "lucide-react";

interface UpdateItem {
  id: string;
  title: string;
  date: string;
  type: "info" | "check";
  badges: string[];
  attachments?: string[];
}

export function StudentPlatformUpdates() {
  const [searchQuery, setSearchQuery] = useState("");

  const updates: UpdateItem[] = [
    {
      id: "up_1",
      title: "🔒 Platform Update: OTP Verification for Student Payments",
      date: "27 June 2026",
      type: "check",
      badges: ["New Feature", "Pinned", "Unread"]
    },
    {
      id: "up_2",
      title: "📣 Going live soon: Upgraded Student Full View",
      date: "22 June 2026",
      type: "info",
      badges: ["Enhancement", "Pinned", "Unread"],
      attachments: ["Student_Full_View_User_Manual.pdf"]
    },
    {
      id: "up_3",
      title: "🎉 CMS achieves 1EdTech LTI Advantage Complete Certification",
      date: "17 June 2026",
      type: "check",
      badges: ["New Feature", "Unread"]
    },
    {
      id: "up_4",
      title: "🔒 Open Results Page access — Authentication Required",
      date: "24 April 2026",
      type: "info",
      badges: ["Enhancement"]
    }
  ];

  const filteredUpdates = updates.filter(u =>
    u.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">

        <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <Sparkles className="size-3.5 text-indigo-500" />
          <span>Ask AI</span>
        </button>
      </div>

      {/* Search & Actions Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search updates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f4f5f7] dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded-xl pl-3 pr-10 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        </div>

        <button className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold shadow-sm hover:bg-slate-50 transition">
          <Filter className="size-3.5 text-slate-500" />
          <span>Filter</span>
        </button>

        <button className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 hover:bg-slate-50 transition">
          <MoreVertical className="size-4 text-slate-500" />
        </button>
      </div>

      {/* Dotted Timeline & Cards container */}
      <div className="relative pl-12 space-y-8">
        {/* Vertical dotted timeline line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 border-l-2 border-dashed border-slate-200 dark:border-slate-800"></div>

        {filteredUpdates.map((item) => (
          <div key={item.id} className="relative group">
            {/* Timeline Icon bubble on the left */}
            <div className="absolute -left-[45px] top-3 size-8 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-450 shadow-sm z-10">
              {item.type === "check" ? (
                <ClipboardCheck className="size-4 text-slate-500" />
              ) : (
                <Info className="size-4 text-slate-500" />
              )}
            </div>

            {/* Content card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow transition duration-200">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </h3>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 shrink-0 select-none">
                  {item.date}
                </span>
              </div>

              {/* Badges row */}
              <div className="flex flex-wrap gap-2 text-[10px] font-extrabold select-none">
                {item.badges.map((badge, idx) => {
                  let colorClass = "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-450";
                  if (badge === "Pinned") {
                    colorClass = "bg-[#e0f2fe] text-[#0369a1] dark:bg-[#075985]/20 dark:text-sky-400";
                  } else if (badge === "Unread") {
                    colorClass = "bg-[#ffedd5] text-[#c2410c] dark:bg-[#7c2d12]/20 dark:text-orange-400";
                  } else if (badge === "Enhancement") {
                    colorClass = "bg-[#dcfce7] text-[#15803d] dark:bg-[#14532d]/25 dark:text-green-400";
                  }

                  return (
                    <span key={idx} className={`px-2.5 py-0.5 rounded ${colorClass}`}>
                      {badge}
                    </span>
                  );
                })}
              </div>

              {/* Attachments Section if present */}
              {item.attachments && item.attachments.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-black text-slate-450 uppercase tracking-wide block">
                    Attachments
                  </span>
                  {item.attachments.map((file, fIdx) => (
                    <div
                      key={fIdx}
                      onClick={() => alert(`Simulated download of ${file}`)}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-150 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/50 hover:bg-slate-50 transition cursor-pointer max-w-sm"
                    >
                      <svg className="size-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate flex-1">
                        {file}
                      </span>
                      <Download className="size-3.5 text-slate-450 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

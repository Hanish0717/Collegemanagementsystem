import { useState } from "react";
import { Sparkles, Info } from "lucide-react";

function EmptyStateGraphic({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center space-y-4 select-none">
      <div className="relative size-32 flex items-center justify-center">
        {/* Beautiful 3D red box graphic matching the screenshot */}
        <div className="w-24 h-20 bg-rose-600 rounded-2xl shadow-xl transform -rotate-6 flex items-center justify-center relative border border-rose-500">
          <div className="w-18 h-14 bg-rose-700 rounded-xl" />
          <div className="absolute -top-5 -right-4 bg-indigo-950 text-white text-base font-black px-3.5 py-1 rounded-full shadow-lg border-2 border-indigo-400">
            0
          </div>
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
        <p className="text-xs text-slate-500 font-medium">{desc}</p>
      </div>
    </div>
  );
}

export function StudentAssignments() {
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">

        <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <Sparkles className="size-3.5 text-indigo-500" />
          <span>Ask AI</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-3.5 py-1.5 rounded-lg text-xs transition whitespace-nowrap ${
            activeTab === "active"
              ? "bg-[#e0f2fe] text-[#0284c7] font-bold"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          Active Assignments
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-3.5 py-1.5 rounded-lg text-xs transition whitespace-nowrap ${
            activeTab === "completed"
              ? "bg-[#e0f2fe] text-[#0284c7] font-bold"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          Completed Assignments
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[400px] flex flex-col justify-center">
        <h2 className="text-base font-bold text-slate-900 dark:text-white self-start mb-4">
          Integrated Assignments
        </h2>

        {activeTab === "active" ? (
          <EmptyStateGraphic
            title="No Items Found"
            desc="No Active Integrated Assignments"
          />
        ) : (
          <EmptyStateGraphic
            title="No Items Found"
            desc="No Completed Integrated Assignments"
          />
        )}
      </div>
    </div>
  );
}

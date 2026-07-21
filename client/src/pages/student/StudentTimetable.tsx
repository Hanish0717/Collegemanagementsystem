import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";

export function StudentTimetable() {
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  // Render dummy dates for July 2026 calendar view matching the screenshot
  const calendarWeeks = [
    // Week 1
    [
      { dayNum: 28, isMuted: true },
      { dayNum: 29, isMuted: true, label: "+2 more" },
      { dayNum: 30, isMuted: true, label: "+3 more" },
      { dayNum: 1, label: "+2 more" },
      { dayNum: 2 },
      { dayNum: 3 },
      { dayNum: 4, label: "+2 more" },
    ],
    // Week 2
    [
      { dayNum: 5 },
      { dayNum: 6, label: "+2 more" },
      { dayNum: 7, label: "+3 more" },
      { dayNum: 8, event: "Mini Project - A" },
      { dayNum: 9 },
      { dayNum: 10 },
      { dayNum: 11, label: "+2 more" },
    ],
    // Week 3
    [
      { dayNum: 12 },
      { dayNum: 13, label: "+2 more" },
      { dayNum: 14, label: "+3 more" },
      { dayNum: 15, event: "Mini Project - A" },
      { dayNum: 16 },
      { dayNum: 17 },
      { dayNum: 18, label: "+2 more" },
    ],
    // Week 4
    [
      { dayNum: 19 },
      { dayNum: 20, label: "+2 more" },
      { dayNum: 21, label: "+3 more", isActive: true },
      { dayNum: 22, event: "Mini Project - A" },
      { dayNum: 23 },
      { dayNum: 24 },
      { dayNum: 25, label: "+2 more" },
    ],
    // Week 5
    [
      { dayNum: 26 },
      { dayNum: 27, label: "+2 more" },
      { dayNum: 28, label: "+3 more" },
      { dayNum: 29, event: "Mini Project - A" },
      { dayNum: 30 },
      { dayNum: 31 },
      { dayNum: 1, isMuted: true, label: "+2 more" },
    ],
    // Week 6
    [
      { dayNum: 2, isMuted: true },
      { dayNum: 3, isMuted: true, label: "+2 more" },
      { dayNum: 4, isMuted: true, label: "+3 more" },
      { dayNum: 5, isMuted: true, event: "Mini Project - A" },
      { dayNum: 6, isMuted: true },
      { dayNum: 7, isMuted: true },
      { dayNum: 8, isMuted: true, label: "+2 more" },
    ]
  ];

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">

        <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <Sparkles className="size-3.5 text-indigo-500" />
          <span>Ask AI</span>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-base font-extrabold text-slate-900 dark:text-white">My Timetable</h1>
      </div>

      {/* Sub-bar: Instructions & Refresh */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm text-xs">
        <span className="text-slate-500 font-medium">
          Click on any class to view details. 824 scheduled classes.
        </span>
        <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <RefreshCw className="size-3 text-slate-500" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Calendar Nav Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50">&lt;</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50">&gt;</button>
            <button className="ml-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-slate-800 text-xs font-semibold hover:bg-slate-800">Today</button>
          </div>

          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">July 2026</h2>

          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded text-xs font-bold transition ${
                viewMode === "month"
                  ? "bg-slate-900 text-white dark:bg-slate-700"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded text-xs font-bold transition ${
                viewMode === "week"
                  ? "bg-slate-900 text-white dark:bg-slate-700"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded text-xs font-bold transition ${
                viewMode === "day"
                  ? "bg-slate-900 text-white dark:bg-slate-700"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Day
            </button>
          </div>
        </div>

        {/* Days Columns Headers */}
        <div className="grid grid-cols-7 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider py-1.5 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl">
          <span>SUN</span>
          <span>MON</span>
          <span>TUE</span>
          <span>WED</span>
          <span>THU</span>
          <span>FRI</span>
          <span>SAT</span>
        </div>

        {/* Dates & Events Grid */}
        <div className="grid grid-cols-7 border-t border-l border-slate-100 dark:border-slate-800 text-xs">
          {calendarWeeks.flatMap((week, wIdx) =>
            week.map((day, dIdx) => (
              <div
                key={`${wIdx}-${dIdx}`}
                className="min-h-[85px] border-r border-b border-slate-100 dark:border-slate-800 p-2 flex flex-col justify-between hover:bg-slate-50/30 transition group relative"
              >
                {/* Date Number */}
                <span
                  className={`size-6 flex items-center justify-center font-bold self-start rounded-full text-[11px] ${
                    day.isMuted
                      ? "text-slate-300 dark:text-slate-600"
                      : day.isActive
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {day.dayNum}
                </span>

                {/* Event or Muted label */}
                {day.event ? (
                  <div className="bg-slate-950 text-white dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm mt-1 select-none">
                    <span className="size-1.5 bg-white rounded-full shrink-0" />
                    <span className="truncate">3p Mini Project - A</span>
                  </div>
                ) : day.label ? (
                  <span className="text-[10px] text-slate-400 font-medium mt-auto block">
                    {day.label}
                  </span>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

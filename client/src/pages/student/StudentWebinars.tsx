import { useState } from "react";
import { Sparkles } from "lucide-react";

type WebinarTab = "all" | "upcoming" | "recordings";

export function StudentWebinars() {
  const [activeTab, setActiveTab] = useState<WebinarTab>("all");

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">

        <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <Sparkles className="size-3.5 text-indigo-500" />
          <span>Ask AI</span>
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        {(["all", "upcoming", "recordings"] as WebinarTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition capitalize ${
              activeTab === tab
                ? "bg-[#e0f2fe] text-[#0369a1] dark:bg-[#075985]/35 dark:text-sky-300"
                : "text-slate-500 hover:text-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Center Empty State Illustration */}
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        {/* SVG mockup of the 3D red box with blue zero notification speech bubble */}
        <div className="relative w-48 h-48 flex items-center justify-center select-none scale-110">
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Sparkle rays around the box */}
            <path d="M40 50L30 45" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M35 70L25 70" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M42 90L32 95" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
            
            <path d="M140 50L150 45" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M145 70L155 70" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* 3D Box shadow */}
            <ellipse cx="90" cy="140" rx="45" ry="10" fill="#e2e8f0" fillOpacity="0.8" className="dark:fill-slate-800/40" />

            {/* Red Box back/inner */}
            <path d="M60 85L90 100L120 85L120 120L90 135L60 120V85Z" fill="#dc2626" />
            
            {/* Red Box Flaps */}
            {/* Left flap */}
            <path d="M60 85L40 98L70 108L90 100L60 85Z" fill="#ef4444" />
            {/* Right flap */}
            <path d="M120 85L140 98L110 108L90 100L120 85Z" fill="#b91c1c" />
            {/* Front flap */}
            <path d="M90 100L70 125H110L90 100Z" fill="#dc2626" />

            {/* Red Box front faces */}
            <path d="M60 90L90 105V135L60 120V90Z" fill="#ef4444" />
            <path d="M90 105L120 90V120L90 135V105Z" fill="#b91c1c" />

            {/* Blue Speech bubble pointing up with 0 inside */}
            <g filter="url(#shadow)">
              {/* Bubble body */}
              <rect x="72" y="30" width="36" height="30" rx="15" fill="#1e3a8a" />
              {/* Tail pointing down */}
              <path d="M90 68L84 58H96L90 68Z" fill="#1e3a8a" />
              {/* Text 0 */}
              <text x="90" y="50" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                0
              </text>
            </g>

            {/* Define Drop Shadow for bubble */}
            <defs>
              <filter id="shadow" x="65" y="25" width="50" height="50" filterUnits="userSpaceOnUse">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
              </filter>
            </defs>
          </svg>
        </div>

        <p className="text-xs font-bold text-slate-900 dark:text-white">
          No webinars found.
        </p>
      </div>
    </div>
  );
}

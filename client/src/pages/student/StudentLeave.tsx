import { useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Sparkles, Search, Plus, SlidersHorizontal, ChevronDown, ArrowLeft, X } from "lucide-react";

type SubModule = "gate-pass" | "punch-logs" | "attendance";

interface GatePassRequest {
  id: string;
  requestId: string;
  type: string;
  exitDateTime: string;
  entryDateTime: string;
  requestedDate: string;
  lastModifiedDate: string;
  status: string;
}

export function StudentLeave() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const currentView = (queryParams.get("tab") as SubModule) || "gate-pass";

  // Gate Pass State
  const [gatePasses, setGatePasses] = useState<GatePassRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gpType, setGpType] = useState("Outing");
  const [exitTime, setExitTime] = useState("");
  const [entryTime, setEntryTime] = useState("");

  const handleCreateGatePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitTime || !entryTime) return;

    const newGP: GatePassRequest = {
      id: `gp_${Date.now()}`,
      requestId: `GP-${Math.floor(100000 + Math.random() * 900000)}`,
      type: gpType,
      exitDateTime: exitTime.replace("T", " "),
      entryDateTime: entryTime.replace("T", " "),
      requestedDate: new Date().toISOString().split("T")[0] + " " + new Date().toTimeString().split(" ")[0].slice(0, 5),
      lastModifiedDate: new Date().toISOString().split("T")[0] + " " + new Date().toTimeString().split(" ")[0].slice(0, 5),
      status: "Pending",
    };

    setGatePasses([newGP, ...gatePasses]);
    setExitTime("");
    setEntryTime("");
    setIsModalOpen(false);
  };

  const filteredGatePasses = gatePasses.filter(
    (gp) =>
      gp.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gp.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigateToTab = (tab: SubModule) => {
    navigate({ to: `/dashboard/student/leave?tab=${tab}` });
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">

        <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <Sparkles className="size-3.5 text-indigo-500" />
          <span>Ask AI</span>
        </button>
      </div>

      {/* RENDER VIEW: GATE PASS */}
      {currentView === "gate-pass" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Action Row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f4f5f7] dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded-xl pl-3 pr-10 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-sm hover:opacity-90 transition shrink-0"
            >
              <Plus className="size-3.5 stroke-[3]" />
              <span>New Request</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4">Request ID</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Exit Date Time</th>
                    <th className="p-4">Entry Date Time</th>
                    <th className="p-4">Requested Date</th>
                    <th className="p-4">Last Modified Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredGatePasses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 font-semibold text-xs">
                        No results.
                      </td>
                    </tr>
                  ) : (
                    filteredGatePasses.map((gp) => (
                      <tr key={gp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="p-4 font-mono font-bold text-indigo-600">{gp.requestId}</td>
                        <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{gp.type}</td>
                        <td className="p-4 font-mono">{gp.exitDateTime}</td>
                        <td className="p-4 font-mono">{gp.entryDateTime}</td>
                        <td className="p-4 font-mono text-slate-500">{gp.requestedDate}</td>
                        <td className="p-4 font-mono text-slate-500">{gp.lastModifiedDate}</td>
                        <td className="p-4">
                          <span className="bg-[#fef3c7] text-[#d97706] font-bold px-2.5 py-0.5 rounded text-[10px]">
                            {gp.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button className="text-indigo-650 font-bold hover:underline">View Details</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 bg-slate-50/40 dark:bg-slate-800/20">
              <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 bg-white dark:bg-slate-950 select-none cursor-pointer">
                <span>10 / Page</span>
                <ChevronDown className="size-3 text-slate-400" />
              </div>

              <div className="flex items-center gap-3">
                <button className="text-slate-400 hover:text-slate-655">&lt; Previous</button>
                <button className="text-slate-400 hover:text-slate-655">Next &gt;</button>
              </div>

              <div>
                {filteredGatePasses.length === 0 ? "No records" : `${filteredGatePasses.length} records`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW: HOSTEL PUNCH LOGS */}
      {currentView === "punch-logs" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Filters Button */}
          <div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold shadow-sm hover:bg-slate-50 transition">
              <SlidersHorizontal className="size-3.5 text-slate-500" />
              <span>Filters</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4">Log Type</th>
                    <th className="p-4">Verify Type</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500 font-semibold text-xs">
                      No results.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 bg-slate-50/40 dark:bg-slate-800/20">
              <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 bg-white dark:bg-slate-950 select-none cursor-pointer">
                <span>10 / Page</span>
                <ChevronDown className="size-3 text-slate-400" />
              </div>

              <div className="flex items-center gap-3">
                <button className="text-slate-400 hover:text-slate-655">&lt; Previous</button>
                <button className="text-slate-400 hover:text-slate-655">Next &gt;</button>
              </div>

              <div>No records</div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW: HOSTEL ATTENDANCE */}
      {currentView === "attendance" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4">Date</th>
                    <th className="p-4">Hostel Block</th>
                    <th className="p-4">Hosteler Batch</th>
                    <th className="p-4">Room</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-semibold text-xs">
                      No results.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 bg-slate-50/40 dark:bg-slate-800/20">
              <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 bg-white dark:bg-slate-950 select-none cursor-pointer">
                <span>10 / Page</span>
                <ChevronDown className="size-3 text-slate-400" />
              </div>

              <div className="flex items-center gap-3">
                <button className="text-slate-400 hover:text-slate-655">&lt; Previous</button>
                <button className="text-slate-400 hover:text-slate-655">Next &gt;</button>
              </div>

              <div>No records</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for New Gate Pass Request */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">New Gate Pass Request</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-655">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGatePass} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold">Request Type</label>
                <select
                  value={gpType}
                  onChange={(e) => setGpType(e.target.value)}
                  className="w-full bg-[#f4f5f7] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-medium"
                >
                  <option value="Outing">Outing</option>
                  <option value="Home Sick Leave">Home Sick Leave</option>
                  <option value="Vacation">Vacation</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold">Exit Date & Time</label>
                <input
                  type="datetime-local"
                  value={exitTime}
                  onChange={(e) => setExitTime(e.target.value)}
                  className="w-full bg-[#f4f5f7] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold">Expected Entry Date & Time</label>
                <input
                  type="datetime-local"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  className="w-full bg-[#f4f5f7] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-medium"
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
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Search, Sparkles, SlidersHorizontal, Plus, X } from "lucide-react";

interface ServiceRequest {
  id: string;
  serviceName: string;
  requestNumber: string;
  requestedDate: string;
  lastModified: string;
  status: string;
}

export function StudentServices() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Request Form State
  const [serviceName, setServiceName] = useState("Bonafide Certificate");
  const [purpose, setPurpose] = useState("");

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose) return;

    const newRequest: ServiceRequest = {
      id: `req_${Date.now()}`,
      serviceName,
      requestNumber: `REQ-${Math.floor(100000 + Math.random() * 900000)}`,
      requestedDate: new Date().toISOString().split("T")[0],
      lastModified: new Date().toISOString().split("T")[0],
      status: "Submitted",
    };

    setRequests([newRequest, ...requests]);
    setPurpose("");
    setIsModalOpen(false);
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

      {/* Action / Search Bar Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="No search available"
            disabled
            className="w-full bg-[#f4f5f7] dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded-xl pl-3 pr-10 py-2.5 text-xs text-slate-400 dark:text-slate-500 font-medium cursor-not-allowed select-none"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-350" />
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <SlidersHorizontal className="size-3.5 text-slate-500" />
          <span>Filters</span>
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-sm hover:opacity-90 transition shrink-0"
        >
          <Plus className="size-3.5 stroke-[3]" />
          <span>Create New Request</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 font-bold text-slate-900 dark:text-white">Service Name</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white">Request Number</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white">Requested Date</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white">Last Modified</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white">Status</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold text-xs">
                    No results.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{req.serviceName}</td>
                    <td className="p-4 font-mono font-bold text-indigo-600">{req.requestNumber}</td>
                    <td className="p-4 font-mono font-semibold text-slate-700 dark:text-slate-300">{req.requestedDate}</td>
                    <td className="p-4 font-mono font-semibold text-slate-700 dark:text-slate-300">{req.lastModified}</td>
                    <td className="p-4 font-semibold text-slate-500">{req.status}</td>
                    <td className="p-4 text-center">
                      <button className="text-indigo-600 font-bold hover:underline">View Details</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 bg-slate-50/40 dark:bg-slate-800/20">
          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 bg-white dark:bg-slate-900 select-none cursor-pointer">
            <span>10 / Page</span>
            <ChevronDown className="size-3 text-slate-400" />
          </div>

          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-slate-600">&lt; Previous</button>
            <button className="text-slate-400 hover:text-slate-600">Next &gt;</button>
          </div>

          <div>
            {requests.length === 0 ? "No records" : `${requests.length} records`}
          </div>
        </div>
      </div>

      {/* Modal Dialog for Create New Request */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Create New Request</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold">Service Type</label>
                <select
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full bg-[#f4f5f7] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-medium"
                >
                  <option value="Bonafide Certificate">Bonafide Certificate</option>
                  <option value="Fee Structure Certificate">Fee Structure Certificate</option>
                  <option value="ID Card Replacement Request">ID Card Replacement Request</option>
                  <option value="Conduct Certificate">Conduct Certificate</option>
                  <option value="Hostel Allocation Request">Hostel Allocation Request</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold">Purpose / Detailed Notes</label>
                <textarea
                  placeholder="Explain why you are requesting this service..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
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

function ChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

import { useState, useEffect } from "react";
import { Sparkles, Search, ExternalLink } from "lucide-react";
import api from "@/lib/api";

interface EResource {
  name: string;
  url: string;
}

export function StudentMaterials() {
  const [searchQuery, setSearchQuery] = useState("");
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      try {
        const res = await api.get("/api/library/issued");
        if (res.data?.success && res.data?.data) {
          setBorrowedBooks(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching library data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBorrowedBooks();
  }, []);

  const activeBooks = borrowedBooks.filter(b => b.status === "issued" || b.status === "overdue");
  const returnedBooks = borrowedBooks.filter(b => b.status === "returned");
  const overdueBooks = borrowedBooks.filter(b => b.status === "overdue");
  const totalFine = borrowedBooks.reduce((sum, b) => sum + Number(b.fineAmount || 0), 0);

  const eResources: EResource[] = [
    { name: "ABC for Chemistry", url: "https://www.google.com/search?q=ABC+for+Chemistry" },
    { name: "Academic Tutorials", url: "https://www.google.com/search?q=Academic+Tutorials" },
    { name: "Amrita Vishwa Vidyapeetham", url: "https://www.amrita.edu/" },
    { name: "Bright Storm Videos", url: "https://www.brightstorm.com/" },
    { name: "Britannica", url: "https://www.britannica.com/" },
    { name: "Cambridge Dictionary", url: "https://dictionary.cambridge.org/" },
    { name: "Civil Service Exams", url: "https://www.google.com/search?q=Civil+Service+Exams" },
    { name: "Computer Dictionary (Webopedi...", url: "https://www.webopedia.com/" }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
        <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <Sparkles className="size-3.5 text-indigo-500" />
          <span>Ask AI</span>
        </button>
      </div>

      {/* Greeting and Search Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white">
            Library Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            {activeBooks.length > 0 ? `You have ${activeBooks.length} active checkouts` : "No active library checkouts"}
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search the catalogue"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f4f5f7] dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        </div>
      </div>

      {/* Library Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Issued */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ISSUED</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {loading ? "..." : activeBooks.length}
          </p>
        </div>

        {/* Holds */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">HOLDS</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">0</p>
        </div>

        {/* Fines */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">FINES</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">₹{loading ? "..." : totalFine}</p>
          <span className="text-[10px] text-slate-400 font-bold block pt-0.5">
            {totalFine > 0 ? "Pending Payment" : "Cleared"}
          </span>
        </div>
      </div>

      {/* Interactive Library Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
        {/* Currently Issued */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Currently issued</h3>
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : activeBooks.length === 0 ? (
            <p className="text-slate-450 dark:text-slate-500 font-semibold">Nothing issued. Browse the catalogue.</p>
          ) : (
            <div className="space-y-2">
              {activeBooks.map(item => {
                const bookTitle = typeof item.book === "object" && item.book ? item.book.title : "Library Book";
                return (
                  <div key={item._id || item.id} className="flex justify-between items-center p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{bookTitle}</div>
                      <div className="text-[10px] text-slate-400">Taken: {item.issueDate} | Due: {item.dueDate}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${item.status === 'overdue' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Previously Issued */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Previously issued</h3>
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : returnedBooks.length === 0 ? (
            <p className="text-slate-450 dark:text-slate-500 font-semibold">No returned books yet.</p>
          ) : (
            <div className="space-y-2">
              {returnedBooks.map(item => {
                const bookTitle = typeof item.book === "object" && item.book ? item.book.title : "Library Book";
                return (
                  <div key={item._id || item.id} className="flex justify-between items-center p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{bookTitle}</div>
                      <div className="text-[10px] text-slate-400">Returned: {item.returnDate}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-600">
                      RETURNED
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Holds and Reservations */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Holds and reservations</h3>
          <p className="text-slate-450 dark:text-slate-500 font-semibold">No active holds.</p>
        </div>

        {/* Dues */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Dues</h3>
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : overdueBooks.length === 0 && totalFine === 0 ? (
            <p className="text-slate-450 dark:text-slate-500 font-semibold">No outstanding dues.</p>
          ) : (
            <div className="space-y-2">
              {overdueBooks.map(item => {
                const bookTitle = typeof item.book === "object" && item.book ? item.book.title : "Library Book";
                return (
                  <div key={item._id || item.id} className="flex justify-between items-center p-2.5 rounded-xl border border-rose-150 dark:border-rose-950/20 bg-rose-50/20">
                    <div>
                      <div className="font-semibold text-rose-700 dark:text-rose-400">{bookTitle} (Overdue)</div>
                      <div className="text-[10px] text-rose-500">Fine accrued: ₹{item.fineAmount || 0}</div>
                    </div>
                  </div>
                );
              })}
              {returnedBooks.filter(b => b.fineAmount > 0).map(item => {
                const bookTitle = typeof item.book === "object" && item.book ? item.book.title : "Library Book";
                return (
                  <div key={item._id || item.id} className="flex justify-between items-center p-2.5 rounded-xl border border-rose-150 dark:border-rose-950/20 bg-rose-50/20">
                    <div>
                      <div className="font-semibold text-slate-700 dark:text-slate-300">{bookTitle} (Returned late)</div>
                      <div className="text-[10px] text-rose-500 font-bold">Unpaid fine: ₹{item.fineAmount}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* E-resources Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
          E-resources
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-slate-700 dark:text-slate-350">
          {eResources.map((res, index) => (
            <a
              key={index}
              href={res.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-650 bg-white dark:bg-slate-900 rounded-xl transition shadow-sm"
            >
              <span className="truncate mr-2">{res.name}</span>
              <ExternalLink className="size-3.5 text-slate-400 shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Award, ShieldCheck, QrCode, FileText } from "lucide-react";
import { Badge, Card } from "@/components/dashboard/ui";
import api from "@/lib/api";

export function StudentHallTicket() {
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTicketType, setActiveTicketType] = useState<"regular" | "supplementary" | "internal" | null>(null);

  const fetchHallTicket = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/student-module/hall-ticket");
      if (res.data?.success && res.data?.data) {
        setTicket(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching hall ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHallTicket();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:p-0 print:m-0 pb-12">


      <div className="print:hidden">
        <h1 className="text-base font-extrabold text-slate-900 dark:text-white">Hall Tickets</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Hall Ticket services at your ease.</p>
      </div>

      {/* Main Student Card Info */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm print:hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
            alt="ADABALA AMRUTHA"
            className="size-24 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shadow-sm"
          />
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">ID</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">23331A4401</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Admission no.</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">-</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Candidate Name</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">ADABALA AMRUTHA 23331A4401</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Program</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">-</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Batch</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">-</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Blue Action Buttons/Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        <button
          onClick={() => setActiveTicketType(activeTicketType === "regular" ? null : "regular")}
          className={`h-24 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-sm p-5 text-left flex flex-col justify-between shadow-md transition transform hover:-translate-y-0.5 active:scale-95 ${
            activeTicketType === "regular" ? "ring-4 ring-indigo-500/30" : ""
          }`}
        >
          <span className="block">Regular Exam Hall Ticket</span>
          <FileText className="size-5 opacity-80" />
        </button>

        <button
          onClick={() => setActiveTicketType(activeTicketType === "supplementary" ? null : "supplementary")}
          className={`h-24 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-sm p-5 text-left flex flex-col justify-between shadow-md transition transform hover:-translate-y-0.5 active:scale-95 ${
            activeTicketType === "supplementary" ? "ring-4 ring-indigo-500/30" : ""
          }`}
        >
          <span className="block">Supplementary Exam Hall Ticket</span>
          <FileText className="size-5 opacity-80" />
        </button>

        <button
          onClick={() => setActiveTicketType(activeTicketType === "internal" ? null : "internal")}
          className={`h-24 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-sm p-5 text-left flex flex-col justify-between shadow-md transition transform hover:-translate-y-0.5 active:scale-95 ${
            activeTicketType === "internal" ? "ring-4 ring-indigo-500/30" : ""
          }`}
        >
          <span className="block">Internal Exam Hall Ticket</span>
          <FileText className="size-5 opacity-80" />
        </button>
      </div>

      {/* Dynamic Admit Card Details (Shown when a ticket type is selected) */}
      {activeTicketType === "regular" && (
        <div className="space-y-4">
          <div className="flex justify-end gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm hover:opacity-90 transition-all"
            >
              Print / Download Admit Card (PDF)
            </button>
          </div>

          <Card className="p-8 border-2 space-y-6 max-w-4xl mx-auto bg-card shadow-lg print:border-black print:shadow-none print:max-w-none">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 pb-6 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-900 text-white rounded-2xl">
                  <Award className="size-8" />
                </div>
                <div>
                  <h2 className="text-base font-black uppercase tracking-wide">MVGR College of Engineering</h2>
                  <p className="text-[10px] text-muted-foreground font-bold">Controller of Examinations | Hall Ticket Admit Card</p>
                  <Badge tone="purple" className="mt-1">{ticket?.examSession || "Nov - Dec 2026 Regular End-Sem"}</Badge>
                </div>
              </div>
              <div className="text-center sm:text-right font-mono text-xs space-y-1">
                <p className="font-bold text-sm text-indigo-600">{ticket?.hallTicketNumber || "HT-23331A4401-S7"}</p>
                <p className="text-muted-foreground">Issued: {ticket?.issuedDate || "20-07-2026"}</p>
                <Badge tone="success" className="inline-flex items-center gap-1">
                  <ShieldCheck className="size-3" /> Verified Official
                </Badge>
              </div>
            </div>

            {/* Student Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border text-xs">
              <div className="space-y-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <span className="text-slate-400 font-bold block">Candidate Name:</span>
                <p className="font-bold text-sm text-slate-900 dark:text-white">ADABALA AMRUTHA</p>
                <span className="text-slate-400 font-bold block pt-1">Roll Number:</span>
                <p className="font-mono font-bold text-indigo-600">23331A4401</p>
              </div>

              <div className="space-y-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <span className="text-slate-400 font-bold block">Department & Semester:</span>
                <p className="font-bold text-slate-900 dark:text-white">CSE(DS)</p>
                <span className="text-slate-400 font-bold block pt-1">Semester:</span>
                <p className="font-bold text-slate-900 dark:text-white">Semester 7</p>
              </div>

              <div className="space-y-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <span className="text-slate-400 font-bold block">Assigned Examination Venue:</span>
                <p className="font-bold leading-tight text-slate-900 dark:text-white">
                  Block A - Dept of CSE, Exam Hall 102
                </p>
              </div>
            </div>

            {/* Timetable Table */}
            <div className="space-y-3">
              <h3 className="font-black text-[11px] uppercase tracking-wider text-slate-400">
                Confirmed Examination Timetable
              </h3>
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b font-bold text-slate-700 uppercase">
                    <tr>
                      <th className="p-3">Course Code</th>
                      <th className="p-3">Subject Name</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Time Slot</th>
                      <th className="p-3">Hall & Seat</th>
                      <th className="p-3 text-center">Invigilator Sign</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-semibold text-slate-700 dark:text-slate-300">
                    {(ticket?.examSchedule || [
                      { code: "R23MSCST015", subject: "Web Technologies", date: "2026-11-15", time: "10:00 AM - 01:00 PM", room: "Hall 102", seatNo: "CSE-A1" },
                      { code: "R23MSCST016", subject: "OOAD and Design Patterns", date: "2026-11-18", time: "10:00 AM - 01:00 PM", room: "Hall 102", seatNo: "CSE-A1" },
                      { code: "R23MSCST017", subject: "Microprocessors and Interfacing", date: "2026-11-21", time: "10:00 AM - 01:00 PM", room: "Hall 102", seatNo: "CSE-A1" }
                    ]).map((ex: any) => (
                      <tr key={ex.code} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-indigo-600">{ex.code}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{ex.subject}</td>
                        <td className="p-3 font-mono">{ex.date}</td>
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400">{ex.time}</td>
                        <td className="p-3 font-mono">{ex.room} ({ex.seatNo})</td>
                        <td className="p-3 border-l text-center text-slate-400 italic font-normal">Pending</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t text-xs">
              <div className="md:col-span-2 space-y-1 text-slate-400 font-semibold">
                <p className="font-bold text-slate-700 dark:text-slate-300">Candidate Instructions:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] font-medium">
                  <li>Candidates must carry this printed Admit Card and original College ID to the hall.</li>
                  <li>Electronic gadgets, smartwatches, and programmable calculators are strictly prohibited.</li>
                  <li>Be seated in the assigned hall 15 minutes prior to commencement of exam.</li>
                </ul>
              </div>

              <div className="flex flex-col items-center justify-center p-3 rounded-xl border bg-slate-50/30 text-center space-y-2">
                <div className="size-16 border-2 border-dashed rounded-lg flex items-center justify-center">
                  <QrCode className="size-10 text-slate-700 opacity-80" />
                </div>
                <p className="text-[10px] text-slate-400 font-mono">Digital Signature Verified</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTicketType !== "regular" && activeTicketType !== null && (
        <div className="text-center py-12 text-slate-500 font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          No active schedule generated for this exam category yet.
        </div>
      )}
    </div>
  );
}

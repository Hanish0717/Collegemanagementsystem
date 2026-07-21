import { useState } from "react";
import { Sparkles, ArrowLeft, Info, ArrowRight, ChevronDown, Check, X } from "lucide-react";

type FeeView = "home" | "academic" | "examination" | "transport";

interface AcademicYearData {
  yearLabel: string;
  amount: string;
  hasAsterisk: boolean;
  isPaid: boolean;
}

export function StudentFees() {
  const [currentView, setCurrentView] = useState<FeeView>("home");
  
  // Academic fee tab state
  const [selectedYearTab, setSelectedYearTab] = useState("1 Year *");
  const [activeSection, setActiveSection] = useState<"none" | "history" | "old">("none");
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("55,852.00");
  const [paymentDone, setPaymentDone] = useState(false);

  // Form inputs for mock payment
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const yearsData: AcademicYearData[] = [
    { yearLabel: "1 Year *", amount: "55,852.00", hasAsterisk: true, isPaid: false },
    { yearLabel: "2 Year *", amount: "60,000.00", hasAsterisk: true, isPaid: false },
    { yearLabel: "3 Year *", amount: "65,000.00", hasAsterisk: true, isPaid: false },
    { yearLabel: "4 Year", amount: "0.00", hasAsterisk: false, isPaid: true }
  ];

  const activeYear = yearsData.find(y => y.yearLabel === selectedYearTab) || yearsData[0];

  const handlePayFull = () => {
    setPayAmount(activeYear.amount);
    setIsPayModalOpen(true);
  };

  const handlePayPartial = () => {
    const partialVal = (parseFloat(activeYear.amount.replace(/,/g, "")) / 2).toFixed(2);
    setPayAmount(Number(partialVal).toLocaleString("en-IN", { minimumFractionDigits: 2 }));
    setIsPayModalOpen(true);
  };

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentDone(true);
    setTimeout(() => {
      setPaymentDone(false);
      setIsPayModalOpen(false);
      alert(`Successfully simulated payment of ₹${payAmount}! Record updated.`);
    }, 1500);
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

      {/* RENDER VIEW: HOME - SELECTOR CARDS */}
      {currentView === "home" && (
        <div className="space-y-8 py-8 flex flex-col items-center">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white text-center">
            Select the type of Fee to Continue
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
            {/* Card 1: Pay Academic Fees */}
            <button
              onClick={() => setCurrentView("academic")}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center space-y-4 hover:shadow-lg hover:-translate-y-1 transition transform duration-250 flex flex-col items-center justify-between group"
            >
              <div className="relative size-24 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-full group-hover:scale-105 transition duration-200">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-800 dark:text-slate-200">
                  <path d="M12 8H36V40H12V8Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 16H28" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M20 24H28" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M30 32L38 24L30 32Z" stroke="#eab308" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">Pay Academic Fees</p>
                <p className="text-xs text-slate-400 font-semibold max-w-[200px] leading-relaxed">
                  Pay Tuition Fee, Hostel Fee and Transport Fees
                </p>
              </div>
            </button>

            {/* Card 2: Pay Examination Fees */}
            <button
              onClick={() => setCurrentView("examination")}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center space-y-4 hover:shadow-lg hover:-translate-y-1 transition transform duration-250 flex flex-col items-center justify-between group"
            >
              <div className="relative size-24 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-full group-hover:scale-105 transition duration-200">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-800 dark:text-slate-200">
                  <path d="M10 14H38V40H10V14Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M24 6L38 12L24 18L10 12L24 6Z" fill="#eab308" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">Pay Examination Fees</p>
                <p className="text-xs text-slate-400 font-semibold max-w-[200px] leading-relaxed">
                  Pay Regular and Supplementary Fees
                </p>
              </div>
            </button>

            {/* Card 3: Transport Registration */}
            <button
              onClick={() => setCurrentView("transport")}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center space-y-4 hover:shadow-lg hover:-translate-y-1 transition transform duration-250 flex flex-col items-center justify-between group"
            >
              <div className="relative size-24 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-full group-hover:scale-105 transition duration-200">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-800 dark:text-slate-200">
                  <path d="M12 12V36C12 38.2091 13.7909 40 16 40H32C34.2091 40 36 38.2091 36 36V12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <rect x="18" y="16" width="12" height="16" rx="2" fill="#eab308" stroke="currentColor" strokeWidth="3"/>
                </svg>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">Transport Registration</p>
                <p className="text-xs text-slate-400 font-semibold max-w-[200px] leading-relaxed">
                  Register for bus service and select seats
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* RENDER VIEW: ACADEMIC FEES (Mockup Matched Screen) */}
      {currentView === "academic" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Sub Header label */}
          <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            HOME / ACADEMIC FEE PAYMENT
          </div>

          {/* Student Profile Info Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
              {/* Left Column: Avatar & Name */}
              <div className="flex items-center gap-4 pb-4 md:pb-0">
                <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border shrink-0">
                  {/* Silhouette icon */}
                  <svg className="size-10 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="leading-tight">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
                    ADABALA AMRUTHA
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                    ID : 23331A4401
                  </span>
                </div>
              </div>

              {/* Right Column: Grid Details */}
              <div className="flex-1 w-full grid grid-cols-2 gap-x-8 gap-y-4 pt-4 md:pt-0 md:pl-8 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Admission no.</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">2339</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Program</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">CSE(DS)</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Batch</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">2023 - 2024</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Degree</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">B.TECH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Years Tabs Switcher */}
          <div className="flex items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-2">
            {yearsData.map(year => (
              <button
                key={year.yearLabel}
                onClick={() => setSelectedYearTab(year.yearLabel)}
                className={`text-xs font-bold transition whitespace-nowrap pb-2 -mb-2.5 ${
                  selectedYearTab === year.yearLabel
                    ? "border-b-2 border-amber-500 text-slate-900 dark:text-white"
                    : "text-slate-400 hover:text-slate-650"
                }`}
              >
                {year.yearLabel.includes("*") ? (
                  <>
                    <span>{year.yearLabel.replace(" *", "")}</span>
                    <span className="text-red-500 ml-0.5">*</span>
                  </>
                ) : (
                  year.yearLabel
                )}
              </button>
            ))}
          </div>

          {/* Tuition Fees Card */}
          <div className="max-w-sm w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white rounded-3xl overflow-hidden shadow-md flex flex-col justify-between h-48 select-none">
            <div className="p-5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold opacity-90">Tuition Fees</span>
                <Info className="size-4 opacity-80 cursor-pointer" />
              </div>
              <p className="text-[10px] font-semibold opacity-75 pt-2">Total due amount</p>
              <p className="text-xl font-extrabold tracking-wide">₹{activeYear.amount}</p>
            </div>

            {/* Split Action Buttons bar at the bottom */}
            {activeYear.isPaid ? (
              <div className="bg-emerald-600 py-3 text-center text-xs font-bold flex items-center justify-center gap-1.5">
                <Check className="size-4" /> Paid
              </div>
            ) : (
              <div className="grid grid-cols-2 divide-x divide-white/20 bg-slate-950 font-bold text-xs select-none">
                <button
                  onClick={handlePayPartial}
                  className="py-3.5 hover:bg-slate-900 transition active:scale-95 text-center text-white"
                >
                  Pay Partial
                </button>
                <button
                  onClick={handlePayFull}
                  className="py-3.5 hover:bg-slate-900 transition active:scale-95 text-center text-white"
                >
                  Pay Full
                </button>
              </div>
            )}
          </div>

          {/* Expandable Action Rows */}
          <div className="space-y-3 pt-4">
            {/* Row 1: Online Transactions */}
            <div
              onClick={() => {
                if (!activeYear.isPaid) {
                  handlePayFull();
                } else {
                  alert("Fees for this year already paid!");
                }
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer hover:bg-slate-50 transition"
            >
              <span className="text-xs font-bold text-slate-850 dark:text-white">Online Transactions</span>
              <ArrowRight className="size-4 text-blue-600" />
            </div>

            {/* Row 2: Student Payment History */}
            <div className="space-y-2">
              <div
                onClick={() => setActiveSection(activeSection === "history" ? "none" : "history")}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer hover:bg-slate-50 transition"
              >
                <span className="text-xs font-bold text-slate-850 dark:text-white">Student Payment History</span>
                <ArrowRight className={`size-4 text-blue-600 transition-transform ${activeSection === "history" ? "rotate-90" : ""}`} />
              </div>

              {activeSection === "history" && (
                <div className="bg-slate-50/50 dark:bg-slate-800/40 p-4 border rounded-2xl space-y-2 animate-in slide-in-from-top-1 text-xs">
                  <div className="flex justify-between border-b pb-1.5 font-bold text-slate-400 uppercase text-[10px]">
                    <span>Receipt No</span>
                    <span>Date</span>
                    <span>Amount</span>
                  </div>
                  <div className="flex justify-between font-mono font-semibold">
                    <span>REC-2026-8812</span>
                    <span>12-Jul-2026</span>
                    <span className="text-emerald-600">₹65,000.00</span>
                  </div>
                </div>
              )}
            </div>

            {/* Row 3: Old Transactions */}
            <div className="space-y-2">
              <div
                onClick={() => setActiveSection(activeSection === "old" ? "none" : "old")}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer hover:bg-slate-50 transition"
              >
                <span className="text-xs font-bold text-slate-850 dark:text-white">Old Transactions</span>
                <ChevronDown className={`size-4 text-blue-600 transition-transform ${activeSection === "old" ? "rotate-180" : ""}`} />
              </div>

              {activeSection === "old" && (
                <div className="p-4 border rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 text-xs font-semibold text-slate-500 text-center">
                  No historical legacy receipts found in archives.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW: EXAMINATION FEES */}
      {currentView === "examination" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Exam Fee Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4">Examination</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Due Date</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                    {examFees.map((fee, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{fee.examName}</td>
                        <td className="p-4 font-mono font-bold text-indigo-600">{fee.amount}</td>
                        <td className="p-4 font-mono text-slate-500">{fee.dueDate}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            fee.status === "Paid" ? "bg-[#e2f0d9] text-[#385723]" : "bg-[#fef3c7] text-[#d97706]"
                          }`}>
                            {fee.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 h-fit">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Pay Exam Fee</h3>
            <form onSubmit={submitPayment} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold">Select Exam Fee</label>
                <select
                  value={selectedFee}
                  onChange={(e) => setSelectedFee(e.target.value)}
                  className="w-full bg-[#f4f5f7] dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none"
                  required
                >
                  <option value="">-- Choose Exam Fee --</option>
                  {examFees.filter(f => f.status !== "Paid").map(f => (
                    <option key={f.examName} value={f.examName}>{f.examName} - {f.amount}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9101 1121"
                  className="w-full bg-[#f4f5f7] dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 rounded-xl text-xs font-bold"
              >
                Pay Exam Fee
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RENDER VIEW: TRANSPORT REGISTRATION */}
      {currentView === "transport" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Bus Seat Map Allocation</h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="size-2 bg-indigo-600 rounded-full"></span>
                  <span>College Bus No: 12A • Tagarapuvalsa - MVGR</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                  Driver: K. Appala Naidu (Ph: +91 9848523091) • Departure Time: 07:45 AM from main junction.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Select seat from map</p>
                <div className="grid grid-cols-5 gap-2 max-w-sm">
                  {Array.from({ length: 20 }, (_, i) => {
                    const seatLabel = `Seat-${i + 1}`;
                    const isTaken = i % 4 === 0;
                    const isSelected = selectedSeat === seatLabel;
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={isTaken}
                        onClick={() => setSelectedSeat(seatLabel)}
                        className={`p-2 border rounded-lg text-[10px] font-bold transition text-center ${
                          isTaken
                            ? "bg-slate-100 text-slate-300 border-slate-200"
                            : isSelected
                            ? "bg-indigo-655 bg-indigo-600 text-white border-indigo-600"
                            : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 h-fit">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Register Bus Route</h3>
            <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold">Select Route</label>
                <select
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="w-full bg-[#f4f5f7] dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-medium"
                >
                  <option value="Route-12 (Tagarapuvalsa)">Route-12 (Tagarapuvalsa)</option>
                  <option value="Route-15 (Vizianagaram)">Route-15 (Vizianagaram)</option>
                  <option value="Route-22 (Visakhapatnam)">Route-22 (Visakhapatnam)</option>
                </select>
              </div>

              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-1 text-[11px] text-indigo-800">
                <div className="font-bold font-mono">₹18,000 / Year</div>
              </div>

              {transportStatus === "Registered" ? (
                <div className="p-3 bg-emerald-50 text-emerald-800 font-bold text-center rounded-xl border border-emerald-100">
                  Successfully Registered!
                </div>
              ) : (
                <button
                  onClick={() => {
                    setTransportStatus("Registered");
                    alert("Bus route registration successful!");
                  }}
                  className="w-full py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 rounded-xl text-xs font-bold"
                >
                  Register Bus Service
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment simulation modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white">Fee Online Transaction</h2>
              <button onClick={() => setIsPayModalOpen(false)} className="text-slate-400 hover:text-slate-650">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={submitPayment} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-150 text-blue-800 dark:text-blue-200">
                <span className="font-bold block text-[10px] uppercase">Transaction Amount</span>
                <span className="text-base font-extrabold">₹{payAmount}</span>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9101 1121"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-[#f4f5f7] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-[#f4f5f7] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-medium"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold">CVV</label>
                  <input
                    type="password"
                    placeholder="***"
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-[#f4f5f7] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="ADABALA AMRUTHA"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-[#f4f5f7] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-medium"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentDone}
                  className="px-4 py-2 bg-[#1e3a8a] text-white rounded-xl text-xs font-bold"
                >
                  {paymentDone ? "Processing..." : "Authorize Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

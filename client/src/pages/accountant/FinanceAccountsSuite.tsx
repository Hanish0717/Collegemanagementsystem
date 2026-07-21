import { useState } from 'react';
import {
  Wallet, DollarSign, CreditCard, FileSpreadsheet, Download, Printer, Plus,
  CheckCircle, ArrowUpRight, FileText, Building2, Users
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { exportToCSV, printReport } from '@/lib/exportUtils';
import { toast } from 'sonner';

export function FinanceAccountsSuite() {
  const [ledger] = useState([
    { id: 'LED-501', category: 'Tuition Fee Collection', type: 'Income', amount: '₹4,80,000', party: 'B.Tech Batch 2026', date: 'Jul 21', status: 'Cleared' },
    { id: 'LED-502', category: 'Faculty Salary Payout', type: 'Expense', amount: '₹28,50,000', party: 'CSE & ECE Staff Payroll', date: 'Jul 20', status: 'Cleared' },
    { id: 'LED-503', category: 'Lab Equipment PO #402', type: 'Expense', amount: '₹3,40,000', party: 'Dell Technologies India', date: 'Jul 20', status: 'Pending Approval' },
    { id: 'LED-504', category: 'Scholarship Disbursal', type: 'Expense', amount: '₹1,20,000', party: 'Merit Scholarship (12 Students)', date: 'Jul 19', status: 'Cleared' },
  ]);

  const handleExportCSV = () => {
    exportToCSV('Financial_General_Ledger_2026', [
      { header: 'Ledger Ref ID', key: 'id' },
      { header: 'Category Description', key: 'category' },
      { header: 'Type', key: 'type' },
      { header: 'Amount', key: 'amount' },
      { header: 'Party / Beneficiary', key: 'party' },
      { header: 'Transaction Date', key: 'date' },
      { header: 'Status', key: 'status' },
    ], ledger);
    toast.success('Financial General Ledger exported to CSV!');
  };

  const handlePrint = () => {
    printReport(
      'Institutional Financial General Ledger & GST Statement',
      'Accounts Department Balance Audit — FY 2026-27',
      [
        { header: 'Ref ID', key: 'id' },
        { header: 'Category', key: 'category' },
        { header: 'Flow Type', key: 'type' },
        { header: 'Amount', key: 'amount' },
        { header: 'Party Name', key: 'party' },
        { header: 'Date', key: 'date' },
        { header: 'Clearance Status', key: 'status' },
      ],
      ledger
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                FINANCE & ACCOUNTS MANAGEMENT SUITE
              </span>
              <span className="text-xs text-slate-400 font-mono">FY 2026-27</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Wallet className="size-7 text-emerald-400" /> Enterprise General Ledger & Audit
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Student fee collections, staff payroll disbursements, purchase orders (PO), vendor payments, scholarship grants & GST reporting.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleExportCSV} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer">
              <Download className="size-4 text-emerald-400" /> Export CSV
            </button>
            <button onClick={handlePrint} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer">
              <Printer className="size-4 text-emerald-400" /> Print Ledger
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Inflow (YTD)" value="₹4.82 Cr" change="88% Target Achieved" icon={Wallet} />
        <StatCard label="Total Outflow (YTD)" value="₹3.18 Cr" change="Staff Payroll & Infra" icon={CreditCard} />
        <StatCard label="Net Reserves" value="₹1.64 Cr" change="Liquid Working Capital" icon={DollarSign} />
        <StatCard label="Pending PO Approvals" value="3" change="Requires Finance Sanction" icon={FileText} />
      </div>

      <Card className="p-5">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Financial General Ledger Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-slate-400 text-left">
                <th className="pb-2">Ref ID</th>
                <th className="pb-2">Category Description</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Party / Beneficiary</th>
                <th className="pb-2 text-right">Amount</th>
                <th className="pb-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ledger.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-mono text-[10px] font-bold text-slate-400">{l.id}</td>
                  <td className="py-3 font-extrabold text-slate-900 dark:text-white">{l.category}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${l.type === 'Income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {l.type}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300 font-medium">{l.party}</td>
                  <td className="py-3 text-right font-extrabold text-blue-600">{l.amount}</td>
                  <td className="py-3 text-center">
                    <Badge tone={l.status === 'Cleared' ? 'success' : 'warn'} className="text-[9px]">{l.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

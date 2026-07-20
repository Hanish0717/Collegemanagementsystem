import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle,
  FileText,
  Clock,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { toast } from 'sonner';

export function AccountsDashboard() {
  const [vendorInvoices, setVendorInvoices] = useState([
    {
      id: 'INV-801',
      vendor: 'Sai Security Services',
      category: 'Campus Guard Wages',
      amount: 120000,
      due: 'July 25',
      status: 'Pending',
    },
    {
      id: 'INV-802',
      vendor: 'Nirmal Caterers',
      category: 'Hostel Mess Provisions',
      amount: 185000,
      due: 'July 28',
      status: 'Pending',
    },
    {
      id: 'INV-803',
      vendor: 'Supreme Books Dist',
      category: 'Library Catalog Purchases',
      amount: 65000,
      due: 'August 02',
      status: 'Pending',
    },
  ]);

  const [payrollStatus, setPayrollStatus] = useState('Pending Odd Term Payroll Run');

  const handlePayVendor = (id: string, vendor: string, amount: number) => {
    setVendorInvoices((prev) => prev.filter((v) => v.id !== id));
    toast.success(`Disbursed payment of ₹${amount.toLocaleString()} to ${vendor}`);
  };

  const handleRunPayroll = () => {
    toast.loading('Processing salary schedules, bank files, and TDS deductions...', {
      duration: 1500,
    });
    setTimeout(() => {
      setPayrollStatus('Odd Term Payroll Disbursed successfully!');
      toast.success('Payroll disbursed to all 342 active employees!');
    }, 1600);
  };

  const handleGSTReport = () => {
    toast.success('GST Quarterly Report (GST-3B) generated and prepared for e-filing.');
  };

  const feeSourceData = [
    { category: 'Tuition Fees', collected: 245, pending: 15 },
    { category: 'Hostel Fees', collected: 32, pending: 2.5 },
    { category: 'Transport Fees', collected: 7.2, pending: 1.2 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts &amp; Financial Console"
        desc="Audit student tuition fees, pay vendor invoices, run staff payroll, and generate tax/GST records."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Fees Collected"
          value="₹2.84 Cr"
          change="93.6% collection rate"
          icon={Wallet}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Fees Receivable"
          value="₹18.7L"
          change="321 student defualters"
          icon={DollarSign}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="Monthly Staff Payroll"
          value="₹42.5L"
          change="342 staff members"
          icon={Briefcase}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="Pending Invoices"
          value="₹3.70L"
          change="3 major bills due soon"
          icon={CreditCard}
          gradient="bg-gradient-primary"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Fee Collection Breakdown */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Fee Collection Ratios</h3>
              <p className="text-[10px] text-slate-500">
                Collected amount vs outstanding pending dues in Lakhs (₹)
              </p>
            </div>
            <Badge tone="success">Active Year</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={feeSourceData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="category" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Bar
                  dataKey="collected"
                  name="Collected (Lakhs)"
                  fill="#10B981"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="pending"
                  name="Pending (Lakhs)"
                  fill="#F59E0B"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Vendor Payments Checklist */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800 text-sm">Vendor Invoices</h3>
            <Badge tone="warn">{vendorInvoices.length} Due</Badge>
          </div>
          <div className="space-y-3">
            {vendorInvoices.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-6">
                All vendor bills paid!
              </div>
            ) : (
              vendorInvoices.map((row) => (
                <div
                  key={row.id}
                  className="p-3 border rounded-xl space-y-2 text-xs hover:bg-slate-50/50 transition"
                >
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{row.vendor}</span>
                    <span className="font-mono text-indigo-600">
                      ₹{row.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Category: {row.category}</span>
                    <span>Due: {row.due}</span>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handlePayVendor(row.id, row.vendor, row.amount)}
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] transition cursor-pointer"
                    >
                      Disburse Payment
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Payroll Card */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm mb-1.5">
              Staff Salaries &amp; Payroll Run
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Disburse monthly compensation to teaching and non-teaching personnel, calculate tax
              withholdings, and schedule direct deposits.
            </p>
            <div className="p-3 bg-slate-50 border rounded-xl flex items-center gap-3">
              <Clock className="size-4 text-amber-500 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-slate-700">Payroll Status:</span>{' '}
                <span className="font-medium text-slate-500">{payrollStatus}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4 pt-4 border-t">
            <button
              onClick={handleRunPayroll}
              className="flex-1 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              Disburse Salary Payroll
            </button>
          </div>
        </Card>

        {/* Financial reports */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="font-semibold mb-2">Accounting Audits</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verify institutional ledgers, export tax files, review scholarship distributions, and
              audit GST filings.
            </p>
          </div>
          <div className="space-y-2 mt-6">
            <button
              onClick={handleGSTReport}
              className="w-full py-2.5 rounded-xl border flex items-center gap-2 justify-center text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              <FileText className="size-4 text-indigo-500" />
              <span>Generate Quarterly GST Report</span>
            </button>
            <button
              onClick={() => {
                toast.success('FY Ledger Books successfully consolidated.');
              }}
              className="w-full py-2.5 rounded-xl border flex items-center gap-2 justify-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Consolidate Ledger Books
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

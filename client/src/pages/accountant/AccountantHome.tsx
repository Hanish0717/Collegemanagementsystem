import { useState } from 'react';
import { Wallet, CreditCard, TrendingUp, DollarSign, FileSpreadsheet, Download, CheckCircle, Users } from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

export function AccountantHome() {
  const feeCollectionData = [
    { month: 'Feb', collected: 28, target: 40 },
    { month: 'Mar', collected: 35, target: 40 },
    { month: 'Apr', collected: 38, target: 40 },
    { month: 'May', collected: 42, target: 45 },
    { month: 'Jun', collected: 39, target: 45 },
    { month: 'Jul', collected: 24, target: 45 },
  ];

  const expensePie = [
    { name: 'Salaries', value: 58, color: '#1d4ed8' },
    { name: 'Infrastructure', value: 18, color: '#10B981' },
    { name: 'Utilities', value: 12, color: '#F59E0B' },
    { name: 'Miscellaneous', value: 12, color: '#8B5CF6' },
  ];

  const recentTransactions = [
    { id: 'TXN-1201', student: 'Rahul Kumar', roll: 'CS2026010', amount: '₹45,000', type: 'Tuition Fee', date: 'Jul 21', status: 'Paid' },
    { id: 'TXN-1202', student: 'Priya Sharma', roll: 'EC2026044', amount: '₹45,000', type: 'Tuition Fee', date: 'Jul 21', status: 'Paid' },
    { id: 'TXN-1203', student: 'Arun Reddy', roll: 'ME2026031', amount: '₹22,500', type: 'Partial Payment', date: 'Jul 20', status: 'Partial' },
    { id: 'TXN-1204', student: 'Sneha Gupta', roll: 'EE2026018', amount: '₹45,000', type: 'Tuition Fee', date: 'Jul 20', status: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance & Accounts Dashboard"
        desc="Fee collection, salary disbursement, expense tracking, scholarship management and financial reports."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Fee Collected (July)" value="₹24.8L" change="55% of monthly target" icon={Wallet} />
        <StatCard label="Pending Dues" value="₹18.6L" change="284 students outstanding" icon={CreditCard} />
        <StatCard label="Salary Disbursed" value="₹1.12 Cr" change="342 staff — this month" icon={Users} />
        <StatCard label="Scholarships" value="₹8.4L" change="96 students benefited" icon={DollarSign} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Monthly Fee Collection vs Target</h3>
              <p className="text-xs text-muted-foreground">Collected (₹L) vs Target (₹L)</p>
            </div>
            <Badge tone="info">FY 2026-27</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={feeCollectionData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" fontSize={11} stroke="#64748B" />
                <YAxis fontSize={11} stroke="#64748B" />
                <Tooltip />
                <Bar dataKey="collected" name="Collected (₹L)" fill="#1d4ed8" radius={[5, 5, 0, 0]} />
                <Bar dataKey="target" name="Target (₹L)" fill="#e2e8f0" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Expense Breakdown</h3>
            <Badge>This Month</Badge>
          </div>
          <div className="h-44">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={expensePie} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {expensePie.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {expensePie.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-bold">{d.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Recent Fee Transactions</h3>
              <p className="text-xs text-muted-foreground">Latest payment records</p>
            </div>
            <Badge tone="info">Today</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">ID</th>
                  <th className="text-left pb-2">Student</th>
                  <th className="text-left pb-2">Type</th>
                  <th className="text-right pb-2">Amount</th>
                  <th className="text-center pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-2 font-mono text-[10px] text-slate-400">{t.id}</td>
                    <td className="py-2">
                      <div className="font-semibold">{t.student}</div>
                      <div className="text-slate-400 text-[10px]">{t.roll}</div>
                    </td>
                    <td className="py-2 text-slate-500">{t.type}</td>
                    <td className="py-2 text-right font-bold text-blue-700">{t.amount}</td>
                    <td className="py-2 text-center">
                      <Badge tone={t.status === 'Paid' ? 'success' : t.status === 'Partial' ? 'warn' : 'danger'} className="text-[9px]">
                        {t.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4 text-sm">Finance Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Generate Fee Challan', icon: CreditCard, color: 'text-blue-600' },
              { label: 'Mark Salary Paid', icon: CheckCircle, color: 'text-emerald-600' },
              { label: 'Add Scholarship', icon: DollarSign, color: 'text-violet-600' },
              { label: 'Export Financial Report', icon: Download, color: 'text-amber-600' },
              { label: 'Reconcile Ledger', icon: FileSpreadsheet, color: 'text-slate-600' },
            ].map(({ label, icon: Icon, color }) => (
              <button key={label} onClick={() => toast.success(`${label} initiated!`)} className="w-full py-2.5 rounded-xl border flex items-center gap-2.5 justify-center text-xs font-bold hover:bg-slate-50 transition cursor-pointer">
                <Icon className={`size-4 ${color}`} /> {label}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

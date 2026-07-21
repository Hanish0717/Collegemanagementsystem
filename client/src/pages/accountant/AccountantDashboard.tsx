import { useState } from 'react';
import {
  Wallet, CreditCard, DollarSign, Download, CheckCircle, FileSpreadsheet,
  TrendingUp, Users, ArrowUpRight, Plus, Building2
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

export function AccountantDashboard() {
  const feeCollectionData = [
    { month: 'Feb', collected: 28, target: 40 },
    { month: 'Mar', collected: 35, target: 40 },
    { month: 'Apr', collected: 38, target: 40 },
    { month: 'May', collected: 42, target: 45 },
    { month: 'Jun', collected: 39, target: 45 },
    { month: 'Jul', collected: 24, target: 45 },
  ];

  const expensePie = [
    { name: 'Staff Salaries', value: 58, color: '#1d4ed8' },
    { name: 'Lab Equipment & Infra', value: 18, color: '#10B981' },
    { name: 'Utilities & Maintenance', value: 12, color: '#F59E0B' },
    { name: 'Scholarships & Grants', value: 12, color: '#8B5CF6' },
  ];

  const recentTransactions = [
    { id: 'TXN-4001', student: 'Rahul Kumar', roll: 'CS2026010', amount: '₹45,000', type: 'Tuition Fee', status: 'Paid' },
    { id: 'TXN-4002', student: 'Priya Sharma', roll: 'EC2026044', amount: '₹45,000', type: 'Tuition Fee', status: 'Paid' },
    { id: 'TXN-4003', student: 'Arun Reddy', roll: 'ME2026031', amount: '₹22,500', type: 'Hostel Installment', status: 'Partial' },
    { id: 'TXN-4004', student: 'Sneha Gupta', roll: 'EE2026018', amount: '₹45,000', type: 'Tuition Fee', status: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance & Accounts Management Suite"
        desc="Financial ledgers: Student fee collections, payroll disbursements, vendor expenses, and scholarship sanctions."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Fee Collected (July)" value="₹24.8 Lakhs" change="55% of monthly target" icon={Wallet} />
        <StatCard label="Outstanding Dues" value="₹18.6 Lakhs" change="284 Students Pending" icon={CreditCard} />
        <StatCard label="Monthly Payroll" value="₹1.12 Crores" change="342 Staff Paid" icon={Users} />
        <StatCard label="Sanctioned Scholarships" value="₹8.4 Lakhs" change="96 Beneficiaries" icon={DollarSign} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Fee Collection vs Target Chart */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Fee Collection Progress vs Target</h3>
                <p className="text-xs text-slate-500">Monthly breakdown in ₹ Lakhs</p>
              </div>
              <button onClick={() => toast.success('Fee receipt report downloaded.')} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer">
                <Download className="size-3.5" /> Download Report
              </button>
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

          {/* Recent Fee Transactions Table */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Recent Payment Transactions</h3>
              <Badge tone="info">Live Desk</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-400 text-left">
                    <th className="pb-2">Txn ID</th>
                    <th className="pb-2">Student</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 font-mono text-[10px] text-slate-400">{t.id}</td>
                      <td className="py-2.5 font-extrabold text-slate-900 dark:text-white">
                        {t.student}
                        <div className="text-[10px] text-slate-400 font-normal">{t.roll}</div>
                      </td>
                      <td className="py-2.5 text-slate-500">{t.type}</td>
                      <td className="py-2.5 text-right font-extrabold text-blue-600">{t.amount}</td>
                      <td className="py-2.5 text-center">
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
        </div>

        {/* Expenses Pie + Quick Actions */}
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-2">Monthly Expenses</h3>
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
                <div key={d.name} className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-slate-500 font-normal">{d.name}</span>
                  </div>
                  <span>{d.value}%</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Accounts Quick Dock</h3>
            <div className="space-y-2">
              <button onClick={() => toast.success('Challan generated!')} className="w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                <span className="flex items-center gap-2"><CreditCard className="size-4 text-blue-600" /> Issue Fee Challan</span>
              </button>
              <button onClick={() => toast.success('Staff Payroll disbursed!')} className="w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                <span className="flex items-center gap-2"><CheckCircle className="size-4 text-emerald-600" /> Process Staff Payroll</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

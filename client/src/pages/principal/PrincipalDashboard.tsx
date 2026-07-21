import { useState } from 'react';
import {
  Award, GraduationCap, Users, TrendingUp, CheckCircle, ShieldCheck,
  Building2, FileText, Download, Send, Check, X, Star, BarChart3
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

export function PrincipalDashboard() {
  const [approvals, setApprovals] = useState([
    { id: 'PR-801', title: 'Institutional Budget Approval Q3', amount: '₹42.5 Lakhs', dept: 'Finance & Accounts', date: 'Jul 21' },
    { id: 'PR-802', title: 'Campus Expansion Building Blueprint', amount: '₹1.2 Crores', dept: 'Infrastructure Committee', date: 'Jul 20' },
    { id: 'PR-803', title: 'International Academic MOU (MIT)', amount: 'N/A', dept: 'Research & Collaborations', date: 'Jul 19' },
  ]);

  const naacMetrics = [
    { criterion: 'Curricular Aspects', score: 3.85, max: 4.0 },
    { criterion: 'Teaching-Learning', score: 3.90, max: 4.0 },
    { criterion: 'Research & Innovation', score: 3.72, max: 4.0 },
    { criterion: 'Infrastructure', score: 3.95, max: 4.0 },
    { criterion: 'Student Support', score: 3.88, max: 4.0 },
  ];

  const handleApprove = (id: string, title: string) => {
    setApprovals(p => p.filter(a => a.id !== id));
    toast.success(`Principal Executed Digital Seal: Approved "${title}"`);
  };

  return (
    <div className="space-y-6">
      {/* Principal Executive Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                OFFICE OF THE PRINCIPAL
              </span>
              <span className="text-xs text-slate-300 font-mono">NAAC A++ Certified Institution</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Award className="size-7 text-amber-400" /> Executive Boardroom Console
            </h1>
            <p className="text-xs text-slate-300 mt-1">Institutional excellence, academic rankings, policy sanctioning & executive approvals.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => toast.success('Principal Presidential Address scheduled.')} className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer">
              <Send className="size-4" /> Issue Presidential Circular
            </button>
          </div>
        </div>
      </div>

      {/* KPI Top Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Institutional CGPA" value="3.84 / 4.0" change="NAAC A++ Status" icon={Award} />
        <StatCard label="Placement Rate" value="94.2%" change="2026 Batch Record" icon={TrendingUp} />
        <StatCard label="Active R&D Grants" value="₹2.4 Cr" change="38 Published Papers" icon={ShieldCheck} />
        <StatCard label="Total Student Body" value="5,240" change="100% Seat Occupancy" icon={Users} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Pending Executive Signatures */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="size-5 text-amber-500" /> Executive Digital Seal Approvals
                </h3>
                <p className="text-xs text-slate-500">High-value sanctions requiring Principal signature</p>
              </div>
              <Badge tone="warn">{approvals.length} Sanctions Pending</Badge>
            </div>

            {approvals.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No pending executive sanctions.</div>
            ) : (
              <div className="space-y-3">
                {approvals.map(a => (
                  <div key={a.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">{a.id}</span>
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">{a.title}</span>
                      </div>
                      <p className="text-xs text-slate-500">Dept: {a.dept} • Amount: <strong className="text-slate-800 dark:text-slate-200">{a.amount}</strong></p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => toast.error('Sanction declined.')} className="px-3 py-1.5 rounded-xl border text-rose-600 text-xs font-bold hover:bg-rose-50 cursor-pointer">Decline</button>
                      <button onClick={() => handleApprove(a.id, a.title)} className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer">Apply Seal & Approve</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* NAAC Quality Ratings */}
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="size-4 text-amber-500" /> NAAC Quality Criteria Ratings
          </h3>
          <div className="space-y-3">
            {naacMetrics.map(m => (
              <div key={m.criterion} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{m.criterion}</span>
                  <span className="font-mono text-blue-600">{m.score} / {m.max}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(m.score / m.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  ShieldAlert, Server, HardDrive, Cpu, Terminal, Database, Activity,
  Users, Key, Lock, RefreshCw, Download, AlertOctagon, CheckCircle2,
  Clock, Zap, Shield, Search
} from 'lucide-react';
import { Card, Badge } from '@/components/dashboard/ui';
import { toast } from 'sonner';

export function SuperAdminDashboard() {
  const [logs, setLogs] = useState([
    { id: 1, time: '15:42:01', type: 'AUTH', text: 'Root session validated for Super Admin' },
    { id: 2, time: '15:40:12', type: 'SYS', text: 'Automatic DB snapshot created (14.2 GB)' },
    { id: 3, time: '15:38:50', type: 'SECURITY', text: 'Rate-limiter blocked IP 192.168.1.104 (5 failed attempts)' },
    { id: 4, time: '15:31:05', type: 'API', text: 'Sync service updated 5,240 student records' },
  ]);

  const [lockdown, setLockdown] = useState(false);

  const toggleLockdown = () => {
    setLockdown(!lockdown);
    if (!lockdown) {
      toast.error('EMERGENCY LOCKDOWN ACTIVATED! Non-admin access disabled.');
    } else {
      toast.success('System lockdown lifted. Normal traffic restored.');
    }
  };

  const serverNodes = [
    { name: 'API Server Cluster', status: 'Online', load: '32%', uptime: '99.98%', latency: '18ms' },
    { name: 'Primary DB (MySQL)', status: 'Healthy', load: '45%', uptime: '99.99%', latency: '4ms' },
    { name: 'Redis Cache Node', status: 'Active', load: '14%', uptime: '100%', latency: '1ms' },
    { name: 'Storage Bucket (S3)', status: 'Optimal', load: '68%', uptime: '99.95%', latency: '22ms' },
  ];

  return (
    <div className="space-y-6">
      {/* Top System Command Header */}
      <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SYSTEM TOPOLOGY COMMAND CENTER
              </span>
              <span className="text-xs text-slate-400 font-mono">v4.8.2-prod</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <ShieldAlert className="size-7 text-blue-500" /> Super Admin Control Console
            </h1>
            <p className="text-xs text-slate-400 mt-1">Full root access: Infrastructure metrics, security audit stream, and database lifecycle management.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.success('DB Backup started in background.')}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Database className="size-4" /> Trigger DB Backup
            </button>
            <button
              onClick={toggleLockdown}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                lockdown ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30'
              }`}
            >
              <Lock className="size-4" /> {lockdown ? 'Lift Lockdown' : 'Emergency Lockdown'}
            </button>
          </div>
        </div>
      </div>

      {/* Node Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {serverNodes.map(node => (
          <div key={node.name} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white">{node.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {node.status}
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between"><span>CPU Load:</span><strong className="text-slate-800 dark:text-slate-200 font-mono">{node.load}</strong></div>
              <div className="flex justify-between"><span>Uptime:</span><strong className="text-slate-800 dark:text-slate-200 font-mono">{node.uptime}</strong></div>
              <div className="flex justify-between"><span>Latency:</span><strong className="text-emerald-600 font-mono">{node.latency}</strong></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Terminal Audit Stream */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5 bg-slate-950 border-slate-800 text-slate-200">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="size-5 text-emerald-400" />
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">Live System Audit Log Stream</h3>
              </div>
              <button onClick={() => toast.success('Logs flushed to storage.')} className="text-[10px] font-mono text-slate-400 hover:text-white">
                Flush Stream
              </button>
            </div>
            <div className="font-mono text-xs space-y-2 h-64 overflow-y-auto pr-2">
              {logs.map(l => (
                <div key={l.id} className="flex items-start gap-3 py-1 border-b border-slate-900 text-[11px]">
                  <span className="text-slate-500 font-bold shrink-0">{l.time}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${l.type === 'SECURITY' ? 'bg-rose-950 text-rose-400' : l.type === 'AUTH' ? 'bg-blue-950 text-blue-400' : 'bg-slate-800 text-slate-300'}`}>
                    {l.type}
                  </span>
                  <span className="text-slate-300">{l.text}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Super Admin Actions */}
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Super Admin Privileges</h3>
          <div className="space-y-2.5">
            <button onClick={() => toast.success('Cache cleared!')} className="w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold hover:bg-slate-50 transition">
              <span className="flex items-center gap-2"><RefreshCw className="size-4 text-blue-600" /> Flush Redis Cache</span>
            </button>
            <button onClick={() => toast.success('Global security audit initiated.')} className="w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold hover:bg-slate-50 transition">
              <span className="flex items-center gap-2"><Shield className="size-4 text-emerald-600" /> Run Security Audit</span>
            </button>
            <button onClick={() => toast.success('User session tokens revoked.')} className="w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold hover:bg-slate-50 transition">
              <span className="flex items-center gap-2"><Key className="size-4 text-amber-600" /> Force Global Logout</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

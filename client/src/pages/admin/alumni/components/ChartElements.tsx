import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { GlassCard } from './CardElements';

export function GradientAreaChart({ data, dataKey, xKey, color = "#8b5cf6", title }: { data: any[], dataKey: string, xKey: string, color?: string, title?: string }) {
  return (
    <GlassCard className="p-6 h-full flex flex-col">
      {title && <h3 className="font-semibold text-lg mb-6">{title}</h3>}
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
            <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} fillOpacity={1} fill={`url(#color-${dataKey})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

export function StyledBarChart({ data, dataKey, xKey, color = "#0ea5e9", title }: { data: any[], dataKey: string, xKey: string, color?: string, title?: string }) {
  return (
    <GlassCard className="p-6 h-full flex flex-col">
      {title && <h3 className="font-semibold text-lg mb-6">{title}</h3>}
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
            <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip 
              cursor={{ fill: 'currentColor', opacity: 0.05 }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

export function DonutChart({ data, dataKey, nameKey, title, colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316'] }: { data: any[], dataKey: string, nameKey: string, title?: string, colors?: string[] }) {
  return (
    <GlassCard className="p-6 h-full flex flex-col">
      {title && <h3 className="font-semibold text-lg mb-6">{title}</h3>}
      <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={5}
              dataKey={dataKey}
              nameKey={nameKey}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-foreground">
            {data.reduce((sum, item) => sum + (item[dataKey] || 0), 0)}
          </span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">Total</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
        {data.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
            {entry[nameKey]}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

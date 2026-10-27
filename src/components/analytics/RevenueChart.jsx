import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function RevenueChart({ data = [] }) {
  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
          <div className="font-semibold">{label}</div>
          <div className="text-teal-300 font-mono font-bold">
            Revenue: {formatCurrency(payload[0].value)}
          </div>
          <div className="text-slate-300">
            Sessions: {payload[0].payload.sessions || 0}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Practice Revenue Trend (INR)</h3>
          <p className="text-xs text-slate-500">Gross consultation & package revenue across the last 6 months.</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueTeal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f766e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(v) => `₹${v / 1000}k`} 
            />
            <Tooltip content={customTooltip} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#0f766e"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueTeal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

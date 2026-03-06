'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { JobData } from '@/components/jobs/AllJobsTable';

interface Props {
  jobs: JobData[];
}

const CustomHoverTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] p-3 shadow-xl rounded-lg text-white border border-slate-700">
        <p className="font-bold text-slate-300 text-xs mb-1">{label}</p>
        <p className="font-bold text-emerald-400">
          ₦{new Intl.NumberFormat().format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function RevenueChart({ jobs }: Props) {
  const data = useMemo(() => {
    // Group only valid historical NGN Jobs by Month-Year of Commencement
    const revenueByMonth = jobs.reduce((acc, job) => {
      if (job.currency !== 'NGN') return acc;
      
      const date = new Date(job.startDate);
      // Construct a sortable key, e.g., "2023-01"
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      acc[monthYear] = (acc[monthYear] || 0) + job.agreedPrice;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort chronologically
    return Object.entries(revenueByMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => {
        // Format label for display, e.g., "Jan 2023"
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          Revenue: value
        };
      })
      .slice(-12); // Keep only the trailing 12 months for chart sanity
  }, [jobs]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-slate-500 font-medium">
        Not enough historical NGN data to plot pipeline.
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `₦${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `₦${(val / 1000).toFixed(1)}K`;
    return `₦${val}`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <Tooltip content={<CustomHoverTooltip />} />
        <Area 
          type="monotone" 
          dataKey="Revenue" 
          stroke="#10B981" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
          activeDot={{ r: 6, fill: '#0f172a', stroke: '#10B981', strokeWidth: 2 }}
        />
        <XAxis 
          dataKey="month" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#64748B' }}
          dy={10}
          minTickGap={20}
        />
        <YAxis 
          tickFormatter={formatCurrency} 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#64748B' }}
          dx={-10}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

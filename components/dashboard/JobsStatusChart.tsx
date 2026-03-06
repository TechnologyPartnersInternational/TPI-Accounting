'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { JobData } from '@/components/jobs/AllJobsTable';

const COLORS = {
  'Completed': '#10B981', // Emerald
  'Ongoing': '#6366F1',   // Indigo
  'Pending': '#F59E0B',   // Amber
  'Overdue': '#EF4444',   // Red
};

interface Props {
  jobs: JobData[];
}

const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
        <p className="font-bold text-slate-800">{payload[0].name}</p>
        <p className="text-sm text-slate-500">
          {payload[0].value} {payload[0].value === 1 ? 'Job' : 'Jobs'}
        </p>
      </div>
    );
  }
  return null;
};

export function JobsStatusChart({ jobs }: Props) {
  const data = useMemo(() => {
    const statusCounts = jobs.reduce((acc, job) => {
      const status = job.status || 'Ongoing';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [jobs]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-slate-500 font-medium">
        No active jobs to visualize.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={65}
          outerRadius={95}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#94A3B8'} />
          ))}
        </Pie>
        <Tooltip content={<CustomPieTooltip />} />
        <Legend 
          iconType="circle" 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
          wrapperStyle={{ paddingTop: '10px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

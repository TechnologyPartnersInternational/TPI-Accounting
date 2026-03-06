'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ClientSummary } from '@/components/clients/ClientListTable';

interface Props {
  clients: ClientSummary[];
}

export function OutstandingDebtsChart({ clients }: Props) {
  // Process the dataset: Grab top 10 clients with highest outstanding NGN debts
  const data = useMemo(() => {
    return [...clients]
      .filter(c => c.ngnTotalOutstanding > 0)
      .sort((a, b) => b.ngnTotalOutstanding - a.ngnTotalOutstanding)
      .slice(0, 8) // Limit to top 8 so the x-axis doesn't clutter
      .map(c => ({
        name: c.clientName.length > 15 ? c.clientName.substring(0, 15) + '...' : c.clientName,
        'Amount Paid': c.ngnTotalPaid,
        'Outstanding Balance': c.ngnTotalOutstanding,
      }));
  }, [clients]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-slate-500 font-medium">
        No outstanding NGN debts on record.
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
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis 
          dataKey="name" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#64748B' }}
          dy={10}
        />
        <YAxis 
          tickFormatter={formatCurrency} 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#64748B' }}
          dx={-10}
        />
        <Tooltip
          cursor={{ fill: '#F8FAFC' }}
          contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [`₦${new Intl.NumberFormat().format(value)}`, '']}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
        <Bar dataKey="Amount Paid" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
        <Bar dataKey="Outstanding Balance" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

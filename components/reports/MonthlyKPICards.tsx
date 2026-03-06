'use client';

import { DollarSign, Briefcase, AlertCircle } from 'lucide-react';

interface MonthlyMetrics {
  totalRevenue: number;
  totalJobs: number;
  outstandingBalance: number;
}

export function MonthlyKPICards({ metrics }: { metrics: MonthlyMetrics }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Revenue */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Expected Revenue</p>
            <h2 className="text-3xl font-bold text-[#0f172a]">{formatCurrency(metrics.totalRevenue)}</h2>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* Total Jobs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Jobs</p>
            <h2 className="text-3xl font-bold text-[#0f172a]">{metrics.totalJobs}</h2>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Briefcase size={24} />
          </div>
        </div>
      </div>

      {/* Outstanding Balance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Outstanding</p>
            <h2 className="text-3xl font-bold text-[#0f172a]">{formatCurrency(metrics.outstandingBalance)}</h2>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}

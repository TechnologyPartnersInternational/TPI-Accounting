'use client';

import { JobData } from '@/components/jobs/AllJobsTable';
import { useMemo } from 'react';

interface MonthlyKPICardsProps {
  jobs: JobData[];
}

export function MonthlyKPICards({ jobs }: MonthlyKPICardsProps) {
  const metrics = useMemo(() => {
    return jobs.reduce((acc, job) => {
      const amtPaid = job.amountPaid || 0;
      const outstanding = job.agreedPrice - amtPaid;
      
      if (job.currency === 'NGN') {
        acc.ngnCost += job.agreedPrice;
        acc.ngnAdvance += amtPaid;
        acc.ngnBalance += outstanding;
      } else {
        acc.usdCost += job.agreedPrice;
        acc.usdAdvance += amtPaid;
        acc.usdBalance += outstanding;
      }
      return acc;
    }, { 
      ngnCost: 0, ngnAdvance: 0, ngnBalance: 0, 
      usdCost: 0, usdAdvance: 0, usdBalance: 0 
    });
  }, [jobs]);

  const formatCurrency = (amount: number, currency: 'NGN' | 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
      
      {/* Total Value */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center">
        <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-4">Total Value of Active Jobs</h3>
        <div className="space-y-3">
            <div className="flex items-end justify-between">
            <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">NGN</span>
            <span className="text-xl font-bold text-slate-900">{formatCurrency(metrics.ngnCost, 'NGN')}</span>
            </div>
            <div className="flex items-end justify-between pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">USD</span>
            <span className="text-xl font-bold text-slate-900">{formatCurrency(metrics.usdCost, 'USD')}</span>
            </div>
        </div>
      </div>

      {/* Amount Paid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center">
        <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-4">Total Amount Paid</h3>
        <div className="space-y-3">
            <div className="flex items-end justify-between">
            <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">NGN</span>
            <span className="text-xl font-semibold text-slate-700">{formatCurrency(metrics.ngnAdvance, 'NGN')}</span>
            </div>
            <div className="flex items-end justify-between pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">USD</span>
            <span className="text-xl font-semibold text-slate-700">{formatCurrency(metrics.usdAdvance, 'USD')}</span>
            </div>
        </div>
      </div>

      {/* Outstanding Balance */}
      <div className="bg-[#0f172a] rounded-2xl shadow-md border border-slate-800 p-6 flex flex-col justify-center relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        
        <h3 className="text-[13px] font-bold text-indigo-300 uppercase tracking-wider mb-4 relative z-10">Total Outstanding Balance</h3>
        <div className="space-y-3 relative z-10">
            <div className="flex items-end justify-between">
            <span className="text-xs font-bold text-red-300 bg-red-900/40 px-2 py-1 rounded border border-red-800">NGN</span>
            <span className={`text-xl font-bold ${metrics.ngnBalance > 0 ? 'text-white' : 'text-slate-400'}`}>
                {formatCurrency(metrics.ngnBalance, 'NGN')}
            </span>
            </div>
            <div className="flex items-end justify-between pt-3 border-t border-slate-700/60">
            <span className="text-xs font-bold text-red-300 bg-red-900/40 px-2 py-1 rounded border border-red-800">USD</span>
            <span className={`text-xl font-bold ${metrics.usdBalance > 0 ? 'text-white' : 'text-slate-400'}`}>
                {formatCurrency(metrics.usdBalance, 'USD')}
            </span>
            </div>
        </div>
      </div>

    </div>
  );
}

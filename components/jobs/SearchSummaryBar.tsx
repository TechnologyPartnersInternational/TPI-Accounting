'use client';

import { JobData } from '@/components/jobs/AllJobsTable';
import { useMemo } from 'react';

interface SearchSummaryBarProps {
  jobs: JobData[];
}

export function SearchSummaryBar({ jobs }: SearchSummaryBarProps) {

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      
      {/* Total Value Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-center">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Total Value of Filtered Jobs</h3>
        <div className="space-y-2">
            <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">NGN</span>
            <span className="text-base font-bold text-[#0f172a]">{formatCurrency(metrics.ngnCost, 'NGN')}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">USD</span>
            <span className="text-base font-bold text-[#0f172a]">{formatCurrency(metrics.usdCost, 'USD')}</span>
            </div>
        </div>
      </div>

      {/* Amount Paid Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-center">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Total Amount Paid</h3>
        <div className="space-y-2">
            <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">NGN</span>
            <span className="text-base font-medium text-gray-700">{formatCurrency(metrics.ngnAdvance, 'NGN')}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">USD</span>
            <span className="text-base font-medium text-gray-700">{formatCurrency(metrics.usdAdvance, 'USD')}</span>
            </div>
        </div>
      </div>

      {/* Outstanding Balance Card */}
      <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-5 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
        <h3 className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-3 relative z-10">Total Outstanding Balance</h3>
        <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-red-300 bg-red-900/40 px-1.5 py-0.5 rounded border border-red-800">NGN</span>
            <span className={`text-base font-bold ${metrics.ngnBalance > 0 ? 'text-white' : 'text-slate-400'}`}>
                {formatCurrency(metrics.ngnBalance, 'NGN')}
            </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-700">
            <span className="text-[10px] font-bold text-red-300 bg-red-900/40 px-1.5 py-0.5 rounded border border-red-800">USD</span>
            <span className={`text-base font-bold ${metrics.usdBalance > 0 ? 'text-white' : 'text-slate-400'}`}>
                {formatCurrency(metrics.usdBalance, 'USD')}
            </span>
            </div>
        </div>
      </div>

    </div>
  );
}

import { JobData } from './AllJobsTable';

export function SearchSummaryBar({ jobs }: { jobs: JobData[] }) {
  const totals = jobs.reduce(
    (acc, job) => {
      const isNGN = job.currency === 'NGN';
      if (isNGN) {
        acc.ngnCost += job.agreedPrice;
        acc.ngnReceived += (job.amountPaid || 0);
      } else {
        acc.usdCost += job.agreedPrice;
        acc.usdReceived += (job.amountPaid || 0);
      }
      return acc;
    },
    { ngnCost: 0, ngnReceived: 0, usdCost: 0, usdReceived: 0 }
  );

  const formatUsd = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatNgn = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NGN' }).format(val);

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="flex-1 bg-[#0f172a] text-white rounded-xl p-4 flex justify-between items-center shadow-md">
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Expected (NGN)</p>
          <p className="text-xl font-bold text-emerald-400">{formatNgn(totals.ngnCost)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Received (NGN)</p>
          <p className="text-xl font-bold">{formatNgn(totals.ngnReceived)}</p>
        </div>
      </div>
      
      <div className="flex-1 bg-[#1e293b] text-white rounded-xl p-4 flex justify-between items-center shadow-md">
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Expected (USD)</p>
          <p className="text-xl font-bold text-emerald-400">{formatUsd(totals.usdCost)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Received (USD)</p>
          <p className="text-xl font-bold">{formatUsd(totals.usdReceived)}</p>
        </div>
      </div>
    </div>
  );
}

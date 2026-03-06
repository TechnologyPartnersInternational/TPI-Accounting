import { getJobs } from '@/actions/jobActions';
import { AllJobsTable } from '@/components/jobs/AllJobsTable';
import { MonthlyKPICards } from '@/components/reports/MonthlyKPICards';
import { redirect } from 'next/navigation';
import { Download, Calendar, DollarSign } from 'lucide-react';

export default async function MonthlySummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const month = resolvedParams.month ? parseInt(resolvedParams.month as string) : new Date().getMonth() + 1;
  const year = resolvedParams.year ? parseInt(resolvedParams.year as string) : new Date().getFullYear();

  // Fetch only NGN jobs for the selected month according to user preference in previous conversations
  const jobsResponse: any = await getJobs({ month, year });
  const allJobs: any[] = jobsResponse.data || [];
  
  // NGN only for this basic summary
  const ngnJobs = allJobs.filter(j => j.currency === 'NGN' || !j.currency);

  const totalRevenue = ngnJobs.reduce((acc, job) => acc + (job.agreedPrice || 0), 0);
  const totalPaid = ngnJobs.reduce((acc, job) => acc + (job.amountPaid || 0), 0);
  const outstandingBalance = totalRevenue - totalPaid;

  const metrics = {
    totalRevenue,
    totalJobs: allJobs.length,
    outstandingBalance,
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Monthly Summary</h1>
          <p className="text-sm text-gray-500 mt-1">Review financial overview for specific months</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form className="flex items-center gap-3">
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Calendar size={18} className="text-gray-400" />
            <select name="month" defaultValue={month} className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer">
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <select name="year" defaultValue={year} className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-[#0f172a] hover:bg-slate-800 text-white font-medium text-sm rounded-lg transition-colors shadow-sm">
            View Month
          </button>
        </form>
      </div>

      <MonthlyKPICards metrics={metrics} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#0f172a]">Jobs for {months.find(m => m.value === month)?.label} {year}</h2>
        </div>
        
        {/* We use AllJobsTable directly since we have the data */}
        <AllJobsTable jobs={allJobs} totalJobs={allJobs.length} />
      </div>
    </div>
  );
}

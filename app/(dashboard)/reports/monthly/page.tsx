'use client';

import { useState, useEffect } from 'react';
import { getJobs } from '@/actions/jobActions';
import { JobData } from '@/components/jobs/AllJobsTable';
import { MonthlyKPICards } from '@/components/reports/MonthlyKPICards';
import { SearchResultsTable } from '@/components/jobs/SearchResultsTable';
import { BarChart3, CalendarDays } from 'lucide-react';

export default function MonthlySummaryPage() {
  // Setup default: Current Date
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  // The `<input type="month">` uses YYYY-MM format
  const defaultValue = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
  const [monthSelection, setMonthSelection] = useState<string>(defaultValue);
  
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Parse the value, run query
    if (!monthSelection) return;

    const [yearStr, monthStr] = monthSelection.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const fetchMonthlyData = async () => {
      setIsLoading(true);
      try {
        const response = await getJobs({ month, year });
        if (response.success && response.data) {
          setJobs(response.data as JobData[]);
        } else {
          setJobs([]);
        }
      } catch (e) {
        console.error("Error fetching monthly data", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthlyData();
  }, [monthSelection]);

  // Display helper for header
  const getDisplayDate = () => {
    if (!monthSelection) return 'Selected Month';
    const [year, month] = monthSelection.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs mb-3 border border-indigo-100">
            <BarChart3 size={14} /> Reporting Module
          </div>
          <h1 className="text-3xl font-bold text-[#0f172a]">{getDisplayDate()} Summary</h1>
          <p className="text-slate-500 mt-1.5 max-w-lg">
             Financial overview of all active, commenced, or due jobs securely overlapping the selected month block.
          </p>
        </div>

        {/* Date Selector */}
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                <CalendarDays size={20} />
            </div>
            <div className="pr-4">
               <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5 tracking-wider">Select Month</label>
               <input 
                 type="month"
                 value={monthSelection}
                 onChange={(e) => setMonthSelection(e.target.value)}
                 className="text-sm font-semibold text-slate-800 bg-transparent border-none p-0 focus:ring-0 outline-none w-32 cursor-pointer"
               />
            </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
           <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
           <p className="text-slate-500 font-medium mt-4">Generating financial models...</p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* KPI Summary Block */}
          <MonthlyKPICards jobs={jobs} />

          {/* Data Table */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4">{getDisplayDate()} Job Ledger</h2>
            <SearchResultsTable 
                jobs={jobs} 
                exportButtonLabel="Export Monthly Summary to Excel" 
            />
          </div>
        </div>
      )}

    </div>
  );
}

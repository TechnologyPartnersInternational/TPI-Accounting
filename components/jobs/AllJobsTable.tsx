'use client';

import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Edit, Eye, Filter, Download } from 'lucide-react';
import { JobRecordInput } from '@/actions/jobActions';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export interface JobData extends JobRecordInput {
  _id: string;
}

interface AllJobsTableProps {
  jobs: JobData[];
  totalJobs: number;
}

export function AllJobsTable({ jobs, totalJobs }: AllJobsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

  const formatCurrency = (amount: number, currency: 'NGN' | 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium border border-green-200">Completed</span>;
      case 'ONGOING':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-200">Ongoing</span>;
      case 'PENDING':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium border border-amber-200">Yet to commence</span>;
      case 'OVERDUE':
        return <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium border border-red-200">Overdue</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-50 text-gray-700 rounded-md text-xs font-medium border border-gray-200">{status}</span>;
    }
  };

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters('q', searchTerm);
  };

  // Group jobs by client directly in render logic or before
  // We want to calculate the rowspan for each client group
  const groupedJobs: { clientName: string; jobs: JobData[] }[] = [];
  const clientMap = new Map<string, JobData[]>();

  jobs.forEach(job => {
    if (!clientMap.has(job.clientName)) {
      clientMap.set(job.clientName, []);
    }
    clientMap.get(job.clientName)!.push(job);
  });

  clientMap.forEach((clientJobs, clientName) => {
    groupedJobs.push({ clientName, jobs: clientJobs });
  });

  // Calculate aggregates
  const aggregates = jobs.reduce(
    (acc, job) => {
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
    },
    { ngnCost: 0, ngnAdvance: 0, ngnBalance: 0, usdCost: 0, usdAdvance: 0, usdBalance: 0 }
  );
  const handleExport = async () => {
    try {
      const jobIds = jobs.map(j => j._id);
      
      const response = await fetch('/api/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: jobIds }),
      });
      
      if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `All_Jobs_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
      } else {
          console.error('Failed to export dataset');
          alert("Export Failed.");
      }
    } catch (e) {
        console.error("Export Exception: ", e);
        alert("Failed to generate export file. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col pt-4">
      
      {/* Table Controls */}
      <div className="px-6 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by client or job title..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm text-gray-900 placeholder-gray-500 bg-slate-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select 
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white text-sm font-medium text-gray-700"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                updateFilters('status', e.target.value);
              }}
            >
              <option value="">All Statuses</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Yet to commence</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <button 
            onClick={handleExport}
            disabled={jobs.length === 0}
            className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium rounded-lg text-sm transition-colors hover:bg-emerald-100 flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={16} />
            Export View
          </button>
        </div>
      </div>

      {/* The Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse min-w-[1200px]">
          <thead className="bg-[#f8fafc] text-xs uppercase text-gray-500 border-y border-gray-200">
            {/* Top Header Row for nested super-headers */}
            <tr>
              <th rowSpan={2} className="px-4 py-3 font-bold border-r border-gray-200 bg-[#f1f5f9] text-[#0f172a] shadow-[inset_0_-2px_0_rgba(0,0,0,0.05)] w-40">Client Name</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold border-r border-gray-200 w-64">Job Title</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold border-r border-gray-200 w-28 whitespace-nowrap">Commencement Date</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold border-r border-gray-200 w-28 whitespace-nowrap">Expiration Date</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold border-r border-gray-300 w-32 border-r-[2px]">Project Status</th>
              
              <th colSpan={2} className="px-4 py-2 font-bold text-center border-b border-gray-200 border-r-[2px] border-r-gray-300 bg-blue-50/50 text-[#0f172a]">Cost of Project</th>
              <th colSpan={2} className="px-4 py-2 font-bold text-center border-b border-gray-200 border-r-[2px] border-r-gray-300 bg-indigo-50/50 text-[#0f172a]">Advance Payment</th>
              <th colSpan={2} className="px-4 py-2 font-bold text-center border-b border-gray-200 border-r-[2px] border-r-gray-300 bg-red-50/50 text-[#0f172a]">Balance Payment</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold w-16 text-center">Actions</th>
            </tr>
            {/* Sub Header Row for Currencies */}
            <tr className="bg-white shadow-[inset_0_-1px_0_#e2e8f0]">
              <th className="px-3 py-2 font-semibold text-center border-r border-gray-200 whitespace-nowrap text-green-700 bg-green-50/30">Naira (NGN)</th>
              <th className="px-3 py-2 font-semibold text-center border-r-[2px] border-r-gray-300 whitespace-nowrap text-emerald-700 bg-emerald-50/30">Dollars (USD$)</th>
              
              <th className="px-3 py-2 font-semibold text-center border-r border-gray-200 whitespace-nowrap text-green-700 bg-green-50/30">Naira (NGN)</th>
              <th className="px-3 py-2 font-semibold text-center border-r-[2px] border-r-gray-300 whitespace-nowrap text-emerald-700 bg-emerald-50/30">Dollars (USD$)</th>
              
              <th className="px-3 py-2 font-semibold text-center border-r border-gray-200 whitespace-nowrap text-green-700 bg-green-50/30">Naira (NGN)</th>
              <th className="px-3 py-2 font-semibold text-center border-r-[2px] border-r-gray-300 whitespace-nowrap text-emerald-700 bg-emerald-50/30">Dollars (USD$)</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200 text-gray-700 bg-white">
            {groupedJobs.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-6 py-12 text-center text-gray-500 font-medium">
                  No jobs found matching your criteria.
                </td>
              </tr>
            ) : (
              groupedJobs.map((group, groupIndex) => 
                group.jobs.map((job, jobIndex) => {
                  const isFirstRowOfClient = jobIndex === 0;
                  const amtPaid = job.amountPaid || 0;
                  const outstanding = job.agreedPrice - amtPaid;
                  const isNGN = job.currency === 'NGN';
                  const isUSD = job.currency === 'USD';

                  return (
                    <tr key={job._id.toString()} className="hover:bg-slate-50 transition-colors">
                      {isFirstRowOfClient && (
                        <td 
                          rowSpan={group.jobs.length} 
                          className="px-4 py-4 font-bold text-[#0f172a] border-r border-gray-200 align-top bg-white border-b-gray-300"
                        >
                          <div className="sticky top-0">{group.clientName}</div>
                        </td>
                      )}
                      <td className={`px-4 py-3 border-r border-gray-200 ${!isFirstRowOfClient ? 'border-l border-gray-200' : ''}`}>
                        <span className="font-medium text-[#0f172a] block">{job.jobDescription}</span>
                        <span className="text-xs text-gray-400 mt-0.5 block">{job.category}</span>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200 text-gray-500">
                        {new Date(job.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200 text-gray-500 border-r-[2px]">
                        {new Date(job.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300 border-r-[2px]">
                        {getStatusBadge(job.status || 'Pending')}
                      </td>
                      
                      {/* Cost */}
                      <td className="px-3 py-3 border-r border-gray-200 text-right font-semibold text-[#0f172a]">
                        {isNGN ? formatCurrency(job.agreedPrice, 'NGN') : '-'}
                      </td>
                      <td className="px-3 py-3 border-r-[2px] border-gray-300 text-right font-semibold text-[#0f172a]">
                        {isUSD ? formatCurrency(job.agreedPrice, 'USD') : '-'}
                      </td>
                      
                      {/* Advance */}
                      <td className="px-3 py-3 border-r border-gray-200 text-right text-gray-600">
                        {isNGN ? formatCurrency(amtPaid, 'NGN') : '-'}
                      </td>
                      <td className="px-3 py-3 border-r-[2px] border-gray-300 text-right text-gray-600">
                        {isUSD ? formatCurrency(amtPaid, 'USD') : '-'}
                      </td>
                      
                      {/* Balance */}
                      <td className={`px-3 py-3 border-r border-gray-200 text-right font-semibold ${outstanding > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {isNGN ? formatCurrency(outstanding, 'NGN') : '-'}
                      </td>
                      <td className={`px-3 py-3 border-r-[2px] border-gray-300 text-right font-semibold ${outstanding > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {isUSD ? formatCurrency(outstanding, 'USD') : '-'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="View Details">
                            <Eye size={16} />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" title="Edit Job">
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )
            )}
            
            {/* Summary Footer Row */}
            {jobs.length > 0 && (
              <tr className="bg-[#f8fafc] border-t-2 border-slate-300/80 font-bold uppercase text-xs tracking-wider">
                <td colSpan={5} className="px-4 py-4 text-right text-[#0f172a] border-r-[2px] border-slate-300/80">
                  Total Summary
                </td>
                
                <td className="px-3 py-4 border-r border-gray-200 text-right text-[#0f172a]">
                  {formatCurrency(aggregates.ngnCost, 'NGN')}
                </td>
                <td className="px-3 py-4 border-r-[2px] border-slate-300/80 text-right text-[#0f172a]">
                  {formatCurrency(aggregates.usdCost, 'USD')}
                </td>
                
                <td className="px-3 py-4 border-r border-gray-200 text-right text-[#0f172a]">
                  {formatCurrency(aggregates.ngnAdvance, 'NGN')}
                </td>
                <td className="px-3 py-4 border-r-[2px] border-slate-300/80 text-right text-[#0f172a]">
                  {formatCurrency(aggregates.usdAdvance, 'USD')}
                </td>
                
                <td className="px-3 py-4 border-r border-gray-200 text-right text-red-700 bg-red-50/50">
                  {formatCurrency(aggregates.ngnBalance, 'NGN')}
                </td>
                <td className="px-3 py-4 border-r-[2px] border-slate-300/80 text-right text-red-700 bg-red-50/50">
                  {formatCurrency(aggregates.usdBalance, 'USD')}
                </td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Container */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
        <span className="text-sm text-gray-500">
          Showing <span className="font-semibold text-[#0f172a]">{jobs.length}</span> of <span className="font-semibold text-[#0f172a]">{totalJobs}</span> jobs
        </span>
        <div className="flex gap-1 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <button className="px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50 text-gray-600 border-r border-gray-200 flex items-center justify-center transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button className="px-4 py-1.5 text-sm font-semibold bg-indigo-50 text-indigo-600 border-r border-gray-200">1</button>
          <button className="px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50 text-gray-600 flex items-center justify-center transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

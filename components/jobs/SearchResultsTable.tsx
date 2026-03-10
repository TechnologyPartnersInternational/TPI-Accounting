'use client';

import { Edit, Eye, Download } from 'lucide-react';
import { JobData } from '@/components/jobs/AllJobsTable';
import Link from 'next/link';

interface Props {
  jobs: JobData[];
}

export function SearchResultsTable({ jobs }: Props) {
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

  const handleExport = async () => {
    try {
      const ids = jobs.map(j => j._id);
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Filtered_Search_Export.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        alert("Export failed.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to export filtered searches.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col pt-0 relative">
      {/* Top right floating export button */}
      {jobs.length > 0 && (
         <button 
           onClick={handleExport}
           className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold text-xs rounded-md shadow-sm hover:bg-indigo-100 flex items-center gap-1.5 transition-colors"
         >
           <Download size={14}/> Export Visible
         </button>
      )}

      {/* The Table Container */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-sm text-left border-collapse min-w-[1200px]">
          <thead className="bg-[#f8fafc] text-xs uppercase text-gray-500 border-y border-gray-200">
            <tr>
              <th rowSpan={2} className="px-4 py-3 font-bold border-r border-gray-200 bg-[#f1f5f9] text-[#0f172a] shadow-[inset_0_-2px_0_rgba(0,0,0,0.05)] w-40">Client Name</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold border-r border-gray-200 w-64">Job Title</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold border-r border-gray-200 w-28 whitespace-nowrap">Commencement Date</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold border-r border-gray-200 w-28 whitespace-nowrap">Expiration Date</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold border-r border-gray-300 w-32 border-r-2">Project Status</th>
              
              <th colSpan={2} className="px-4 py-2 font-bold text-center border-b border-gray-200 border-r-2 border-r-gray-300 bg-blue-50/50 text-[#0f172a]">Cost of Project</th>
              <th colSpan={2} className="px-4 py-2 font-bold text-center border-b border-gray-200 border-r-2 border-r-gray-300 bg-indigo-50/50 text-[#0f172a]">Advance Payment</th>
              <th colSpan={2} className="px-4 py-2 font-bold text-center border-b border-gray-200 border-r-2 border-r-gray-300 bg-red-50/50 text-[#0f172a]">Balance Payment</th>
              <th rowSpan={2} className="px-4 py-3 font-semibold w-16 text-center">Actions</th>
            </tr>
            <tr className="bg-white shadow-[inset_0_-1px_0_#e2e8f0]">
              <th className="px-3 py-2 font-semibold text-center border-r border-gray-200 whitespace-nowrap text-green-700 bg-green-50/30">Naira (NGN)</th>
              <th className="px-3 py-2 font-semibold text-center border-r-2 border-r-gray-300 whitespace-nowrap text-emerald-700 bg-emerald-50/30">Dollars (USD$)</th>
              
              <th className="px-3 py-2 font-semibold text-center border-r border-gray-200 whitespace-nowrap text-green-700 bg-green-50/30">Naira (NGN)</th>
              <th className="px-3 py-2 font-semibold text-center border-r-2 border-r-gray-300 whitespace-nowrap text-emerald-700 bg-emerald-50/30">Dollars (USD$)</th>
              
              <th className="px-3 py-2 font-semibold text-center border-r border-gray-200 whitespace-nowrap text-green-700 bg-green-50/30">Naira (NGN)</th>
              <th className="px-3 py-2 font-semibold text-center border-r-2 border-r-gray-300 whitespace-nowrap text-emerald-700 bg-emerald-50/30">Dollars (USD$)</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200 text-gray-700 bg-white">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-6 py-12 text-center text-gray-500 font-medium">
                  {/* Results are explicitly handled empty state in the page view so we just render nothing mostly */}
                  No matching jobs found. Adjust your search parameters upstairs.
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
                const amtPaid = job.amountPaid || 0;
                const outstanding = job.agreedPrice - amtPaid;
                const isNGN = job.currency === 'NGN';
                const isUSD = job.currency === 'USD';

                return (
                  <tr key={job._id.toString()} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-bold text-[#0f172a] border-r border-gray-200 align-top">
                      {job.clientName}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200">
                      <span className="font-medium text-[#0f172a] block">{job.jobDescription}</span>
                      <span className="text-xs text-gray-400 mt-0.5 block">{job.category}</span>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 text-gray-500">
                      {new Date(job.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 text-gray-500 border-r-2">
                      {new Date(job.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-300 border-r-2">
                      {getStatusBadge(job.status || 'Pending')}
                    </td>
                    
                    {/* Cost */}
                    <td className="px-3 py-3 border-r border-gray-200 text-right font-semibold text-[#0f172a]">
                      {isNGN ? formatCurrency(job.agreedPrice, 'NGN') : '-'}
                    </td>
                    <td className="px-3 py-3 border-r-2 border-gray-300 text-right font-semibold text-[#0f172a]">
                      {isUSD ? formatCurrency(job.agreedPrice, 'USD') : '-'}
                    </td>
                    
                    {/* Advance */}
                    <td className="px-3 py-3 border-r border-gray-200 text-right text-gray-600">
                      {isNGN ? formatCurrency(amtPaid, 'NGN') : '-'}
                    </td>
                    <td className="px-3 py-3 border-r-2 border-gray-300 text-right text-gray-600">
                      {isUSD ? formatCurrency(amtPaid, 'USD') : '-'}
                    </td>
                    
                    {/* Balance */}
                    <td className={`px-3 py-3 border-r border-gray-200 text-right font-semibold ${outstanding > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      {isNGN ? formatCurrency(outstanding, 'NGN') : '-'}
                    </td>
                    <td className={`px-3 py-3 border-r-2 border-gray-300 text-right font-semibold ${outstanding > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      {isUSD ? formatCurrency(outstanding, 'USD') : '-'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          href={`/jobs/${job._id}`}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" 
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link 
                          href={`/jobs/${job._id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" 
                          title="Edit Job"
                        >
                          <Edit size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Edit, Eye, Filter, Download } from 'lucide-react';
import { JobData } from '@/components/jobs/AllJobsTable';

interface ClientJobsTableProps {
  jobs: JobData[];
  clientName: string; 
}

export function ClientJobsTable({ jobs, clientName }: ClientJobsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter Jobs side-client
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.jobDescription.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? job.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      // Build query string matching the current filters applied to the client
      const params = new URLSearchParams({
        clientName: clientName
      });
      
      if (statusFilter) params.append('status', statusFilter);
      // Notice: we don't pass searchTerm as the export API expects structural filters, 
      // but clientName strongly isolates the dataset.

      const response = await fetch(`/api/export?${params.toString()}`);
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${clientName.replace(/\s+/g, '_')}_Jobs_Export.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to generate export file. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col pt-4">
      
      {/* Table Controls */}
      <div className="px-6 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search within client tasks..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm text-[#0f172a]"
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select 
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white text-sm font-medium text-[#0f172a]"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
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
            className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium rounded-lg text-sm transition-colors hover:bg-emerald-100 flex items-center gap-2"
          >
            <Download size={16} />
            Export Jobs
          </button>
        </div>
      </div>

      {/* The Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
          <thead className="bg-[#f8fafc] text-xs uppercase text-gray-500 border-y border-gray-200">
            <tr>
              <th rowSpan={2} className="px-6 py-3 font-semibold border-r border-gray-200 w-64 bg-[#f1f5f9] text-[#0f172a] shadow-[inset_0_-2px_0_rgba(0,0,0,0.05)]">Job Title</th>
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
            {paginatedJobs.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center text-gray-500 font-medium">
                  No jobs found matching your criteria for this client.
                </td>
              </tr>
            ) : (
              paginatedJobs.map((job) => {
                const amtPaid = job.amountPaid || 0;
                const outstanding = job.agreedPrice - amtPaid;
                const isNGN = job.currency === 'NGN';
                const isUSD = job.currency === 'USD';

                return (
                  <tr key={job._id.toString()} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 border-r border-gray-200">
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
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Container */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
          <span className="text-sm text-gray-500">
            Showing <span className="font-semibold text-[#0f172a]">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-semibold text-[#0f172a]">{Math.min(currentPage * itemsPerPage, filteredJobs.length)}</span> of <span className="font-semibold text-[#0f172a]">{filteredJobs.length}</span> jobs
          </span>
          <div className="flex gap-1 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50 text-gray-600 border-r border-gray-200 flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-4 py-1.5 text-sm font-semibold text-gray-700 border-r border-gray-200 flex items-center">
              Page {currentPage} of {totalPages}
            </span>
            <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50 text-gray-600 flex items-center justify-center transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

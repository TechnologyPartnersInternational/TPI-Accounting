'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { JobRecordInput } from '@/actions/jobActions';
import Link from 'next/link';

interface JobData extends JobRecordInput {
  _id: string;
}

interface DashboardTableProps {
  jobs: JobData[];
}

export function DashboardTable({ jobs }: DashboardTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.jobDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? job.category === categoryFilter : true;
    const matchesMonth = monthFilter ? new Date(job.dueDate).getMonth() === parseInt(monthFilter) : true;
    return matchesSearch && matchesCategory && matchesMonth;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider">COMPLETED</span>;
      case 'OVERDUE':
        return <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider">OVERDUE</span>;
      case 'PENDING':
        return <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider">PENDING</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 pt-6">
      
      {/* Table Toolbar */}
      <div className="px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Search by Client" 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-48 focus:outline-none focus:ring-1 focus:ring-[#0f172a] text-gray-900 placeholder-gray-500 bg-slate-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filters */}
          <div className="relative">
            <select 
              className="appearance-none flex items-center px-4 py-2 pr-8 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 bg-white focus:outline-none focus:ring-1 focus:ring-[#0f172a]"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i.toString()}>
                  {new Date(0, i).toLocaleString('en-US', { month: 'short' })}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select 
              className="appearance-none flex items-center px-4 py-2 pr-8 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 bg-white focus:outline-none focus:ring-1 focus:ring-[#0f172a]"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Tax Advisory">Tax Advisory</option>
              <option value="Audit & Assurance">Audit & Assurance</option>
              <option value="Accountancy Services">Accountancy Services</option>
              <option value="Financial Consulting">Financial Consulting</option>
              <option value="Others">Others</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* CTA Button */}
        <Link 
          href="/jobs/new"
          className="bg-[#0f172a] hover:bg-[#1e293b] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center shadow-sm whitespace-nowrap"
        >
          <span className="mr-1.5 text-lg leading-none">+</span> Log New Job
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#f8fafc] text-xs uppercase text-gray-500 font-semibold border-y border-gray-100">
            <tr>
              <th className="px-6 py-4">Client Name</th>
              <th className="px-6 py-4">Job Description</th>
              <th className="px-6 py-4">Cat</th>
              <th className="px-6 py-4 text-right">Agreed Price</th>
              <th className="px-6 py-4 text-right">Paid</th>
              <th className="px-6 py-4 text-right">Outstanding</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 opacity-90 text-gray-700">
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  No jobs found matching your filters.
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job._id.toString()} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-[#0f172a]">{job.clientName}</td>
                  <td className="px-6 py-4 text-gray-500">{job.jobDescription}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-semibold">{job.category}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">{formatCurrency(job.agreedPrice)}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(job.amountPaid || 0)}</td>
                  <td className={`px-6 py-4 text-right font-medium ${(job.agreedPrice - (job.amountPaid || 0)) > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {formatCurrency(job.agreedPrice - (job.amountPaid || 0))}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium">
                    {new Date(job.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(job.status || 'PENDING')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 text-sm text-gray-500">
        <p>Showing 1 to 5 of 142 clients</p>
        <div className="flex items-center space-x-1">
          <button className="p-1 hover:text-[#0f172a]"><ChevronLeft size={16} /></button>
          <button className="w-7 h-7 flex items-center justify-center rounded bg-[#0f172a] text-white font-medium text-xs">1</button>
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 font-medium text-xs transition-colors">2</button>
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 font-medium text-xs transition-colors">3</button>
          <button className="p-1 hover:text-[#0f172a]"><ChevronRight size={16} /></button>
        </div>
      </div>

    </div>
  );
}

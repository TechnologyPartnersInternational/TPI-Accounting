'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ArrowRight, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export type ClientSummary = {
  _id: string;
  clientName: string;
  contactEmail?: string;
  contactPhone?: string;
  industry?: string;
  ngnTotalValue: number;
  ngnTotalPaid: number;
  ngnTotalOutstanding: number;
  usdTotalValue: number;
  usdTotalPaid: number;
  usdTotalOutstanding: number;
  jobCount: number;
};

interface ClientListTableProps {
  clients: ClientSummary[];
}

type SortField = 'clientName' | 'totalValue' | 'totalOutstanding';
type SortDirection = 'asc' | 'desc';

export function ClientListTable({ clients }: ClientListTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('clientName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const EXCHANGE_RATE = 1500; // Mock rate for combining values for sorting purposes

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'clientName' ? 'asc' : 'desc'); // Default to sorting numeric values desc
    }
  };

  const filteredAndSortedClients = useMemo(() => {
    let result = [...clients];

    // Filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(client => 
        client.clientName.toLowerCase().includes(lowerSearch) ||
        (client.industry && client.industry.toLowerCase().includes(lowerSearch))
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA: string | number = 0;
      let valB: string | number = 0;

      if (sortField === 'clientName') {
        valA = a.clientName.toLowerCase();
        valB = b.clientName.toLowerCase();
      } else if (sortField === 'totalValue') {
        valA = a.ngnTotalValue + (a.usdTotalValue * EXCHANGE_RATE);
        valB = b.ngnTotalValue + (b.usdTotalValue * EXCHANGE_RATE);
      } else if (sortField === 'totalOutstanding') {
        valA = a.ngnTotalOutstanding + (a.usdTotalOutstanding * EXCHANGE_RATE);
        valB = b.ngnTotalOutstanding + (b.usdTotalOutstanding * EXCHANGE_RATE);
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [clients, searchTerm, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedClients.length / itemsPerPage);
  const paginatedClients = filteredAndSortedClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (amount: number, currency: 'NGN' | 'USD') => {
    if (!amount || amount === 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-indigo-600" /> 
      : <ChevronDown className="w-4 h-4 text-indigo-600" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col pt-4">
      
      {/* Search Bar */}
      <div className="px-6 pb-4 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search clients by name or industry..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm text-gray-900 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
          <thead className="bg-[#f8fafc] text-xs uppercase text-gray-500 border-y border-gray-200">
            <tr>
              <th 
                className="px-6 py-4 font-bold border-r border-gray-200 bg-[#f1f5f9] text-[#0f172a] shadow-[inset_0_-2px_0_rgba(0,0,0,0.05)] cursor-pointer group select-none w-1/4"
                onClick={() => handleSort('clientName')}
              >
                <div className="flex items-center gap-2">
                  Client Name <SortIcon field="clientName" />
                </div>
              </th>
              
              {/* Dual Column Header structure for Financials */}
              <th className="p-0 border-r border-gray-300 border-r-2" colSpan={2}>
                <div className="border-b border-gray-200 px-4 py-2 font-bold text-center bg-blue-50/50 text-[#0f172a] cursor-pointer group flex items-center justify-center gap-2"
                     onClick={() => handleSort('totalValue')}>
                  Total Value of All Jobs <SortIcon field="totalValue" />
                </div>
                <div className="flex bg-white">
                  <div className="flex-1 px-3 py-2 font-semibold text-center border-r border-gray-200 text-green-700 bg-green-50/30">Naira (NGN)</div>
                  <div className="flex-1 px-3 py-2 font-semibold text-center text-emerald-700 bg-emerald-50/30">Dollars (USD$)</div>
                </div>
              </th>

              <th className="p-0 border-r border-gray-300 border-r-2" colSpan={2}>
                <div className="border-b border-gray-200 px-4 py-2 font-bold text-center bg-indigo-50/50 text-[#0f172a]">
                  Total Amount Paid
                </div>
                <div className="flex bg-white">
                  <div className="flex-1 px-3 py-2 font-semibold text-center border-r border-gray-200 text-green-700 bg-green-50/30">Naira (NGN)</div>
                  <div className="flex-1 px-3 py-2 font-semibold text-center text-emerald-700 bg-emerald-50/30">Dollars (USD$)</div>
                </div>
              </th>

              <th className="p-0" colSpan={2}>
                <div className="border-b border-gray-200 px-4 py-2 font-bold text-center bg-red-50/50 text-[#0f172a] cursor-pointer group flex items-center justify-center gap-2"
                     onClick={() => handleSort('totalOutstanding')}>
                  Total Outstanding Balance <SortIcon field="totalOutstanding" />
                </div>
                <div className="flex bg-white">
                  <div className="flex-1 px-3 py-2 font-semibold text-center border-r border-gray-200 text-green-700 bg-green-50/30">Naira (NGN)</div>
                  <div className="flex-1 px-3 py-2 font-semibold text-center text-emerald-700 bg-emerald-50/30">Dollars (USD$)</div>
                </div>
              </th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200 text-gray-700 bg-white">
            {paginatedClients.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-gray-500 font-medium">
                  <Building2 size={48} className="mx-auto text-gray-300 mb-3" />
                  No clients found matching your search criteria.
                </td>
              </tr>
            ) : (
              paginatedClients.map((client) => {
                const hasOutstanding = client.ngnTotalOutstanding > 0 || client.usdTotalOutstanding > 0;
                
                return (
                  <tr key={client._id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4 border-r border-gray-200">
                      <Link href={`/clients/${client._id}`} className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex flex-col group-hover:translate-x-1 transition-transform">
                        <span>{client.clientName}</span>
                        {client.industry && <span className="text-xs font-normal text-gray-500 hover:no-underline mt-0.5">{client.industry}</span>}
                      </Link>
                      <div className="text-xs font-medium text-gray-400 mt-1.5 flex items-center gap-1">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded">{client.jobCount} job{client.jobCount !== 1 ? 's' : ''}</span>
                      </div>
                    </td>
                    
                    {/* Total Value */}
                    <td className="px-4 py-4 text-right font-semibold text-[#0f172a]">
                      {formatCurrency(client.ngnTotalValue, 'NGN')}
                    </td>
                    <td className="px-4 py-4 border-r-2 border-gray-300 text-right font-semibold text-[#0f172a]">
                      {formatCurrency(client.usdTotalValue, 'USD')}
                    </td>

                    {/* Total Paid */}
                    <td className="px-4 py-4 text-right text-gray-600 font-medium">
                      {formatCurrency(client.ngnTotalPaid, 'NGN')}
                    </td>
                    <td className="px-4 py-4 border-r-2 border-gray-300 text-right text-gray-600 font-medium">
                      {formatCurrency(client.usdTotalPaid, 'USD')}
                    </td>

                    {/* Total Outstanding */}
                    <td className={`px-4 py-4 text-right font-bold ${hasOutstanding ? 'text-red-600 bg-red-50/20' : 'text-gray-400'}`}>
                      {formatCurrency(client.ngnTotalOutstanding, 'NGN')}
                    </td>
                    <td className={`px-4 py-4 text-right font-bold ${hasOutstanding ? 'text-red-600 bg-red-50/20' : 'text-gray-400'}`}>
                      <div className="flex items-center justify-between">
                        <span className="flex-1 text-right">{formatCurrency(client.usdTotalOutstanding, 'USD')}</span>
                        <Link href={`/clients/${client._id}`} className="ml-3 text-gray-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                          <ArrowRight size={16} />
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

      {/* Pagination Container */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
          <span className="text-sm text-gray-500">
            Showing <span className="font-semibold text-[#0f172a]">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-semibold text-[#0f172a]">{Math.min(currentPage * itemsPerPage, filteredAndSortedClients.length)}</span> of <span className="font-semibold text-[#0f172a]">{filteredAndSortedClients.length}</span> clients
          </span>
          <div className="flex gap-1 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 border-r border-gray-200 flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-4 py-1.5 text-sm font-semibold text-gray-700 border-r border-gray-200 flex items-center">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 flex items-center justify-center transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

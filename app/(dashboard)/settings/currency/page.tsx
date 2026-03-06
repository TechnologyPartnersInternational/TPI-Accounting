'use client';

import { useState, useEffect } from 'react';
import { 
    DollarSign, 
    ArrowRightLeft, 
    History, 
    AlertCircle, 
    Check, 
    ShieldAlert, 
    ChevronLeft, 
    ChevronRight, 
    RefreshCw
} from 'lucide-react';
import { getCurrentRate, getRateHistory, updateRate } from '@/actions/exchangeRateActions';

type ExchangeRateRecord = {
  _id: string;
  ngnPerUsd: number;
  previousRate: number | null;
  changedBy: string;
  createdAt: string;
};

export default function CurrencySettingsPage() {
  const [currentRate, setCurrentRate] = useState<ExchangeRateRecord | null>(null);
  const [history, setHistory] = useState<ExchangeRateRecord[]>([]);
  
  // Form State
  const [newRateValue, setNewRateValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Hardcode dummy Admin name for standard auth mockup context
  const ACTIVE_ADMIN = "System Admin";

  const fetchActiveRate = async () => {
    try {
      const resp = await getCurrentRate();
      if (resp.success && resp.data) {
        setCurrentRate(resp.data);
      }
    } catch (e) {
      console.error("Failed to load active rate:", e);
    }
  };

  const fetchHistoryPage = async (page: number) => {
    setIsLoadingHistory(true);
    try {
      const resp = await getRateHistory(page, 10);
      if (resp.success && resp.data) {
        setHistory(resp.data.history);
        setTotalPages(resp.data.totalPages || 1);
        setCurrentPage(resp.data.currentPage || 1);
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Mount Effect
  useEffect(() => {
    fetchActiveRate();
    fetchHistoryPage(1);
  }, []);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    const parsedRate = parseFloat(newRateValue);
    
    if (isNaN(parsedRate) || parsedRate <= 0) {
      setErrorMessage("Please enter a valid numeric value greater than zero.");
      return;
    }
    
    if (currentRate && parsedRate === currentRate.ngnPerUsd) {
      setErrorMessage("The new rate must be different from the currently active rate.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await updateRate(parsedRate, ACTIVE_ADMIN);
      
      if (result.success) {
        setSuccessMessage("Exchange rate updated successfully!");
        setNewRateValue('');
        
        // Refresh grids
        fetchActiveRate();
        fetchHistoryPage(1);
        
        // Auto dismiss success toast
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage(result.message || "An error occurred while saving the rate.");
      }
    } catch (error) {
      setErrorMessage("An unexpected server error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number | null, allowFractions = true) => {
    if (val === null || val === undefined) return 'N/A';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: allowFractions ? 2 : 0,
    }).format(val).replace('NGN', '₦');
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(d);
  };

  return (
    <div className="w-full pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs mb-3 border border-indigo-100">
            <DollarSign size={14} /> Global System Variable
          </div>
          <h1 className="text-3xl font-bold text-[#0f172a]">Currency Rates</h1>
          <p className="text-slate-500 mt-1.5 max-w-lg">
             Manage the central NGN ⇄ USD exchange multiplier. Rate updates will instantly propagate across all financial calculations system-wide.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        
        {/* Active Rate Hero Widget */}
        <div className="md:col-span-1 bg-gradient-to-br from-indigo-900 to-[#0f172a] rounded-2xl shadow-xl overflow-hidden border border-indigo-800 relative">
           <div className="absolute top-0 right-0 p-4 opacity-10">
               <ArrowRightLeft size={120} />
           </div>
           
           <div className="relative p-6 h-full flex flex-col justify-center">
             <div className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                 Active Multiplier
             </div>
             
             {currentRate ? (
               <div className="space-y-1">
                 <div className="flex items-baseline gap-2">
                   <span className="text-4xl text-white font-black tracking-tight">1</span>
                   <span className="text-indigo-300 font-semibold">USD</span>
                 </div>
                 <div className="h-0.5 w-12 bg-indigo-500/50 my-3 rounded-full"></div>
                 <div className="flex items-baseline gap-2">
                   <span className="text-4xl text-emerald-400 font-black tracking-tight">
                     {new Intl.NumberFormat('en-US').format(currentRate.ngnPerUsd)}
                   </span>
                   <span className="text-emerald-100 font-semibold">NGN</span>
                 </div>
               </div>
             ) : (
               <div className="text-slate-400">Loading Active Rate...</div>
             )}

             {currentRate && (
               <div className="mt-8 pt-4 border-t border-white/10 text-xs text-indigo-200/60 font-medium">
                 Last updated: {formatDate(currentRate.createdAt)}<br />
                 by {currentRate.changedBy}
               </div>
             )}
           </div>
        </div>

        {/* Update Form Widget */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-1">
           <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <ShieldAlert className="text-amber-500" size={24} />
                <h2 className="text-xl font-bold text-slate-800">Assign New Rate</h2>
              </div>
              
              <div className="mb-6 bg-slate-50 border border-slate-100 rounded-lg p-4 text-sm text-slate-600">
                Updating this underlying value instantly modifies real-time aggregated Cost profiles across all Active & Historical database renderings. This action is permanently audited.
              </div>

              {errorMessage && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                      <span className="text-sm text-red-700 font-medium">{errorMessage}</span>
                  </div>
              )}

              {successMessage && (
                  <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                      <Check className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                      <span className="text-sm text-emerald-700 font-medium">{successMessage}</span>
                  </div>
              )}

              <form onSubmit={handleUpdateSubmit} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="w-full sm:flex-1">
                   <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                     New NGN per 1 USD
                   </label>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₦</span>
                      <input 
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g. 1500.00"
                        value={newRateValue}
                        onChange={(e) => setNewRateValue(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-900 transition-shadow"
                      />
                   </div>
                </div>
                
                <button 
                  type="submit"
                  disabled={isSubmitting || !newRateValue}
                  className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-200 hover:shadow-md hover:shadow-indigo-300 hover:-translate-y-0.5"
                >
                  {isSubmitting ? (
                    <RefreshCw className="animate-spin" size={18} />
                   ) : (
                    <ArrowRightLeft size={18} />
                   )}
                  Save Architecture Rate
                </button>
              </form>
           </div>
        </div>

      </div>

      {/* Historical Audit Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col pt-2">
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <History className="text-indigo-600" size={20} />
              <h2 className="text-lg font-bold text-slate-800">Historical Rates Ledger</h2>
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Immutable Audit Trail</span>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-sm text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-50/80 text-xs uppercase text-slate-500 border-y border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold border-r border-slate-200 w-1/4">Date of Change</th>
                  <th className="px-6 py-4 font-bold text-right">Previous Rate</th>
                  <th className="px-6 py-4 font-bold text-right border-l border-slate-200 bg-indigo-50/30 text-indigo-800">New Rate</th>
                  <th className="px-6 py-4 font-bold border-l border-slate-200">Changed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingHistory ? (
                   <tr>
                     <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        <RefreshCw className="animate-spin inline-block mr-2" size={16} /> Loading Audit Log...
                     </td>
                   </tr>
                ) : history.length === 0 ? (
                   <tr>
                     <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                        No historical rate changes logged yet.
                     </td>
                   </tr>
                ) : (
                  history.map((record, index) => {
                    const isNewest = currentPage === 1 && index === 0;
                    return (
                      <tr key={record._id} className={`${isNewest ? 'bg-indigo-50/20' : 'hover:bg-slate-50/50'} transition-colors group`}>
                         <td className="px-6 py-4 border-r border-slate-100">
                           <div className="font-semibold text-slate-800 flex items-center gap-2">
                             {formatDate(record.createdAt)}
                             {isNewest && <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm">Active</span>}
                           </div>
                         </td>
                         <td className="px-6 py-4 text-right">
                           <div className="font-medium text-slate-400">
                             {record.previousRate ? `1 USD = ${formatCurrency(record.previousRate)}` : 'Initial Baseline'}
                           </div>
                         </td>
                         <td className="px-6 py-4 text-right border-l border-slate-100 bg-indigo-50/10 font-bold text-indigo-700">
                           1 USD = {formatCurrency(record.ngnPerUsd)}
                         </td>
                         <td className="px-6 py-4 border-l border-slate-100">
                           <div className="flex items-center gap-2 text-slate-600 font-medium">
                             <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 border border-slate-300">
                               {record.changedBy.charAt(0)}
                             </div>
                             {record.changedBy}
                           </div>
                         </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
           </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
             <span className="text-sm text-slate-500 font-medium">
               Page <span className="text-slate-800 font-bold">{currentPage}</span> of <span className="text-slate-800 font-bold">{totalPages}</span>
             </span>
             <div className="flex gap-1 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <button 
                  onClick={() => fetchHistoryPage(currentPage - 1)}
                  disabled={currentPage === 1 || isLoadingHistory}
                  className="px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 border-r border-slate-200 flex items-center transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => fetchHistoryPage(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoadingHistory}
                  className="px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 flex items-center transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
             </div>
          </div>
        )}

      </div>

    </div>
  );
}

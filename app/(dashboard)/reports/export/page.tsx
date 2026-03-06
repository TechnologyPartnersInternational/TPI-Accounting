'use client';

import { useState, useEffect, useMemo } from 'react';
import { Download, Calendar, Users, Search, AlertCircle, FileSpreadsheet, Check } from 'lucide-react';
import { getClients } from '@/actions/clientActions';

export default function ExportDataPage() {
  const [clients, setClients] = useState<{ _id: string; clientName: string }[]>([]);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await getClients();
        if (res.success && res.data) {
          // Sort clients alphabetically for easier scanning
          const sortedClients = (res.data as any[]).sort((a, b) => a.clientName.localeCompare(b.clientName));
          setClients(sortedClients);
        }
      } catch (err) {
        console.error("Failed to fetch clients for export selector", err);
      }
    };
    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    if (!clientSearchQuery) return clients;
    return clients.filter(c => c.clientName.toLowerCase().includes(clientSearchQuery.toLowerCase()));
  }, [clients, clientSearchQuery]);

  const toggleClientSelection = (clientId: string) => {
    const newSet = new Set(selectedClients);
    if (newSet.has(clientId)) {
      newSet.delete(clientId);
    } else {
      newSet.add(clientId);
    }
    setSelectedClients(newSet);
    setExportSuccess(false); // Reset success state if they change parameters
  };

  const toggleSelectAll = () => {
    if (selectedClients.size === filteredClients.length) {
      setSelectedClients(new Set()); // Deselect all currently filtered
    } else {
      const newSet = new Set(selectedClients);
      filteredClients.forEach(c => newSet.add(c._id));
      setSelectedClients(newSet);
    }
    setExportSuccess(false);
  };

  const isAllFilteredSelected = filteredClients.length > 0 && 
    filteredClients.every(c => selectedClients.has(c._id));

  // Determine if at least one parameter is selected to allow export
  const canExport = selectedClients.size > 0 || (startDate && endDate);

  const handleExport = async () => {
    setIsExporting(true);
    setExportError('');
    setExportSuccess(false);

    try {
      // Map Object IDs back to Client Names since our database filters currently index heavily on string names.
      // E.g. Search Jobs and Client Detail tabs both use the client name string for their filter payload hook.
      const selectedClientNames = Array.from(selectedClients).map(id => {
        return clients.find(c => c._id === id)?.clientName || '';
      }).filter(Boolean);

      const payload = {
        filters: {
          clientName: selectedClientNames.length > 0 ? selectedClientNames : undefined,
          commencementStart: startDate || undefined,
          expirationEnd: endDate || undefined,
        }
      };

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
         throw new Error('Failed to fetch dataset from server.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Custom_TPI_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      setExportSuccess(true);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setExportSuccess(false), 5000);

    } catch (err) {
      console.error("Export exception:", err);
      setExportError("Failed to generate export file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-12">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs mb-3 border border-indigo-100">
            <Download size={14} /> Data Portability
          </div>
          <h1 className="text-3xl font-bold text-[#0f172a]">Export Data</h1>
          <p className="text-slate-500 mt-1.5 max-w-lg">
             Generate custom financial Excel reports. Select specific clients and date boundaries below to aggregate precise ledger exports.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Client Selection Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-100 bg-slate-50/50">
                <Users className="text-indigo-600" size={20} />
                <h2 className="text-lg font-bold text-slate-800">1. Client Selection</h2>
            </div>
            
            <div className="p-6">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search clients..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm text-slate-900"
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {filteredClients.length} Available Clients
                    </span>
                    <button 
                      onClick={toggleSelectAll}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1.5 rounded-md"
                    >
                      {isAllFilteredSelected ? 'Deselect All Filtered' : 'Select All Filtered'}
                    </button>
                </div>

                {/* Client Checkbox Container */}
                <div className="border border-slate-200 rounded-lg overflow-y-auto max-h-[300px] bg-slate-50/30 p-2 space-y-1">
                    {filteredClients.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-sm italic">
                            No clients match your search.
                        </div>
                    ) : (
                        filteredClients.map(client => (
                            <label key={client._id} className="flex items-center gap-3 p-2.5 hover:bg-white rounded-md cursor-pointer group transition-colors border border-transparent hover:border-slate-200 hover:shadow-sm">
                                <input 
                                   type="checkbox" 
                                   className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                   checked={selectedClients.has(client._id)}
                                   onChange={() => toggleClientSelection(client._id)}
                                />
                                <span className={`text-sm ${selectedClients.has(client._id) ? 'font-bold text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{client.clientName}</span>
                            </label>
                        ))
                    )}
                </div>
            </div>
          </div>

          {/* Date Range Selection Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-100 bg-slate-50/50">
                <Calendar className="text-indigo-600" size={20} />
                <h2 className="text-lg font-bold text-slate-800">2. Date Boundaries</h2>
                <span className="ml-auto text-xs font-medium text-slate-400 italic">(Optional)</span>
            </div>
            
            <div className="p-6">
                <p className="text-sm text-slate-500 mb-5">
                    Limit the export to jobs starting after the Start Date and ending before the End Date. Leave blank to process the entire history.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div>
                       <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Commencement Start Date</label>
                       <input 
                         type="date" 
                         value={startDate}
                         onChange={(e) => { setStartDate(e.target.value); setExportSuccess(false); }}
                         className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800"
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Expiration End Date</label>
                       <input 
                         type="date" 
                         value={endDate}
                         onChange={(e) => { setEndDate(e.target.value); setExportSuccess(false); }}
                         className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800"
                       />
                   </div>
                </div>
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Summary & Action */}
        <div className="space-y-6">
            <div className="bg-[#0f172a] rounded-xl shadow-lg border border-slate-800 p-6 sticky top-8 text-white">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/60">
                    <FileSpreadsheet className="text-emerald-400" size={24} />
                    <h2 className="text-xl font-bold">Report Summary</h2>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Total Clients Selected</span>
                        <span className="font-mono font-bold text-lg">{selectedClients.size > 0 ? selectedClients.size : 'All'}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm border-t border-slate-700/60 pt-4">
                        <span className="text-slate-400">Timeframe</span>
                        {startDate || endDate ? (
                            <span className="font-medium text-emerald-300 text-xs">
                                {startDate ? new Date(startDate).toLocaleDateString() : 'Beginning of Time'} 
                                {' - '} 
                                {endDate ? new Date(endDate).toLocaleDateString() : 'Present Day'}
                            </span>
                        ) : (
                            <span className="font-medium text-amber-200">Entire History</span>
                        )}
                    </div>
                </div>

                {exportError && (
                    <div className="mb-6 p-3 bg-red-900/30 border border-red-800 rounded-lg flex items-start gap-2">
                        <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
                        <span className="text-sm text-red-200">{exportError}</span>
                    </div>
                )}

                {exportSuccess && (
                    <div className="mb-6 p-3 bg-emerald-900/30 border border-emerald-800 rounded-lg flex items-start gap-2 animate-in fade-in">
                        <Check className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                        <span className="text-sm text-emerald-200">Report generated successfully! Check your downloads folder.</span>
                    </div>
                )}

                <button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/50 disabled:text-emerald-200/50 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.15)] disabled:shadow-none"
                >
                    {isExporting ? (
                       <>
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         Generating Excel File...
                       </>
                    ) : (
                       <>
                         <Download size={18} />
                         Generate Excel Report
                       </>
                    )}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}

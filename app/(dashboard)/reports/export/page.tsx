'use client';

import { useState, useEffect } from 'react';
import { getClients } from '@/actions/clientActions';
import { Download, Calendar, Search, FileSpreadsheet, Check, CheckSquare, Square } from 'lucide-react';

export default function ExportDataPage() {
  const [clients, setClients] = useState<{ _id: string; clientName: string }[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function load() {
      const res: any = await getClients();
      if (res.success && res.data) {
        setClients(res.data.sort((a: any, b: any) => a.clientName.localeCompare(b.clientName)));
      }
    }
    load();
  }, []);

  const filteredClients = clients.filter(c => c.clientName.toLowerCase().includes(search.toLowerCase()));
  const allSelected = selectedClients.length > 0 && selectedClients.length === clients.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map(c => c._id));
    }
  };

  const toggleClient = (id: string) => {
    if (selectedClients.includes(id)) {
      setSelectedClients(selectedClients.filter(c => c !== id));
    } else {
      setSelectedClients([...selectedClients, id]);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const query = new URLSearchParams();
      selectedClients.forEach(id => query.append('clientIds', id));
      if (startDate) query.append('startDate', startDate);
      if (endDate) query.append('endDate', endDate);

      // Call the API endpoint we've set up
      const response = await fetch(`/api/export?${query.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TPI_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      console.error(e);
      alert("Failed to generate export file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-[#0f172a]">Export Data</h1>
        <p className="text-sm text-gray-500 mt-1">Generate custom Excel reports for your clients and jobs</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span> 
            Client Selection
          </h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-shadow"
            />
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col h-64">
            <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
              <button 
                onClick={toggleAll}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
               >
                {allSelected ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} className="text-gray-400" />}
                Select All Clients
              </button>
              <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                {selectedClients.length} selected
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {filteredClients.map(client => {
                const isSelected = selectedClients.includes(client._id);
                return (
                  <button
                    key={client._id}
                    onClick={() => toggleClient(client._id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md mb-1 transition-colors ${
                      isSelected ? 'bg-indigo-50 text-indigo-900 border border-indigo-100' : 'hover:bg-slate-50 text-gray-700 border border-transparent'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex flex-shrink-0 items-center justify-center ${
                      isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span className="text-sm font-medium text-left">{client.clientName}</span>
                  </button>
                )
              })}
              {filteredClients.length === 0 && (
                <div className="h-full flex items-center justify-center text-sm text-gray-500 font-medium pb-8 pt-8">
                  No clients match your search
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span> 
            Date Range (Optional)
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 whitespace-nowrap">From Details (Commencement)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow text-sm text-gray-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow text-sm text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleExport}
          disabled={isExporting || selectedClients.length === 0}
          className="px-6 py-3 bg-[#0f172a] hover:bg-slate-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-md flex items-center gap-2 text-sm"
        >
          {isExporting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FileSpreadsheet size={18} />
          )}
          {isExporting ? 'Generating Report...' : `Generate Excel Report (${selectedClients.length} Clients)`}
        </button>
      </div>
    </div>
  );
}

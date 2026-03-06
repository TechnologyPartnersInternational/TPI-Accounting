'use client';

import { useState } from 'react';
import { SearchSummaryBar } from '@/components/jobs/SearchSummaryBar';
import { SearchResultsTable } from '@/components/jobs/SearchResultsTable';
import { JobData } from '@/components/jobs/AllJobsTable';
import { getJobs, JobFilters } from '@/actions/jobActions';
import { Search, RotateCcw, Building2, Briefcase, Filter, Calendar, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

export default function SearchJobsPage() {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<JobData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Filter States
  const [clientName, setClientName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<string[]>([]);
  const [category, setCategory] = useState<string[]>([]);
  const [currency, setCurrency] = useState('BOTH');
  
  // Date Ranges
  const [commencementStart, setCommencementStart] = useState('');
  const [commencementEnd, setCommencementEnd] = useState('');
  const [expirationStart, setExpirationStart] = useState('');
  const [expirationEnd, setExpirationEnd] = useState('');

  const handleSearch = async () => {
    setIsLoading(true);
    
    // Construct filters object
    const filters: JobFilters = {
      clientName: clientName || undefined,
      searchQuery: searchQuery || undefined,
      status: status.length > 0 ? status : undefined,
      category: category.length > 0 ? category : undefined,
      currency: currency !== 'BOTH' ? currency : undefined,
      commencementStart: commencementStart || undefined,
      commencementEnd: commencementEnd || undefined,
      expirationStart: expirationStart || undefined,
      expirationEnd: expirationEnd || undefined,
    };

    try {
      const response = await getJobs(filters);
      if (response.success && response.data) {
        setResults(response.data as JobData[]);
      } else {
        console.error("Filter error:", response.error);
        setResults([]);
      }
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
      // Auto-collapse large filter panel on mobile/small screens after search
      if (window.innerWidth < 768) {
          setIsFilterPanelOpen(false);
      }
    }
  };

  const handleClearFilters = () => {
    setClientName('');
    setSearchQuery('');
    setStatus([]);
    setCategory([]);
    setCurrency('BOTH');
    setCommencementStart('');
    setCommencementEnd('');
    setExpirationStart('');
    setExpirationEnd('');
    setResults([]);
    setHasSearched(false);
  };

  const toggleArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
            <Search className="text-indigo-600" /> Advanced Search
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pinpoint historical data across multiple criteria dynamically.
          </p>
        </div>
      </div>

      {/* Main Filter Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
        
        {/* Panel Header Toggle */}
        <div 
          onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          className="bg-slate-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
            <Filter size={18} className="text-indigo-500" />
            Filter Parameters
          </div>
          <button className="text-gray-400 hover:text-indigo-600">
             {isFilterPanelOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Panel Body */}
        {isFilterPanelOpen && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Column 1: Core Text Queries */}
            <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1.5">
                    <Building2 size={14}/> Client Target
                  </label>
                  <input 
                    type="text" 
                    placeholder="Exact client name..." 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1.5">
                    <Briefcase size={14}/> Keyword Search
                  </label>
                  <input 
                    type="text" 
                    placeholder="Search by Title or Description..." 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
            </div>

            {/* Column 2: Status & Category Arrays */}
            <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1.5">
                    <Filter size={14}/> Project Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                     {['Ongoing', 'Completed', 'Pending', 'Overdue'].map(s => (
                       <button 
                         key={s}
                         onClick={() => toggleArrayItem(setStatus, s)}
                         className={`text-xs px-2.5 py-1.5 rounded-md border font-medium transition-colors ${status.includes(s) ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-slate-50'}`}
                       >
                         {s}
                       </button>
                     ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Service Category</label>
                  <div className="flex flex-wrap gap-2">
                     {['Tax Advisory', 'Audit & Assurance', 'Accountancy Services', 'Financial Consulting', 'Others'].map(c => (
                       <button 
                         key={c}
                         onClick={() => toggleArrayItem(setCategory, c)}
                         className={`text-xs px-2.5 py-1.5 rounded-md border font-medium transition-colors ${category.includes(c) ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-slate-50'}`}
                       >
                         {c}
                       </button>
                     ))}
                  </div>
                </div>
            </div>

            {/* Column 3: Dates */}
            <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1.5">
                    <Calendar size={14}/> Commencement Range
                  </label>
                  <div className="flex items-center gap-2">
                      <input 
                        type="date"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 text-gray-600 outline-none"
                        value={commencementStart}
                        onChange={(e) => setCommencementStart(e.target.value)}
                      />
                      <span className="text-gray-400">to</span>
                      <input 
                        type="date"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 text-gray-600 outline-none"
                        value={commencementEnd}
                        onChange={(e) => setCommencementEnd(e.target.value)}
                      />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Expiration Range</label>
                  <div className="flex items-center gap-2">
                       <input 
                        type="date"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 text-gray-600 outline-none"
                        value={expirationStart}
                        onChange={(e) => setExpirationStart(e.target.value)}
                      />
                      <span className="text-gray-400">to</span>
                      <input 
                        type="date"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 text-gray-600 outline-none"
                        value={expirationEnd}
                        onChange={(e) => setExpirationEnd(e.target.value)}
                      />
                  </div>
                </div>
            </div>

            {/* Column 4: Currency & Actions */}
            <div className="space-y-6 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1.5">
                    <DollarSign size={14}/> Primary Currency
                  </label>
                  <div className="flex gap-2">
                     {['BOTH', 'NGN', 'USD'].map(curr => (
                       <button 
                         key={curr}
                         onClick={() => setCurrency(curr)}
                         className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${currency === curr ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-slate-50'}`}
                       >
                         {curr}
                       </button>
                     ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                   <button 
                    onClick={handleClearFilters}
                    className="flex-1 py-2.5 px-4 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                   >
                     <RotateCcw size={16} /> Reset
                   </button>
                   <button 
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="flex-[2] py-2.5 px-4 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                   >
                     {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     ) : (
                        <><Search size={16} /> Run Search</>
                     )}
                   </button>
                </div>
            </div>

          </div>
        </div>
        )}
      </div>

      {/* Render Results Area only when a search has occurred or is cleared */}
      {hasSearched && (
         <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <SearchSummaryBar jobs={results} />
           <SearchResultsTable jobs={results} />
         </div>
      )}

    </div>
  );
}

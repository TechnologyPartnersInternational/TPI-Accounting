'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createJob, updateJob, JobRecordInput } from '@/actions/jobActions';
import { getClients } from '@/actions/clientActions';
import { AddClientModal } from '@/components/clients/AddClientModal';
import { Search, Plus, Calendar, DollarSign, PenTool, CheckCircle, Package } from 'lucide-react';

interface NewJobFormProps {
  initialData?: JobRecordInput & { _id: string };
}

export function NewJobForm({ initialData }: NewJobFormProps) {
  const router = useRouter();
  
  // -- State variables --
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  
  // Client Autocomplete State
  const [clientSearchText, setClientSearchText] = useState('');
  const [clients, setClients] = useState<{clientName: string}[]>([]);
  const [isSearchingClients, setIsSearchingClients] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form Field State
  const [formData, setFormData] = useState<Partial<JobRecordInput>>(initialData || {
    clientName: '',
    category: '',
    currency: 'NGN',
    agreedPrice: 0,
    amountPaid: 0,
    status: 'Ongoing',
  });

  // Handle setting client search text if initialData exists
  useEffect(() => {
    if (initialData?.clientName) {
      setClientSearchText(initialData.clientName);
    }
  }, [initialData]);

  // Derived Fields
  const outstandingBalance = (formData.agreedPrice || 0) - (formData.amountPaid || 0);
  
  // -- Handlers --
  const fetchClients = async (search = '') => {
    setIsSearchingClients(true);
    const result = await getClients(search);
    if (result.success && result.data) {
      setClients(result.data as {clientName: string}[]);
    }
    setIsSearchingClients(false);
  };

  // -- Effects --
  useEffect(() => {
    // Fetch clients on mount
    fetchClients();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setClientSearchText(value);
    setFormData(prev => ({ ...prev, clientName: value }));
    setShowDropdown(true);
    fetchClients(value);
  };

  const selectClient = (name: string) => {
    setClientSearchText(name);
    setFormData(prev => ({ ...prev, clientName: name }));
    setShowDropdown(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto-parse numbers
    if (name === 'agreedPrice' || name === 'amountPaid') {
      const numValue = value === '' ? 0 : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!formData.clientName) {
      setError('A Client Name must be selected or entered.');
      setIsSubmitting(false);
      return;
    }

    let response;
    if (initialData?._id) {
      response = await updateJob(initialData._id, formData as JobRecordInput);
    } else {
      response = await createJob(formData as JobRecordInput);
    }
    
    const { success, error: submitError } = response;
    
    if (success) {
      router.push('/jobs'); // Standard redirect back to the All Jobs table
    } else {
      setError(submitError || `Failed to successfully ${initialData ? 'update' : 'create'} the job record.`);
      setIsSubmitting(false);
    }
  };

  // Mock Currency Conversion rate (1 USD = 1500 NGN)
  // In a real app this would be fetched from settings, but we implement basic display logic here per requirements.
  const EXCHANGE_RATE = 1500;
  
  const getConvertedValue = (amount: number) => {
    if (formData.currency === 'NGN') {
      return (amount / EXCHANGE_RATE).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    } else {
      return (amount * EXCHANGE_RATE).toLocaleString('en-US', { style: 'currency', currency: 'NGN' });
    }
  };

  const PrimarySymbol = formData.currency === 'NGN' ? '₦' : '$';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 relative">
      <AddClientModal 
        isOpen={isClientModalOpen} 
        onClose={() => setIsClientModalOpen(false)} 
        onSuccess={(name) => {
          selectClient(name);
          setIsClientModalOpen(false);
        }} 
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 border border-red-100">
            <span className="font-semibold block">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* Client Search */}
            <div className="space-y-2 relative" ref={dropdownRef}>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-800">Client Name <span className="text-red-500">*</span></label>
                <button 
                  type="button" 
                  onClick={() => setIsClientModalOpen(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={14} /> Add New Client
                </button>
              </div>
              
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={clientSearchText}
                  onChange={handleClientSearchChange}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-[#0f172a] focus:border-[#0f172a] text-gray-900 placeholder-gray-500 bg-slate-50"
                  placeholder="Search existing clients..."
                />
                
                {showDropdown && clients.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {clients.map(c => (
                      <div 
                        key={c.clientName} 
                        onClick={() => selectClient(c.clientName)}
                        className="px-4 py-2.5 hover:bg-indigo-50 cursor-pointer border-b border-gray-50 last:border-0 text-sm font-medium text-gray-700 transition-colors"
                      >
                        {c.clientName}
                      </div>
                    ))}
                  </div>
                )}
                
                {showDropdown && clients.length === 0 && !isSearchingClients && clientSearchText && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-center text-sm text-gray-500">
                    No clients found matching &ldquo;{clientSearchText}&rdquo;. <br />
                    Click &ldquo;+ Add New Client&rdquo; above.
                  </div>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <PenTool size={16} className="text-gray-400"/> Job Description & Title <span className="text-red-500">*</span>
              </label>
              <textarea
                name="jobDescription"
                required
                rows={3}
                value={formData.jobDescription || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm resize-none custom-scrollbar text-gray-900 placeholder-gray-400 bg-white"
                placeholder="Detailed description of the services..."
              />
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Package size={16} className="text-gray-400"/> Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  required
                  value={formData.category || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white text-gray-900"
                >
                  <option value="" disabled>Select Category</option>
                  <option value="Audit & Assurance">Audit & Assurance</option>
                  <option value="Tax Services">Tax Services</option>
                  <option value="Advisory">Advisory</option>
                  <option value="Accounting">Accounting</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <CheckCircle size={16} className="text-gray-400"/> Current Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  required
                  value={formData.status || 'Ongoing'}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white text-gray-900"
                >
                  <option value="Pending">Yet to commence</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">Internal Remarks</label>
              <textarea
                name="internalNotes"
                rows={2}
                value={formData.internalNotes || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm resize-none custom-scrollbar text-gray-900 placeholder-gray-400 bg-white"
                placeholder="Optional notes for accounting team..."
              />
            </div>
            
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
            
            {/* Currency Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800 mb-2 block">Primary Billing Currency</label>
              <div className="flex bg-gray-100 p-1 rounded-lg w-max">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, currency: 'NGN' }))}
                  className={`px-6 py-1.5 text-sm font-medium rounded-md transition-all ${
                    formData.currency === 'NGN' 
                    ? 'bg-white text-green-700 shadow-sm border border-gray-200' 
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Naira (NGN)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, currency: 'USD' }))}
                  className={`px-6 py-1.5 text-sm font-medium rounded-md transition-all ${
                    formData.currency === 'USD' 
                    ? 'bg-white text-emerald-700 shadow-sm border border-gray-200' 
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dollars (USD)
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Real-time UI conversions rendered at abstract rate <span className="font-semibold">N1,500 = $1</span> for demonstration.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              {/* Financials */}
              <div className="col-span-2 space-y-2 group">
                <label className="text-sm font-semibold text-gray-800">Agreed Price <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">{PrimarySymbol}</span>
                    <input
                      name="agreedPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.agreedPrice || ''}
                      onChange={handleChange}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-[#0f172a] placeholder-gray-400 transition-all bg-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-500 opacity-80 cursor-not-allowed text-right font-medium">
                    = {getConvertedValue(formData.agreedPrice || 0)}
                  </div>
                </div>
              </div>

              <div className="col-span-2 space-y-2 mb-2">
                <label className="text-sm font-semibold text-gray-800">Advance Payment Made</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">{PrimarySymbol}</span>
                    <input
                      name="amountPaid"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amountPaid || ''}
                      onChange={handleChange}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-[#0f172a] placeholder-gray-400 bg-white transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-500 opacity-80 cursor-not-allowed text-right font-medium">
                    = {getConvertedValue(formData.amountPaid || 0)}
                  </div>
                </div>
              </div>

              {/* Outstanding Calc */}
              <div className="col-span-2 bg-[#0f172a] p-4 rounded-xl flex items-center justify-between shadow-sm">
                <span className="text-indigo-100 font-semibold text-sm">Outstanding Balance</span>
                <div className="text-right flex flex-col items-end">
                  <span className={`text-xl font-bold ${outstandingBalance > 0 ? 'text-white' : 'text-green-400'}`}>
                    {PrimarySymbol}{outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs font-semibold text-indigo-200/50 mt-0.5 tracking-wider">
                    {getConvertedValue(outstandingBalance)}
                  </span>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><Calendar size={14} className="text-gray-400"/> Commencement</label>
                <input
                  name="startDate"
                  type="date"
                  required
                  value={(formData.startDate as string) || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-gray-900 bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><Calendar size={14} className="text-gray-400"/> Expiration</label>
                <input
                  name="dueDate"
                  type="date"
                  required
                  value={(formData.dueDate as string) || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-gray-900 bg-white"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push('/jobs')}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel & Return
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 hover:shadow transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : <DollarSign size={16} />}
            {isSubmitting ? 'Processing Entry...' : initialData ? 'Update Job Recording' : 'Submit New Job Recording'}
          </button>
        </div>
      </form>
    </div>
  );
}

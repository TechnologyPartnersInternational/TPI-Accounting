'use client';

import { useState } from 'react';
import { X, Building, Mail, Phone, Tag } from 'lucide-react';
import { createClient } from '@/actions/clientActions';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (clientName: string) => void;
}

export function AddClientModal({ isOpen, onClose, onSuccess }: AddClientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    clientName: '',
    contactEmail: '',
    contactPhone: '',
    industry: '',
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.clientName.trim()) {
      setError('Client Name is required.');
      setIsSubmitting(false);
      return;
    }

    const { success, error: actionError } = await createClient(formData);
    
    setIsSubmitting(false);

    if (success) {
      onSuccess(formData.clientName);
      setFormData({ clientName: '', contactEmail: '', contactPhone: '', industry: '' }); // Reset
    } else {
      setError(actionError || 'Failed to create client.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-lg text-[#0f172a] flex items-center gap-2">
            <Building size={18} className="text-indigo-600" />
            Add New Client
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
              Client Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="clientName"
                name="clientName"
                type="text"
                required
                value={formData.clientName}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors sm:text-sm text-gray-900 placeholder-gray-400 bg-white"
                placeholder="e.g. Global Tech Solutions"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">Industry</label>
            <div className="relative">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="industry"
                name="industry"
                type="text"
                value={formData.industry}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors sm:text-sm text-gray-900 placeholder-gray-400 bg-white"
                placeholder="e.g. Oil & Gas"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Contact Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors sm:text-sm text-gray-900 placeholder-gray-400 bg-white"
                placeholder="billing@company.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">Contact Phone</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors sm:text-sm text-gray-900 placeholder-gray-400 bg-white"
                placeholder="+234..."
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex flex-row items-center justify-center disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Client'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

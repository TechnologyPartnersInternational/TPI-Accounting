'use client';

import { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Download,
  Info,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select a valid Excel file (.xlsx)');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/jobs/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(result.message || 'Jobs imported successfully!');
        // Refresh and redirect after success
        setTimeout(() => {
          router.push('/jobs');
          router.refresh();
        }, 2500);
      } else {
        setError(result.error || 'Failed to upload jobs');
      }
    } catch {
      setError('An unexpected error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/jobs/bulk-template');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tpi-job-import-template.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        setError('Failed to download template. Please try again.');
      }
    } catch {
      setError('An error occurred while downloading the template.');
    }
  };

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Bulk Job Import</h1>
          <p className="text-sm text-gray-500 mt-1">Import historical or large volumes of job records using an Excel template.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            {!successMessage ? (
              <div className="space-y-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                    file ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-200 hover:border-indigo-400 hover:bg-slate-50'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx"
                    className="hidden" 
                  />
                  {file ? (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <FileSpreadsheet size={32} />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-slate-800 max-w-sm truncate">{file.name}</p>
                        <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="text-sm text-red-500 font-bold hover:underline px-4 py-1 rounded-full hover:bg-red-50 transition-colors"
                      >
                        Remove file
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Upload size={32} />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-slate-700">Click to browse or drag & drop</p>
                        <p className="text-sm text-slate-400 mt-1">Only .xlsx Excel files are supported</p>
                      </div>
                    </>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">Import Error</p>
                      <p className="text-xs font-semibold mt-0.5 opacity-90">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  disabled={!file || isUploading}
                  onClick={handleUpload}
                  className="w-full py-4 bg-[#0f172a] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-900/10 text-base"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Processing Import...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      Start Bulk Import
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                  <CheckCircle2 size={40} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Import Successful!</h3>
                  <p className="text-gray-500 mt-2 font-medium max-w-sm mx-auto">{successMessage}</p>
                </div>
                <div className="flex items-center text-sm font-bold text-indigo-600 gap-2">
                  <span className="animate-pulse">Redirecting to jobs table</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions / Template Download */}
        <div className="space-y-6">
          <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Info size={18} className="text-indigo-400" />
                Instructions
              </h3>
              <ul className="space-y-4 text-xs font-medium text-slate-300">
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-white">1</span>
                  Download the official TPI Job Import template.
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-white">2</span>
                  Fill in the client names, job titles, costs, and dates correctly.
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-white">3</span>
                  Upload the file here to process all records at once.
                </li>
              </ul>
              
              <button 
                onClick={handleDownloadTemplate}
                className="mt-8 w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-lg shadow-black/20"
              >
                <Download size={16} />
                Download Template
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h4 className="font-bold text-slate-800 text-sm mb-4">Template Structure</h4>
            <div className="space-y-3">
              {[
                { name: 'Client Name', desc: 'Merged cells supported' },
                { name: 'Job Title', desc: 'Required' },
                { name: 'Commencement', desc: 'Date or string (Oct.25)' },
                { name: 'Cost (NGN/USD)', desc: 'Enter in either column' },
                { name: 'Advance Payment', desc: 'Enter in either column' },
                { name: 'Current Status', desc: 'Optional' },
              ].map((col) => (
                <div key={col.name} className="flex flex-col text-xs border-b border-gray-50 pb-2">
                  <span className="text-gray-800 font-bold">{col.name}</span>
                  <span className="text-gray-400 font-medium">{col.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

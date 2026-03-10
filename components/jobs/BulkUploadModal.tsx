'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Download } from 'lucide-react';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      } else {
        setError(result.error || 'Failed to upload jobs');
      }
    } catch (_err) {
      setError('An unexpected error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Upload size={18} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Bulk Job Import</h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!successMessage ? (
            <>
              <div className="space-y-4">
                <p className="text-sm text-gray-500 leading-relaxed font-medium text-center">
                  Upload an Excel file (.xlsx) to bulk create past or current job recordings. 
                  Ensure your file matches the required template format.
                </p>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                    file ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-slate-50'
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
                      <FileSpreadsheet size={40} className="text-indigo-600" />
                      <p className="text-sm font-bold text-indigo-700 max-w-xs truncate">{file.name}</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="text-xs text-red-500 font-bold hover:underline"
                      >
                        Remove file
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Upload size={24} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-700">Click to browse or drag & drop</p>
                        <p className="text-xs text-slate-400 mt-1">Excel formats only (.xlsx)</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold leading-relaxed">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  disabled={!file || isUploading}
                  onClick={handleUpload}
                  className="w-full py-3 bg-[#0f172a] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/10"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Uploading & Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Import All Records
                    </>
                  )}
                </button>
                
                <button 
                   type="button"
                   className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <Download size={14} />
                  Download Example Template
                </button>
              </div>
            </>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Import Successful!</h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">{successMessage}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

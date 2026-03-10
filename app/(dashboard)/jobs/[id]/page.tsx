import { getJobById } from '@/actions/jobActions';
import { ArrowLeft, Building2, Calendar, DollarSign, Edit, Tag, Clock, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Job Details | TPI Accounting',
};

export default async function JobDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const result = await getJobById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const job = result.data as any; // Using any for quick fix, but should ideally use a proper shared type

  const formatCurrency = (amount: number, currency: 'NGN' | 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusInfo = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return { icon: <CheckCircle2 className="text-green-500" size={20} />, label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200' };
      case 'ONGOING':
        return { icon: <Clock className="text-blue-500" size={20} />, label: 'Ongoing', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'OVERDUE':
        return { icon: <AlertCircle className="text-red-500" size={20} />, label: 'Overdue', color: 'bg-red-50 text-red-700 border-red-200' };
      default:
        return { icon: <Info className="text-amber-500" size={20} />, label: 'Yet to commence', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  const statusInfo = getStatusInfo(job.status);
  const amtPaid = job.amountPaid || 0;
  const outstanding = job.agreedPrice - amtPaid;

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 pb-12">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/jobs" 
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to All Jobs
        </Link>
        <Link 
          href={`/jobs/${id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
        >
          <Edit size={16} />
          Edit This Job
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Content - Job Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                  <Tag size={12}/> {job.category}
                </div>
                <h1 className="text-3xl font-bold text-[#0f172a] mt-3 leading-tight">{job.jobDescription}</h1>
              </div>
              <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-semibold text-sm ${statusInfo.color}`}>
                {statusInfo.icon}
                {statusInfo.label}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Client Name</p>
                    <p className="text-base font-bold text-[#0f172a]">{job.clientName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Billing Currency</p>
                    <p className="text-base font-bold text-[#0f172a]">{job.currency === 'NGN' ? 'Naira (NGN)' : 'US Dollars (USD)'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Commencement Date</p>
                    <p className="text-base font-bold text-[#0f172a]">{new Date(job.startDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Expiration / Due Date</p>
                    <p className="text-base font-bold text-[#0f172a]">{new Date(job.dueDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                  </div>
                </div>
              </div>
            </div>

            {job.internalNotes && (
              <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Internal Remarks</p>
                <p className="text-sm text-gray-600 leading-relaxed font-semibold italic">&ldquo;{job.internalNotes}&rdquo;</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Financials */}
        <div className="space-y-6">
          <div className="bg-[#0f172a] rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-900/50">
              <h2 className="text-white font-bold tracking-tight">Financial Summary</h2>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-[#0f172a]">Total Agreed Price</p>
                <p className="text-3xl font-black text-white">{formatCurrency(job.agreedPrice, job.currency)}</p>
              </div>

              <div className="space-y-1 pt-4 border-t border-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Advance Payment Made</p>
                <div className="flex items-end justify-between">
                  <p className="text-xl font-bold text-emerald-400">{formatCurrency(amtPaid, job.currency)}</p>
                  <p className="text-[10px] text-slate-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-widest mb-1.5">PAID</p>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (amtPaid / job.agreedPrice) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1 pt-4 border-t border-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Outstanding Balance</p>
                <div className="flex items-end justify-between">
                  <p className={`text-2xl font-black ${outstanding > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    {formatCurrency(outstanding, job.currency)}
                  </p>
                  {outstanding > 0 && (
                    <p className="text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded uppercase tracking-widest mb-1.5">DUE</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900/50 p-6 flex items-center gap-3">
               {outstanding <= 0 ? (
                 <>
                   <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shrink-0">
                     <CheckCircle2 size={18} />
                   </div>
                   <p className="text-xs text-slate-400 font-medium leading-tight">This project is fully settled. No further payments required.</p>
                 </>
               ) : (
                 <>
                   <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                     <Info size={18} />
                   </div>
                   <p className="text-xs text-slate-400 font-medium leading-tight">Partial payment received. Acknowledge further advances in the edit section.</p>
                 </>
               )}
            </div>
          </div>
          
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
             <div className="flex items-start gap-4 text-indigo-700">
               <Info size={20} className="shrink-0 mt-0.5" />
               <div className="space-y-2">
                 <p className="text-sm font-bold">Quick Note</p>
                 <p className="text-xs leading-relaxed opacity-80">Financial details are stored in {job.currency}. Conversions to other currencies in tables are for visualization purposes only.</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

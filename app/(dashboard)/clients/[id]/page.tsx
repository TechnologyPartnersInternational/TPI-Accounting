import { getClientById } from '@/actions/clientActions';
import { getJobs } from '@/actions/jobActions';
import { ClientJobsTable } from '@/components/clients/ClientJobsTable';
import { JobData } from '@/components/jobs/AllJobsTable';
import { Building2, Mail, Phone, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Client Details | TPI Accounting',
};

export default async function ClientDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  // Fetch client profile
  const [clientRes] = await Promise.all([
    getClientById(id),
  ]);

  if (!clientRes.success || !clientRes.data) {
    notFound();
  }

  const client = clientRes.data as { clientName: string, contactEmail?: string, contactPhone?: string, industry?: string };
  
  // Fetch Jobs specific to this explicit client name
  const exactJobsRes = await getJobs({ clientName: client.clientName });
  const rawJobs = (exactJobsRes.data || []) as JobData[];
  
  // Since we use $regex for search inside getJobs, we must ensure we strictly isolate this exact client 
  // in memory in case of substring overlap (e.g. searching "Apple" returning "Apple Inc" and "Apple Corp")
  const jobs = rawJobs.filter(j => j.clientName.toLowerCase() === client.clientName.toLowerCase());

  // Calculate Metrics
  const metrics = jobs.reduce((acc, job) => {
    const amtPaid = job.amountPaid || 0;
    const outstanding = job.agreedPrice - amtPaid;
    
    if (job.currency === 'NGN') {
      acc.ngnCost += job.agreedPrice;
      acc.ngnAdvance += amtPaid;
      acc.ngnBalance += outstanding;
    } else {
      acc.usdCost += job.agreedPrice;
      acc.usdAdvance += amtPaid;
      acc.usdBalance += outstanding;
    }
    return acc;
  }, { ngnCost: 0, ngnAdvance: 0, ngnBalance: 0, usdCost: 0, usdAdvance: 0, usdBalance: 0 });

  const formatCurrency = (amount: number, currency: 'NGN' | 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      
      {/* Top Navigation */}
      <div>
        <Link href="/clients" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-4">
          <ArrowLeft size={16} />
          Back to Client List
        </Link>
      </div>

      {/* Client Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div className="h-32 bg-indigo-600/5 border-b border-indigo-100/50 absolute top-0 left-0 right-0"></div>
        <div className="relative pt-8 px-8 pb-8 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center shrink-0 text-indigo-600">
               <Building2 size={36} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">{client.clientName}</h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm font-medium text-gray-500">
                {client.industry && (
                  <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-md text-gray-700">
                    <Tag size={14} className="text-gray-400"/> {client.industry}
                  </span>
                )}
                {client.contactEmail && (
                  <span className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer">
                    <Mail size={14} className="text-gray-400"/> {client.contactEmail}
                  </span>
                )}
                {client.contactPhone && (
                  <span className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer">
                    <Phone size={14} className="text-gray-400"/> {client.contactPhone}
                  </span>
                )}
                
                {/* Fallback if no details assigned */}
                {!client.industry && !client.contactEmail && !client.contactPhone && (
                    <span className="italic text-gray-400">No additional contact details provided</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="shrink-0">
             <div className="text-right">
                <p className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-1">Total Lifetime Jobs</p>
                <div className="text-3xl font-black text-indigo-600">{jobs.length}</div>
             </div>
          </div>
        </div>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Value Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Total Contract Value</h3>
          <div className="space-y-3">
             <div className="flex items-center justify-between">
               <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">NGN</span>
               <span className="text-lg font-bold text-[#0f172a]">{formatCurrency(metrics.ngnCost, 'NGN')}</span>
             </div>
             <div className="flex items-center justify-between pt-3 border-t border-gray-100">
               <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">USD</span>
               <span className="text-lg font-bold text-[#0f172a]">{formatCurrency(metrics.usdCost, 'USD')}</span>
             </div>
          </div>
        </div>

        {/* Amount Paid Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Total Amount Paid</h3>
          <div className="space-y-3">
             <div className="flex items-center justify-between">
               <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">NGN</span>
               <span className="text-lg font-bold text-[#0f172a]">{formatCurrency(metrics.ngnAdvance, 'NGN')}</span>
             </div>
             <div className="flex items-center justify-between pt-3 border-t border-gray-100">
               <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">USD</span>
               <span className="text-lg font-bold text-[#0f172a]">{formatCurrency(metrics.usdAdvance, 'USD')}</span>
             </div>
          </div>
        </div>

        {/* Outstanding Balance Card */}
        <div className="bg-[#0f172a] rounded-xl shadow border border-slate-700 p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-4 relative z-10">Total Outstanding</h3>
          <div className="space-y-3 relative z-10">
             <div className="flex items-center justify-between">
               <span className="text-xs font-bold text-red-300 bg-red-900/30 px-2 py-0.5 rounded border border-red-800">NGN</span>
               <span className={`text-xl font-bold ${metrics.ngnBalance > 0 ? 'text-white' : 'text-slate-400'}`}>
                 {formatCurrency(metrics.ngnBalance, 'NGN')}
               </span>
             </div>
             <div className="flex items-center justify-between pt-3 border-t border-slate-700">
               <span className="text-xs font-bold text-red-300 bg-red-900/30 px-2 py-0.5 rounded border border-red-800">USD</span>
               <span className={`text-xl font-bold ${metrics.usdBalance > 0 ? 'text-white' : 'text-slate-400'}`}>
                 {formatCurrency(metrics.usdBalance, 'USD')}
               </span>
             </div>
          </div>
        </div>
      </div>

      {/* Main Historical Table */}
      <div className="pt-4">
        <h2 className="text-lg font-bold text-[#0f172a] mb-4">Historical Job Records</h2>
        <ClientJobsTable jobs={jobs} clientName={client.clientName} />
      </div>

    </div>
  );
}

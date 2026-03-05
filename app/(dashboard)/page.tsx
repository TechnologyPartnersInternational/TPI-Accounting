import { DashboardTable } from '@/components/DashboardTable';
import { getDashboardMetrics, getRecentJobs } from '@/services/dashboardService';

export default async function DashboardClientPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const metrics = await getDashboardMetrics();
  const recentJobs = await getRecentJobs(10);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Welcome, Accountant</h1>
        <p className="text-sm text-gray-500 mt-1">Client Job Logging & Tracking System Overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between h-32">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Value of Jobs ({metrics.jobCount})</p>
          <div>
            <h2 className="text-3xl font-bold text-[#0f172a]">{formatCurrency(metrics.totalValue)}</h2>
            <p className="text-xs text-green-600 font-medium mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Live database total
            </p>
          </div>
        </div>

        {/* Card 2 (Active state styling with thick bottom border) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between h-32 relative overflow-hidden">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount Paid</p>
          <h2 className="text-3xl font-bold text-[#0f172a] mb-2">{formatCurrency(metrics.totalPaid)}</h2>
          <div className="absolute bottom-0 left-6 right-16 h-1.5 bg-[#0f172a] rounded-t-sm"></div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between h-32">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Outstanding Balance</p>
          <div>
            <h2 className="text-3xl font-bold text-[#0f172a]">{formatCurrency(metrics.totalOutstanding)}</h2>
            <p className="text-xs text-slate-400 font-medium mt-1 flex items-center">
              Awaiting payment
            </p>
          </div>
        </div>
      </div>

      <DashboardTable jobs={recentJobs} />

      {/* Bottom Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
           <h3 className="text-base font-bold text-[#0f172a] mb-6">Upcoming Deadlines</h3>
           
           <div className="space-y-5 flex-1">
             <div className="flex justify-between items-center group">
               <div className="flex items-center space-x-3">
                 <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                 <p className="text-sm font-semibold text-[#0f172a] group-hover:text-blue-600 transition-colors cursor-pointer">Global Tech - VAT Filing</p>
               </div>
               <span className="text-xs font-medium text-gray-500">In 2 days</span>
             </div>
             
             <div className="flex justify-between items-center group">
               <div className="flex items-center space-x-3">
                 <div className="w-2 h-2 rounded-full bg-[#0f172a]"></div>
                 <p className="text-sm font-semibold text-[#0f172a] group-hover:text-blue-600 transition-colors cursor-pointer">Oak & Iron - Monthly Review</p>
               </div>
               <span className="text-xs font-medium text-gray-500">In 5 days</span>
             </div>
             
             <div className="flex justify-between items-center group">
               <div className="flex items-center space-x-3">
                 <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                 <p className="text-sm font-semibold text-gray-500 group-hover:text-blue-600 transition-colors cursor-pointer">Nova Retail - Final Report</p>
               </div>
               <span className="text-xs font-medium text-gray-500">In 12 days</span>
             </div>
           </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
           <h3 className="text-base font-bold text-[#0f172a] mb-6">System Activity</h3>
           
           <div className="space-y-6 flex-1 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
             
             <div className="relative flex items-start justify-between">
               <div className="flex items-start space-x-4">
                 <div className="relative z-10 w-6 h-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 </div>
                 <div>
                   <p className="text-sm font-semibold text-[#0f172a]">Report Exported</p>
                   <p className="text-xs text-gray-500 mt-0.5">Sept_Financial_Summary.pdf exported 2h ago</p>
                 </div>
               </div>
             </div>

             <div className="relative flex items-start justify-between">
               <div className="flex items-start space-x-4">
                 <div className="relative z-10 w-6 h-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                 </div>
                 <div>
                   <p className="text-sm font-semibold text-[#0f172a]">Payment Logged</p>
                   <p className="text-xs text-gray-500 mt-0.5">$3,450.00 received from Summit Logistics 5h ago</p>
                 </div>
               </div>
             </div>
             
           </div>
        </div>
      </div>
    </div>
  );
}

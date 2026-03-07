import { DashboardTable } from '@/components/DashboardTable';
import { getDashboardMetrics, getRecentJobs, getUpcomingDeadlines, getSystemActivity } from '@/services/dashboardService';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { OutstandingDebtsChart } from '@/components/dashboard/OutstandingDebtsChart';
import { JobsStatusChart } from '@/components/dashboard/JobsStatusChart';
import { getJobs } from '@/actions/jobActions';
import { getClientSummaries } from '@/actions/clientActions';

export default async function DashboardClientPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const metrics = await getDashboardMetrics();
  const recentJobs: any[] = await getRecentJobs(10);
  const upcomingDeadlines: any[] = await getUpcomingDeadlines(4);
  const systemActivity: any[] = await getSystemActivity(4);
  const allJobsResponse: any = await getJobs({});
  const allJobs: any[] = allJobsResponse.data || [];
  const clientsResponse: any = await getClientSummaries();
  const allClients: any[] = clientsResponse.data || [];

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

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-[#0f172a]">Revenue Overview (NGN)</h3>
          </div>
          <RevenueChart jobs={allJobs} />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          <h3 className="text-base font-bold text-[#0f172a] mb-6">Jobs Status</h3>
          <div className="flex-1 min-h-[300px]">
            <JobsStatusChart jobs={allJobs} />
          </div>
        </div>
      </div>
      
      {/* Outstanding Debts Chart Row */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full">
        <h3 className="text-base font-bold text-[#0f172a] mb-6">Outstanding NGN Debts by Client</h3>
        <OutstandingDebtsChart clients={allClients} />
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold text-[#0f172a] mb-4">Recent Jobs</h3>
        <DashboardTable jobs={recentJobs} />
      </div>

      {/* Bottom Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
           <h3 className="text-base font-bold text-[#0f172a] mb-6">Upcoming Deadlines</h3>
           
           <div className="space-y-5 flex-1">
             {upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-gray-500">No upcoming deadlines.</p>
             ) : (
                upcomingDeadlines.map((job: any) => {
                  const daysLeft = Math.ceil((new Date(job.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                  let colorClass = 'bg-gray-300';
                  if (daysLeft <= 2) colorClass = 'bg-red-500';
                  else if (daysLeft <= 5) colorClass = 'bg-yellow-400';
                  else colorClass = 'bg-blue-500';

                  return (
                    <div key={job._id.toString()} className="flex justify-between items-center group">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
                        <p className="text-sm font-semibold text-[#0f172a] group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-1">{job.clientName} - {job.jobDescription}</p>
                      </div>
                      <span className="text-xs font-medium text-gray-500 shrink-0 ml-2">
                        {daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Today' : `In ${daysLeft} days`}
                      </span>
                    </div>
                  );
                })
             )}
           </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
           <h3 className="text-base font-bold text-[#0f172a] mb-6">System Activity</h3>
           
           <div className="space-y-6 flex-1 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
             
             {systemActivity.length === 0 ? (
               <p className="text-sm text-gray-500 text-center">No recent activity.</p>
             ) : (
               systemActivity.map((job: any) => {
                 const timeAgo = Math.floor((new Date().getTime() - new Date(job.updatedAt).getTime()) / (1000 * 3600));
                 return (
                  <div key={job._id.toString()} className="relative flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="relative z-10 w-6 h-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center mt-0.5">
                          <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0f172a]">Job Updated</p>
                        <p className="text-xs text-gray-500 mt-0.5">{job.clientName} - {job.status} {timeAgo > 0 ? `${timeAgo}h ago` : 'Just now'}</p>
                      </div>
                    </div>
                  </div>
                 );
               })
             )}
             
           </div>
        </div>
      </div>
    </div>
  );
}

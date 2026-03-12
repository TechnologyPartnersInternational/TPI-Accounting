import { getJobs } from '@/actions/jobActions';
import { AllJobsTable, JobData } from '@/components/jobs/AllJobsTable';

export const metadata = {
  title: 'All Jobs | TPI Accounting',
};

export const dynamic = 'force-dynamic';

export default async function AllJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : undefined;

  const result = await getJobs({
    searchQuery: q,
    status: status,
  });

  const jobs = (result.data || []) as JobData[];

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">All Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">Review, search, and manage all client jobs and their financial status.</p>
        </div>
        
        {/* We can place global page actions here if needed */}
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg text-sm transition-colors hover:bg-indigo-100 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export View
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <AllJobsTable jobs={jobs} totalJobs={jobs.length} />
      </div>
    </div>
  );
}

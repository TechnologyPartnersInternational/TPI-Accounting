import { getJobs } from '@/actions/jobActions';
import { AllJobsTable, JobData } from '@/components/jobs/AllJobsTable';

export const metadata = {
  title: 'All Jobs | TPI Accounting',
};

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
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">All Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">Review, search, and manage all client jobs and their financial status.</p>
        </div>
        
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <AllJobsTable jobs={jobs} totalJobs={jobs.length} />
      </div>
    </div>
  );
}

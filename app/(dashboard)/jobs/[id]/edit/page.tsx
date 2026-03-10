import { getJobById } from '@/actions/jobActions';
import { NewJobForm } from '@/components/jobs/NewJobForm';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit Job | TPI Accounting',
};

export default async function EditJobPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const result = await getJobById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const job = result.data as any;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Edit Job Recording</h1>
        <p className="text-sm text-gray-500 mt-1">
          Modify the financial or descriptive details for this job record.
        </p>
      </div>

      <NewJobForm initialData={job} />
    </div>
  );
}

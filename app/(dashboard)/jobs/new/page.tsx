import { NewJobForm } from '@/components/jobs/NewJobForm';

export const metadata = {
  title: 'New Job Entry | TPI Accounting',
};

export default function NewJobPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">New Job Entry</h1>
        <p className="text-sm text-gray-500 mt-1">
          Log a new client job. Financials uniquely adapt based on your primary currency selection.
        </p>
      </div>

      <NewJobForm />
      
    </div>
  );
}

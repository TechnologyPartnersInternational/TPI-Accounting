import { getClientSummaries } from '@/actions/clientActions';
import { ClientListTable, ClientSummary } from '@/components/clients/ClientListTable';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Client List | TPI Accounting',
};

export default async function ClientListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;

  const result = await getClientSummaries(q);
  const clients = (result.data || []) as ClientSummary[];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Client List</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and review your complete client roster and lifetime financial aggregates.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/jobs/new" className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg text-sm transition-colors hover:bg-indigo-700 shadow-sm flex items-center gap-2">
            <PlusCircle size={16} />
            Add New Client Job
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <ClientListTable clients={clients} />
      </div>
    </div>
  );
}

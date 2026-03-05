import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fa]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

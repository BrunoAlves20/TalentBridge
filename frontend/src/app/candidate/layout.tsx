import { DashboardSidebar } from "@/components/candidate/dashboard/DashboardSidebar";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 antialiased transition-colors">
      <DashboardSidebar />
      {/* pt-16 no mobile = altura do topbar fixo; md:pl-64 = largura do sidebar desktop */}
      <div className="pt-16 md:pt-0 md:pl-64 flex flex-col min-h-screen">
        <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}
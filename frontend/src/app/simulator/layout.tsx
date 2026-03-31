import { DashboardSidebar } from "@/components/candidate/dashboard/DashboardSidebar";

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 antialiased transition-colors">
      <DashboardSidebar />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}
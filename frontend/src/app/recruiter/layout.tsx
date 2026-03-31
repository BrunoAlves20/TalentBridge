import { RecruiterNavbar } from "@/components/layout/RecruiterNavbar";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 antialiased transition-colors">
      <RecruiterNavbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
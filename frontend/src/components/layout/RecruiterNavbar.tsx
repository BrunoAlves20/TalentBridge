"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase, LayoutDashboard, ListChecks, GitBranch, Award, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems = [
  { name: "Dashboard",  href: "/recruiter/dashboard", icon: LayoutDashboard },
  { name: "Vagas",      href: "/recruiter/jobs",      icon: ListChecks },
  { name: "Pipeline",   href: "/recruiter/pipeline",  icon: GitBranch },
  { name: "Ranking",    href: "/recruiter/ranking",   icon: Award },
];

export function RecruiterNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("@TalentBridge:user");
    localStorage.removeItem("usuario_id");
    router.push("/login");
  };

  return (
    <nav className="border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/recruiter/dashboard" className="flex items-center space-x-2 shrink-0">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Talent<span className="text-indigo-600 dark:text-indigo-400">Bridge</span>
            </span>
          </Link>

          {/* Links internos */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Ações do lado direito */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="border-l border-slate-200 dark:border-slate-800 pl-3 ml-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
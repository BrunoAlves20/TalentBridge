"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Briefcase, LayoutDashboard, ListChecks, GitBranch,
  LogOut, Users, Menu, X
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems = [
  { name: "Dashboard",          href: "/recruiter/dashboard", icon: LayoutDashboard },
  { name: "Vagas",              href: "/recruiter/jobs",      icon: ListChecks },
  { name: "Pipeline",           href: "/recruiter/pipeline",  icon: GitBranch },
  { name: "Banco de Talentos",  href: "/recruiter/talents",   icon: Users },
];

export function RecruiterNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fecha drawer ao mudar de rota
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Trava o scroll do body com drawer aberto
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Tecla Escape fecha
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    if (mobileOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("@TalentBridge:user");
    localStorage.removeItem("usuario_id");
    router.push("/auth/login");
  };

  return (
    <nav className="border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/recruiter/dashboard" className="flex items-center space-x-2 shrink-0">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Briefcase className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Talent<span className="text-indigo-600 dark:text-indigo-400">Bridge</span>
            </span>
          </Link>

          {/* Links internos (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <item.icon className="w-4 h-4" aria-hidden="true" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Ações do lado direito */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Logout — desktop */}
            <div className="hidden md:block border-l border-slate-200 dark:border-slate-800 pl-3 ml-1">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Sair</span>
              </button>
            </div>

            {/* Hambúrguer — mobile */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu de navegação"
              aria-expanded={mobileOpen}
              aria-controls="recruiter-mobile-drawer"
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

        </div>
      </div>

      {/* ─── Mobile Drawer + Backdrop ──────────────────────────────────── */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        id="recruiter-mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação do recrutador"
        className={`md:hidden fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-[#0B0E14] border-l border-slate-200 dark:border-slate-800/50 flex flex-col shadow-xl transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800/50">
          <span className="font-bold text-lg text-slate-900 dark:text-white">Menu</span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
            className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        <nav
          aria-label="Navegação do recrutador (mobile)"
          className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all min-h-[44px] ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all min-h-[44px]"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            Sair
          </button>
        </div>
      </aside>
    </nav>
  );
}

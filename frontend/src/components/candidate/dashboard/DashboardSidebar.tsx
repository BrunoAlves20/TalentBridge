"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  User,
  Briefcase,
  Bookmark,
  Settings,
  LogOut,
  BrainCircuit,
  Compass,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { name: "Visão Geral",    href: "/candidate/dashboard",    icon: LayoutDashboard },
  { name: "Explorar Vagas", href: "/candidate/explore",      icon: Compass },
  { name: "Meu Perfil",     href: "/candidate/profile",      icon: User },
  { name: "Candidaturas",   href: "/candidate/applications", icon: Briefcase },
  { name: "Vagas Salvas",   href: "/candidate/saved",        icon: Bookmark },
  { name: "Simulações IA",  href: "/simulator",              icon: BrainCircuit },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fecha o drawer ao trocar de rota
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Trava o scroll do body quando o drawer está aberto
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Fecha com tecla Escape
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
    localStorage.removeItem("@TalentBridge:OnboardingData");
    router.push("/auth/login");
  };

  const renderNavLinks = () =>
    navItems.map((item) => {
      const isActive =
        pathname === item.href ||
        (item.href === "/candidate/explore" && pathname.startsWith("/candidate/explore"));

      return (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive ? "page" : undefined}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group min-h-[44px] ${
            isActive
              ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1A1D2D]/50 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <item.icon
            className={`w-5 h-5 transition-transform group-hover:scale-110 ${
              isActive ? "text-indigo-600 dark:text-indigo-400" : ""
            }`}
            aria-hidden="true"
          />
          {item.name}
        </Link>
      );
    });

  return (
    <>
      {/* ─── Mobile Top Bar (visível apenas em < md) ───────────────────── */}
      <header className="md:hidden fixed top-0 inset-x-0 h-16 z-40 flex items-center justify-between px-4 bg-white/90 dark:bg-[#0B0E14]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50">
        <Link href="/candidate/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xl">
            T
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
            Talent<span className="text-indigo-600 dark:text-indigo-400">Bridge</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu de navegação"
          aria-expanded={mobileOpen}
          aria-controls="candidate-mobile-drawer"
          className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          <Menu className="w-6 h-6" aria-hidden="true" />
        </button>
      </header>

      {/* ─── Sidebar Desktop (>= md) ───────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#0B0E14] border-r border-slate-200 dark:border-slate-800/50 flex-col transition-colors z-40 hidden md:flex">
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-slate-800/50">
          <Link href="/candidate/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xl">
              T
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              Talent<span className="text-indigo-600 dark:text-indigo-400">Bridge</span>
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav
          aria-label="Navegação principal do candidato"
          className="flex-1 py-8 px-4 flex flex-col gap-1 overflow-y-auto"
        >
          <div className="px-4 mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Menu Principal
            </p>
          </div>
          {renderNavLinks()}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-1">
          <Link
            href="/candidate/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group min-h-[44px] ${
              pathname === "/candidate/settings"
                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1A1D2D]/50 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" aria-hidden="true" />
            Configurações
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all group min-h-[44px]"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            Sair
          </button>
        </div>
      </aside>

      {/* ─── Mobile Drawer + Backdrop ──────────────────────────────────── */}
      {/* Backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        id="candidate-mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-[#0B0E14] border-r border-slate-200 dark:border-slate-800/50 flex flex-col shadow-xl transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header do drawer */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800/50">
          <Link href="/candidate/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xl">
              T
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              Talent<span className="text-indigo-600 dark:text-indigo-400">Bridge</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
            className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Nav */}
        <nav
          aria-label="Navegação principal do candidato (mobile)"
          className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto"
        >
          <div className="px-4 mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Menu Principal
            </p>
          </div>
          {renderNavLinks()}
        </nav>

        {/* Footer drawer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-1">
          <Link
            href="/candidate/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group min-h-[44px] ${
              pathname === "/candidate/settings"
                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1A1D2D]/50 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Settings className="w-5 h-5" aria-hidden="true" />
            Configurações
          </Link>
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
    </>
  );
}

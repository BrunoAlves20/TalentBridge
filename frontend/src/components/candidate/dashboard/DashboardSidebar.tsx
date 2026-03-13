"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  Bookmark, 
  Settings, 
  LogOut,
  BrainCircuit
} from "lucide-react";

const navItems = [
  { name: "Visão Geral", href: "/candidate/dashboard", icon: LayoutDashboard },
  { name: "Meu Perfil", href: "/candidate/profile", icon: User },
  { name: "Minhas Vagas", href: "/candidate/applications", icon: Briefcase },
  { name: "Vagas Salvas", href: "/candidate/saved", icon: Bookmark },
  { name: "Simulações IA", href: "/simulator", icon: BrainCircuit },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#0B0E14] border-r border-slate-200 dark:border-slate-800/50 flex flex-col transition-colors z-40 hidden md:flex">
      {/* Header/Logo Placeholder */}
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

      {/* Navigation Links */}
      <div className="flex-1 py-8 px-4 flex flex-col gap-2 overflow-y-auto">
        <div className="px-4 mb-2">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Menu Principal</p>
        </div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${
                isActive 
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1A1D2D]/50 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Footer / Settings */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-2">
        <Link 
          href="/candidate/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1A1D2D]/50 hover:text-slate-900 dark:hover:text-white transition-all group"
        >
          <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
          Configurações
        </Link>
        <button 
          className="flex items-center w-full gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all group"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}

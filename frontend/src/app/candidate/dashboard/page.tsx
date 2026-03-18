"use client";

import { Award, Briefcase, TrendingUp, Bell, Search, Star } from "lucide-react";
import { SimulatorCTA } from "@/components/candidate/dashboard/SimulatorCTA";

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }: any) => (
  <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{value}</h3>
        {subtitle && <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

export default function CandidateDashboard() {
  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Topbar rápida do Dashboard (Busca e Notificações) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Bem-vindo(a), Lucas! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Aqui está o resumo da sua jornada até o momento.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar vagas..." 
              className="w-full bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-full py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition dark:text-white"
            />
          </div>
          <button className="w-10 h-10 rounded-full bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition shadow-sm relative shrink-0">
            <div className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#0B0E14]"></div>
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Widgets principais */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Status do Perfil" 
          value="100% Completo" 
          subtitle="Visibilidade máxima para recrutadores"
          icon={Award}
          colorClass="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard 
          title="Minhas Candidaturas" 
          value="0" 
          subtitle="Você ainda não se aplicou a vagas"
          icon={Briefcase}
          colorClass="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
        />
        <StatCard 
          title="Matches Encontrados" 
          value="12" 
          subtitle="Vagas recomendadas p/ seu perfil"
          icon={Star}
          colorClass="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Call to Action principal - Simulador IA */}
      <div className="mb-10">
        <SimulatorCTA />
      </div>

      {/* Seção adicional para "Vagas Recomendadas" (Mock) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Vagas Recomendadas para Você
          </h2>
          <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">Ver todas</button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card Vaga 1 */}
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 p-6 rounded-3xl group hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4 flex items-center justify-center font-black text-slate-400">N</div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">Tech Lead Front-End</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">Nubank • São Paulo, SP</p>
            <div className="flex gap-2 mb-6">
              <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-md">98% Match</span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2.5 py-1 rounded-md">Híbrido</span>
            </div>
            <button className="w-full bg-slate-50 dark:bg-[#1A1D2D] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-white font-bold py-2.5 rounded-xl transition-colors">
              Ver Detalhes
            </button>
          </div>
          
          {/* Card Vaga 2 */}
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 p-6 rounded-3xl group hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 mb-4 flex items-center justify-center font-black text-white">M</div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">Senior React Developer</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">Mercado Livre • Remoto</p>
            <div className="flex gap-2 mb-6">
              <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-md">94% Match</span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2.5 py-1 rounded-md">Remoto</span>
            </div>
            <button className="w-full bg-slate-50 dark:bg-[#1A1D2D] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-white font-bold py-2.5 rounded-xl transition-colors">
              Ver Detalhes
            </button>
          </div>
          
          {/* Card Vaga 3 */}
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 p-6 rounded-3xl group hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-colors cursor-pointer hidden md:block">
            <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white mb-4 flex items-center justify-center font-black text-white dark:text-black">G</div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">Engenheiro de Software Frontend</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">Google • São Paulo, SP</p>
            <div className="flex gap-2 mb-6">
              <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-md">90% Match</span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2.5 py-1 rounded-md">Híbrido</span>
            </div>
            <button className="w-full bg-slate-50 dark:bg-[#1A1D2D] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-white font-bold py-2.5 rounded-xl transition-colors">
              Ver Detalhes
            </button>
          </div>
        </div>
      </section>
      
    </div>
  );
}

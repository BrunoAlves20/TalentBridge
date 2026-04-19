"use client";

import { useEffect, useState } from "react";
import { Briefcase, TrendingUp, Bell, Search, Star, ArrowRight } from "lucide-react";
import { SimulatorCTA } from "@/components/candidate/dashboard/SimulatorCTA";
import { ProfileStrength } from "@/components/candidate/dashboard/ProfileStrength";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface VagaRecomendada {
  id: number;
  titulo: string;
  empresa: string;
  localizacao: string;
  modalidade: string;
  faixa_salarial: string;
  total_candidatos: number;
}

// ─── Componentes ──────────────────────────────────────────────────────────────

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

const MODALIDADE_LABEL: Record<string, string> = {
  REMOTO: "Remoto",
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CandidateDashboard() {
  const [userName, setUserName] = useState("Candidato");
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [applicationCount, setApplicationCount] = useState<number | null>(null);
  const [vagasRecomendadas, setVagasRecomendadas] = useState<VagaRecomendada[]>([]);
  const [loadingVagas, setLoadingVagas] = useState(false);
  const [candidatandoId, setCandidatandoId] = useState<number | null>(null);
  const [jaInscrito, setJaInscrito] = useState<Set<number>>(new Set());

  useEffect(() => {
    const localUserRaw = localStorage.getItem("@TalentBridge:user");
    if (localUserRaw) {
      try {
        const user = JSON.parse(localUserRaw);
        setUserName(user.name?.split(" ")[0] ?? "Candidato");
      } catch {}
    }

    const id = localStorage.getItem("usuario_id");
    setUsuarioId(id);

    if (id) {
      // Conta candidaturas reais
      fetch(`${API_URL}/vagas/minhas-candidaturas/${id}`)
        .then((r) => r.json())
        .then((data) => {
          setApplicationCount(data.candidaturas?.length ?? 0);
          const ids = new Set<number>(
            (data.candidaturas ?? []).map((c: any) => c.vaga_id as number)
          );
          setJaInscrito(ids);
        })
        .catch(() => setApplicationCount(0));

      // Vagas abertas para recomendar
      setLoadingVagas(true);
      fetch(`${API_URL}/vagas/abertas`)
        .then((r) => r.json())
        .then((data) => setVagasRecomendadas((data.vagas ?? []).slice(0, 3)))
        .catch(() => {})
        .finally(() => setLoadingVagas(false));
    }
  }, []);

  const handleCandidatar = async (vagaId: number) => {
    if (!usuarioId) return;
    setCandidatandoId(vagaId);
    try {
      const res = await fetch(`${API_URL}/vagas/candidatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaga_id: vagaId, candidato_id: Number(usuarioId) }),
      });
      if (res.ok) {
        setJaInscrito((prev) => new Set([...prev, vagaId]));
        setApplicationCount((prev) => (prev ?? 0) + 1);
      }
    } finally {
      setCandidatandoId(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Topbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Bem-vindo(a), {userName}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Aqui está o resumo da sua jornada até o momento.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href="/candidate/jobs" className="relative flex-1 md:w-64 hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <div className="w-full bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-full py-2.5 pl-10 pr-4 text-sm font-medium text-slate-400 cursor-pointer hover:border-indigo-300 transition">
              Buscar vagas...
            </div>
          </Link>
          <button className="w-10 h-10 rounded-full bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition shadow-sm relative shrink-0">
            <div className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#0B0E14]" />
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <StatCard
          title="Minhas Candidaturas"
          value={applicationCount === null ? "..." : applicationCount}
          subtitle={
            applicationCount === null
              ? "Carregando..."
              : applicationCount === 0
              ? "Você ainda não se aplicou a vagas"
              : `${applicationCount} candidatura(s) enviada(s)`
          }
          icon={Briefcase}
          colorClass="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          title="Vagas Disponíveis"
          value={loadingVagas ? "..." : vagasRecomendadas.length > 0 ? vagasRecomendadas.length + "+" : "0"}
          subtitle="Vagas abertas para você se candidatar"
          icon={Star}
          colorClass="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* CTA + ProfileStrength */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 mb-10">
        <SimulatorCTA />
        <ProfileStrength usuarioId={usuarioId} />
      </div>

      {/* Vagas Recomendadas */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Vagas Disponíveis
          </h2>
          <Link
            href="/candidate/jobs"
            className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingVagas ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 p-6 rounded-3xl animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 mb-4" />
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : vagasRecomendadas.length === 0 ? (
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-12 text-center">
            <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhuma vaga aberta no momento.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vagasRecomendadas.map((vaga) => (
              <div
                key={vaga.id}
                className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 p-6 rounded-3xl group hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 flex items-center justify-center text-white font-black text-xl">
                  {(vaga.empresa || vaga.titulo || "?").charAt(0).toUpperCase()}
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {vaga.titulo}
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
                  {vaga.empresa || "—"} • {vaga.localizacao || "Remoto"}
                </p>
                <div className="flex gap-2 mb-6">
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2.5 py-1 rounded-md">
                    {MODALIDADE_LABEL[vaga.modalidade] ?? vaga.modalidade}
                  </span>
                  {vaga.faixa_salarial && (
                    <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-md">
                      {vaga.faixa_salarial}
                    </span>
                  )}
                </div>

                {jaInscrito.has(vaga.id) ? (
                  <div className="w-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                    ✓ Inscrito
                  </div>
                ) : (
                  <button
                    onClick={() => handleCandidatar(vaga.id)}
                    disabled={candidatandoId === vaga.id}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
                  >
                    {candidatandoId === vaga.id ? "Enviando..." : "Candidatar-se"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
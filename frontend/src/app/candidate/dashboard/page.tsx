"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Briefcase, TrendingUp, Bell, Search, Star,
  Bookmark, BookmarkCheck, CheckCircle2, Loader2,
  ArrowRight, MapPin, Building2
} from "lucide-react";
import { SimulatorCTA } from "@/components/candidate/dashboard/SimulatorCTA";
import { ProfileStrength } from "@/components/candidate/dashboard/ProfileStrength";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Vaga {
  id: number;
  titulo: string;
  empresa: string;
  nome_recrutador: string;
  localizacao: string;
  modalidade: string;
  faixa_salarial: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MODALIDADE_LABEL: Record<string, string> = {
  REMOTO: "Remoto",
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
};

const MODALIDADE_COLOR: Record<string, string> = {
  REMOTO: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  HIBRIDO: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  PRESENCIAL: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }: any) => (
  <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-1">
          {title}
        </p>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{value}</h3>
        {subtitle && (
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CandidateDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Candidato");
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [applicationCount, setApplicationCount] = useState<number | null>(null);

  // Vagas disponíveis (máx 3 no dashboard)
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loadingVagas, setLoadingVagas] = useState(false);

  // Controle de candidatura e salvamento por vaga_id
  const [candidatandoId, setCandidatandoId] = useState<number | null>(null);
  const [salvandoId, setSalvandoId] = useState<number | null>(null);
  const [inscritos, setInscritos] = useState<Set<number>>(new Set());
  const [salvos, setSalvos] = useState<Set<number>>(new Set());

  // Busca
  const [busca, setBusca] = useState("");

  // ── Inicialização ────────────────────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem("@TalentBridge:user");
    if (raw) {
      try {
        const user = JSON.parse(raw);
        setUserName(user.name?.split(" ")[0] ?? "Candidato");
      } catch {}
    }
    const id = localStorage.getItem("usuario_id");
    setUsuarioId(id);
  }, []);

  // ── Carrega dados quando temos o usuarioId ────────────────────────────────
  const carregarDados = useCallback(async (id: string) => {
    // Candidaturas
    fetch(`${API_URL}/vagas/minhas-candidaturas/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setApplicationCount(data.candidaturas?.length ?? 0);
        const ids = new Set<number>((data.candidaturas ?? []).map((c: any) => c.vaga_id as number));
        setInscritos(ids);
      })
      .catch(() => setApplicationCount(0));

    // Vagas salvas
    fetch(`${API_URL}/vagas/salvas/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const ids = new Set<number>((data.vagas_salvas ?? []).map((v: any) => v.vaga_id as number));
        setSalvos(ids);
      })
      .catch(() => {});

    // Vagas abertas
    setLoadingVagas(true);
    fetch(`${API_URL}/vagas/abertas`)
      .then((r) => r.json())
      .then((data) => setVagas((data.vagas ?? []).slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoadingVagas(false));
  }, []);

  useEffect(() => {
    if (usuarioId) carregarDados(usuarioId);
  }, [usuarioId, carregarDados]);

  // ── Busca — navega para explorar vagas com o termo ────────────────────────
  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    if (busca.trim()) {
      router.push(`/candidate/explore?q=${encodeURIComponent(busca.trim())}`);
    } else {
      router.push("/candidate/explore");
    }
  };

  // ── Candidatar-se ────────────────────────────────────────────────────────
  const handleCandidatar = async (vagaId: number) => {
    if (!usuarioId) return;
    setCandidatandoId(vagaId);
    try {
      const res = await fetch(`${API_URL}/vagas/candidatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaga_id: vagaId, candidato_id: Number(usuarioId) }),
      });
      if (res.ok || res.status === 409) {
        setInscritos((prev) => new Set([...prev, vagaId]));
        setApplicationCount((prev) => (res.ok ? (prev ?? 0) + 1 : prev));
      }
    } finally {
      setCandidatandoId(null);
    }
  };

  // ── Salvar / dessalvar vaga ──────────────────────────────────────────────
  const handleSalvar = async (vagaId: number) => {
    if (!usuarioId) return;
    setSalvandoId(vagaId);
    const jaSalvo = salvos.has(vagaId);
    try {
      if (jaSalvo) {
        const res = await fetch(
          `${API_URL}/vagas/salvas/${vagaId}?usuario_id=${usuarioId}`,
          { method: "DELETE" }
        );
        if (res.ok) setSalvos((prev) => { const next = new Set(prev); next.delete(vagaId); return next; });
      } else {
        const res = await fetch(`${API_URL}/vagas/salvar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vaga_id: vagaId, usuario_id: Number(usuarioId) }),
        });
        if (res.ok || res.status === 409) {
          setSalvos((prev) => new Set([...prev, vagaId]));
        }
      }
    } finally {
      setSalvandoId(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">

      {/* ── Topbar ──────────────────────────────────────────────────────────── */}
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
          {/* ✅ Barra de busca maior e funcional */}
          <form onSubmit={handleBusca} className="relative flex-1 md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar vagas por cargo, empresa ou stack..."
              className="w-full bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl py-3 pl-11 pr-24 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition dark:text-white"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition"
            >
              Buscar
            </button>
          </form>

          <button className="w-10 h-10 rounded-full bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition shadow-sm relative shrink-0">
            <div className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#0B0E14]" />
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <StatCard
          title="Minhas Candidaturas"
          value={applicationCount === null ? "..." : applicationCount}
          subtitle={
            applicationCount === null ? "Carregando..." :
            applicationCount === 0 ? "Você ainda não se candidatou a vagas" :
            `${applicationCount} candidatura(s) enviada(s)`
          }
          icon={Briefcase}
          colorClass="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          title="Vagas Salvas"
          value={salvos.size}
          subtitle={salvos.size === 0 ? "Salve vagas para candidatar mais tarde" : `${salvos.size} vaga(s) na sua lista`}
          icon={Bookmark}
          colorClass="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* ── CTA + ProfileStrength ────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 mb-10">
        <SimulatorCTA />
        <ProfileStrength usuarioId={usuarioId} />
      </div>

      {/* ── Vagas Disponíveis ────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Vagas Disponíveis para Você
          </h2>
          {/* ✅ "Ver todas" navega para a tela Explorar Vagas */}
          <Link
            href="/candidate/explore"
            className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition"
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
        ) : vagas.length === 0 ? (
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-12 text-center">
            <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhuma vaga aberta no momento.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vagas.map((vaga) => {
              const jaInscrito = inscritos.has(vaga.id);
              const jaSalvo = salvos.has(vaga.id);
              const isCandidatando = candidatandoId === vaga.id;
              const isSalvando = salvandoId === vaga.id;

              return (
                <div
                  key={vaga.id}
                  className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 p-6 rounded-3xl group hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-all hover:shadow-md flex flex-col"
                >
                  {/* Header do card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shrink-0">
                      {(vaga.empresa || vaga.titulo || "?").charAt(0).toUpperCase()}
                    </div>
                    {/* ✅ Botão salvar */}
                    <button
                      onClick={() => handleSalvar(vaga.id)}
                      disabled={isSalvando}
                      title={jaSalvo ? "Remover dos salvos" : "Salvar vaga"}
                      className={`p-2 rounded-xl transition disabled:opacity-40 ${
                        jaSalvo
                          ? "text-amber-500 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20"
                          : "text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                      }`}
                    >
                      {isSalvando ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : jaSalvo ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {vaga.titulo}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    {vaga.empresa || vaga.nome_recrutador || "—"}
                  </p>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {vaga.modalidade && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${MODALIDADE_COLOR[vaga.modalidade] ?? "bg-slate-100 text-slate-600"}`}>
                        {MODALIDADE_LABEL[vaga.modalidade] ?? vaga.modalidade}
                      </span>
                    )}
                    {vaga.faixa_salarial && (
                      <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-md">
                        {vaga.faixa_salarial}
                      </span>
                    )}
                    {vaga.localizacao && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {vaga.localizacao}
                      </span>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="mt-auto flex gap-2">
                    {jaInscrito ? (
                      <div className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold py-2.5 rounded-xl text-sm border border-emerald-200 dark:border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" /> Inscrito
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCandidatar(vaga.id)}
                        disabled={isCandidatando}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2"
                      >
                        {isCandidatando ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isCandidatando ? "Enviando..." : "Candidatar-se"}
                      </button>
                    )}
                    <Link
                      href={`/candidate/explore?vaga=${vaga.id}`}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm font-bold"
                      title="Ver detalhes"
                    >
                      Ver
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
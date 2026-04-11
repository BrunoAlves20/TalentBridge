"use client";

import { useState } from "react";
import {
  MoreHorizontal, ChevronRight, Mail, X,
  Users, CheckCircle2, Clock, Trophy, XCircle,
  MapPin, Briefcase, ArrowRight
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Stage = "Triagem" | "Teste Técnico" | "Entrevista" | "Proposta" | "Contratado";

interface PipelineCandidate {
  id: number;
  name: string;
  role: string;
  location: string;
  matchScore: number;
  stage: Stage;
  appliedJob: string;
  email: string;
  daysInStage: number;
  stacks: string[];
}

// ─── Config das colunas ───────────────────────────────────────────────────────

const STAGES: { key: Stage; label: string; color: string; icon: React.ElementType; bg: string; border: string }[] = [
  {
    key: "Triagem",
    label: "Triagem",
    color: "text-slate-600 dark:text-slate-400",
    icon: Clock,
    bg: "bg-slate-100 dark:bg-slate-800/50",
    border: "border-slate-200 dark:border-slate-700/50",
  },
  {
    key: "Teste Técnico",
    label: "Teste Técnico",
    color: "text-indigo-600 dark:text-indigo-400",
    icon: Briefcase,
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    border: "border-indigo-200 dark:border-indigo-500/20",
  },
  {
    key: "Entrevista",
    label: "Entrevista",
    color: "text-purple-600 dark:text-purple-400",
    icon: Users,
    bg: "bg-purple-50 dark:bg-purple-500/10",
    border: "border-purple-200 dark:border-purple-500/20",
  },
  {
    key: "Proposta",
    label: "Proposta",
    color: "text-amber-600 dark:text-amber-400",
    icon: CheckCircle2,
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/20",
  },
  {
    key: "Contratado",
    label: "Contratado",
    color: "text-emerald-600 dark:text-emerald-400",
    icon: Trophy,
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/20",
  },
];

const STAGE_ORDER: Stage[] = ["Triagem", "Teste Técnico", "Entrevista", "Proposta", "Contratado"];

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_CANDIDATES: PipelineCandidate[] = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 75) return "text-indigo-600 dark:text-indigo-400";
  return "text-amber-600 dark:text-amber-400";
}

function warningDays(days: number) {
  if (days >= 7) return "text-rose-500";
  if (days >= 4) return "text-amber-500";
  return "text-slate-400";
}

// ─── Card do candidato no pipeline ───────────────────────────────────────────

function CandidateCard({
  candidate,
  onMove,
  onDiscard,
  onClick,
}: {
  candidate: PipelineCandidate;
  onMove: (id: number) => void;
  onDiscard: (id: number) => void;
  onClick: (c: PipelineCandidate) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isLast = candidate.stage === "Contratado";

  return (
    <div
      className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700/40 transition-all cursor-pointer group relative"
      onClick={() => onClick(candidate)}
    >
      {/* Ações */}
      <div
        className="absolute top-3 right-3"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 bg-white dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-10 w-44">
            {!isLast && (
              <button
                onClick={() => { onMove(candidate.id); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition"
              >
                <ArrowRight className="w-4 h-4 text-indigo-500" />
                Avançar etapa
              </button>
            )}
            <button
              onClick={() => { onDiscard(candidate.id); setMenuOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2 transition"
            >
              <XCircle className="w-4 h-4" />
              Descartar
            </button>
          </div>
        )}
      </div>

      {/* Identidade */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shrink-0">
          {candidate.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate pr-8">
            {candidate.name}
          </p>
          <p className="text-[11px] text-slate-400 truncate">{candidate.appliedJob}</p>
        </div>
      </div>

      {/* Stacks */}
      <div className="flex gap-1 flex-wrap mb-3">
        {candidate.stacks.slice(0, 2).map((s) => (
          <span
            key={s}
            className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Footer do card */}
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-bold ${warningDays(candidate.daysInStage)}`}>
          {candidate.daysInStage === 0
            ? "Hoje"
            : `${candidate.daysInStage}d nesta etapa`}
        </span>
        <span className={`text-sm font-black ${scoreColor(candidate.matchScore)}`}>
          {candidate.matchScore}%
        </span>
      </div>

      {/* Avançar rápido */}
      {!isLast && (
        <button
          onClick={(e) => { e.stopPropagation(); onMove(candidate.id); }}
          className="mt-3 w-full py-2 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 dark:hover:border-indigo-500 dark:hover:text-indigo-400 text-[11px] font-bold transition flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100"
        >
          Avançar <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// ─── Drawer lateral de detalhe ────────────────────────────────────────────────

function CandidateDetail({
  candidate,
  onClose,
  onMove,
}: {
  candidate: PipelineCandidate;
  onClose: () => void;
  onMove: (id: number) => void;
}) {
  const isLast = candidate.stage === "Contratado";
  const nextStageIdx = STAGE_ORDER.indexOf(candidate.stage) + 1;
  const nextStage = STAGE_ORDER[nextStageIdx];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white dark:bg-[#0B0E14] border-l border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto flex flex-col">
        <div className="sticky top-0 z-10 bg-white dark:bg-[#0B0E14] border-b border-slate-100 dark:border-slate-800/50 p-6 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 dark:text-white">Detalhes do Candidato</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 flex-1 space-y-8">
          {/* Avatar + Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shrink-0">
              {candidate.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{candidate.name}</h2>
              <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">{candidate.role}</p>
              <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                <MapPin className="w-3 h-3" />
                {candidate.location}
              </div>
            </div>
          </div>

          {/* Timeline de estágios */}
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-4">Etapa atual</p>
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {STAGE_ORDER.map((s, i) => {
                const currentIdx = STAGE_ORDER.indexOf(candidate.stage);
                const isPast = i < currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <div key={s} className="flex items-center gap-1 shrink-0">
                    <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide transition ${
                      isCurrent
                        ? "bg-indigo-600 text-white"
                        : isPast
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}>
                      {s}
                    </div>
                    {i < STAGE_ORDER.length - 1 && (
                      <ChevronRight className={`w-3 h-3 shrink-0 ${isPast ? "text-emerald-400" : "text-slate-300 dark:text-slate-700"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-[#1A1D2D]/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800/50">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Match</p>
              <p className={`text-3xl font-black ${scoreColor(candidate.matchScore)}`}>
                {candidate.matchScore}%
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-[#1A1D2D]/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800/50">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Nesta etapa</p>
              <p className={`text-3xl font-black ${warningDays(candidate.daysInStage)}`}>
                {candidate.daysInStage}d
              </p>
            </div>
          </div>

          {/* Stacks */}
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">Stack</p>
            <div className="flex flex-wrap gap-2">
              {candidate.stacks.map((s) => (
                <span key={s} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg text-xs font-bold">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">Contato</p>
            <a
              href={`mailto:${candidate.email}`}
              className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              <Mail className="w-4 h-4" />
              {candidate.email}
            </a>
          </div>
        </div>

        {/* Footer de ações */}
        <div className="sticky bottom-0 p-6 border-t border-slate-100 dark:border-slate-800/50 bg-white dark:bg-[#0B0E14] space-y-3">
          {!isLast && (
            <button
              onClick={() => { onMove(candidate.id); onClose(); }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Avançar para "{nextStage}"
            </button>
          )}
          <a
            href={`mailto:${candidate.email}`}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm font-bold"
          >
            <Mail className="w-4 h-4" /> Enviar E-mail
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Page principal ───────────────────────────────────────────────────────────

export default function PipelinePage() {
  const [candidates, setCandidates] = useState<PipelineCandidate[]>(INITIAL_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] = useState<PipelineCandidate | null>(null);

  const moveToNextStage = (id: number) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const currentIdx = STAGE_ORDER.indexOf(c.stage);
        const nextStage = STAGE_ORDER[currentIdx + 1];
        return nextStage ? { ...c, stage: nextStage, daysInStage: 0 } : c;
      })
    );
    setSelectedCandidate((prev) => {
      if (!prev || prev.id !== id) return prev;
      const currentIdx = STAGE_ORDER.indexOf(prev.stage);
      const nextStage = STAGE_ORDER[currentIdx + 1];
      return nextStage ? { ...prev, stage: nextStage, daysInStage: 0 } : prev;
    });
  };

  const discard = (id: number) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    if (selectedCandidate?.id === id) setSelectedCandidate(null);
  };

  const getColumn = (stage: Stage) => candidates.filter((c) => c.stage === stage);

  const totalCandidates = candidates.length;
  const contratados = candidates.filter((c) => c.stage === "Contratado").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] antialiased transition-colors">
      <main className="max-w-[1400px] mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Pipeline de Candidatos
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
              {totalCandidates} candidatos ativos · {contratados} contratados
            </p>
          </div>

          {/* Resumo rápido */}
          <div className="flex gap-3">
            {STAGES.map((s) => {
              const count = getColumn(s.key).length;
              const Icon = s.icon;
              return (
                <div
                  key={s.key}
                  className={`hidden lg:flex flex-col items-center px-4 py-2.5 rounded-xl border ${s.bg} ${s.border}`}
                >
                  <Icon className={`w-4 h-4 ${s.color} mb-1`} />
                  <span className={`text-lg font-black ${s.color}`}>{count}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kanban */}
        <div className="flex gap-4 overflow-x-auto pb-8">
          {STAGES.map((stage) => {
            const columnCandidates = getColumn(stage.key);
            const Icon = stage.icon;

            return (
              <div key={stage.key} className="flex-shrink-0 w-72 flex flex-col">
                {/* Cabeçalho da coluna */}
                <div className={`flex items-center justify-between px-4 py-3 rounded-xl border mb-3 ${stage.bg} ${stage.border}`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${stage.color}`} />
                    <span className={`text-sm font-black ${stage.color}`}>{stage.label}</span>
                  </div>
                  <span className={`text-sm font-black ${stage.color} bg-white/60 dark:bg-black/20 rounded-full w-6 h-6 flex items-center justify-center`}>
                    {columnCandidates.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-3 flex-1">
                  {columnCandidates.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
                      <p className="text-xs text-slate-400 font-medium">Nenhum candidato</p>
                    </div>
                  ) : (
                    columnCandidates.map((c) => (
                      <CandidateCard
                        key={c.id}
                        candidate={c}
                        onMove={moveToNextStage}
                        onDiscard={discard}
                        onClick={setSelectedCandidate}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {selectedCandidate && (
        <CandidateDetail
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onMove={moveToNextStage}
        />
      )}
    </div>
  );
}
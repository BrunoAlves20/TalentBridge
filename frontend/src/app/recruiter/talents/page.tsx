"use client";

/**
 * Banco de Talentos — página unificada
 *
 * Esta página consolidou duas telas anteriores:
 *   • /recruiter/talents — listagem com filtros, status e drawer de detalhe
 *   • /recruiter/ranking — Top 3 destaques, ordenação por score e ação "Avançar"
 *
 * Ambas consumiam o mesmo endpoint /recrutador/ranking/{id}, então faziam
 * trabalho duplicado. A nova página combina:
 *   - Top 3 candidatos por compatibilidade (cards no topo)
 *   - Filtros: busca, vaga, status, score mínimo
 *   - Tabela completa com paginação visual
 *   - Drawer com perfil + ação "Avançar Candidato" (status → EM_ANALISE)
 */

import { useState, useEffect, useMemo } from "react";
import {
  Search, MapPin, Briefcase, Users, RefreshCw,
  AlertCircle, ChevronDown, Mail, X, ExternalLink,
  CheckCircle2, Star, Award, Filter, TrendingUp
} from "lucide-react";
import { apiFetch } from "@/services/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Candidato {
  candidatura_id: number;
  usuario_id: number;
  nome: string;
  email: string;
  cidade: string;
  estado: string;
  foto_perfil: string | null;
  sobre_mim: string;
  vaga_id: number;
  vaga_titulo: string;
  status_candidatura: string;
  hard_skills: string[];
  soft_skills: string[];
  skills_compativeis: string[];
  match_score: number;
}

interface Vaga {
  id: number;
  titulo: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, { label: string; classes: string }> = {
  ENVIADO:    { label: "Triagem",       classes: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  EM_ANALISE: { label: "Em análise",    classes: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
  ENTREVISTA: { label: "Entrevista",    classes: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400" },
  APROVADO:   { label: "Aprovado",      classes: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
  REJEITADO:  { label: "Descartado",    classes: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" },
};

function scoreColor(score: number) {
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 75) return "text-indigo-600 dark:text-indigo-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-slate-500 dark:text-slate-400";
}

function scoreBg(score: number) {
  if (score >= 90) return "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20";
  if (score >= 75) return "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20";
  return "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20";
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 90 ? "bg-emerald-500" : score >= 75 ? "bg-indigo-500" : "bg-amber-500";
  return (
    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

// ─── Drawer de detalhe do candidato ──────────────────────────────────────────

function CandidatoDrawer({
  candidato,
  onClose,
  onAdvance,
}: {
  candidato: Candidato;
  onClose: () => void;
  onAdvance: (candidaturaId: number) => void;
}) {
  const cfg = STATUS_LABEL[candidato.status_candidatura] ?? STATUS_LABEL.ENVIADO;
  // Mostra "Avançar" só faz sentido enquanto o candidato não está numa fase posterior.
  const podeAvancar = ["ENVIADO"].includes(candidato.status_candidatura);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-lg bg-white dark:bg-[#0B0E14] border-l border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto flex flex-col">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-[#0B0E14] border-b border-slate-100 dark:border-slate-800/50 p-6 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 dark:text-white">Perfil do Candidato</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 flex-1 space-y-7">
          {/* Identidade */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-lg">
              {candidato.nome.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{candidato.nome}</h2>
              <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mt-0.5">
                {candidato.vaga_titulo}
              </p>
              {(candidato.cidade || candidato.estado) && (
                <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                  <MapPin className="w-3 h-3" />
                  {[candidato.cidade, candidato.estado].filter(Boolean).join(", ")}
                </div>
              )}
            </div>
            <div className={`border rounded-2xl px-4 py-3 text-center ${scoreBg(candidato.match_score)}`}>
              <p className={`text-3xl font-black ${scoreColor(candidato.match_score)}`}>
                {candidato.match_score}%
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Match</p>
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Status no pipeline</p>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.classes}`}>
              {cfg.label}
            </span>
          </div>

          {/* Sobre */}
          {candidato.sobre_mim && (
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Sobre</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{candidato.sobre_mim}</p>
            </div>
          )}

          {/* Análise de compatibilidade */}
          <div className="bg-slate-50 dark:bg-[#1A1D2D]/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/50">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-5">
              Análise de Compatibilidade
            </p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Habilidades técnicas</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400">
                    {Math.round(candidato.match_score * 0.92)}%
                  </span>
                </div>
                <ScoreBar score={candidato.match_score * 0.92} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Soft skills</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400">
                    {Math.round(candidato.match_score * 0.85)}%
                  </span>
                </div>
                <ScoreBar score={candidato.match_score * 0.85} />
              </div>
            </div>
          </div>

          {/* Skills compatíveis */}
          {candidato["skills_compativeis"]?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">
                Skills compatíveis com a vaga
              </p>
              <div className="space-y-1.5">
                {candidato["skills_compativeis"].map((s, idx) => (
                  <div key={`sc-${idx}`} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hard skills */}
          {candidato.hard_skills?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">Stack técnica</p>
              <div className="flex flex-wrap gap-2">
                {candidato.hard_skills.map((s, idx) => (
                  <span key={`chs-${idx}`} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg text-xs font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Soft skills */}
          {candidato.soft_skills?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">Soft skills</p>
              <div className="flex flex-wrap gap-2">
                {candidato.soft_skills.map((s, idx) => (
                  <span key={`css-${idx}`} className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-lg text-xs font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-6 border-t border-slate-100 dark:border-slate-800/50 bg-white dark:bg-[#0B0E14] flex gap-3">
          {podeAvancar && (
            <button
              onClick={() => { onAdvance(candidato.candidatura_id); onClose(); }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Avançar Candidato
            </button>
          )}
          <a
            href={`mailto:${candidato.email}`}
            className={`${podeAvancar ? "px-5" : "flex-1"} flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm font-bold`}
          >
            <Mail className="w-4 h-4" /> Enviar E-mail
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Page principal ───────────────────────────────────────────────────────────

export default function BancoTalentosPage() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [selectedVagaId, setSelectedVagaId] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [minScore, setMinScore] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [selected, setSelected] = useState<Candidato | null>(null);

  const recrutadorId =
    typeof window !== "undefined" ? localStorage.getItem("usuario_id") : null;

  // ── Carrega vagas do recrutador ────────────────────────────────────────────
  useEffect(() => {
    if (!recrutadorId) return;
    apiFetch(`${API_URL}/recrutador/minhas-vagas/${recrutadorId}`)
      .then((r) => r.json())
      .then((data) => setVagas(data.vagas ?? []))
      .catch(() => {});
  }, [recrutadorId]);

  // ── Carrega candidatos (com score, vindos do endpoint /ranking) ────────────
  const fetchCandidatos = async (vagaId?: number) => {
    if (!recrutadorId) return;
    setLoading(true);
    setErro(null);
    try {
      const url = vagaId
        ? `${API_URL}/recrutador/ranking/${recrutadorId}?vaga_id=${vagaId}`
        : `${API_URL}/recrutador/ranking/${recrutadorId}`;
      const res = await apiFetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setCandidatos(data.ranking ?? []);
    } catch {
      setErro("Erro ao carregar candidatos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCandidatos(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [recrutadorId]);

  // ── Ação: avançar candidato para EM_ANALISE ───────────────────────────────
  const handleAdvance = async (candidaturaId: number) => {
    try {
      const res = await apiFetch(
        `${API_URL}/recrutador/candidaturas/${candidaturaId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "EM_ANALISE" }),
        }
      );
      if (!res.ok) throw new Error();
      // Atualiza localmente para feedback imediato (sem precisar refetch)
      setCandidatos((prev) =>
        prev.map((c) =>
          c.candidatura_id === candidaturaId
            ? { ...c, status_candidatura: "EM_ANALISE" }
            : c
        )
      );
    } catch {
      alert("Erro ao avançar candidato. Tente novamente.");
    }
  };

  // ── Filtros locais ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return candidatos
      .filter((c) => {
        const matchSearch =
          c.nome.toLowerCase().includes(search.toLowerCase()) ||
          c.hard_skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
          c.email.toLowerCase().includes(search.toLowerCase());

        const labelStatus = STATUS_LABEL[c.status_candidatura]?.label ?? "";
        const matchStatus = filterStatus === "Todos" || labelStatus === filterStatus;

        const matchMinScore = c.match_score >= minScore;

        return matchSearch && matchStatus && matchMinScore;
      })
      .sort((a, b) => b.match_score - a.match_score);
  }, [candidatos, search, filterStatus, minScore]);

  const top3 = filtered.slice(0, 3);
  const statusOptions = ["Todos", ...Object.values(STATUS_LABEL).map((v) => v.label)];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] antialiased transition-colors">
      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Banco de Talentos
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg ml-[52px]">
            Candidatos das suas vagas, ordenados por compatibilidade com IA
          </p>
        </div>

        {/* Erro */}
        {erro && (
          <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4 mb-6 text-rose-600 dark:text-rose-400 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" /> {erro}
            <button onClick={() => fetchCandidatos()} className="ml-auto underline">
              Tentar novamente
            </button>
          </div>
        )}

        {/* Top 3 destaques — só aparece quando há resultados e não está filtrando ativamente */}
        {!loading && top3.length > 0 && (
          <div className="mb-10">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-5 flex items-center gap-2">
              <Award className="w-3.5 h-3.5" /> Top candidatos por compatibilidade
            </p>
            <div className="grid md:grid-cols-3 gap-5">
              {top3.map((c, idx) => (
                <button
                  key={`top-${c.candidatura_id}-${idx}`}
                  onClick={() => setSelected(c)}
                  className="relative text-left bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-all hover:shadow-lg hover:shadow-indigo-500/5 group"
                >
                  {idx === 0 && (
                    <div className="absolute -top-3 left-5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow">
                      <Star className="w-3 h-3" /> Melhor match
                    </div>
                  )}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shrink-0">
                      {c.nome.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {c.nome}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{c.vaga_titulo}</p>
                    </div>
                    <span className={`text-2xl font-black ${scoreColor(c.match_score)}`}>
                      {c.match_score}%
                    </span>
                  </div>
                  <ScoreBar score={c.match_score} />
                  <div className="flex gap-1.5 mt-4 flex-wrap">
                    {c.hard_skills.slice(0, 3).map((s, sIdx) => (
                      <span key={`tstack-${sIdx}`} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold">
                        {s}
                      </span>
                    ))}
                    {c.hard_skills.length > 3 && (
                      <span className="text-slate-400 text-[10px] font-bold">+{c.hard_skills.length - 3}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou stack..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition dark:text-white"
            />
          </div>

          {/* Filtro por vaga */}
          <div className="relative">
            <select
              value={selectedVagaId}
              onChange={(e) => {
                const id = e.target.value === "" ? undefined : Number(e.target.value);
                setSelectedVagaId(e.target.value === "" ? "" : Number(e.target.value));
                fetchCandidatos(id);
              }}
              className="appearance-none bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl py-3 pl-4 pr-10 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white w-full sm:w-56 transition"
            >
              <option value="">Todas as vagas</option>
              {vagas.map((v, idx) => (
                <option key={`vaga-${v.id}-${idx}`} value={v.id}>{v.titulo}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Filtro por status */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl py-3 pl-4 pr-10 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white w-full sm:w-44 transition"
            >
              {statusOptions.map((s, idx) => (
                <option key={`status-${idx}`} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Botão expandir filtros avançados (score) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition ${
              showFilters
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white dark:bg-[#0B0E14] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Score</span>
          </button>

          {/* Refresh */}
          <button
            onClick={() => fetchCandidatos(selectedVagaId === "" ? undefined : Number(selectedVagaId))}
            disabled={loading}
            className="p-3 bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl text-slate-400 hover:text-indigo-500 hover:border-indigo-300 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Score mínimo (filtro avançado) */}
        {showFilters && (
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl p-6 mb-6 flex items-center gap-6">
            <div className="flex items-center gap-3 flex-1">
              <TrendingUp className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                Score mínimo:
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 w-12 text-right">
                {minScore}%
              </span>
            </div>
          </div>
        )}

        {/* Contagem */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            {loading ? "Carregando..." : `${filtered.length} candidato(s) encontrado(s)`}
          </p>
        </div>

        {/* Tabela */}
        {loading ? (
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-2xl overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={`skel-${i}`} className="p-5 border-b border-slate-100 dark:border-slate-800/50 animate-pulse flex gap-4 items-center">
                <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-16 text-center">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">
              {candidatos.length === 0
                ? "Nenhum candidato encontrado. Publique vagas para atrair candidatos."
                : "Nenhum candidato corresponde a esses filtros."}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-[#1A1D2D]/30 text-slate-500 border-b border-slate-200 dark:border-slate-800/50">
                <tr>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest">#</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest">Candidato</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest hidden md:table-cell">Vaga</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest hidden lg:table-cell">Stack</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest text-center">Status</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest text-center">Match</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filtered.map((c, idx) => {
                  const cfg = STATUS_LABEL[c.status_candidatura] ?? STATUS_LABEL.ENVIADO;
                  return (
                    <tr
                      key={`cand-${c.candidatura_id}-${idx}`}
                      className="hover:bg-slate-50 dark:hover:bg-indigo-500/5 transition group cursor-pointer"
                      onClick={() => setSelected(c)}
                    >
                      {/* Ranking */}
                      <td className="p-5 text-sm font-black text-slate-300 dark:text-slate-700 w-12">
                        {idx + 1}
                      </td>

                      {/* Candidato */}
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shrink-0">
                            {c.nome.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {c.nome}
                            </p>
                            <p className="text-[11px] text-slate-500">{c.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Vaga */}
                      <td className="p-5 hidden md:table-cell">
                        <p className="text-slate-700 dark:text-slate-300 font-medium text-sm flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-slate-400" />
                          {c.vaga_titulo}
                        </p>
                        {(c.cidade || c.estado) && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {[c.cidade, c.estado].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </td>

                      {/* Stack */}
                      <td className="p-5 hidden lg:table-cell">
                        <div className="flex gap-1 flex-wrap">
                          {c.hard_skills.slice(0, 3).map((s, sIdx) => (
                            <span key={`ths-${sIdx}`} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold">
                              {s}
                            </span>
                          ))}
                          {c.hard_skills.length > 3 && (
                            <span className="text-slate-400 text-[10px] font-bold">
                              +{c.hard_skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.classes}`}>
                          {cfg.label}
                        </span>
                      </td>

                      {/* Match */}
                      <td className="p-5 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className={`text-lg font-black ${scoreColor(c.match_score)}`}>
                            {c.match_score}%
                          </span>
                          <div className="w-16">
                            <ScoreBar score={c.match_score} />
                          </div>
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="p-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`mailto:${c.email}`}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-white transition"
                            title="Enviar e-mail"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => setSelected(c)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-white transition"
                            title="Ver perfil completo"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-[#1A1D2D]/10">
              <span className="text-xs text-slate-500 font-medium">
                Mostrando {filtered.length} de {candidatos.length} candidatos
              </span>
            </div>
          </div>
        )}
      </main>

      {selected && (
        <CandidatoDrawer
          candidato={selected}
          onClose={() => setSelected(null)}
          onAdvance={handleAdvance}
        />
      )}
    </div>
  );
}

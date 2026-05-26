"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search, MapPin, Briefcase, Users, RefreshCw,
  AlertCircle, ChevronDown, Mail, X, ExternalLink,
  CheckCircle2, MinusCircle
} from "lucide-react";

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
  skills_compatíveis: string[];
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
  if (score >= 75) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-indigo-600 dark:text-indigo-400";
  return "text-amber-600 dark:text-amber-400";
}

// ─── Drawer de detalhe do candidato ──────────────────────────────────────────

function CandidatoDrawer({
  candidato,
  onClose,
}: {
  candidato: Candidato;
  onClose: () => void;
}) {
  const cfg = STATUS_LABEL[candidato.status_candidatura] ?? STATUS_LABEL.ENVIADO;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white dark:bg-[#0B0E14] border-l border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto flex flex-col">

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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shrink-0">
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
            <div className="text-right shrink-0">
              <p className={`text-3xl font-black ${scoreColor(candidato.match_score)}`}>
                {candidato.match_score}%
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">match</p>
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

          {/* Skills compatíveis */}
          {candidato["skills_compatíveis"]?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">
                Skills compatíveis com a vaga
              </p>
              <div className="space-y-1.5">
                {candidato["skills_compatíveis"].map((s, idx) => (
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
        <div className="sticky bottom-0 p-6 border-t border-slate-100 dark:border-slate-800/50 bg-white dark:bg-[#0B0E14]">
          <a
            href={`mailto:${candidato.email}`}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-500/20"
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
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [selected, setSelected] = useState<Candidato | null>(null);

  const recrutadorId =
    typeof window !== "undefined" ? localStorage.getItem("usuario_id") : null;

  // ── Carrega vagas do recrutador ────────────────────────────────────────────
  useEffect(() => {
    if (!recrutadorId) return;
    fetch(`${API_URL}/recrutador/minhas-vagas/${recrutadorId}`)
      .then((r) => r.json())
      .then((data) => setVagas(data.vagas ?? []))
      .catch(() => {});
  }, [recrutadorId]);

  // ── Carrega ranking (todos os candidatos com score) ────────────────────────
  const fetchCandidatos = async (vagaId?: number) => {
    if (!recrutadorId) return;
    setLoading(true);
    setErro(null);
    try {
      const url = vagaId
        ? `${API_URL}/recrutador/ranking/${recrutadorId}?vaga_id=${vagaId}`
        : `${API_URL}/recrutador/ranking/${recrutadorId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setCandidatos(data.ranking ?? []);
    } catch (e: any) {
      setErro("Erro ao carregar candidatos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCandidatos(); }, [recrutadorId]);

  // ── Filtros locais ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return candidatos.filter((c) => {
      const matchSearch =
        c.nome.toLowerCase().includes(search.toLowerCase()) ||
        c.hard_skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
        c.email.toLowerCase().includes(search.toLowerCase());

      const labelStatus = STATUS_LABEL[c.status_candidatura]?.label ?? "";
      const matchStatus = filterStatus === "Todos" || labelStatus === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [candidatos, search, filterStatus]);

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
            Todos os candidatos que se inscreveram nas suas vagas
          </p>
        </div>

        {/* Erro */}
        {erro && (
          <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4 mb-6 text-rose-600 dark:text-rose-400 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" /> {erro}
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
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

          {/* Refresh */}
          <button
            onClick={() => fetchCandidatos(selectedVagaId === "" ? undefined : Number(selectedVagaId))}
            disabled={loading}
            className="p-3 bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl text-slate-400 hover:text-indigo-500 hover:border-indigo-300 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

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
                        <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">{c.vaga_titulo}</p>
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
                        <span className={`text-lg font-black ${scoreColor(c.match_score)}`}>
                          {c.match_score}%
                        </span>
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
        <CandidatoDrawer candidato={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import {
  Briefcase, MapPin, Clock, CheckCircle2, XCircle,
  Search, AlertCircle, Loader2, Calendar, RefreshCw, Trash2
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type StatusBackend = "ENVIADO" | "EM_ANALISE" | "ENTREVISTA" | "APROVADO" | "REJEITADO";
type AppStatus = "Em análise" | "Teste Técnico" | "Entrevista" | "Aprovado" | "Reprovado";

interface Application {
  candidatura_id: number;
  vaga_id: number;
  titulo: string;
  departamento: string;
  empresa: string;
  modalidade: string;
  localizacao: string;
  faixa_salarial: string;
  status_candidatura: StatusBackend;
  data_candidatura: string;
}

// ─── Mapeamentos ──────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<StatusBackend, AppStatus> = {
  ENVIADO: "Em análise",
  EM_ANALISE: "Teste Técnico",
  ENTREVISTA: "Entrevista",
  APROVADO: "Aprovado",
  REJEITADO: "Reprovado",
};

const MODALIDADE_LABEL: Record<string, string> = {
  REMOTO: "Remoto",
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
};

const statusConfig: Record<AppStatus, { classes: string; dot: string }> = {
  "Em análise": {
    classes: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    dot: "bg-slate-400",
  },
  "Teste Técnico": {
    classes: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-400",
  },
  Entrevista: {
    classes: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
    dot: "bg-indigo-500",
  },
  Aprovado: {
    classes: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  Reprovado: {
    classes: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
    dot: "bg-rose-400",
  },
};

const progressStep: Record<AppStatus, number> = {
  "Em análise": 1,
  "Teste Técnico": 2,
  Entrevista: 3,
  Aprovado: 4,
  Reprovado: 0,
};

const STEPS = ["Em análise", "Teste Técnico", "Entrevista", "Aprovado"];

// ─── Componentes ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AppStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

function ProgressBar({ status }: { status: AppStatus }) {
  if (status === "Reprovado") {
    return (
      <div className="flex items-center gap-2 mt-4">
        <div className="flex-1 h-1.5 bg-rose-100 dark:bg-rose-900/30 rounded-full">
          <div className="h-full w-full bg-rose-400 rounded-full" />
        </div>
        <span className="text-xs text-rose-500 font-bold shrink-0">Encerrado</span>
      </div>
    );
  }
  const step = progressStep[status];
  const pct = Math.round((step / STEPS.length) * 100);
  return (
    <div className="mt-4">
      <div className="flex justify-between mb-1.5">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`text-[10px] font-bold hidden sm:block ${
              i < step ? "text-indigo-600 dark:text-indigo-400" : "text-slate-300 dark:text-slate-700"
            }`}
          >
            {s}
          </span>
        ))}
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<AppStatus | "Todas">("Todas");
  const [cancelando, setCancelando] = useState<number | null>(null);

  const candidatoId =
    typeof window !== "undefined" ? localStorage.getItem("usuario_id") : null;

  const carregar = async () => {
    if (!candidatoId) { setLoading(false); return; }
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch(`${API_URL}/vagas/minhas-candidaturas/${candidatoId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setApplications(data.candidaturas ?? []);
    } catch (e: any) {
      setErro("Não foi possível carregar suas candidaturas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, [candidatoId]);

  const handleCancelar = async (candidaturaId: number) => {
    if (!candidatoId) return;
    setCancelando(candidaturaId);
    try {
      const res = await fetch(
        `${API_URL}/vagas/candidaturas/${candidaturaId}?candidato_id=${candidatoId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail);
      }
      setApplications((prev) => prev.filter((a) => a.candidatura_id !== candidaturaId));
    } catch (e: any) {
      setErro(e.message || "Erro ao cancelar candidatura.");
      setTimeout(() => setErro(null), 3000);
    } finally {
      setCancelando(null);
    }
  };

  const filtered = applications.filter((a) => {
    const label = STATUS_LABEL[a.status_candidatura] ?? "Em análise";
    const matchSearch =
      a.titulo.toLowerCase().includes(search.toLowerCase()) ||
      a.empresa?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Todas" || label === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: applications.length,
    ativas: applications.filter((a) => !["APROVADO", "REJEITADO"].includes(a.status_candidatura)).length,
    aprovadas: applications.filter((a) => a.status_candidatura === "APROVADO").length,
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Minhas Candidaturas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            {loading
              ? "Carregando..."
              : `${counts.total} candidaturas · ${counts.ativas} em andamento · ${counts.aprovadas} aprovada(s)`}
          </p>
        </div>
        <button
          onClick={carregar}
          disabled={loading}
          className="p-2.5 bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl text-slate-400 hover:text-indigo-500 hover:border-indigo-300 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {erro && (
        <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4 mb-6 text-rose-600 dark:text-rose-400 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" /> {erro}
        </div>
      )}

      {/* Filtros por status */}
      <div className="flex gap-3 flex-wrap mb-8">
        {(["Todas", "Em análise", "Teste Técnico", "Entrevista", "Aprovado", "Reprovado"] as const).map((s) => {
          const count =
            s === "Todas"
              ? applications.length
              : applications.filter((a) => STATUS_LABEL[a.status_candidatura] === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filterStatus === s
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 hover:border-indigo-300"
              }`}
            >
              {s} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Busca */}
      <div className="relative mb-8 max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por cargo ou empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition dark:text-white"
        />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 animate-pulse">
              <div className="flex gap-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-16 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            {applications.length === 0
              ? "Você ainda não se candidatou a nenhuma vaga."
              : "Nenhuma candidatura encontrada com esses filtros."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const statusLabel = STATUS_LABEL[app.status_candidatura] ?? "Em análise";
            const podeCancelar = app.status_candidatura === "ENVIADO";

            return (
              <div
                key={app.candidatura_id}
                className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all group"
              >
                <div className="flex items-start gap-5">
                  {/* Avatar empresa */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-md">
                    {(app.empresa || app.titulo || "?").charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {app.titulo}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                          {app.empresa || "—"}{app.departamento ? ` · ${app.departamento}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge status={statusLabel} />
                        {podeCancelar && (
                          <button
                            onClick={() => handleCancelar(app.candidatura_id)}
                            disabled={cancelando === app.candidatura_id}
                            className="p-2 text-slate-300 hover:text-rose-500 dark:text-slate-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                            title="Cancelar candidatura"
                          >
                            {cancelando === app.candidatura_id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-400 mb-1">
                      {app.localizacao && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {app.localizacao}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {MODALIDADE_LABEL[app.modalidade] ?? app.modalidade}
                      </span>
                      {app.faixa_salarial && (
                        <span className="font-bold text-slate-600 dark:text-slate-300">{app.faixa_salarial}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Candidatou-se em {new Date(app.data_candidatura).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <ProgressBar status={statusLabel} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
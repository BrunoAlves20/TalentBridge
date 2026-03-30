"use client";

import { useState } from "react";
import {
  Briefcase, MapPin, Clock, CheckCircle2, XCircle,
  ChevronRight, Search, Filter, ExternalLink, Calendar,
  AlertCircle, Loader2
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type AppStatus = "Em análise" | "Teste Técnico" | "Entrevista" | "Aprovado" | "Reprovado";

interface Application {
  id: number;
  jobTitle: string;
  company: string;
  companyInitial: string;
  companyColor: string;
  location: string;
  workMode: "Remoto" | "Híbrido" | "Presencial";
  contractType: string;
  appliedAt: string;
  status: AppStatus;
  matchScore: number;
  lastUpdate: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const APPLICATIONS: Application[] = [
  {
    id: 1,
    jobTitle: "Frontend Developer",
    company: "Nubank",
    companyInitial: "N",
    companyColor: "bg-purple-600",
    location: "São Paulo, SP",
    workMode: "Híbrido",
    contractType: "CLT",
    appliedAt: "2025-03-10",
    status: "Entrevista",
    matchScore: 94,
    lastUpdate: "Há 2 dias",
  },
  {
    id: 2,
    jobTitle: "Senior React Developer",
    company: "Mercado Livre",
    companyInitial: "M",
    companyColor: "bg-yellow-500",
    location: "Remoto",
    workMode: "Remoto",
    contractType: "CLT",
    appliedAt: "2025-03-05",
    status: "Teste Técnico",
    matchScore: 90,
    lastUpdate: "Há 5 dias",
  },
  {
    id: 3,
    jobTitle: "Engenheiro de Software Frontend",
    company: "Google",
    companyInitial: "G",
    companyColor: "bg-slate-900",
    location: "São Paulo, SP",
    workMode: "Híbrido",
    contractType: "CLT",
    appliedAt: "2025-02-28",
    status: "Em análise",
    matchScore: 87,
    lastUpdate: "Há 12 dias",
  },
  {
    id: 4,
    jobTitle: "Tech Lead Frontend",
    company: "iFood",
    companyInitial: "i",
    companyColor: "bg-red-500",
    location: "São Paulo, SP",
    workMode: "Presencial",
    contractType: "CLT",
    appliedAt: "2025-02-20",
    status: "Reprovado",
    matchScore: 78,
    lastUpdate: "Há 18 dias",
  },
  {
    id: 5,
    jobTitle: "Desenvolvedor Next.js",
    company: "RD Station",
    companyInitial: "R",
    companyColor: "bg-emerald-600",
    location: "Remoto",
    workMode: "Remoto",
    contractType: "PJ",
    appliedAt: "2025-02-15",
    status: "Aprovado",
    matchScore: 96,
    lastUpdate: "Há 22 dias",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<AppStatus, { label: string; icon: React.ElementType; classes: string; dot: string }> = {
  "Em análise": {
    label: "Em análise",
    icon: Loader2,
    classes: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    dot: "bg-slate-400",
  },
  "Teste Técnico": {
    label: "Teste Técnico",
    icon: AlertCircle,
    classes: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-400",
  },
  Entrevista: {
    label: "Entrevista",
    icon: Calendar,
    classes: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
    dot: "bg-indigo-500",
  },
  Aprovado: {
    label: "Aprovado",
    icon: CheckCircle2,
    classes: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  Reprovado: {
    label: "Reprovado",
    icon: XCircle,
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

function StatusBadge({ status }: { status: AppStatus }) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
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
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<AppStatus | "Todas">("Todas");

  const filtered = APPLICATIONS.filter((a) => {
    const matchSearch =
      a.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      a.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Todas" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: APPLICATIONS.length,
    ativas: APPLICATIONS.filter((a) => !["Aprovado", "Reprovado"].includes(a.status)).length,
    aprovadas: APPLICATIONS.filter((a) => a.status === "Aprovado").length,
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Minhas Candidaturas
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          {counts.total} candidaturas · {counts.ativas} em andamento · {counts.aprovadas} aprovada(s)
        </p>
      </div>

      {/* Stat pills */}
      <div className="flex gap-3 flex-wrap mb-8">
        {(["Todas", "Em análise", "Teste Técnico", "Entrevista", "Aprovado", "Reprovado"] as const).map(
          (s) => {
            const count = s === "Todas" ? APPLICATIONS.length : APPLICATIONS.filter((a) => a.status === s).length;
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
          }
        )}
      </div>

      {/* Search */}
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

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-16 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Nenhuma candidatura encontrada.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all group"
            >
              <div className="flex items-start gap-5">
                {/* Logo */}
                <div
                  className={`w-14 h-14 rounded-2xl ${app.companyColor} flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-md`}
                >
                  {app.companyInitial}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {app.jobTitle}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                        {app.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                        {app.matchScore}%
                      </span>
                      <StatusBadge status={app.status} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {app.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {app.workMode} · {app.contractType}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Candidatou-se em {new Date(app.appliedAt).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">
                      Atualizado {app.lastUpdate}
                    </span>
                  </div>

                  <ProgressBar status={app.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
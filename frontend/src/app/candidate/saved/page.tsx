"use client";

import { useState } from "react";
import {
  Bookmark, BookmarkX, MapPin, Briefcase,
  Search, ExternalLink, Clock, Trash2, CheckCircle2
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface SavedJob {
  id: number;
  jobTitle: string;
  company: string;
  companyInitial: string;
  companyColor: string;
  location: string;
  workMode: "Remoto" | "Híbrido" | "Presencial";
  contractType: string;
  salaryRange: string;
  matchScore: number;
  savedAt: string;
  isNew: boolean;
  tags: string[];
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

const INITIAL_SAVED: SavedJob[] = [
  {
    id: 1,
    jobTitle: "Tech Lead Frontend",
    company: "Nubank",
    companyInitial: "N",
    companyColor: "bg-purple-600",
    location: "São Paulo, SP",
    workMode: "Híbrido",
    contractType: "CLT",
    salaryRange: "R$ 18k – 25k",
    matchScore: 98,
    savedAt: "Há 1 dia",
    isNew: true,
    tags: ["React", "TypeScript", "Next.js"],
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
    salaryRange: "R$ 16k – 22k",
    matchScore: 94,
    savedAt: "Há 3 dias",
    isNew: true,
    tags: ["React", "GraphQL", "AWS"],
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
    salaryRange: "R$ 25k – 40k",
    matchScore: 90,
    savedAt: "Há 5 dias",
    isNew: false,
    tags: ["Angular", "TypeScript", "GCP"],
  },
  {
    id: 4,
    jobTitle: "Desenvolvedor Next.js Pleno",
    company: "Hotmart",
    companyInitial: "H",
    companyColor: "bg-orange-500",
    location: "Remoto",
    workMode: "Remoto",
    contractType: "PJ",
    salaryRange: "R$ 10k – 14k",
    matchScore: 86,
    savedAt: "Há 1 semana",
    isNew: false,
    tags: ["Next.js", "Node.js", "PostgreSQL"],
  },
];

// ─── Card ─────────────────────────────────────────────────────────────────────

function JobCard({ job, onRemove, onApply }: {
  job: SavedJob;
  onRemove: (id: number) => void;
  onApply: (id: number) => void;
}) {
  return (
    <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all group">
      <div className="flex items-start gap-5">
        {/* Logo */}
        <div className={`w-14 h-14 rounded-2xl ${job.companyColor} flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-md`}>
          {job.companyInitial}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {job.jobTitle}
                </h3>
                {job.isNew && (
                  <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                    NOVA
                  </span>
                )}
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{job.company}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {job.matchScore}%
              </span>
              <button
                onClick={() => onRemove(job.id)}
                className="p-2 text-slate-300 hover:text-rose-500 dark:text-slate-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                title="Remover dos salvos"
              >
                <BookmarkX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-400 mb-4">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
            <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.workMode} · {job.contractType}</span>
            <span className="font-bold text-slate-600 dark:text-slate-300">{job.salaryRange}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Salvo {job.savedAt}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {job.tags.map((tag) => (
              <span key={tag} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg text-xs font-bold">
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => onApply(job.id)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Candidatar-se
            </button>
            <button className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-bold flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Ver vaga
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SavedJobsPage() {
  const [saved, setSaved] = useState<SavedJob[]>(INITIAL_SAVED);
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState<number[]>([]);

  const filtered = saved.filter(
    (j) =>
      j.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleRemove = (id: number) => setSaved((prev) => prev.filter((j) => j.id !== id));

  const handleApply = (id: number) => {
    setApplied((prev) => [...prev, id]);
    setTimeout(() => setSaved((prev) => prev.filter((j) => j.id !== id)), 1200);
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Vagas Salvas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            {saved.length} {saved.length === 1 ? "vaga salva" : "vagas salvas"} ·{" "}
            {saved.filter((j) => j.isNew).length} novas desde sua última visita
          </p>
        </div>
        {saved.length > 0 && (
          <button
            onClick={() => setSaved([])}
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Limpar tudo
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por cargo, empresa ou stack..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition dark:text-white"
        />
      </div>

      {/* Content */}
      {saved.length === 0 ? (
        <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-16 text-center">
          <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
            Nenhuma vaga salva
          </h3>
          <p className="text-slate-400 text-sm">
            Quando você salvar uma vaga, ela aparecerá aqui para você candidatar-se quando quiser.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((job) =>
            applied.includes(job.id) ? (
              <div key={job.id} className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-3xl p-6 flex items-center gap-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">
                    Candidatura enviada para {job.jobTitle}!
                  </p>
                  <p className="text-sm text-emerald-600/70 dark:text-emerald-500/70">
                    Você pode acompanhar o status em "Minhas Candidaturas".
                  </p>
                </div>
              </div>
            ) : (
              <JobCard key={job.id} job={job} onRemove={handleRemove} onApply={handleApply} />
            )
          )}
        </div>
      )}
    </div>
  );
}
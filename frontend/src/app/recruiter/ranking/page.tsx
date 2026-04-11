"use client";

import { useState, useMemo } from "react";
import {
  Search, Filter, Star, MapPin, Briefcase,
  ChevronDown, Award, TrendingUp, Zap, X,
  CheckCircle2, AlertCircle, MinusCircle, ExternalLink
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Candidate {
  id: number;
  name: string;
  role: string;
  location: string;
  matchScore: number;
  appliedJob: string;
  stacks: string[];
  softSkills: string[];
  experience: number;
  education: string;
  about: string;
  strengths: string[];
  gaps: string[];
  workMode: "Remoto" | "Híbrido" | "Presencial";
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const CANDIDATES: Candidate[] = [];

const JOBS = ["Todas as Vagas"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 75) return "text-indigo-600 dark:text-indigo-400";
  return "text-amber-600 dark:text-amber-400";
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

// ─── Drawer de detalhe ────────────────────────────────────────────────────────

function CandidateDrawer({ candidate, onClose }: { candidate: Candidate; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="flex-1 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="w-full max-w-lg bg-white dark:bg-[#0B0E14] border-l border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-[#0B0E14] border-b border-slate-100 dark:border-slate-800/50 p-6 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 dark:text-white">Perfil do Candidato</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 flex flex-col gap-8">
          {/* Identidade */}
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-lg">
              {candidate.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{candidate.name}</h2>
              <p className="text-indigo-600 dark:text-indigo-400 font-semibold">{candidate.role}</p>
              <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {candidate.location}
              </div>
            </div>
            <div className={`border rounded-2xl px-4 py-3 text-center ${scoreBg(candidate.matchScore)}`}>
              <p className={`text-3xl font-black ${scoreColor(candidate.matchScore)}`}>
                {candidate.matchScore}%
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Match</p>
            </div>
          </div>

          {/* Sobre */}
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">Sobre</p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{candidate.about}</p>
          </div>

          {/* Score breakdown */}
          <div className="bg-slate-50 dark:bg-[#1A1D2D]/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/50">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-5">
              Análise de Compatibilidade
            </p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Habilidades técnicas</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400">
                    {Math.round(candidate.matchScore * 0.92)}%
                  </span>
                </div>
                <ScoreBar score={candidate.matchScore * 0.92} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Experiência</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400">
                    {Math.min(100, candidate.experience * 20)}%
                  </span>
                </div>
                <ScoreBar score={Math.min(100, candidate.experience * 20)} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Soft skills</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400">
                    {Math.round(candidate.matchScore * 0.85)}%
                  </span>
                </div>
                <ScoreBar score={candidate.matchScore * 0.85} />
              </div>
            </div>
          </div>

          {/* Pontos fortes */}
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">
              Pontos Fortes
            </p>
            <div className="space-y-2">
              {candidate.strengths.map((s) => (
                <div key={s} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lacunas */}
          {candidate.gaps.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">
                Lacunas Identificadas
              </p>
              <div className="space-y-2">
                {candidate.gaps.map((g) => (
                  <div key={g} className="flex items-center gap-2 text-sm">
                    <MinusCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400">{g}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stacks */}
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">
              Stack Técnica
            </p>
            <div className="flex flex-wrap gap-2">
              {candidate.stacks.map((s) => (
                <span
                  key={s}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg text-xs font-bold"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Soft Skills */}
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">
              Soft Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {candidate.softSkills.map((s) => (
                <span
                  key={s}
                  className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-lg text-xs font-bold"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="sticky bottom-0 p-6 border-t border-slate-100 dark:border-slate-800/50 bg-white dark:bg-[#0B0E14] flex gap-3">
          <button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Avançar Candidato
          </button>
          <a
            href="#"
            className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2 text-sm font-bold"
          >
            <ExternalLink className="w-4 h-4" /> Ver Perfil
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Page principal ───────────────────────────────────────────────────────────

export default function RankingPage() {
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState("Todas as Vagas");
  const [minScore, setMinScore] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return CANDIDATES.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.stacks.some((s) => s.toLowerCase().includes(search.toLowerCase()));
      const matchJob = selectedJob === "Todas as Vagas" || c.appliedJob === selectedJob;
      const matchScore = c.matchScore >= minScore;
      return matchSearch && matchJob && matchScore;
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [search, selectedJob, minScore]);

  const top3 = filtered.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] antialiased transition-colors">
      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Motor de Ranking
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg ml-[52px]">
            Candidatos ordenados por compatibilidade com as suas vagas
          </p>
        </div>

        {/* Top 3 Destaque */}
        {top3.length > 0 && (
          <div className="mb-12">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-5 flex items-center gap-2">
              <Award className="w-3.5 h-3.5" /> Top candidatos
            </p>
            <div className="grid md:grid-cols-3 gap-5">
              {top3.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCandidate(c)}
                  className="relative text-left bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-all hover:shadow-lg hover:shadow-indigo-500/5 group"
                >
                  {i === 0 && (
                    <div className="absolute -top-3 left-5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow">
                      <Star className="w-3 h-3" /> Melhor match
                    </div>
                  )}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {c.name}
                      </p>
                      <p className="text-xs text-slate-400">{c.role}</p>
                    </div>
                    <span className={`text-2xl font-black ${scoreColor(c.matchScore)}`}>
                      {c.matchScore}%
                    </span>
                  </div>
                  <ScoreBar score={c.matchScore} />
                  <div className="flex gap-1.5 mt-4 flex-wrap">
                    {c.stacks.slice(0, 3).map((s) => (
                      <span key={s} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold">
                        {s}
                      </span>
                    ))}
                    {c.stacks.length > 3 && (
                      <span className="text-slate-400 text-[10px] font-bold">+{c.stacks.length - 3}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou stack..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition dark:text-white"
            />
          </div>

          <div className="relative">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="appearance-none bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl py-3 pl-4 pr-10 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white w-full sm:w-56 transition"
            >
              {JOBS.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition ${
              showFilters
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white dark:bg-[#0B0E14] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Filtro de score */}
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

        {/* Lista completa */}
        <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {filtered.length} candidatos encontrados
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-16 text-center">
              <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Nenhum candidato corresponde aos filtros.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filtered.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCandidate(c)}
                  className="w-full text-left p-5 hover:bg-slate-50 dark:hover:bg-indigo-500/5 transition group flex items-center gap-5"
                >
                  {/* Posição */}
                  <span className="text-sm font-black text-slate-300 dark:text-slate-700 w-6 shrink-0">
                    {idx + 1}
                  </span>

                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shrink-0">
                    {c.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {c.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {c.appliedJob}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {c.location}
                      </span>
                    </div>
                  </div>

                  {/* Stacks */}
                  <div className="hidden lg:flex gap-1.5 flex-wrap max-w-xs">
                    {c.stacks.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-end gap-1.5 ml-4 shrink-0 w-24">
                    <span className={`text-2xl font-black ${scoreColor(c.matchScore)}`}>
                      {c.matchScore}%
                    </span>
                    <ScoreBar score={c.matchScore} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedCandidate && (
        <CandidateDrawer
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}
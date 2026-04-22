"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bookmark, BookmarkX, MapPin, Briefcase,
  Search, ExternalLink, Clock, Trash2, CheckCircle2,
  Loader2, AlertCircle, RefreshCw, Building2
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface VagaSalva {
  salvo_id: number;
  vaga_id: number;
  titulo: string;
  departamento: string;
  descricao: string;
  requisitos: string;
  modalidade: "REMOTO" | "PRESENCIAL" | "HIBRIDO";
  localizacao: string;
  faixa_salarial: string;
  status_vaga: string;
  empresa: string;
  logo_empresa: string | null;
  data_salvamento: string;
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

function tempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (dias === 0) return "Hoje";
  if (dias === 1) return "Há 1 dia";
  if (dias < 7) return `Há ${dias} dias`;
  if (dias < 30) return `Há ${Math.floor(dias / 7)} semana(s)`;
  return `Há ${Math.floor(dias / 30)} mês(es)`;
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function JobCard({
  vaga,
  onRemover,
  onCandidatar,
  candidatando,
  removendo,
  jaInscrito,
}: {
  vaga: VagaSalva;
  onRemover: (vagaId: number) => void;
  onCandidatar: (vagaId: number) => void;
  candidatando: boolean;
  removendo: boolean;
  jaInscrito: boolean;
}) {
  const tags = vaga.requisitos
    ? vaga.requisitos.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 4)
    : [];

  return (
    <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all group">
      <div className="flex items-start gap-5">
        {/* Avatar empresa */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-md">
          {(vaga.empresa || vaga.titulo || "?").charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="min-w-0">
              <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                {vaga.titulo}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                {vaga.empresa || "—"}
                {vaga.departamento && (
                  <span className="text-slate-400"> · {vaga.departamento}</span>
                )}
              </p>
            </div>

            {/* Botão remover */}
            <button
              onClick={() => onRemover(vaga.vaga_id)}
              disabled={removendo}
              className="p-2 text-slate-300 hover:text-rose-500 dark:text-slate-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all shrink-0 disabled:opacity-40"
              title="Remover dos salvos"
            >
              {removendo
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <BookmarkX className="w-5 h-5" />}
            </button>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-400 my-3">
            {vaga.localizacao && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {vaga.localizacao}
              </span>
            )}
            <span className={`px-2.5 py-0.5 rounded-full font-bold ${MODALIDADE_COLOR[vaga.modalidade]}`}>
              {MODALIDADE_LABEL[vaga.modalidade]}
            </span>
            {vaga.faixa_salarial && (
              <span className="font-bold text-slate-600 dark:text-slate-300">{vaga.faixa_salarial}</span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Salvo {tempoRelativo(vaga.data_salvamento)}
            </span>
          </div>

          {/* Tags de requisitos */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {tags.map((tag, tIdx) => (
                <span
                  key={`${tag}-${tIdx}`}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg text-xs font-bold"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3">
            {jaInscrito ? (
              <div className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold py-2.5 rounded-xl text-sm border border-emerald-200 dark:border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" /> Inscrito
              </div>
            ) : (
              <button
                onClick={() => onCandidatar(vaga.vaga_id)}
                disabled={candidatando || vaga.status_vaga !== "ABERTA"}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                {candidatando
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                  : <><CheckCircle2 className="w-4 h-4" /> Candidatar-se</>}
              </button>
            )}

            {/* Ver vaga — rota para a página de detalhe */}
            <Link
              href={`/candidate/jobs/${vaga.vaga_id}`}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-bold flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" /> Ver vaga
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page principal ───────────────────────────────────────────────────────────

export default function SavedJobsPage() {
  const [vagas, setVagas] = useState<VagaSalva[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Controla qual vaga_id está sendo processado (evita cliques duplos)
  const [candidatandoId, setCandidatandoId] = useState<number | null>(null);
  const [removendoId, setRemovendoId] = useState<number | null>(null);
  const [limpando, setLimpando] = useState(false);

  // Vagas em que o candidato já se inscreveu nesta sessão
  const [inscritos, setInscritos] = useState<Set<number>>(new Set());

  const candidatoId =
    typeof window !== "undefined" ? localStorage.getItem("usuario_id") : null;

  // ── Carrega vagas salvas da API ───────────────────────────────────────────
  const carregarSalvas = useCallback(async () => {
    if (!candidatoId) { setLoading(false); return; }
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch(`${API_URL}/vagas/salvas/${candidatoId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erro ao carregar vagas salvas.");
      setVagas(data.vagas_salvas ?? []);
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [candidatoId]);

  useEffect(() => { carregarSalvas(); }, [carregarSalvas]);

  // ── Remover vaga salva ────────────────────────────────────────────────────
  const handleRemover = async (vagaId: number) => {
    if (!candidatoId) return;
    setRemovendoId(vagaId);
    try {
      const res = await fetch(
        `${API_URL}/vagas/salvas/${vagaId}?usuario_id=${candidatoId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail);
      }
      setVagas((prev) => prev.filter((v) => v.vaga_id !== vagaId));
    } catch (e: any) {
      setErro(e.message || "Erro ao remover vaga.");
      setTimeout(() => setErro(null), 3500);
    } finally {
      setRemovendoId(null);
    }
  };

  // ── Candidatar-se ─────────────────────────────────────────────────────────
  const handleCandidatar = async (vagaId: number) => {
    if (!candidatoId) return;
    setCandidatandoId(vagaId);
    try {
      const res = await fetch(`${API_URL}/vagas/candidatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaga_id: vagaId, candidato_id: Number(candidatoId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      setInscritos((prev) => new Set([...prev, vagaId]));
      setSuccessMsg("Candidatura enviada! Acompanhe em Minhas Candidaturas.");
      setTimeout(() => setSuccessMsg(null), 4000);

      // Remove da lista de salvas após candidatura bem-sucedida
      // (comportamento opcional — comentar a linha abaixo para manter na lista)
      await handleRemoverSilencioso(vagaId);
    } catch (e: any) {
      if (e.message?.includes("409") || e.message?.includes("já se candidatou")) {
        setInscritos((prev) => new Set([...prev, vagaId]));
      } else {
        setErro(e.message || "Erro ao enviar candidatura.");
        setTimeout(() => setErro(null), 3500);
      }
    } finally {
      setCandidatandoId(null);
    }
  };

  // Remove silenciosamente (sem feedback de erro — usado internamente)
  const handleRemoverSilencioso = async (vagaId: number) => {
    if (!candidatoId) return;
    try {
      await fetch(`${API_URL}/vagas/salvas/${vagaId}?usuario_id=${candidatoId}`, {
        method: "DELETE",
      });
      setVagas((prev) => prev.filter((v) => v.vaga_id !== vagaId));
    } catch {
      // falha silenciosa — candidatura já foi registrada
    }
  };

  // ── Limpar tudo ───────────────────────────────────────────────────────────
  const handleLimparTudo = async () => {
    if (!candidatoId || vagas.length === 0) return;
    setLimpando(true);
    try {
      // Chama DELETE em paralelo para cada vaga salva
      await Promise.all(
        vagas.map((v) =>
          fetch(`${API_URL}/vagas/salvas/${v.vaga_id}?usuario_id=${candidatoId}`, {
            method: "DELETE",
          })
        )
      );
      setVagas([]);
    } catch {
      setErro("Erro ao limpar a lista. Tente novamente.");
      setTimeout(() => setErro(null), 3500);
    } finally {
      setLimpando(false);
    }
  };

  // ── Filtro local por busca ────────────────────────────────────────────────
  const filtered = vagas.filter(
    (v) =>
      v.titulo.toLowerCase().includes(search.toLowerCase()) ||
      v.empresa?.toLowerCase().includes(search.toLowerCase()) ||
      v.requisitos?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Vagas Salvas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            {loading
              ? "Carregando..."
              : `${vagas.length} ${vagas.length === 1 ? "vaga salva" : "vagas salvas"}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={carregarSalvas}
            disabled={loading}
            className="p-2.5 bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl text-slate-400 hover:text-indigo-500 hover:border-indigo-300 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {vagas.length > 0 && (
            <button
              onClick={handleLimparTudo}
              disabled={limpando}
              className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-rose-500 transition disabled:opacity-50"
            >
              {limpando
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Trash2 className="w-4 h-4" />}
              Limpar tudo
            </button>
          )}
        </div>
      </div>

      {/* Notificações */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 mb-6 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}
      {erro && (
        <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4 mb-6 text-rose-600 dark:text-rose-400 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" /> {erro}
        </div>
      )}

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

      {/* Conteúdo */}
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
      ) : vagas.length === 0 ? (
        <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-16 text-center">
          <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
            Nenhuma vaga salva
          </h3>
          <p className="text-slate-400 text-sm">
            Quando você salvar uma vaga, ela aparecerá aqui para se candidatar quando quiser.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-12 text-center">
          <p className="text-slate-500 font-medium">Nenhuma vaga encontrada para essa busca.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((vaga) => (
            <JobCard
              key={vaga.salvo_id}
              vaga={vaga}
              onRemover={handleRemover}
              onCandidatar={handleCandidatar}
              candidatando={candidatandoId === vaga.vaga_id}
              removendo={removendoId === vaga.vaga_id}
              jaInscrito={inscritos.has(vaga.vaga_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
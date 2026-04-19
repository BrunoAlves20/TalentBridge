"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search, MapPin, Briefcase, Clock, ChevronDown,
  X, CheckCircle2, Loader2, Filter, RefreshCw, AlertCircle,
  Building2, ExternalLink
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Vaga {
  id: number;
  titulo: string;
  departamento: string;
  descricao: string;
  requisitos: string;
  modalidade: "REMOTO" | "PRESENCIAL" | "HIBRIDO";
  localizacao: string;
  faixa_salarial: string;
  criado_em: string;
  empresa: string;
  nome_recrutador: string;
  total_candidatos: number;
  // estado de UI local
  ja_candidatou?: boolean;
  candidatura_id?: number | null;
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

// ─── Card da Vaga ─────────────────────────────────────────────────────────────

function VagaCard({
  vaga,
  onCandidatar,
  loading,
}: {
  vaga: Vaga;
  onCandidatar: (id: number) => void;
  loading: boolean;
}) {
  const [expandida, setExpandida] = useState(false);
  const requisitos = vaga.requisitos ? vaga.requisitos.split(",").map((r) => r.trim()).filter(Boolean) : [];

  return (
    <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all group">
      <div className="flex items-start gap-5">
        {/* Avatar empresa */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-md">
          {(vaga.empresa || vaga.nome_recrutador || "?").charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {vaga.titulo}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {vaga.empresa || vaga.nome_recrutador}
                {vaga.departamento && <span className="text-slate-400"> · {vaga.departamento}</span>}
              </p>
            </div>

            {/* Botão candidatar */}
            {vaga.ja_candidatou ? (
              <span className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" /> Inscrito
              </span>
            ) : (
              <button
                onClick={() => onCandidatar(vaga.id)}
                disabled={loading}
                className="shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-bold transition shadow-md shadow-indigo-500/20 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Candidatar-se
              </button>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-400 mb-3">
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
              <Clock className="w-3.5 h-3.5" /> {tempoRelativo(vaga.criado_em)}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> {vaga.total_candidatos} candidato(s)
            </span>
          </div>

          {/* Descrição resumida */}
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">
            {vaga.descricao}
          </p>

          {/* Tags de requisitos */}
          {requisitos.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {requisitos.slice(0, 5).map((req) => (
                <span key={req} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                  {req}
                </span>
              ))}
              {requisitos.length > 5 && (
                <span className="text-slate-400 text-xs font-bold">+{requisitos.length - 5}</span>
              )}
            </div>
          )}

          {/* Expandir descrição */}
          <button
            onClick={() => setExpandida(!expandida)}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            {expandida ? "Ver menos" : "Ver descrição completa"}
            <ChevronDown className={`w-3 h-3 transition-transform ${expandida ? "rotate-180" : ""}`} />
          </button>

          {expandida && (
            <div className="mt-4 p-4 bg-slate-50 dark:bg-[#1A1D2D]/30 rounded-xl border border-slate-200 dark:border-slate-800/50">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {vaga.descricao}
              </p>
              {vaga.requisitos && (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-4 mb-2">Requisitos</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{vaga.requisitos}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page principal ───────────────────────────────────────────────────────────

export default function ExplorarVagasPage() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [busca, setBusca] = useState("");
  const [modalidadeFiltro, setModalidadeFiltro] = useState<string>("Todas");
  const [loading, setLoading] = useState(true);
  const [candidatandoId, setCandidatandoId] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const candidatoId =
    typeof window !== "undefined" ? localStorage.getItem("usuario_id") : null;

  // ── Carrega vagas abertas ─────────────────────────────────────────────────
  const carregarVagas = async () => {
    setLoading(true);
    setErro(null);
    try {
      const params = new URLSearchParams();
      if (modalidadeFiltro !== "Todas") {
        const map: Record<string, string> = { Remoto: "REMOTO", Presencial: "PRESENCIAL", Híbrido: "HIBRIDO" };
        params.set("modalidade", map[modalidadeFiltro] || modalidadeFiltro);
      }
      if (busca.trim()) params.set("busca", busca.trim());

      const res = await fetch(`${API_URL}/vagas/abertas?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Erro ao buscar vagas");

      // Verifica quais vagas o candidato já se inscreveu
      let candidaturasIds: number[] = [];
      if (candidatoId) {
        const resC = await fetch(`${API_URL}/vagas/minhas-candidaturas/${candidatoId}`);
        if (resC.ok) {
          const dataC = await resC.json();
          candidaturasIds = (dataC.candidaturas ?? []).map((c: any) => c.vaga_id);
        }
      }

      setVagas(
        (data.vagas ?? []).map((v: Vaga) => ({
          ...v,
          ja_candidatou: candidaturasIds.includes(v.id),
        }))
      );
    } catch (e: any) {
      setErro(e.message || "Erro ao carregar vagas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarVagas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalidadeFiltro]);

  // ── Candidatar-se ─────────────────────────────────────────────────────────
  const handleCandidatar = async (vagaId: number) => {
    if (!candidatoId) {
      setErro("Você precisa estar logado para se candidatar.");
      return;
    }
    setCandidatandoId(vagaId);
    try {
      const res = await fetch(`${API_URL}/vagas/candidatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaga_id: vagaId, candidato_id: Number(candidatoId) }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Erro ao enviar candidatura");

      // Atualiza estado local sem recarregar tudo
      setVagas((prev) =>
        prev.map((v) =>
          v.id === vagaId ? { ...v, ja_candidatou: true, total_candidatos: v.total_candidatos + 1 } : v
        )
      );
      setSuccessMsg("Candidatura enviada! Acompanhe o status em Minhas Candidaturas.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e: any) {
      setErro(e.message);
      setTimeout(() => setErro(null), 4000);
    } finally {
      setCandidatandoId(null);
    }
  };

  // ── Filtro local por busca ────────────────────────────────────────────────
  const vagasFiltradas = useMemo(() => {
    if (!busca.trim()) return vagas;
    const q = busca.toLowerCase();
    return vagas.filter(
      (v) =>
        v.titulo.toLowerCase().includes(q) ||
        v.descricao.toLowerCase().includes(q) ||
        v.empresa?.toLowerCase().includes(q) ||
        v.requisitos?.toLowerCase().includes(q)
    );
  }, [vagas, busca]);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Explorar Vagas
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          {loading ? "Carregando..." : `${vagasFiltradas.length} vaga(s) disponível(is)`}
        </p>
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

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cargo, empresa ou tecnologia..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && carregarVagas()}
            className="w-full bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition dark:text-white"
          />
        </div>

        <div className="flex gap-2">
          {["Todas", "Remoto", "Híbrido", "Presencial"].map((m) => (
            <button
              key={m}
              onClick={() => setModalidadeFiltro(m)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                modalidadeFiltro === m
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-300"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <button
          onClick={carregarVagas}
          disabled={loading}
          className="p-3 bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl text-slate-400 hover:text-indigo-500 hover:border-indigo-300 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
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
      ) : vagasFiltradas.length === 0 ? (
        <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-16 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Nenhuma vaga encontrada</h3>
          <p className="text-slate-400 text-sm">Tente ajustar os filtros ou volte mais tarde.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vagasFiltradas.map((vaga) => (
            <VagaCard
              key={vaga.id}
              vaga={vaga}
              onCandidatar={handleCandidatar}
              loading={candidatandoId === vaga.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
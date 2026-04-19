"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search, MapPin, Briefcase, Clock, ChevronDown,
  X, CheckCircle2, Loader2, RefreshCw, AlertCircle,
  Building2, Bookmark, BookmarkCheck, ChevronUp
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
  jaInscrito,
  jaSalvo,
  onCandidatar,
  onSalvar,
  candidatando,
  salvando,
}: {
  vaga: Vaga;
  jaInscrito: boolean;
  jaSalvo: boolean;
  onCandidatar: (id: number) => void;
  onSalvar: (id: number) => void;
  candidatando: boolean;
  salvando: boolean;
}) {
  const [expandida, setExpandida] = useState(false);
  const tags = vaga.requisitos
    ? vaga.requisitos.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all group">
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-md">
          {(vaga.empresa || vaga.titulo || "?").charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {vaga.titulo}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                {vaga.empresa || vaga.nome_recrutador}
                {vaga.departamento && <span className="text-slate-400"> · {vaga.departamento}</span>}
              </p>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 shrink-0">
              {/* ✅ Botão salvar */}
              <button
                onClick={() => onSalvar(vaga.id)}
                disabled={salvando}
                title={jaSalvo ? "Remover dos salvos" : "Salvar vaga"}
                className={`p-2 rounded-xl border transition disabled:opacity-40 ${
                  jaSalvo
                    ? "border-amber-300 dark:border-amber-500/40 text-amber-500 bg-amber-50 dark:bg-amber-500/10"
                    : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                }`}
              >
                {salvando ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : jaSalvo ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>

              {/* Candidatar-se */}
              {jaInscrito ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" /> Inscrito
                </span>
              ) : (
                <button
                  onClick={() => onCandidatar(vaga.id)}
                  disabled={candidatando}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-bold transition shadow-md shadow-indigo-500/20 flex items-center gap-2"
                >
                  {candidatando && <Loader2 className="w-4 h-4 animate-spin" />}
                  Candidatar-se
                </button>
              )}
            </div>
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

          {/* Descrição */}
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">
            {vaga.descricao}
          </p>

          {/* Tags de requisitos */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.slice(0, expandida ? tags.length : 5).map((tag) => (
                <span key={tag} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                  {tag}
                </span>
              ))}
              {!expandida && tags.length > 5 && (
                <span className="text-slate-400 text-xs font-bold">+{tags.length - 5}</span>
              )}
            </div>
          )}

          {/* Expandir */}
          <button
            onClick={() => setExpandida(!expandida)}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            {expandida ? (
              <><ChevronUp className="w-3 h-3" /> Ver menos</>
            ) : (
              <><ChevronDown className="w-3 h-3" /> Ver descrição completa</>
            )}
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

// ─── Inner page (usa useSearchParams — deve ser envolvida em Suspense) ─────────

function ExplorarVagasInner() {
  const searchParams = useSearchParams();
  const termInicial = searchParams.get("q") ?? "";

  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [busca, setBusca] = useState(termInicial);
  const [buscaInput, setBuscaInput] = useState(termInicial);
  const [modalidadeFiltro, setModalidadeFiltro] = useState("Todas");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [candidatandoId, setCandidatandoId] = useState<number | null>(null);
  const [salvandoId, setSalvandoId] = useState<number | null>(null);
  const [inscritos, setInscritos] = useState<Set<number>>(new Set());
  const [salvos, setSalvos] = useState<Set<number>>(new Set());

  const candidatoId =
    typeof window !== "undefined" ? localStorage.getItem("usuario_id") : null;

  // ── Carrega vagas e estado inicial do usuário ─────────────────────────────
  const carregarVagas = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const params = new URLSearchParams();
      const modalMap: Record<string, string> = { Remoto: "REMOTO", Presencial: "PRESENCIAL", Híbrido: "HIBRIDO" };
      if (modalidadeFiltro !== "Todas") params.set("modalidade", modalMap[modalidadeFiltro] ?? modalidadeFiltro);
      if (busca.trim()) params.set("busca", busca.trim());

      const res = await fetch(`${API_URL}/vagas/abertas?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setVagas(data.vagas ?? []);
    } catch (e: any) {
      setErro(e.message ?? "Erro ao carregar vagas.");
    } finally {
      setLoading(false);
    }
  }, [busca, modalidadeFiltro]);

  // Carrega estado de candidaturas e vagas salvas
  useEffect(() => {
    if (!candidatoId) return;
    Promise.all([
      fetch(`${API_URL}/vagas/minhas-candidaturas/${candidatoId}`).then((r) => r.json()),
      fetch(`${API_URL}/vagas/salvas/${candidatoId}`).then((r) => r.json()),
    ]).then(([cands, salvas]) => {
      setInscritos(new Set((cands.candidaturas ?? []).map((c: any) => c.vaga_id as number)));
      setSalvos(new Set((salvas.vagas_salvas ?? []).map((v: any) => v.vaga_id as number)));
    }).catch(() => {});
  }, [candidatoId]);

  useEffect(() => { carregarVagas(); }, [carregarVagas]);

  // ── Candidatar-se ────────────────────────────────────────────────────────
  const handleCandidatar = async (vagaId: number) => {
    if (!candidatoId) return;
    setCandidatandoId(vagaId);
    try {
      const res = await fetch(`${API_URL}/vagas/candidatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaga_id: vagaId, candidato_id: Number(candidatoId) }),
      });
      if (res.ok || res.status === 409) {
        setInscritos((prev) => new Set([...prev, vagaId]));
        if (res.ok) {
          setSuccessMsg("Candidatura enviada! Acompanhe em Minhas Candidaturas.");
          setTimeout(() => setSuccessMsg(null), 4000);
        }
      } else {
        const data = await res.json();
        throw new Error(data.detail);
      }
    } catch (e: any) {
      setErro(e.message ?? "Erro ao enviar candidatura.");
      setTimeout(() => setErro(null), 4000);
    } finally {
      setCandidatandoId(null);
    }
  };

  // ── Salvar / dessalvar ────────────────────────────────────────────────────
  const handleSalvar = async (vagaId: number) => {
    if (!candidatoId) return;
    setSalvandoId(vagaId);
    const jaSalvo = salvos.has(vagaId);
    try {
      if (jaSalvo) {
        const res = await fetch(
          `${API_URL}/vagas/salvas/${vagaId}?usuario_id=${candidatoId}`,
          { method: "DELETE" }
        );
        if (res.ok) setSalvos((prev) => { const s = new Set(prev); s.delete(vagaId); return s; });
      } else {
        const res = await fetch(`${API_URL}/vagas/salvar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vaga_id: vagaId, usuario_id: Number(candidatoId) }),
        });
        if (res.ok || res.status === 409) setSalvos((prev) => new Set([...prev, vagaId]));
      }
    } finally {
      setSalvandoId(null);
    }
  };

  // ── Busca manual (Enter ou botão) ─────────────────────────────────────────
  const handleSubmitBusca = (e: React.FormEvent) => {
    e.preventDefault();
    setBusca(buscaInput);
  };

  const limparBusca = () => { setBuscaInput(""); setBusca(""); };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Explorar Vagas
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          {loading ? "Carregando..." : `${vagas.length} vaga(s) disponível(is)`}
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
        <form onSubmit={handleSubmitBusca} className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cargo, empresa ou tecnologia..."
            value={buscaInput}
            onChange={(e) => setBuscaInput(e.target.value)}
            className="w-full bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl py-3 pl-11 pr-24 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition dark:text-white"
          />
          {buscaInput && (
            <button type="button" onClick={limparBusca} className="absolute right-16 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition">
            Buscar
          </button>
        </form>

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
      ) : vagas.length === 0 ? (
        <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-16 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Nenhuma vaga encontrada</h3>
          <p className="text-slate-400 text-sm">Tente ajustar os filtros ou volte mais tarde.</p>
          {busca && (
            <button onClick={limparBusca} className="mt-4 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline">
              Limpar busca
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {vagas.map((vaga) => (
            <VagaCard
              key={vaga.id}
              vaga={vaga}
              jaInscrito={inscritos.has(vaga.id)}
              jaSalvo={salvos.has(vaga.id)}
              onCandidatar={handleCandidatar}
              onSalvar={handleSalvar}
              candidatando={candidatandoId === vaga.id}
              salvando={salvandoId === vaga.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Export com Suspense (exigido pelo useSearchParams) ───────────────────────

export default function ExplorarVagasPage() {
  return (
    <Suspense fallback={
      <div className="animate-in fade-in duration-500">
        <div className="mb-10">
          <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-2 animate-pulse" />
          <div className="h-5 bg-slate-100 dark:bg-slate-900 rounded w-32 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 animate-pulse h-32" />
          ))}
        </div>
      </div>
    }>
      <ExplorarVagasInner />
    </Suspense>
  );
}
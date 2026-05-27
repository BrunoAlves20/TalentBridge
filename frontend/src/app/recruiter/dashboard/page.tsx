"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Briefcase, Users, UserCheck, Calendar, Award, TrendingUp,
  Search, ChevronLeft, ChevronRight, Mail, CheckCircle,
  Eye, Trash2, Edit3, X, FileText, Plus, ChevronDown, AlertCircle,
  Loader2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import { apiFetch } from "@/services/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Job {
  id: number;
  title: string;
  location: string;
  type: string;
  status: "Aberta" | "Encerrada" | "Pausada"; 
  department?: string;
  description?: string;
  requirements?: string;
  salaryMin?: string;
  salaryMax?: string;
}

interface Candidate {
  id: number;
  name: string;
  job: string;
  match: string;
  status: string;
  email: string;
  phone: string;
  resume: string;
}

type WorkMode = "Remoto" | "Híbrido" | "Presencial";
type JobStatus = "Aberta" | "Pausada" | "Encerrada"; // ✅ CORRIGIDO

// ─── Componentes auxiliares ───────────────────────────────────────────────────

const StatCard = ({ title, value, icon: Icon }: any) => (
  <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl p-8 shadow-sm hover:border-indigo-500/30 transition-all group">
    <div className="flex flex-col gap-6">
      <div className="bg-slate-50 dark:bg-[#1A1D2D] p-3 rounded-xl w-fit group-hover:bg-indigo-600/10 dark:group-hover:bg-indigo-900/40 transition-colors">
        <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
      </div>
    </div>
  </div>
);

const Badge = ({ children, variant }: { children: string; variant: string }) => {
  const styles: any = {
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
    info: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20",
    neutral: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${styles[variant] || styles.neutral}`}>
      {children}
    </span>
  );
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{children}</label>;
}

function inputCls() {
  return "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm transition";
}

// ─── Mapeamentos frontend ↔ backend ──────────────────────────────────────────

// ✅ CORRIGIDO: "Encerrada" → "ENCERRADA" (não "FECHADA")
const MODALIDADE_TO_LABEL: Record<string, WorkMode> = {
  REMOTO: "Remoto",
  HIBRIDO: "Híbrido",
  PRESENCIAL: "Presencial",
};

const LABEL_TO_MODALIDADE: Record<string, string> = {
  Remoto: "REMOTO",
  Híbrido: "HIBRIDO",
  Presencial: "PRESENCIAL",
};

const STATUS_TO_LABEL: Record<string, JobStatus> = {
  ABERTA: "Aberta",
  PAUSADA: "Pausada",
  ENCERRADA: "Encerrada",   // ✅ CORRIGIDO
};

const LABEL_TO_STATUS: Record<string, string> = {
  Aberta: "ABERTA",
  Pausada: "PAUSADA",
  Encerrada: "ENCERRADA",   // ✅ CORRIGIDO
};

// ─── Modal de Criação / Edição de Vaga ───────────────────────────────────────

function JobModal({
  job,
  onClose,
  onSave,
}: {
  job: Partial<Job> | null;
  onClose: () => void;
  onSave: (data: Partial<Job>) => void;
}) {
  const [form, setForm] = useState<Partial<Job>>(
    job
      ? {
          title: job.title ?? "",
          department: job.department ?? "",
          location: job.location ?? "",
          type: job.type ?? "Remoto",
          status: job.status ?? "Aberta",
          description: job.description ?? "",
          requirements: job.requirements ?? "",
          salaryMin: job.salaryMin ?? "",
          salaryMax: job.salaryMax ?? "",
        }
      : {
          title: "",
          department: "",
          location: "",
          type: "Remoto",
          status: "Aberta",
          description: "",
          requirements: "",
          salaryMin: "",
          salaryMax: "",
        }
  );

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!form.title?.trim()) e.title = "Obrigatório";
    if (!form.department?.trim()) e.department = "Obrigatório";
    if (!form.location?.trim()) e.location = "Obrigatório";
    if (!form.description?.trim()) e.description = "Obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const handleSave = () => { if (validate()) onSave(form); };

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-modal-title"
        className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
      >
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#1A1D2D]/30 shrink-0">
          <h3 id="job-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
            {job?.id ? "Editar Vaga" : "Criar Nova Vaga"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="inline-flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <FieldLabel>Título da Vaga *</FieldLabel>
              <input className={inputCls()} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="ex: Frontend Developer" />
              {errors.title && <p className="text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.title}</p>}
            </div>
            <div className="space-y-2">
              <FieldLabel>Departamento *</FieldLabel>
              <input className={inputCls()} value={form.department} onChange={(e) => set("department", e.target.value)} placeholder="ex: Engenharia" />
              {errors.department && <p className="text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.department}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <FieldLabel>Localização *</FieldLabel>
              <input className={inputCls()} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="ex: São Paulo, SP" />
              {errors.location && <p className="text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.location}</p>}
            </div>
            <div className="space-y-2">
              <FieldLabel>Modalidade</FieldLabel>
              <div className="relative">
                <select className={inputCls() + " appearance-none pr-10"} value={form.type} onChange={(e) => set("type", e.target.value)}>
                  <option>Remoto</option>
                  <option>Híbrido</option>
                  <option>Presencial</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <FieldLabel>Tipo de Contrato</FieldLabel>
              <div className="relative">
                <select className={inputCls() + " appearance-none pr-10"} defaultValue="CLT">
                  <option>CLT</option>
                  <option>PJ</option>
                  <option>Estágio</option>
                  <option>Freelance</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel>Salário mín. (R$)</FieldLabel>
              <input className={inputCls()} value={form.salaryMin} onChange={(e) => set("salaryMin", e.target.value)} placeholder="5000" type="number" />
            </div>
            <div className="space-y-2">
              <FieldLabel>Salário máx. (R$)</FieldLabel>
              <input className={inputCls()} value={form.salaryMax} onChange={(e) => set("salaryMax", e.target.value)} placeholder="10000" type="number" />
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Status da Vaga</FieldLabel>
            <div className="flex flex-wrap gap-2 sm:gap-3" role="radiogroup" aria-label="Status da vaga">
              {(["Aberta", "Pausada", "Encerrada"] as JobStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={form.status === s}
                  onClick={() => set("status", s)}
                  className={`flex-1 min-w-[6rem] min-h-[44px] py-3 px-3 rounded-xl text-sm font-bold border transition ${
                    form.status === s
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                      : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Descrição da Vaga *</FieldLabel>
            <textarea className={inputCls() + " h-28 resize-none"} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Descreva as responsabilidades e o contexto da vaga..." />
            {errors.description && <p className="text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.description}</p>}
          </div>

          <div className="space-y-2">
            <FieldLabel>Requisitos e Habilidades</FieldLabel>
            <textarea className={inputCls() + " h-24 resize-none"} value={form.requirements} onChange={(e) => set("requirements", e.target.value)} placeholder="Liste as tecnologias e habilidades necessárias, separadas por vírgula..." />
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-[#1A1D2D]/30 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white px-5 py-3 min-h-[44px] transition rounded-xl"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 sm:px-8 py-3 min-h-[44px] rounded-xl text-sm font-black transition shadow-lg shadow-indigo-500/20"
          >
            {job?.id ? "Salvar Alterações" : "Publicar Vaga"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ job, onClose, onConfirm }: { job: Job; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trash2 className="w-6 h-6 text-rose-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Excluir esta vaga?</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          A vaga <span className="font-bold text-slate-700 dark:text-slate-200">&quot;{job.title}&quot;</span> e todos os seus dados serão removidos permanentemente.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-lg shadow-rose-500/20">Sim, excluir</button>
        </div>
      </div>
    </div>
  );
}

// ─── Page principal ───────────────────────────────────────────────────────────

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [deleteJob, setDeleteJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJob, setFilterJob] = useState("Todas");
  const [openJobModal, setOpenJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [approvingCandidate, setApprovingCandidate] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const itemsPerPage = 5;

  // Trava o scroll do <body> enquanto qualquer modal estiver aberto, para
  // evitar que o fundo continue rolável quando o usuário scrolla dentro do
  // modal (sintoma típico em desktop e mobile).
  useEffect(() => {
    const anyModalOpen = !!selectedCandidate || openJobModal || !!deleteJob;
    if (!anyModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedCandidate, openJobModal, deleteJob]);

  useEffect(() => {
    const recrutadorId = localStorage.getItem("usuario_id");
    if (!recrutadorId) return;

    apiFetch(`${API_URL}/recrutador/minhas-vagas/${recrutadorId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.vagas) {
          setJobs(
            data.vagas.map((v: any) => {
              const salaryParts = v.faixa_salarial ? v.faixa_salarial.split("-") : [];
              return {
                id: v.id,
                title: v.titulo,
                location: v.localizacao || "Não informado",
                type: MODALIDADE_TO_LABEL[v.modalidade] ?? "Presencial",
                status: STATUS_TO_LABEL[v.status] ?? "Aberta",  // ✅ CORRIGIDO
                department: v.departamento || "",
                description: v.descricao || "",
                requirements: v.requisitos || "",
                salaryMin: salaryParts[0]?.trim() || "",
                salaryMax: salaryParts[1]?.trim() || "",
              };
            })
          );
        }
      })
      .catch((err) => console.error("Erro ao carregar vagas:", err));

    apiFetch(`${API_URL}/recrutador/dashboard/${recrutadorId}`)
      .then((r) => r.json())
      .then((data) => {
        setDashboardData(data);
        if (data.candidatos_recentes) {
          setCandidates(
            data.candidatos_recentes.map((c: any, idx: number) => ({
              id: c.candidatura_id ?? (c.usuario_id * 10000 + idx),
              name: c.nome,
              job: c.vaga_titulo || "—",
              match: "—",
              status: c.status_candidatura || "ENVIADO",
              email: c.email,
              phone: "",
              resume: "#",
            }))
          );
        }
      })
      .catch((err) => console.error("Erro ao carregar dashboard:", err));
  }, []);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchJob = filterJob === "Todas" || c.job === filterJob;
      return matchSearch && matchJob;
    });
  }, [candidates, searchTerm, filterJob]);

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenJobModal = (job?: Job) => {
    setEditingJob(job ? { ...job } : null);
    setOpenJobModal(true);
  };

  const handleSaveJob = async (data: Partial<Job>) => {
    if (!data.title || !data.location) return;
    const recrutadorId = localStorage.getItem("usuario_id");
    if (!recrutadorId) return;

    try {
      if (editingJob) {
        const res = await apiFetch(`${API_URL}/recrutador/vagas/${editingJob.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recrutador_id: Number(recrutadorId),
            titulo: data.title,
            departamento: data.department || "",   // ✅ enviando campo
            descricao: data.description || "",
            requisitos: data.requirements || "",
            modalidade: LABEL_TO_MODALIDADE[data.type || "Presencial"] || "PRESENCIAL",
            localizacao: data.location,
            faixa_salarial: data.salaryMin && data.salaryMax ? `${data.salaryMin}-${data.salaryMax}` : "",
            status: LABEL_TO_STATUS[data.status || "Aberta"] || "ABERTA",  // ✅ CORRIGIDO
          }),
        });
        if (res.ok) setJobs(jobs.map((j) => (j.id === editingJob.id ? { ...j, ...data } : j)));
      } else {
        const res = await apiFetch(`${API_URL}/recrutador/vagas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recrutador_id: Number(recrutadorId),
            titulo: data.title,
            departamento: data.department || "",   // ✅ enviando campo
            descricao: data.description || "",
            requisitos: data.requirements || "",
            modalidade: LABEL_TO_MODALIDADE[data.type || "Presencial"] || "PRESENCIAL",
            localizacao: data.location,
            faixa_salarial: data.salaryMin && data.salaryMax ? `${data.salaryMin}-${data.salaryMax}` : "",
          }),
        });
        if (res.ok) {
          const result = await res.json();
          setJobs([
            ...jobs,
            {
              id: result.id,
              title: data.title || "",
              location: data.location || "",
              type: data.type || "Remoto",
              status: data.status || "Aberta",
              department: data.department,
              description: data.description,
              requirements: data.requirements,
              salaryMin: data.salaryMin,
              salaryMax: data.salaryMax,
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Erro ao salvar vaga:", err);
    }
    setOpenJobModal(false);
  };

  const handleDeleteJob = async () => {
    if (!deleteJob) return;
    const recrutadorId = localStorage.getItem("usuario_id");
    if (!recrutadorId) return;
    try {
      const res = await apiFetch(
        `${API_URL}/recrutador/vagas/${deleteJob.id}?recrutador_id=${recrutadorId}`,
        { method: "DELETE" }
      );
      if (res.ok) setJobs(jobs.filter((j) => j.id !== deleteJob.id));
    } catch (err) {
      console.error("Erro ao excluir vaga:", err);
    }
    setDeleteJob(null);
  };

  // Aprova um candidato — atualiza o status da candidatura para APROVADO
  const handleApproveCandidate = async () => {
    if (!selectedCandidate) return;
    setApproveError(null);
    setApprovingCandidate(true);
    try {
      const res = await apiFetch(
        `${API_URL}/recrutador/candidaturas/${selectedCandidate.id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CONTRATADO" }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Não foi possível aprovar o candidato.");
      }

      // Atualiza estado local
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === selectedCandidate.id ? { ...c, status: "APROVADO" } : c
        )
      );
      // Reflete na contagem do dashboard (sem refetch)
      setDashboardData((d: any) =>
        d
          ? {
              ...d,
              candidatos_por_etapa: {
                ...(d.candidatos_por_etapa ?? {}),
                APROVADO: ((d.candidatos_por_etapa?.APROVADO ?? 0) as number) + 1,
              },
            }
          : d
      );
      setSelectedCandidate(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao aprovar candidato.";
      setApproveError(msg);
    } finally {
      setApprovingCandidate(false);
    }
  };

  const pipelineData = dashboardData?.candidatos_por_etapa
    ? Object.entries(dashboardData.candidatos_por_etapa).map(([name, value]) => ({
        name,
        value: value as number,
      }))
    : [];
  const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 antialiased transition-colors">
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <header className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard do Recrutador</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-base sm:text-lg">Resumo geral das suas operações de recrutamento.</p>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <StatCard title="Vagas Abertas" value={dashboardData?.vagas_abertas ?? jobs.filter((j) => j.status === "Aberta").length} icon={Briefcase} />
          <StatCard title="Total de Candidatos" value={dashboardData?.total_candidatos ?? 0} icon={Users} />
          <StatCard title="Candidatos em Processo" value={dashboardData?.total_candidatos ?? 0} icon={UserCheck} />
          <StatCard title="Entrevistas Agendadas" value={dashboardData?.candidatos_por_etapa?.ENTREVISTA ?? 0} icon={Calendar} />
          <StatCard title="Contratações Realizadas" value={dashboardData?.candidatos_por_etapa?.APROVADO ?? 0} icon={Award} />
          <StatCard title="Taxa de Conversão" value={`${dashboardData?.taxa_conversao ?? 0}%`} icon={TrendingUp} />
        </div>

        {/* Analytics */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-[#0B0E14] p-8 rounded-2xl border border-slate-200 dark:border-slate-800/50 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Pipeline de Recrutamento</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pipelineData} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                  {pipelineData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1A1D2D", border: "none", borderRadius: "8px", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-[#0B0E14] p-8 rounded-2xl border border-slate-200 dark:border-slate-800/50 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Candidatos por Vaga</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={jobs.map((j) => ({ name: j.title.split(" ")[0], qtd: candidates.filter((c) => c.job === j.title).length }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-[#1e293b]" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#64748b" />
                <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#64748b" />
                <Tooltip cursor={{ fill: "rgba(99, 102, 241, 0.05)" }} contentStyle={{ backgroundColor: "#1A1D2D", border: "none", borderRadius: "8px", color: "#fff" }} />
                <Bar dataKey="qtd" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vagas */}
        <section className="mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Vagas Ativas</h2>
            <button
              type="button"
              onClick={() => handleOpenJobModal()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 min-h-[44px] rounded-xl text-sm font-bold transition inline-flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" aria-hidden="true" /> Nova Vaga
            </button>
          </div>
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[640px]">
              <thead className="bg-slate-50 dark:bg-[#1A1D2D]/30 text-slate-500 border-b border-slate-200 dark:border-slate-800/50">
                <tr>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest">Cargo</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest">Local / Tipo</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest text-center">Status</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {(() => {
                  const vagasAtivas = jobs.filter((job) => job.status === "Aberta");
                  if (vagasAtivas.length === 0) {
                    return (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                          Nenhuma vaga ativa no momento.
                        </td>
                      </tr>
                    );
                  }
                  return vagasAtivas.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-indigo-500/5 transition group">
                      <td className="p-5 font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{job.title}</td>
                      <td className="p-5 text-slate-500 dark:text-slate-400">{job.location} • {job.type}</td>
                      <td className="p-5 text-center">
                        <Badge variant="success">{job.status}</Badge>
                      </td>
                      <td className="p-5 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenJobModal(job)}
                          aria-label={`Editar vaga ${job.title}`}
                          className="inline-flex items-center justify-center w-11 h-11 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-white transition"
                        >
                          <Edit3 className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteJob(job)}
                          aria-label={`Excluir vaga ${job.title}`}
                          className="inline-flex items-center justify-center w-11 h-11 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500 transition"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
            </div>
          </div>
        </section>

        {/* Candidatos recentes */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Candidatos Recentes</h2>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar candidato..."
                  className="w-full bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 p-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 outline-none"
                value={filterJob}
                onChange={(e) => setFilterJob(e.target.value)}
              >
                <option value="Todas">Todas as Vagas</option>
                {jobs.map((j) => <option key={j.id} value={j.title}>{j.title}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[640px]">
              <thead className="bg-slate-50 dark:bg-[#1A1D2D]/30 text-slate-500 border-b border-slate-200 dark:border-slate-800/50">
                <tr>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest">Candidato</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest text-center">Vaga</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest text-center">Status</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest text-right">Perfil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {paginatedCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-indigo-500/5 transition">
                    <td className="p-5">
                      <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                      <div className="text-[11px] text-slate-500">{c.email}</div>
                    </td>
                    <td className="p-5 text-center text-slate-600 dark:text-slate-400">{c.job}</td>
                    <td className="p-5 text-center">
                      <Badge variant="info">{c.status}</Badge>
                    </td>
                    <td className="p-5 text-right">
                      <button onClick={() => setSelectedCandidate(c)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold inline-flex items-center gap-1.5 transition">
                        <Eye className="w-4 h-4" /> Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 dark:bg-[#1A1D2D]/10">
              <span className="text-xs text-slate-500 font-medium">Mostrando {paginatedCandidates.length} de {filteredCandidates.length} candidatos</span>
              <div className="flex gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  aria-label="Página anterior"
                  className="inline-flex items-center justify-center w-11 h-11 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  aria-label="Próxima página"
                  className="inline-flex items-center justify-center w-11 h-11 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {openJobModal && <JobModal job={editingJob} onClose={() => setOpenJobModal(false)} onSave={handleSaveJob} />}
      {deleteJob && <DeleteModal job={deleteJob} onClose={() => setDeleteJob(null)} onConfirm={handleDeleteJob} />}

      {selectedCandidate && (
        <div
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => { setSelectedCandidate(null); setApproveError(null); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="candidate-detail-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col"
          >
            <div className="h-20 sm:h-24 bg-gradient-to-br from-indigo-600 to-purple-700 p-4 sm:p-6 flex justify-end items-start shrink-0">
              <button
                type="button"
                onClick={() => { setSelectedCandidate(null); setApproveError(null); }}
                aria-label="Fechar detalhes do candidato"
                className="inline-flex items-center justify-center w-11 h-11 bg-black/20 hover:bg-black/40 rounded-full text-white transition"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
            <div className="px-4 sm:px-10 pb-6 sm:pb-10 pt-6 sm:pt-8 overflow-y-auto flex-1">
              <div className="mb-6 sm:mb-8 flex items-center gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-2xl sm:text-3xl shadow-sm shrink-0">👤</div>
                <div className="min-w-0 flex-1">
                  <h3 id="candidate-detail-title" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white break-words leading-tight">{selectedCandidate.name}</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm sm:text-base mt-1">{selectedCandidate.job}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
                <div className="bg-slate-50 dark:bg-[#1A1D2D]/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/50 text-sm">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">E-mail de Contato</p>
                  <p className="text-slate-900 dark:text-white font-medium">{selectedCandidate.email}</p>
                </div>
                <div className="bg-slate-50 dark:bg-[#1A1D2D]/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/50 text-sm">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Currículo</p>
                  <a href="#" className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-2 hover:underline"><FileText className="w-4 h-4" /> Visualizar PDF</a>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {approveError && (
                  <div
                    role="alert"
                    className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-sm bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-3"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{approveError}</span>
                  </div>
                )}

                {selectedCandidate.status === "APROVADO" ? (
                  <div
                    role="status"
                    className="w-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" aria-hidden="true" />
                    Candidato já aprovado
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleApproveCandidate}
                    disabled={approvingCandidate}
                    aria-busy={approvingCandidate}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 min-h-[44px] rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
                  >
                    {approvingCandidate ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                        Aprovando…
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" aria-hidden="true" />
                        Aprovar Candidato
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => window.location.href = `mailto:${selectedCandidate.email}`}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white font-bold py-4 min-h-[44px] rounded-2xl flex items-center justify-center gap-2 transition hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <Mail className="w-5 h-5" aria-hidden="true" /> Enviar Mensagem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
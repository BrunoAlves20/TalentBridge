"use client";

import { useState, useEffect } from "react";
import {
  Plus, Search, Edit3, Trash2, X, Briefcase,
  MapPin, Clock, Users, ChevronDown, AlertCircle
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type ContractType = "CLT" | "PJ" | "Estágio" | "Freelance";
type WorkMode = "Remoto" | "Híbrido" | "Presencial";
type JobStatus = "Aberta" | "Pausada" | "Fechada";

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  workMode: WorkMode;
  contractType: ContractType;
  salaryMin: string;
  salaryMax: string;
  status: JobStatus;
  description: string;
  requirements: string;
  applicants: number;
  createdAt: string;
}

// ─── Dados iniciais (mock) ────────────────────────────────────────────────────

const INITIAL_JOBS: Job[] = [];

const EMPTY_FORM: Omit<Job, "id" | "applicants" | "createdAt"> = {
  title: "",
  department: "",
  location: "",
  workMode: "Remoto",
  contractType: "CLT",
  salaryMin: "",
  salaryMax: "",
  status: "Aberta",
  description: "",
  requirements: "",
};

// ─── Componentes auxiliares ───────────────────────────────────────────────────

const statusConfig: Record<JobStatus, { label: string; classes: string }> = {
  Aberta: {
    label: "Aberta",
    classes: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  },
  Pausada: {
    label: "Pausada",
    classes: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  },
  Fechada: {
    label: "Fechada",
    classes: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-700/50",
  },
};

function StatusBadge({ status }: { status: JobStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

function WorkModeBadge({ mode }: { mode: WorkMode }) {
  const colors: Record<WorkMode, string> = {
    Remoto: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
    Híbrido: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
    Presencial: "bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-400",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${colors[mode]}`}>
      {mode}
    </span>
  );
}

// ─── Input Label helper ───────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
      {children}
    </label>
  );
}

function inputCls() {
  return "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm transition";
}

// ─── Modal de Criação / Edição ────────────────────────────────────────────────

function JobModal({
  job,
  onClose,
  onSave,
}: {
  job: Partial<Job> | null;
  onClose: () => void;
  onSave: (data: Omit<Job, "id" | "applicants" | "createdAt">) => void;
}) {
  const [form, setForm] = useState<Omit<Job, "id" | "applicants" | "createdAt">>(
    job
      ? {
          title: job.title ?? "",
          department: job.department ?? "",
          location: job.location ?? "",
          workMode: job.workMode ?? "Remoto",
          contractType: job.contractType ?? "CLT",
          salaryMin: job.salaryMin ?? "",
          salaryMax: job.salaryMax ?? "",
          status: job.status ?? "Aberta",
          description: job.description ?? "",
          requirements: job.requirements ?? "",
        }
      : { ...EMPTY_FORM }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Obrigatório";
    if (!form.department.trim()) e.department = "Obrigatório";
    if (!form.location.trim()) e.location = "Obrigatório";
    if (!form.description.trim()) e.description = "Obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (validate()) onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#1A1D2D]/30 shrink-0">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {job?.id ? "Editar Vaga" : "Criar Nova Vaga"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6 overflow-y-auto">
          {/* Título + Departamento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FieldLabel>Título da Vaga *</FieldLabel>
              <input
                className={inputCls()}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="ex: Frontend Developer"
              />
              {errors.title && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.title}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <FieldLabel>Departamento *</FieldLabel>
              <input
                className={inputCls()}
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
                placeholder="ex: Engenharia"
              />
              {errors.department && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.department}
                </p>
              )}
            </div>
          </div>

          {/* Localização + Modalidade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FieldLabel>Localização *</FieldLabel>
              <input
                className={inputCls()}
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="ex: São Paulo, SP"
              />
              {errors.location && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.location}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <FieldLabel>Modalidade</FieldLabel>
              <div className="relative">
                <select
                  className={inputCls() + " appearance-none pr-10"}
                  value={form.workMode}
                  onChange={(e) => set("workMode", e.target.value as WorkMode)}
                >
                  <option>Remoto</option>
                  <option>Híbrido</option>
                  <option>Presencial</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Contrato + Salário */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <FieldLabel>Tipo de Contrato</FieldLabel>
              <div className="relative">
                <select
                  className={inputCls() + " appearance-none pr-10"}
                  value={form.contractType}
                  onChange={(e) => set("contractType", e.target.value as ContractType)}
                >
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
              <input
                className={inputCls()}
                value={form.salaryMin}
                onChange={(e) => set("salaryMin", e.target.value)}
                placeholder="5000"
                type="number"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Salário máx. (R$)</FieldLabel>
              <input
                className={inputCls()}
                value={form.salaryMax}
                onChange={(e) => set("salaryMax", e.target.value)}
                placeholder="10000"
                type="number"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <FieldLabel>Status da Vaga</FieldLabel>
            <div className="flex gap-3">
              {(["Aberta", "Pausada", "Fechada"] as JobStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => set("status", s)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold border transition ${
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

          {/* Descrição */}
          <div className="space-y-2">
            <FieldLabel>Descrição da Vaga *</FieldLabel>
            <textarea
              className={inputCls() + " h-28 resize-none"}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Descreva as responsabilidades e o contexto da vaga..."
            />
            {errors.description && (
              <p className="text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.description}
              </p>
            )}
          </div>

          {/* Requisitos */}
          <div className="space-y-2">
            <FieldLabel>Requisitos e Habilidades</FieldLabel>
            <textarea
              className={inputCls() + " h-24 resize-none"}
              value={form.requirements}
              onChange={(e) => set("requirements", e.target.value)}
              placeholder="Liste as tecnologias e habilidades necessárias, separadas por vírgula..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-[#1A1D2D]/30 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white px-5 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl text-sm font-black transition shadow-lg shadow-indigo-500/20"
          >
            {job?.id ? "Salvar Alterações" : "Publicar Vaga"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de Exclusão ────────────────────────────────────────────────────────

function DeleteModal({ job, onClose, onConfirm }: { job: Job; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trash2 className="w-6 h-6 text-rose-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Excluir esta vaga?</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          A vaga <span className="font-bold text-slate-700 dark:text-slate-200">"{job.title}"</span> e todos
          os seus dados serão removidos permanentemente.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-lg shadow-rose-500/20"
          >
            Sim, excluir
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page principal ───────────────────────────────────────────────────────────

export default function JobsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<JobStatus | "Todas">("Todas");
  const [modalJob, setModalJob] = useState<Partial<Job> | null | false>(false);
  const [deleteJob, setDeleteJob] = useState<Job | null>(null);

  // Carregar vagas da API
  useEffect(() => {
    const recrutadorId = localStorage.getItem("usuario_id");
    if (!recrutadorId) return;

    fetch(`${API_URL}/recrutador/minhas-vagas/${recrutadorId}`)
      .then(res => res.json())
      .then(data => {
        if (data.vagas) {
          setJobs(data.vagas.map((v: any) => ({
            id: v.id,
            title: v.titulo,
            department: "",
            location: v.localizacao || "Não informado",
            workMode: (v.modalidade === "REMOTO" ? "Remoto" : v.modalidade === "HIBRIDO" ? "Híbrido" : "Presencial") as WorkMode,
            contractType: "CLT" as ContractType,
            salaryMin: v.faixa_salarial?.split("-")[0] || "",
            salaryMax: v.faixa_salarial?.split("-")[1] || "",
            status: (v.status === "ABERTA" ? "Aberta" : v.status === "PAUSADA" ? "Pausada" : "Fechada") as JobStatus,
            description: v.descricao || "",
            requirements: v.requisitos || "",
            applicants: v.total_candidatos || 0,
            createdAt: v.criado_em?.split("T")[0] || new Date().toISOString().split("T")[0],
          })));
        }
      })
      .catch(err => console.error("Erro ao carregar vagas:", err));
  }, []);

  const filtered = jobs.filter((j) => {
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Todas" || j.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = async (data: Omit<Job, "id" | "applicants" | "createdAt">) => {
    const recrutadorId = localStorage.getItem("usuario_id");
    if (!recrutadorId) return;

    const modalidadeMap: Record<string, string> = { "Remoto": "REMOTO", "Híbrido": "HIBRIDO", "Presencial": "PRESENCIAL" };
    const statusMap: Record<string, string> = { "Aberta": "ABERTA", "Pausada": "PAUSADA", "Fechada": "FECHADA" };

    try {
      if (modalJob && (modalJob as Job).id) {
        const res = await fetch(`${API_URL}/recrutador/vagas/${(modalJob as Job).id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recrutador_id: Number(recrutadorId),
            titulo: data.title,
            descricao: data.description,
            requisitos: data.requirements,
            modalidade: modalidadeMap[data.workMode] || "PRESENCIAL",
            localizacao: data.location,
            faixa_salarial: data.salaryMin && data.salaryMax ? `${data.salaryMin}-${data.salaryMax}` : "",
            status: statusMap[data.status] || "ABERTA",
          }),
        });
        if (res.ok) {
          setJobs((prev) =>
            prev.map((j) => (j.id === (modalJob as Job).id ? { ...j, ...data } : j))
          );
        }
      } else {
        const res = await fetch(`${API_URL}/recrutador/vagas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recrutador_id: Number(recrutadorId),
            titulo: data.title,
            descricao: data.description,
            requisitos: data.requirements,
            modalidade: modalidadeMap[data.workMode] || "PRESENCIAL",
            localizacao: data.location,
            faixa_salarial: data.salaryMin && data.salaryMax ? `${data.salaryMin}-${data.salaryMax}` : "",
          }),
        });
        if (res.ok) {
          const result = await res.json();
          setJobs((prev) => [
            ...prev,
            {
              ...data,
              id: result.id,
              applicants: 0,
              createdAt: new Date().toISOString().split("T")[0],
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Erro ao salvar vaga:", err);
    }
    setModalJob(false);
  };

  const handleDelete = async () => {
    if (deleteJob) {
      const recrutadorId = localStorage.getItem("usuario_id");
      if (!recrutadorId) return;
      try {
        const res = await fetch(`${API_URL}/recrutador/vagas/${deleteJob.id}?recrutador_id=${recrutadorId}`, { method: "DELETE" });
        if (res.ok) {
          setJobs((prev) => prev.filter((j) => j.id !== deleteJob.id));
        }
      } catch (err) {
        console.error("Erro ao excluir vaga:", err);
      }
      setDeleteJob(null);
    }
  };

  const totalAberta = jobs.filter((j) => j.status === "Aberta").length;
  const totalCandidatos = jobs.reduce((acc, j) => acc + j.applicants, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 antialiased transition-colors">
      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Gerenciar Vagas
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
              {totalAberta} vagas abertas · {totalCandidatos} candidatos no total
            </p>
          </div>
          <button
            onClick={() => setModalJob({})}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-black transition flex items-center gap-2 shadow-lg shadow-indigo-500/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nova Vaga
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título ou departamento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            {(["Todas", "Aberta", "Pausada", "Fechada"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                  filterStatus === s
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-16 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Nenhuma vaga encontrada.</p>
            <button
              onClick={() => setModalJob({})}
              className="mt-4 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline"
            >
              Criar a primeira vaga
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-[#1A1D2D]/30 text-slate-500 border-b border-slate-200 dark:border-slate-800/50">
                <tr>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest">Vaga</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest hidden md:table-cell">
                    Local / Modalidade
                  </th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest hidden lg:table-cell text-center">
                    Candidatos
                  </th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest text-center">Status</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filtered.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-slate-50 dark:hover:bg-indigo-500/5 transition group"
                  >
                    <td className="p-5">
                      <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {job.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {job.department} · {job.contractType}
                      </p>
                    </td>
                    <td className="p-5 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{job.location}</span>
                      </div>
                      <div className="mt-1.5">
                        <WorkModeBadge mode={job.workMode} />
                      </div>
                    </td>
                    <td className="p-5 hidden lg:table-cell text-center">
                      <div className="flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Users className="w-3.5 h-3.5" />
                        <span className="font-bold">{job.applicants}</span>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="p-5 text-right space-x-1">
                      <button
                        onClick={() => setModalJob(job)}
                        className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-white transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteJob(job)}
                        className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-[#1A1D2D]/10">
              <span className="text-xs text-slate-500 font-medium">
                Mostrando {filtered.length} de {jobs.length} vagas
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Modais */}
      {modalJob !== false && (
        <JobModal
          job={modalJob}
          onClose={() => setModalJob(false)}
          onSave={handleSave}
        />
      )}
      {deleteJob && (
        <DeleteModal
          job={deleteJob}
          onClose={() => setDeleteJob(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
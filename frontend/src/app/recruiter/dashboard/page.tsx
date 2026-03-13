"use client";

import { useState, useMemo } from "react";
import {
  Briefcase, Users, UserCheck, Calendar, Award, TrendingUp,
  Search, ChevronLeft, ChevronRight, Mail, CheckCircle, 
  Eye, Trash2, Edit3, X, FileText, Plus
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import { Navbar } from "@/components/layout/Navbar";

// --- Tipagens ---
interface Job {
  id: number;
  title: string;
  location: string;
  type: string;
  status: "Aberta" | "Fechada";
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

// --- StatCard Adaptável ---
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

const Badge = ({ children, variant }: { children: string, variant: string }) => {
  const styles: any = {
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
    info: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20",
    neutral: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20",
  };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${styles[variant] || styles.neutral}`}>{children}</span>;
};

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<Job[]>([
    { id: 1, title: "Frontend Developer", location: "Remoto", type: "CLT", status: "Aberta" },
    { id: 2, title: "Backend Developer", location: "São Paulo", type: "PJ", status: "Fechada" },
    { id: 3, title: "UX Designer", location: "Híbrido", type: "CLT", status: "Aberta" }
  ]);

  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: 1, name: "Lucas Mendes", job: "Frontend Developer", match: "92%", status: "Entrevista", email: "lucas@email.com", phone: "(11) 99999-1111", resume: "#" },
    { id: 2, name: "Ana Costa", job: "Backend Developer", match: "88%", status: "Triagem", email: "ana@email.com", phone: "(11) 99999-2222", resume: "#" },
    { id: 3, name: "Pedro Alves", job: "UX Designer", match: "84%", status: "Teste Técnico", email: "pedro@email.com", phone: "(11) 99999-3333", resume: "#" },
    { id: 4, name: "Maria Souza", job: "Frontend Developer", match: "90%", status: "Triagem", email: "maria@email.com", phone: "(11) 99999-4444", resume: "#" }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterJob, setFilterJob] = useState("Todas");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [openJobModal, setOpenJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formType, setFormType] = useState("");
  const [formStatus, setFormStatus] = useState<"Aberta" | "Fechada">("Aberta");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchJob = filterJob === "Todas" || c.job === filterJob;
      const matchStatus = filterStatus === "Todos" || c.status === filterStatus;
      return matchSearch && matchJob && matchStatus;
    });
  }, [candidates, searchTerm, filterJob, filterStatus]);

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenJobModal = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setFormTitle(job.title);
      setFormLocation(job.location);
      setFormType(job.type);
      setFormStatus(job.status);
    } else {
      setEditingJob(null);
      setFormTitle("");
      setFormLocation("");
      setFormType("");
      setFormStatus("Aberta");
    }
    setOpenJobModal(true);
  };

  const handleSaveJob = () => {
    if (!formTitle || !formLocation) return;
    if (editingJob) {
      setJobs(jobs.map(j => j.id === editingJob.id ? { ...j, title: formTitle, location: formLocation, type: formType, status: formStatus } : j));
    } else {
      const newJob: Job = { id: Date.now(), title: formTitle, location: formLocation, type: formType, status: formStatus };
      setJobs([...jobs, newJob]);
    }
    setOpenJobModal(false);
  };

  const pipelineData = [
    { name: "Triagem", value: 40 },
    { name: "Teste", value: 25 },
    { name: "Entrevista", value: 20 },
    { name: "Contratados", value: 15 }
  ];
  const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 antialiased transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard do Recrutador</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Resumo geral das suas operações de recrutamento.</p>
        </header>

        {/* 1. Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <StatCard title="Vagas Abertas" value={jobs.filter(j => j.status === 'Aberta').length} icon={Briefcase} />
          <StatCard title="Total de Candidatos" value={candidates.length} icon={Users} />
          <StatCard title="Candidatos em Processo" value="74" icon={UserCheck} />
          <StatCard title="Entrevistas Agendadas" value="19" icon={Calendar} />
          <StatCard title="Contratações Realizadas" value="6" icon={Award} />
          <StatCard title="Taxa de Conversão" value="8.3%" icon={TrendingUp} />
        </div>

        {/* 2. Analytics */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-[#0B0E14] p-8 rounded-2xl border border-slate-200 dark:border-slate-800/50 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Pipeline de Recrutamento</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pipelineData} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                  {pipelineData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1A1D2D', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-[#0B0E14] p-8 rounded-2xl border border-slate-200 dark:border-slate-800/50 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Candidatos por Vaga</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={jobs.map(j => ({ name: j.title.split(' ')[0], qtd: candidates.filter(c => c.job === j.title).length }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-[#1e293b]" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#64748b" />
                <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#64748b" />
                <Tooltip cursor={{fill: 'rgba(99, 102, 241, 0.05)'}} contentStyle={{ backgroundColor: '#1A1D2D', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="qtd" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Tabela de Vagas */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Vagas Ativas</h2>
            <button onClick={() => handleOpenJobModal()} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-500/20">
              <Plus className="w-4 h-4" /> Nova Vaga
            </button>
          </div>
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-[#1A1D2D]/30 text-slate-500 border-b border-slate-200 dark:border-slate-800/50">
                <tr>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest">Cargo</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest">Local / Tipo</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest text-center">Status</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-indigo-500/5 transition group">
                    <td className="p-5 font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{job.title}</td>
                    <td className="p-5 text-slate-500 dark:text-slate-400">{job.location} • {job.type}</td>
                    <td className="p-5 text-center">
                      <Badge variant={job.status === 'Aberta' ? 'success' : 'neutral'}>{job.status}</Badge>
                    </td>
                    <td className="p-5 text-right space-x-2">
                      <button onClick={() => handleOpenJobModal(job)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-white transition"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => setJobs(jobs.filter(j => j.id !== job.id))} className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500 transition"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Gestão de Candidatos */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Candidatos Recentes</h2>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" placeholder="Buscar candidato..." 
                  className="w-full bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition dark:text-white"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 p-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 outline-none" value={filterJob} onChange={(e) => setFilterJob(e.target.value)}>
                <option value="Todas">Todas as Vagas</option>
                {jobs.map(j => <option key={j.id} value={j.title}>{j.title}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-[#1A1D2D]/30 text-slate-500 border-b border-slate-200 dark:border-slate-800/50">
                <tr>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest">Candidato</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest text-center">Vaga</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest text-center">Match</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest text-center">Status</th>
                  <th className="p-5 font-semibold uppercase text-[10px] tracking-widest text-right">Perfil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {paginatedCandidates.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-indigo-500/5 transition">
                    <td className="p-5">
                      <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                      <div className="text-[11px] text-slate-500">{c.email}</div>
                    </td>
                    <td className="p-5 text-center text-slate-600 dark:text-slate-400">{c.job}</td>
                    <td className="p-5 text-center font-black text-indigo-600 dark:text-indigo-400">{c.match}</td>
                    <td className="p-5 text-center">
                      <Badge variant={c.status === 'Aprovado' ? 'success' : c.status === 'Triagem' ? 'warning' : 'info'}>{c.status}</Badge>
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

            <div className="p-5 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between bg-slate-50 dark:bg-[#1A1D2D]/10">
              <span className="text-xs text-slate-500 font-medium">Mostrando {paginatedCandidates.length} de {filteredCandidates.length} candidatos</span>
              <div className="flex gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"><ChevronLeft className="w-4 h-4" /></button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL: Vaga */}
      {openJobModal && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#1A1D2D]/30">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingJob ? 'Editar Vaga' : 'Criar Nova Vaga'}</h3>
              <button onClick={() => setOpenJobModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Título da Vaga</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
              </div>
              {/* Grid com localização e contrato */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Localização</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none dark:text-white" value={formLocation} onChange={e => setFormLocation(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Contrato</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none dark:text-white" value={formType} onChange={e => setFormType(e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="CLT">CLT</option>
                    <option value="PJ">PJ</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Status da Vaga</label>
                <div className="flex gap-3">
                  <button onClick={() => setFormStatus('Aberta')} className={`flex-1 py-3 rounded-xl text-sm font-bold border transition ${formStatus === 'Aberta' ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>Aberta</button>
                  <button onClick={() => setFormStatus('Fechada')} className={`flex-1 py-3 rounded-xl text-sm font-bold border transition ${formStatus === 'Fechada' ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white text-slate-600' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>Fechada</button>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-[#1A1D2D]/30 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setOpenJobModal(false)} className="text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white px-4">Cancelar</button>
              <button onClick={handleSaveJob} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl text-sm font-black transition">Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Candidato */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 flex justify-end items-start">
              <button onClick={() => setSelectedCandidate(null)} className="bg-black/20 hover:bg-black/40 p-2 rounded-full text-white transition"><X className="w-6 h-6" /></button>
            </div>
            <div className="px-10 pb-10">
              <div className="relative -top-12 flex items-end gap-6">
                <div className="w-28 h-28 rounded-3xl bg-slate-100 dark:bg-[#1A1D2D] border-4 border-white dark:border-[#0B0E14] flex items-center justify-center text-4xl shadow-2xl">👤</div>
                <div className="pb-3">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">{selectedCandidate.name}</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-semibold">{selectedCandidate.job}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-10">
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
                <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20">
                  <CheckCircle className="w-5 h-5" /> Aprovar Candidato
                </button>
                <button onClick={() => window.location.href=`mailto:${selectedCandidate.email}`} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition hover:bg-slate-200 dark:hover:bg-slate-700">
                  <Mail className="w-5 h-5" /> Enviar Mensagem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User, Loader2, ArrowLeft, Briefcase, GraduationCap,
  Wrench, HeartHandshake, Edit3, Mail, Phone,
  MapPin, Link as LinkIcon, ExternalLink, X, Plus, Trash2,
  Github, Linkedin, Globe, UploadCloud, FileCheck, AlertCircle, Download
} from "lucide-react";

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type FetchError = "offline" | "not_found" | null;

export default function CandidateProfilePage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchError, setFetchError] = useState<FetchError>(null);

  // CV upload state
  const [cvUploadState, setCvUploadState] = useState<"idle" | "uploading" | "extracting" | "done">("idle");
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const [hasCvSaved, setHasCvSaved] = useState<boolean>(false);
  const [isCheckingCv, setIsCheckingCv] = useState<boolean>(true);
  const cvInputRef = useRef<HTMLInputElement | null>(null);

  const [modalAberto, setModalAberto] = useState<"personal" | "experience" | "education" | "skills" | null>(null);
  const [formDataPersonal, setFormDataPersonal] = useState<any>({});
  const [formDataExperience, setFormDataExperience] = useState<any[]>([]);
  const [formDataEducation, setFormDataEducation] = useState<any[]>([]);
  const [formDataStacks, setFormDataStacks] = useState("");
  const [formDataSoftSkills, setFormDataSoftSkills] = useState("");

  useEffect(() => {
    // Guard: se o onboarding não foi completado, manda para o passo1
    const localUserRaw = localStorage.getItem("@TalentBridge:user");
    if (localUserRaw) {
      const user = JSON.parse(localUserRaw);
      if (user.onboarding_completo === false) {
        router.replace("/candidate/onboarding/passo1");
        return;
      }
    }

    const buscarPerfil = async () => {
      const usuarioId = localStorage.getItem("usuario_id");
      if (!usuarioId) {
        setFetchError("not_found");
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `${getApiUrl()}/candidatos/perfil-completo/${usuarioId}`
        );
        if (response.ok) {
          setPerfil(await response.json());
        } else if (response.status === 404) {
          setFetchError("not_found");
        } else {
          setFetchError("offline");
        }
      } catch {
        setFetchError("offline");
      } finally {
        setIsLoading(false);
      }
    };

    const verificarCvExistente = async () => {
      const usuarioId = localStorage.getItem("usuario_id");
      if (!usuarioId) return;
      try {
        const response = await fetch(`${getApiUrl()}/candidatos/verificar-cv/${usuarioId}`);
        if (response.ok) {
          const data = await response.json();
          setHasCvSaved(data.existe);
          if (data.existe) setCvFileName(data.nome_arquivo);
        }
      } catch (err) {
        console.error("Erro ao verificar currículo:", err);
      } finally {
        setIsCheckingCv(false);
      }
    };

    buscarPerfil();
    verificarCvExistente();
  }, []);

  const openModalPersonal  = () => { setFormDataPersonal(perfil.personal); setModalAberto("personal"); };
  const openModalExperience = () => { setFormDataExperience([...perfil.experience]); setModalAberto("experience"); };
  const openModalEducation  = () => { setFormDataEducation([...perfil.education]); setModalAberto("education"); };
  const openModalSkills     = () => {
    setFormDataStacks(perfil.stacks.join(", "));
    setFormDataSoftSkills(perfil.softSkills.join(", "));
    setModalAberto("skills");
  };

  const handleSavePersonal = async () => {
    setIsSaving(true);
    const usuarioId = localStorage.getItem("usuario_id");
    try {
      const r = await fetch(`${getApiUrl()}/candidatos/perfil-pessoal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: Number(usuarioId), ...formDataPersonal }),
      });
      if (!r.ok) throw new Error("Erro ao atualizar dados pessoais.");
      setPerfil({ ...perfil, personal: formDataPersonal });
      setModalAberto(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBulk = async (tipo: "experience" | "education" | "skills") => {
    setIsSaving(true);
    const usuarioId = localStorage.getItem("usuario_id");
    try {
      const stacksArray      = tipo === "skills" ? formDataStacks.split(",").map((s) => s.trim()).filter(Boolean)     : perfil.stacks;
      const softSkillsArray  = tipo === "skills" ? formDataSoftSkills.split(",").map((s) => s.trim()).filter(Boolean) : perfil.softSkills;
      const payload = {
        usuario_id: Number(usuarioId),
        personal:   perfil.personal,
        education:  tipo === "education"  ? formDataEducation  : perfil.education,
        experience: tipo === "experience" ? formDataExperience : perfil.experience,
        stacks:     stacksArray,
        softSkills: softSkillsArray,
      };
      const r = await fetch(`${getApiUrl()}/candidatos/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error("Erro ao atualizar os dados.");
      setPerfil(payload);
      setModalAberto(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  };


  // ── Upload e re-análise de CV ───────────────────────────────────────────────
  const handleCvUpload = async (file: File) => {
    setCvError(null);
    const ext = file.name.toLowerCase();
    if (!ext.endsWith('.pdf') && !ext.endsWith('.docx')) {
      setCvError('Apenas arquivos PDF ou DOCX são aceitos.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCvError('O arquivo deve ter no máximo 5MB.');
      return;
    }

    const usuarioId = localStorage.getItem('usuario_id');
    if (!usuarioId) return;

    setCvUploadState('uploading');
    setCvFileName(file.name);

    const formData = new FormData();
    formData.append('curriculo', file);
    formData.append('usuario_id', usuarioId);

    try {
      await new Promise(r => setTimeout(r, 600));
      setCvUploadState('extracting');

      const response = await fetch(`${getApiUrl()}/candidatos/extrair-cv`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Erro ao processar o currículo.');
      }

      const data = await response.json();
      const extracted = data.dados;

      // Re-salva via onboarding para atualizar o perfil no banco
      const payload = {
        usuario_id: Number(usuarioId),
        personal: { 
          ...perfil.personal, 
          ...extracted.personal,
          email: perfil.personal.email // Mantém o e-mail original do cadastro
        },
        education: (extracted.education ?? []).map((ed: any, i: number) => ({ ...ed, id: Date.now() + i })),
        experience: (extracted.experience ?? []).map((exp: any, i: number) => ({ ...exp, id: Date.now() + 1000 + i })),
        stacks: extracted.stacks ?? perfil.stacks,
        softSkills: extracted.softSkills ?? perfil.softSkills,
      };

      const saveRes = await fetch(`${getApiUrl()}/candidatos/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!saveRes.ok) throw new Error('Erro ao salvar os dados extraídos.');

      setPerfil(payload);
      setCvUploadState('done');
      setHasCvSaved(true);
    } catch (e: any) {
      setCvError(e.message ?? 'Erro ao processar currículo.');
      setCvUploadState('idle');
      setCvFileName(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Carregando seu currículo completo...</p>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
        <button onClick={() => router.push("/candidate/dashboard")} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar para o Painel
        </button>
        <div className="p-10 text-center bg-white dark:bg-[#0B0E14] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {fetchError === "offline" ? (
            <>
              <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-7 h-7 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Backend não está respondendo</h3>
              <p className="text-slate-500 text-sm mb-6">Verifique se o servidor FastAPI está rodando em <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">http://127.0.0.1:8000</code></p>
              <button onClick={() => window.location.reload()} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">
                Tentar novamente
              </button>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-7 h-7 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Perfil não encontrado</h3>
              <p className="text-slate-500 text-sm mb-6">Complete o onboarding para criar seu perfil de candidato.</p>
              <button onClick={() => router.push("/candidate/onboarding")} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">
                Ir para o Onboarding
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const { personal, experience, education, stacks, softSkills } = perfil;

  const handleDownloadCv = async () => {
    const usuarioId = localStorage.getItem("usuario_id");
    if (!usuarioId) return;
    window.open(`${getApiUrl()}/candidatos/baixar-cv/${usuarioId}`, "_blank");
  };

  const getNomeMes = (n?: string) => {
    if (!n) return "";
    const meses = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const i = parseInt(n);
    return isNaN(i) ? "" : meses[i] ?? "";
  };

  const inputCls = "w-full bg-slate-50 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm transition";
  const labelCls = "text-[11px] font-bold text-slate-500 uppercase tracking-widest";

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
      <button onClick={() => router.push("/candidate/dashboard")} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para o Painel
      </button>

      <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-8">Meu Perfil</h1>

      {/* ── CARD: UPLOAD DE CURRÍCULO ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm mb-6">
        <input
          ref={cvInputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleCvUpload(e.target.files[0])}
        />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              {cvUploadState === "done" || hasCvSaved ? <FileCheck className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {cvUploadState === "done" ? "Currículo atualizado com sucesso!" : hasCvSaved ? "Currículo salvo" : "Atualizar currículo via IA"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {cvUploadState === "uploading" && `Enviando ${cvFileName}...`}
                {cvUploadState === "extracting" && "A IA está extraindo seus dados..."}
                {cvUploadState === "done" && `Dados de ${cvFileName} aplicados ao perfil`}
                {cvUploadState === "idle" && (hasCvSaved
                  ? `Arquivo: ${cvFileName || "curriculo.pdf"}. Envie outro para substituir.`
                  : "Envie seu PDF ou DOCX e a IA preencherá seu perfil automaticamente.")}
              </p>
              {cvError && (
                <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {cvError}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasCvSaved && cvUploadState === "idle" && (
              <button
                onClick={handleDownloadCv}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm transition"
              >
                <Download className="w-4 h-4" />
                Baixar
              </button>
            )}

            <button
              onClick={() => {
                if (!hasCvSaved && cvUploadState === "idle") {
                  router.push("/candidate/onboarding/passo1");
                } else {
                  setCvUploadState('idle');
                  setCvFileName(null);
                  setCvError(null);
                  cvInputRef.current?.click();
                }
              }}
              disabled={cvUploadState === 'uploading' || cvUploadState === 'extracting'}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-wait text-white rounded-xl font-bold text-sm transition shadow-md shadow-indigo-500/20"
            >
              {(cvUploadState === 'uploading' || cvUploadState === 'extracting') ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                hasCvSaved ? <UploadCloud className="w-4 h-4" /> : <Plus className="w-4 h-4" />
              )}
              {cvUploadState === 'done' ? 'Enviar outro' : hasCvSaved ? 'Substituir currículo' : 'Adicionar currículo'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">

        {/* CARD: DADOS PESSOAIS */}
        <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-8 shadow-sm relative group">
          <button onClick={openModalPersonal} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors flex items-center gap-2 font-bold text-sm">
            <Edit3 className="w-4 h-4" /> <span className="hidden sm:inline">Editar Pessoal</span>
          </button>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 rounded-3xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex flex-col items-center justify-center shrink-0 border-4 border-white dark:border-[#0B0E14] shadow-lg overflow-hidden">
              {personal?.profilePicture ? (
                <img src={personal.profilePicture} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12" />
              )}
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {personal?.fullName || "Nome não informado"}
                </h2>
                <p className="text-lg text-slate-500 font-medium">
                  {experience?.length > 0 ? experience[0]?.role : "Candidato TalentBridge"}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                {personal?.email    && <div className="flex items-center gap-1.5"><Mail    className="w-4 h-4" />{personal.email}</div>}
                {personal?.phone    && <div className="flex items-center gap-1.5"><Phone   className="w-4 h-4" />{personal.phone}</div>}
                {personal?.city     && <div className="flex items-center gap-1.5"><MapPin  className="w-4 h-4" />{personal.city}, {personal?.state}</div>}
              </div>

              {/* Links sociais — agora renderizados */}
              {(personal?.linkedin || personal?.github || personal?.portfolio) && (
                <div className="flex flex-wrap gap-3">
                  {personal.linkedin && (
                    <a href={personal.linkedin.startsWith("http") ? personal.linkedin : `https://${personal.linkedin}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </a>
                  )}
                  {personal.github && (
                    <a href={personal.github.startsWith("http") ? personal.github : `https://${personal.github}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:underline">
                      <Github className="w-4 h-4" /> GitHub
                    </a>
                  )}
                  {personal.portfolio && (
                    <a href={personal.portfolio.startsWith("http") ? personal.portfolio : `https://${personal.portfolio}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                      <Globe className="w-4 h-4" /> Portfólio
                    </a>
                  )}
                </div>
              )}

              {personal?.about && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold mb-2 uppercase tracking-widest text-slate-500">Sobre Mim</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{personal.about}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CARD: EXPERIÊNCIA */}
        <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-8 shadow-sm relative group">
          <button onClick={openModalExperience} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-xl transition-colors flex items-center gap-2 font-bold text-sm">
            <Edit3 className="w-4 h-4" /> <span className="hidden sm:inline">Editar Experiência</span>
          </button>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center"><Briefcase className="w-5 h-5" /></div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Experiência Profissional</h3>
          </div>
          <div className="space-y-6">
            {experience?.length > 0 ? experience.map((exp: any) => (
              <div key={exp.id} className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                <div className="absolute w-3 h-3 bg-orange-400 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-[#0B0E14]" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{exp.role}</h4>
                <p className="text-orange-600 font-medium mb-1">{exp.company}</p>
                <p className="text-sm text-slate-500 font-medium mb-3">
                  {getNomeMes(exp.startMonth)} {exp.startYear} — {exp.isCurrent ? "Atual" : `${getNomeMes(exp.endMonth)} ${exp.endYear}`}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{exp.description}</p>
              </div>
            )) : <p className="text-slate-400">Nenhuma experiência cadastrada.</p>}
          </div>
        </div>

        {/* CARD: FORMAÇÃO */}
        <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-8 shadow-sm relative group">
          <button onClick={openModalEducation} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-xl transition-colors flex items-center gap-2 font-bold text-sm">
            <Edit3 className="w-4 h-4" /> <span className="hidden sm:inline">Editar Formação</span>
          </button>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center"><GraduationCap className="w-5 h-5" /></div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Formação Acadêmica</h3>
          </div>
          <div className="space-y-6">
            {education?.length > 0 ? education.map((edu: any) => (
              <div key={edu.id} className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                <div className="absolute w-3 h-3 bg-sky-400 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-[#0B0E14]" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{edu.course}</h4>
                <p className="text-sky-600 font-medium mb-1">{edu.institution}</p>
                <p className="text-sm text-slate-500 font-medium">{edu.degree} · {edu.startYear} — {edu.endYear}</p>
              </div>
            )) : <p className="text-slate-400">Nenhuma formação cadastrada.</p>}
          </div>
        </div>

        {/* CARDS: SKILLS */}
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { label: "Stacks", data: stacks, color: "purple", icon: <Wrench className="w-5 h-5" />, pillCls: "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20" },
            { label: "Soft-Skills", data: softSkills, color: "pink", icon: <HeartHandshake className="w-5 h-5" />, pillCls: "bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20" },
          ].map(({ label, data, color, icon, pillCls }) => (
            <div key={label} className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-8 shadow-sm relative group">
              <button onClick={openModalSkills} className={`absolute top-6 right-6 p-2 text-slate-400 hover:text-${color}-600 hover:bg-${color}-50 dark:hover:bg-${color}-500/10 rounded-xl transition-colors`}>
                <Edit3 className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl bg-${color}-100 text-${color}-600 flex items-center justify-center`}>{icon}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{label}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {data?.length > 0 ? data.map((skill: string, i: number) => (
                  <span key={i} className={`px-3 py-1.5 font-bold text-sm rounded-xl border ${pillCls}`}>{skill}</span>
                )) : <p className="text-slate-400 text-sm">Nenhum item cadastrado.</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAIS */}
      {modalAberto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col">

            <div className="sticky top-0 bg-white dark:bg-[#0B0E14] border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {modalAberto === "personal" && "Editar Dados Pessoais"}
                {modalAberto === "experience" && "Editar Experiência"}
                {modalAberto === "education" && "Editar Formação"}
                {modalAberto === "skills" && "Editar Habilidades"}
              </h2>
              <button onClick={() => setModalAberto(null)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">

              {/* PESSOAL */}
              {modalAberto === "personal" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      ["Nome Completo", "fullName", "text"],
                      ["Telefone", "phone", "text"],
                      ["Idade", "age", "text"],
                      ["Cidade", "city", "text"],
                      ["Estado (UF)", "state", "text"],
                      ["CEP", "zipCode", "text"],
                    ].map(([label, field, type]) => (
                      <div key={field} className="space-y-1.5">
                        <label className={labelCls}>{label}</label>
                        <input type={type} value={formDataPersonal[field] ?? ""} onChange={(e) => setFormDataPersonal({ ...formDataPersonal, [field]: e.target.value })} className={inputCls} />
                      </div>
                    ))}
                  </div>

                  {/* Links sociais editáveis */}
                  <div className="pt-2 space-y-4">
                    <p className={labelCls}>Links e Redes</p>
                    {[
                      ["LinkedIn", "linkedin"],
                      ["GitHub", "github"],
                      ["Portfólio", "portfolio"],
                    ].map(([label, field]) => (
                      <div key={field} className="space-y-1.5">
                        <label className={labelCls}>{label}</label>
                        <input type="text" value={formDataPersonal[field] ?? ""} onChange={(e) => setFormDataPersonal({ ...formDataPersonal, [field]: e.target.value })} placeholder={`https://`} className={inputCls} />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className={labelCls}>Sobre Mim</label>
                    <textarea rows={4} value={formDataPersonal.about ?? ""} onChange={(e) => setFormDataPersonal({ ...formDataPersonal, about: e.target.value })} className={inputCls + " resize-none"} />
                  </div>
                </>
              )}

              {/* EXPERIÊNCIA */}
              {modalAberto === "experience" && (
                <div className="space-y-6">
                  {formDataExperience.map((exp, i) => (
                    <div key={i} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50 relative">
                      <button onClick={() => setFormDataExperience(formDataExperience.filter((_, j) => j !== i))} className="absolute top-4 right-4 text-rose-500 hover:text-rose-700"><Trash2 className="w-4 h-4" /></button>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {[["Empresa", "company"], ["Cargo", "role"], ["Ano Início", "startYear"], ["Ano Fim", "endYear"]].map(([label, field]) => (
                          <div key={field} className="space-y-1">
                            <label className={labelCls}>{label}</label>
                            <input type="text" value={exp[field] ?? ""} onChange={(e) => { const n = [...formDataExperience]; n[i] = { ...n[i], [field]: e.target.value }; setFormDataExperience(n); }} className={inputCls} disabled={field === "endYear" && exp.isCurrent} />
                          </div>
                        ))}
                        <div className="col-span-2 space-y-1">
                          <label className={labelCls}>Descrição</label>
                          <textarea rows={3} value={exp.description ?? ""} onChange={(e) => { const n = [...formDataExperience]; n[i] = { ...n[i], description: e.target.value }; setFormDataExperience(n); }} className={inputCls + " resize-none"} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setFormDataExperience([...formDataExperience, { company: "", role: "", startYear: "", endYear: "", isCurrent: false, description: "" }])} className="text-indigo-600 font-bold text-sm flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Adicionar Experiência
                  </button>
                </div>
              )}

              {/* FORMAÇÃO */}
              {modalAberto === "education" && (
                <div className="space-y-6">
                  {formDataEducation.map((edu, i) => (
                    <div key={i} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50 relative">
                      <button onClick={() => setFormDataEducation(formDataEducation.filter((_, j) => j !== i))} className="absolute top-4 right-4 text-rose-500"><Trash2 className="w-4 h-4" /></button>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {[["Curso", "course"], ["Instituição", "institution"], ["Grau", "degree"], ["Ano Início", "startYear"], ["Ano Fim", "endYear"]].map(([label, field]) => (
                          <div key={field} className="space-y-1">
                            <label className={labelCls}>{label}</label>
                            <input type="text" value={edu[field] ?? ""} onChange={(e) => { const n = [...formDataEducation]; n[i] = { ...n[i], [field]: e.target.value }; setFormDataEducation(n); }} className={inputCls} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setFormDataEducation([...formDataEducation, { course: "", institution: "", degree: "", startYear: "", endYear: "" }])} className="text-indigo-600 font-bold text-sm flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Adicionar Formação
                  </button>
                </div>
              )}

              {/* SKILLS */}
              {modalAberto === "skills" && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className={labelCls}>Stacks (separe por vírgula)</label>
                    <textarea rows={3} value={formDataStacks} onChange={(e) => setFormDataStacks(e.target.value)} placeholder="React, Node.js, Python..." className={inputCls + " resize-none"} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Soft Skills (separe por vírgula)</label>
                    <textarea rows={3} value={formDataSoftSkills} onChange={(e) => setFormDataSoftSkills(e.target.value)} placeholder="Liderança, Comunicação..." className={inputCls + " resize-none"} />
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-slate-50 dark:bg-[#1A1D2D] border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-end gap-3 z-10">
              <button onClick={() => setModalAberto(null)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (modalAberto === "personal")   handleSavePersonal();
                  if (modalAberto === "experience") handleSaveBulk("experience");
                  if (modalAberto === "education")  handleSaveBulk("education");
                  if (modalAberto === "skills")     handleSaveBulk("skills");
                }}
                disabled={isSaving}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
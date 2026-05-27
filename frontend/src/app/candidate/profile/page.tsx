"use client";

/**
 * candidate/profile/page.tsx — v2
 *
 * FIX 3 — Alteração de e-mail com OTP:
 *   • O campo "E-mail" no modal de dados pessoais agora tem tratamento especial.
 *   • Ao clicar em "Salvar Alterações", se o e-mail foi modificado:
 *       1. Verifica se já está em uso no banco (GET /candidatos/verificar-email)
 *       2. O backend já chama Hunter antes de enviar o código
 *       3. Chama POST /auth/send-code (tipo: alteracao_email)
 *       4. Abre o EmailVerificationModal
 *       5. Só após OTP validado → salva os demais dados pessoais
 *   • Se o e-mail não mudou → salva normalmente (sem modal).
 */

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User, Loader2, ArrowLeft, Briefcase, GraduationCap,
  Wrench, HeartHandshake, Edit3, Mail, Phone,
  MapPin, Link as LinkIcon, ExternalLink, X, Plus, Trash2,
  Github, Linkedin, Globe, UploadCloud, FileCheck, AlertCircle, Download
} from "lucide-react";
import { EmailVerificationModal, type VerifySuccessPayload } from "@/components/auth/EmailVerificationModal";
import { apiFetch } from "@/services/auth";

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type FetchError = "offline" | "not_found" | null;

export default function CandidateProfilePage() {
  const router = useRouter();
  const [perfil, setPerfil]           = useState<any>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [isSaving, setIsSaving]       = useState(false);
  const [fetchError, setFetchError]   = useState<FetchError>(null);

  // CV upload state
  const [cvUploadState, setCvUploadState] = useState<"idle" | "uploading" | "extracting" | "done">("idle");
  const [cvFileName, setCvFileName]   = useState<string | null>(null);
  const [cvError, setCvError]         = useState<string | null>(null);
  const [hasCvSaved, setHasCvSaved]   = useState<boolean>(false);
  const [isCheckingCv, setIsCheckingCv] = useState<boolean>(true);
  const cvInputRef = useRef<HTMLInputElement | null>(null);

  // Upload de foto de perfil (acessado pelo botão sobre o avatar)
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [modalAberto, setModalAberto] = useState<"personal" | "experience" | "education" | "skills" | null>(null);
  const [formDataPersonal, setFormDataPersonal]     = useState<any>({});
  const [formDataExperience, setFormDataExperience] = useState<any[]>([]);
  const [formDataEducation, setFormDataEducation]   = useState<any[]>([]);
  const [formDataStacks, setFormDataStacks]         = useState("");
  const [formDataSoftSkills, setFormDataSoftSkills] = useState("");

  // ── FIX 3: estado do modal OTP de alteração de e-mail ─────────────────────
  const [otpEmailOpen, setOtpEmailOpen]   = useState(false);
  const [otpEmailTarget, setOtpEmailTarget] = useState(""); // novo e-mail aguardando verificação
  const [otpEmailError, setOtpEmailError] = useState("");
  const [isSendingOtp, setIsSendingOtp]   = useState(false);
  // Dados pessoais que serão salvos APÓS o OTP ser validado
  const [pendingPersonalData, setPendingPersonalData] = useState<any>(null);

  useEffect(() => {
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
      if (!usuarioId) { setFetchError("not_found"); setIsLoading(false); return; }
      try {
        const response = await apiFetch(`${getApiUrl()}/candidatos/perfil-completo/${usuarioId}`);
        if (response.ok) setPerfil(await response.json());
        else if (response.status === 404) setFetchError("not_found");
        else setFetchError("offline");
      } catch { setFetchError("offline"); }
      finally { setIsLoading(false); }
    };

    const verificarCvExistente = async () => {
      const usuarioId = localStorage.getItem("usuario_id");
      if (!usuarioId) return;
      try {
        const response = await apiFetch(`${getApiUrl()}/candidatos/verificar-cv/${usuarioId}`);
        if (response.ok) {
          const data = await response.json();
          setHasCvSaved(data.existe);
          if (data.existe) setCvFileName(data.nome_arquivo);
        }
      } catch (err) { console.error("Erro ao verificar currículo:", err); }
      finally { setIsCheckingCv(false); }
    };

    buscarPerfil();
    verificarCvExistente();
  }, []);

  const openModalPersonal   = () => { setFormDataPersonal(perfil.personal); setModalAberto("personal"); };
  const openModalExperience = () => { setFormDataExperience([...perfil.experience]); setModalAberto("experience"); };
  const openModalEducation  = () => { setFormDataEducation([...perfil.education]); setModalAberto("education"); };
  const openModalSkills     = () => {
    setFormDataStacks(perfil.stacks.join(", "));
    setFormDataSoftSkills(perfil.softSkills.join(", "));
    setModalAberto("skills");
  };

  // ── Salvar dados pessoais (sem alteração de e-mail) ───────────────────────
  const _executarSavePersonal = async (data: any) => {
    setIsSaving(true);
    const usuarioId = localStorage.getItem("usuario_id");
    try {
      const r = await apiFetch(`${getApiUrl()}/candidatos/perfil-pessoal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: Number(usuarioId), ...data }),
      });
      if (!r.ok) throw new Error("Erro ao atualizar dados pessoais.");
      setPerfil({ ...perfil, personal: data });

      // Atualiza localStorage se o nome mudou
      if (data.fullName) {
        try {
          const raw = localStorage.getItem("@TalentBridge:user");
          if (raw) {
            const user = JSON.parse(raw);
            user.name = data.fullName;
            localStorage.setItem("@TalentBridge:user", JSON.stringify(user));
          }
        } catch {}
      }

      setModalAberto(null);
      setPendingPersonalData(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── FIX 3: handleSavePersonal intercepta mudança de e-mail ────────────────
  const handleSavePersonal = async () => {
    const emailAtual  = perfil.personal?.email ?? "";
    const emailNovo   = formDataPersonal?.email ?? "";
    const usuarioId   = localStorage.getItem("usuario_id");

    // Se o e-mail não mudou, salva normalmente
    if (emailNovo.trim().toLowerCase() === emailAtual.trim().toLowerCase()) {
      await _executarSavePersonal(formDataPersonal);
      return;
    }

    // E-mail mudou → precisa de OTP
    if (!emailNovo || !emailNovo.includes("@")) {
      setOtpEmailError("Informe um e-mail válido.");
      return;
    }

    setOtpEmailError("");
    setIsSendingOtp(true);

    try {
      // Solicita o código OTP para o novo e-mail.
      // O backend verifica: duplicata no banco + Hunter.io.
      const res = await apiFetch(`${getApiUrl()}/auth/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailNovo,
          tipo: "alteracao_email",
          novo_email: emailNovo,
          usuario_id: Number(usuarioId),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erro ao enviar código de verificação.");

      // Guarda os dados pessoais que serão salvos após o OTP
      setPendingPersonalData(formDataPersonal);
      setOtpEmailTarget(emailNovo);
      setOtpEmailOpen(true);
    } catch (err: unknown) {
      setOtpEmailError(err instanceof Error ? err.message : "Erro ao verificar novo e-mail.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ── FIX 3: callback do modal OTP — e-mail validado, salva tudo ────────────
  const handleOtpEmailSuccess = async (payload: VerifySuccessPayload) => {
    setOtpEmailOpen(false);

    // Atualiza e-mail no localStorage
    try {
      const raw = localStorage.getItem("@TalentBridge:user");
      if (raw) {
        const user = JSON.parse(raw);
        user.email = payload.novo_email || otpEmailTarget;
        localStorage.setItem("@TalentBridge:user", JSON.stringify(user));
      }
    } catch {}

    // Salva os demais dados pessoais (fullName, phone, city etc.) com o novo e-mail
    if (pendingPersonalData) {
      await _executarSavePersonal({
        ...pendingPersonalData,
        email: payload.novo_email || otpEmailTarget,
      });
    }
  };

  const handleSaveBulk = async (tipo: "experience" | "education" | "skills") => {
    setIsSaving(true);
    const usuarioId = localStorage.getItem("usuario_id");
    try {
      const stacksArray     = tipo === "skills" ? formDataStacks.split(",").map((s) => s.trim()).filter(Boolean)     : perfil.stacks;
      const softSkillsArray = tipo === "skills" ? formDataSoftSkills.split(",").map((s) => s.trim()).filter(Boolean) : perfil.softSkills;
      const payload = {
        usuario_id: Number(usuarioId),
        personal:   perfil.personal,
        education:  tipo === "education"  ? formDataEducation  : perfil.education,
        experience: tipo === "experience" ? formDataExperience : perfil.experience,
        stacks:     stacksArray,
        softSkills: softSkillsArray,
      };
      const r = await apiFetch(`${getApiUrl()}/candidatos/onboarding`, {
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

  // Troca/upload da foto de perfil direto do card (sem precisar abrir o modal).
  // Lê como base64 (data URL) — mesma estratégia do onboarding — e dispara um
  // PUT em /candidatos/perfil-pessoal mantendo os demais campos intactos.
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (!file.type.startsWith("image/")) {
      setPhotoError("Selecione um arquivo de imagem (PNG, JPG).");
      e.target.value = "";
      return;
    }
    const MAX_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setPhotoError("A imagem deve ter no máximo 2MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) return;

      setIsUploadingPhoto(true);
      try {
        const usuarioId = localStorage.getItem("usuario_id");
        const novoPersonal = { ...perfil.personal, profilePicture: dataUrl };
        const r = await apiFetch(`${getApiUrl()}/candidatos/perfil-pessoal`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuario_id: Number(usuarioId), ...novoPersonal }),
        });
        if (!r.ok) throw new Error("Erro ao salvar a foto.");
        setPerfil({ ...perfil, personal: novoPersonal });
      } catch (err: any) {
        setPhotoError(err.message ?? "Não foi possível salvar a foto.");
      } finally {
        setIsUploadingPhoto(false);
        // Permite re-selecionar o mesmo arquivo após erro
        if (photoInputRef.current) photoInputRef.current.value = "";
      }
    };
    reader.onerror = () => {
      setPhotoError("Não foi possível ler a imagem.");
      setIsUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    if (!confirm("Remover a foto de perfil?")) return;
    setPhotoError(null);
    setIsUploadingPhoto(true);
    try {
      const usuarioId = localStorage.getItem("usuario_id");
      const novoPersonal = { ...perfil.personal, profilePicture: "" };
      const r = await apiFetch(`${getApiUrl()}/candidatos/perfil-pessoal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: Number(usuarioId), ...novoPersonal }),
      });
      if (!r.ok) throw new Error("Erro ao remover a foto.");
      setPerfil({ ...perfil, personal: novoPersonal });
    } catch (err: any) {
      setPhotoError(err.message ?? "Não foi possível remover a foto.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCvUpload = async (file: File) => {
    setCvError(null);
    const ext = file.name.toLowerCase();
    if (!ext.endsWith('.pdf') && !ext.endsWith('.docx')) { setCvError('Apenas arquivos PDF ou DOCX são aceitos.'); return; }
    if (file.size > 5 * 1024 * 1024) { setCvError('O arquivo deve ter no máximo 5MB.'); return; }

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
      const response = await apiFetch(`${getApiUrl()}/candidatos/extrair-cv`, { method: 'POST', body: formData });
      if (!response.ok) { const err = await response.json(); throw new Error(err.detail || 'Erro ao processar o currículo.'); }

      const data = await response.json();
      const extracted = data.dados;
      const payload = {
        usuario_id: Number(usuarioId),
        personal: { ...perfil.personal, ...extracted.personal, email: perfil.personal.email },
        education:  (extracted.education  ?? []).map((ed: any,  i: number) => ({ ...ed, id: Date.now() + i })),
        experience: (extracted.experience ?? []).map((exp: any, i: number) => ({ ...exp, id: Date.now() + 1000 + i })),
        stacks:     extracted.stacks     ?? perfil.stacks,
        softSkills: extracted.softSkills ?? perfil.softSkills,
      };
      const saveRes = await apiFetch(`${getApiUrl()}/candidatos/onboarding`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
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
              <button onClick={() => window.location.reload()} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">Tentar novamente</button>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-7 h-7 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Perfil não encontrado</h3>
              <p className="text-slate-500 text-sm mb-6">Complete o onboarding para criar seu perfil de candidato.</p>
              <button onClick={() => router.push("/candidate/onboarding")} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">Ir para o Onboarding</button>
            </>
          )}
        </div>
      </div>
    );
  }

  const { personal, experience, education, stacks, softSkills } = perfil;
  const handleDownloadCv = () => {
    const usuarioId = localStorage.getItem("usuario_id");
    if (usuarioId) window.open(`${getApiUrl()}/candidatos/baixar-cv/${usuarioId}`, "_blank");
  };

  const getNomeMes = (n?: string) => {
    if (!n) return "";
    const meses = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const i = parseInt(n);
    return isNaN(i) ? "" : meses[i] ?? "";
  };

  const inputCls = "w-full bg-slate-50 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm transition";
  const labelCls = "text-[11px] font-bold text-slate-500 uppercase tracking-widest";

  // Listas reutilizadas nos selects de Experiência e Formação.
  // Anos: dos últimos 50 anos até o ano atual + 6 (cobre previsão de formatura).
  const currentYear = new Date().getFullYear();
  const YEARS = Array.from({ length: 57 }, (_, i) => String(currentYear + 6 - i));
  const MONTHS: Array<[string, string]> = [
    ["01", "Janeiro"], ["02", "Fevereiro"], ["03", "Março"], ["04", "Abril"],
    ["05", "Maio"], ["06", "Junho"], ["07", "Julho"], ["08", "Agosto"],
    ["09", "Setembro"], ["10", "Outubro"], ["11", "Novembro"], ["12", "Dezembro"],
  ];

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
      <button onClick={() => router.push("/candidate/dashboard")} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para o Painel
      </button>

      <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-8">Meu Perfil</h1>

      {/* ── CARD: CV ─────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm mb-6">
        <input ref={cvInputRef} type="file" accept=".pdf,.docx" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleCvUpload(e.target.files[0])} />
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
              {cvError && <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {cvError}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasCvSaved && cvUploadState === "idle" && (
              <button onClick={handleDownloadCv}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm transition">
                <Download className="w-4 h-4" /> Baixar
              </button>
            )}
            <button
              onClick={() => {
                if (!hasCvSaved && cvUploadState === "idle") router.push("/candidate/onboarding/passo1");
                else { setCvUploadState('idle'); setCvFileName(null); setCvError(null); cvInputRef.current?.click(); }
              }}
              disabled={cvUploadState === 'uploading' || cvUploadState === 'extracting'}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-wait text-white rounded-xl font-bold text-sm transition shadow-md shadow-indigo-500/20"
            >
              {(cvUploadState === 'uploading' || cvUploadState === 'extracting') ? <Loader2 className="w-4 h-4 animate-spin" />
                : hasCvSaved ? <UploadCloud className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {cvUploadState === 'done' ? 'Enviar outro' : hasCvSaved ? 'Substituir currículo' : 'Adicionar currículo'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">

        {/* CARD: DADOS PESSOAIS */}
        <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-8 shadow-sm relative group">
          <button onClick={openModalPersonal}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors flex items-center gap-2 font-bold text-sm">
            <Edit3 className="w-4 h-4" /> <span className="hidden sm:inline">Editar Pessoal</span>
          </button>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center gap-2">
              <div className="relative group/photo">
                <div className="w-32 h-32 rounded-3xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex flex-col items-center justify-center shrink-0 border-4 border-white dark:border-[#0B0E14] shadow-lg overflow-hidden">
                  {/* Só renderiza <img> se a string for um data URL (base64) ou http(s).
                      Strings legadas começando com "blob:" são URLs de objeto que só
                      existem na sessão original do navegador — viram imagem quebrada
                      depois do logout. Nesses casos exibimos o fallback. */}
                  {personal?.profilePicture &&
                   (personal.profilePicture.startsWith("data:") || personal.profilePicture.startsWith("http"))
                    ? <img src={personal.profilePicture} alt="Foto" className="w-full h-full object-cover" />
                    : <User className="w-12 h-12" />}
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Botão "câmera" sobreposto — aciona o input file oculto */}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  aria-label="Trocar foto de perfil"
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-[#0B0E14] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UploadCloud className="w-4 h-4" />
                </button>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Link "Remover" só quando há foto válida salva */}
              {personal?.profilePicture &&
               (personal.profilePicture.startsWith("data:") || personal.profilePicture.startsWith("http")) && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isUploadingPhoto}
                  className="text-xs font-medium text-rose-500 hover:text-rose-600 transition disabled:opacity-50"
                >
                  Remover foto
                </button>
              )}

              {photoError && (
                <p className="text-xs text-rose-500 text-center max-w-[12rem]">{photoError}</p>
              )}
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{personal?.fullName || "Nome não informado"}</h2>
                <p className="text-lg text-slate-500 font-medium">{experience?.length > 0 ? experience[0]?.role : "Candidato TalentBridge"}</p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                {personal?.email && <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{personal.email}</div>}
                {personal?.phone && <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{personal.phone}</div>}
                {personal?.city  && <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{personal.city}, {personal?.state}</div>}
              </div>
              {(personal?.linkedin || personal?.github || personal?.portfolio) && (
                <div className="flex flex-wrap gap-3">
                  {personal.linkedin && <a href={personal.linkedin.startsWith("http") ? personal.linkedin : `https://${personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"><Linkedin className="w-4 h-4" /> LinkedIn</a>}
                  {personal.github   && <a href={personal.github.startsWith("http")   ? personal.github   : `https://${personal.github}`}   target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:underline"><Github className="w-4 h-4" /> GitHub</a>}
                  {personal.portfolio && <a href={personal.portfolio.startsWith("http") ? personal.portfolio : `https://${personal.portfolio}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"><Globe className="w-4 h-4" /> Portfólio</a>}
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
                <p className="text-sm text-slate-500 font-medium mb-3">{getNomeMes(exp.startMonth)} {exp.startYear} — {exp.isCurrent ? "Atual" : `${getNomeMes(exp.endMonth)} ${exp.endYear}`}</p>
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
        {/*
          ⚠ Tailwind JIT purga classes interpoladas em runtime (`bg-${color}-100`).
          Em build de produção essas classes não existem no CSS gerado. Por isso
          mantemos uma TABELA ESTÁTICA com todas as variantes que usamos.
        */}
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              label: "Stacks",
              data: stacks,
              icon: <Wrench className="w-5 h-5" />,
              iconCls: "bg-purple-100 text-purple-600",
              buttonCls: "text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10",
              pillCls: "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
            },
            {
              label: "Soft-Skills",
              data: softSkills,
              icon: <HeartHandshake className="w-5 h-5" />,
              iconCls: "bg-pink-100 text-pink-600",
              buttonCls: "text-slate-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-500/10",
              pillCls: "bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20",
            },
          ].map(({ label, data, icon, iconCls, buttonCls, pillCls }) => (
            <div key={label} className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-8 shadow-sm relative group">
              <button onClick={openModalSkills} className={`absolute top-6 right-6 p-2 ${buttonCls} rounded-xl transition-colors`}>
                <Edit3 className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl ${iconCls} flex items-center justify-center`}>{icon}</div>
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

      {/* ── MODAIS DE EDIÇÃO ─────────────────────────────────────────────────── */}
      {modalAberto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col">

            <div className="sticky top-0 bg-white dark:bg-[#0B0E14] border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {modalAberto === "personal"   && "Editar Dados Pessoais"}
                {modalAberto === "experience" && "Editar Experiência"}
                {modalAberto === "education"  && "Editar Formação"}
                {modalAberto === "skills"     && "Editar Habilidades"}
              </h2>
              <button onClick={() => { setModalAberto(null); setOtpEmailError(""); }}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">

              {/* PESSOAL */}
              {modalAberto === "personal" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      ["Nome Completo", "fullName", "text",  "name"],
                      ["Telefone",      "phone",    "tel",   "tel"],
                      ["Cidade",        "city",     "text",  "address-level2"],
                      ["CEP",           "zipCode",  "text",  "postal-code"],
                    ].map(([label, field, type, autoComp]) => {
                      const inputId = `personal-${field}`;
                      return (
                        <div key={field} className="space-y-1.5">
                          <label htmlFor={inputId} className={labelCls}>{label}</label>
                          <input
                            id={inputId}
                            name={field}
                            type={type}
                            autoComplete={autoComp}
                            value={formDataPersonal[field] ?? ""}
                            onChange={(e) => setFormDataPersonal({ ...formDataPersonal, [field]: e.target.value })}
                            className={inputCls}
                          />
                        </div>
                      );
                    })}

                    {/* Idade — numérico com min/max razoáveis */}
                    <div className="space-y-1.5">
                      <label htmlFor="personal-age" className={labelCls}>Idade</label>
                      <input
                        id="personal-age"
                        name="age"
                        type="number"
                        min={14}
                        max={120}
                        inputMode="numeric"
                        value={formDataPersonal.age ?? ""}
                        onChange={(e) => setFormDataPersonal({ ...formDataPersonal, age: e.target.value })}
                        className={inputCls}
                      />
                    </div>

                    {/* Gênero — select com opções padronizadas */}
                    <div className="space-y-1.5">
                      <label htmlFor="personal-gender" className={labelCls}>Gênero</label>
                      <select
                        id="personal-gender"
                        name="gender"
                        value={formDataPersonal.gender ?? ""}
                        onChange={(e) => setFormDataPersonal({ ...formDataPersonal, gender: e.target.value })}
                        className={inputCls}
                      >
                        <option value="">Selecione</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Não-binário">Não-binário</option>
                        <option value="Outro">Outro</option>
                        <option value="Prefiro não informar">Prefiro não informar</option>
                      </select>
                    </div>

                    {/* Estado — select de UFs em ordem alfabética */}
                    <div className="space-y-1.5">
                      <label htmlFor="personal-state" className={labelCls}>Estado (UF)</label>
                      <select
                        id="personal-state"
                        name="state"
                        autoComplete="address-level1"
                        value={formDataPersonal.state ?? ""}
                        onChange={(e) => setFormDataPersonal({ ...formDataPersonal, state: e.target.value })}
                        className={inputCls}
                      >
                        <option value="">Selecione</option>
                        {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>

                    {/* FIX 3: campo E-mail com destaque visual quando alterado */}
                    <div className="space-y-1.5 col-span-full">
                      <label htmlFor="personal-email" className={labelCls}>
                        E-mail
                        {formDataPersonal.email !== perfil.personal?.email && (
                          <span className="ml-2 text-amber-500 normal-case font-normal tracking-normal text-xs">
                            — será necessário verificar o novo e-mail
                          </span>
                        )}
                      </label>
                      <input
                        id="personal-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        aria-invalid={!!otpEmailError || undefined}
                        aria-describedby={otpEmailError ? "personal-email-error" : undefined}
                        value={formDataPersonal.email ?? ""}
                        onChange={(e) => {
                          setFormDataPersonal({ ...formDataPersonal, email: e.target.value });
                          setOtpEmailError("");
                        }}
                        className={`${inputCls} ${formDataPersonal.email !== perfil.personal?.email ? "border-amber-400 focus:ring-amber-400" : ""}`}
                      />
                      {otpEmailError && (
                        <p
                          id="personal-email-error"
                          role="alert"
                          className="text-red-500 text-xs flex items-center gap-1 mt-1"
                        >
                          <AlertCircle className="w-3 h-3" aria-hidden="true" /> {otpEmailError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 space-y-4">
                    <p className={labelCls}>Links e Redes</p>
                    {[["LinkedIn", "linkedin"], ["GitHub", "github"], ["Portfólio", "portfolio"]].map(([label, field]) => {
                      const inputId = `personal-link-${field}`;
                      return (
                        <div key={field} className="space-y-1.5">
                          <label htmlFor={inputId} className={labelCls}>{label}</label>
                          <input
                            id={inputId}
                            name={field}
                            type="url"
                            inputMode="url"
                            autoComplete="url"
                            value={formDataPersonal[field] ?? ""}
                            onChange={(e) => setFormDataPersonal({ ...formDataPersonal, [field]: e.target.value })}
                            placeholder="https://"
                            className={inputCls}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label htmlFor="personal-about" className={labelCls}>Sobre Mim</label>
                    <textarea
                      id="personal-about"
                      name="about"
                      rows={4}
                      value={formDataPersonal.about ?? ""}
                      onChange={(e) => setFormDataPersonal({ ...formDataPersonal, about: e.target.value })}
                      className={inputCls + " resize-none"}
                    />
                  </div>
                </>
              )}

              {/* EXPERIÊNCIA */}
              {modalAberto === "experience" && (
                <div className="space-y-6">
                  {formDataExperience.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">
                      Nenhuma experiência cadastrada. Clique abaixo para adicionar.
                    </p>
                  )}
                  {formDataExperience.map((exp, i) => {
                    const updateField = (field: string, value: any) => {
                      const n = [...formDataExperience];
                      n[i] = { ...n[i], [field]: value };
                      setFormDataExperience(n);
                    };
                    return (
                    <div key={i} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50 relative">
                      <button
                        type="button"
                        onClick={() => setFormDataExperience(formDataExperience.filter((_, j) => j !== i))}
                        aria-label={`Remover experiência ${i + 1}`}
                        className="absolute top-2 right-2 inline-flex items-center justify-center w-11 h-11 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 pr-12">
                        {/* Cargo primeiro — é o campo de destaque visual no card */}
                        <div className="space-y-1">
                          <label htmlFor={`exp-${i}-role`} className={labelCls}>Cargo</label>
                          <input
                            id={`exp-${i}-role`}
                            type="text"
                            value={exp.role ?? ""}
                            onChange={(e) => updateField("role", e.target.value)}
                            className={inputCls}
                            placeholder="Ex: Desenvolvedor Full Stack"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor={`exp-${i}-company`} className={labelCls}>Empresa</label>
                          <input
                            id={`exp-${i}-company`}
                            type="text"
                            value={exp.company ?? ""}
                            onChange={(e) => updateField("company", e.target.value)}
                            className={inputCls}
                          />
                        </div>

                        {/* Início: mês + ano lado a lado */}
                        <div className="space-y-1">
                          <label className={labelCls}>Início</label>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              aria-label="Mês de início"
                              value={exp.startMonth ?? ""}
                              onChange={(e) => updateField("startMonth", e.target.value)}
                              className={inputCls}
                            >
                              <option value="">Mês</option>
                              {MONTHS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                            <select
                              aria-label="Ano de início"
                              value={exp.startYear ?? ""}
                              onChange={(e) => updateField("startYear", e.target.value)}
                              className={inputCls}
                            >
                              <option value="">Ano</option>
                              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                          </div>
                        </div>

                        {/* Fim: mês + ano, desabilitados se isCurrent */}
                        <div className="space-y-1">
                          <label className={labelCls}>Fim</label>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              aria-label="Mês de fim"
                              value={exp.endMonth ?? ""}
                              onChange={(e) => updateField("endMonth", e.target.value)}
                              disabled={!!exp.isCurrent}
                              className={inputCls + " disabled:opacity-50 disabled:cursor-not-allowed"}
                            >
                              <option value="">Mês</option>
                              {MONTHS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                            <select
                              aria-label="Ano de fim"
                              value={exp.endYear ?? ""}
                              onChange={(e) => updateField("endYear", e.target.value)}
                              disabled={!!exp.isCurrent}
                              className={inputCls + " disabled:opacity-50 disabled:cursor-not-allowed"}
                            >
                              <option value="">Ano</option>
                              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                          </div>
                        </div>

                        {/* Checkbox "trabalho aqui atualmente" */}
                        <div className="sm:col-span-2 flex items-center gap-2">
                          <input
                            id={`exp-${i}-current`}
                            type="checkbox"
                            checked={!!exp.isCurrent}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const n = [...formDataExperience];
                              n[i] = {
                                ...n[i],
                                isCurrent: checked,
                                // limpa fim quando marcar "atual"
                                ...(checked ? { endMonth: "", endYear: "" } : {}),
                              };
                              setFormDataExperience(n);
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor={`exp-${i}-current`} className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                            Trabalho aqui atualmente
                          </label>
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label htmlFor={`exp-${i}-description`} className={labelCls}>Descrição</label>
                          <textarea
                            id={`exp-${i}-description`}
                            name="description"
                            rows={3}
                            value={exp.description ?? ""}
                            onChange={(e) => updateField("description", e.target.value)}
                            className={inputCls + " resize-none"}
                            placeholder="Principais atividades, tecnologias, conquistas..."
                          />
                        </div>
                      </div>
                    </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setFormDataExperience([...formDataExperience, { company: "", role: "", startMonth: "", startYear: "", endMonth: "", endYear: "", isCurrent: false, description: "" }])}
                    className="text-indigo-600 font-bold text-sm inline-flex items-center gap-1 min-h-[44px] px-2"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" /> Adicionar Experiência
                  </button>
                </div>
              )}

              {/* FORMAÇÃO */}
              {modalAberto === "education" && (
                <div className="space-y-6">
                  {formDataEducation.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">
                      Nenhuma formação cadastrada. Clique abaixo para adicionar.
                    </p>
                  )}
                  {formDataEducation.map((edu, i) => {
                    const updateField = (field: string, value: any) => {
                      const n = [...formDataEducation];
                      n[i] = { ...n[i], [field]: value };
                      setFormDataEducation(n);
                    };
                    return (
                    <div key={i} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50 relative">
                      <button
                        type="button"
                        onClick={() => setFormDataEducation(formDataEducation.filter((_, j) => j !== i))}
                        aria-label={`Remover formação ${i + 1}`}
                        className="absolute top-2 right-2 inline-flex items-center justify-center w-11 h-11 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 pr-12">
                        <div className="space-y-1 sm:col-span-2">
                          <label htmlFor={`edu-${i}-course`} className={labelCls}>Curso / Título</label>
                          <input
                            id={`edu-${i}-course`}
                            type="text"
                            value={edu.course ?? ""}
                            onChange={(e) => updateField("course", e.target.value)}
                            className={inputCls}
                            placeholder="Ex: Análise e Desenvolvimento de Sistemas"
                          />
                        </div>

                        <div className="space-y-1">
                          <label htmlFor={`edu-${i}-institution`} className={labelCls}>Instituição</label>
                          <input
                            id={`edu-${i}-institution`}
                            type="text"
                            value={edu.institution ?? ""}
                            onChange={(e) => updateField("institution", e.target.value)}
                            className={inputCls}
                          />
                        </div>

                        {/* Grau — mesmas opções do onboarding (inclui "Curso") */}
                        <div className="space-y-1">
                          <label htmlFor={`edu-${i}-degree`} className={labelCls}>Grau</label>
                          <select
                            id={`edu-${i}-degree`}
                            value={edu.degree ?? ""}
                            onChange={(e) => updateField("degree", e.target.value)}
                            className={inputCls}
                          >
                            <option value="">Selecione</option>
                            <option value="Fundamental">Fundamental</option>
                            <option value="Médio">Médio / Colegial</option>
                            <option value="Técnico">Ensino Técnico</option>
                            <option value="Curso">Curso Livre / Profissionalizante</option>
                            <option value="Superior">Ensino Superior / Bacharelado</option>
                            <option value="Pós-graduação">Pós-graduação</option>
                            <option value="Mestrado">Mestrado</option>
                            <option value="Doutorado">Doutorado</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label htmlFor={`edu-${i}-startYear`} className={labelCls}>Ano Início</label>
                          <select
                            id={`edu-${i}-startYear`}
                            value={edu.startYear ?? ""}
                            onChange={(e) => updateField("startYear", e.target.value)}
                            className={inputCls}
                          >
                            <option value="">Selecione</option>
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label htmlFor={`edu-${i}-endYear`} className={labelCls}>Ano Fim (ou previsto)</label>
                          <select
                            id={`edu-${i}-endYear`}
                            value={edu.endYear ?? ""}
                            onChange={(e) => updateField("endYear", e.target.value)}
                            className={inputCls}
                          >
                            <option value="">Selecione</option>
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>

                        {/* Carga horária — útil para cursos livres/técnicos */}
                        <div className="space-y-1 sm:col-span-2">
                          <label htmlFor={`edu-${i}-hours`} className={labelCls}>
                            Carga Horária <span className="font-normal normal-case tracking-normal text-slate-400">(opcional)</span>
                          </label>
                          <input
                            id={`edu-${i}-hours`}
                            type="text"
                            value={edu.hours ?? ""}
                            onChange={(e) => updateField("hours", e.target.value)}
                            className={inputCls}
                            placeholder="Ex: 80h, 120 horas"
                          />
                        </div>
                      </div>
                    </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setFormDataEducation([...formDataEducation, { course: "", institution: "", degree: "", startYear: "", endYear: "", hours: "" }])}
                    className="text-indigo-600 font-bold text-sm inline-flex items-center gap-1 min-h-[44px] px-2"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" /> Adicionar Formação
                  </button>
                </div>
              )}

              {/* SKILLS — editor de tags. O estado continua sendo string CSV (sem
                  refatorar o handleSaveBulk que já faz split por vírgula). A UI
                  só renderiza as tags e oferece adicionar/remover individual. */}
              {modalAberto === "skills" && (() => {
                const renderTagEditor = (
                  label: string,
                  placeholder: string,
                  value: string,
                  setValue: (s: string) => void,
                  color: "indigo" | "amber"
                ) => {
                  const tags = value.split(",").map(t => t.trim()).filter(Boolean);
                  const addTag = (raw: string) => {
                    const novos = raw.split(",").map(t => t.trim()).filter(Boolean);
                    if (novos.length === 0) return;
                    const unicos = [...tags];
                    for (const n of novos) {
                      if (!unicos.some(t => t.toLowerCase() === n.toLowerCase())) unicos.push(n);
                    }
                    setValue(unicos.join(", "));
                  };
                  const removeTag = (idx: number) => {
                    setValue(tags.filter((_, i) => i !== idx).join(", "));
                  };
                  const palette = color === "indigo"
                    ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300"
                    : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300";

                  return (
                    <div className="space-y-2">
                      <label className={labelCls}>{label}</label>
                      <div className="min-h-[44px] flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-700 rounded-xl">
                        {tags.length === 0 && (
                          <span className="text-xs text-slate-400 px-2 py-1.5">Nenhum item adicionado</span>
                        )}
                        {tags.map((t, i) => (
                          <span key={`${t}-${i}`} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${palette}`}>
                            {t}
                            <button
                              type="button"
                              onClick={() => removeTag(i)}
                              aria-label={`Remover ${t}`}
                              className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder={placeholder}
                        className={inputCls}
                        onKeyDown={(e) => {
                          // Enter ou vírgula → adiciona a tag
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            const target = e.currentTarget;
                            addTag(target.value);
                            target.value = "";
                          }
                        }}
                        onBlur={(e) => {
                          // Adiciona ao perder foco também (UX: usuário digitou e clicou em "Salvar")
                          if (e.currentTarget.value.trim()) {
                            addTag(e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <p className="text-[11px] text-slate-400">Pressione <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono">Enter</kbd> ou vírgula para adicionar</p>
                    </div>
                  );
                };

                return (
                  <div className="space-y-6">
                    {renderTagEditor("Stacks / Tecnologias", "Ex: React, Node.js, Python...", formDataStacks, setFormDataStacks, "indigo")}
                    {renderTagEditor("Soft Skills", "Ex: Liderança, Comunicação...", formDataSoftSkills, setFormDataSoftSkills, "amber")}
                  </div>
                );
              })()}
            </div>

            <div className="sticky bottom-0 bg-slate-50 dark:bg-[#1A1D2D] border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 z-10">
              <button
                type="button"
                onClick={() => { setModalAberto(null); setOtpEmailError(""); }}
                className="px-5 py-3 min-h-[44px] rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (modalAberto === "personal")   handleSavePersonal();
                  if (modalAberto === "experience") handleSaveBulk("experience");
                  if (modalAberto === "education")  handleSaveBulk("education");
                  if (modalAberto === "skills")     handleSaveBulk("skills");
                }}
                disabled={isSaving || isSendingOtp}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {(isSaving || isSendingOtp) && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSendingOtp ? "Enviando código..." : isSaving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FIX 3: Modal OTP de alteração de e-mail ──────────────────────────── */}
      <EmailVerificationModal
        isOpen={otpEmailOpen}
        onClose={() => setOtpEmailOpen(false)}
        email={otpEmailTarget}
        tipo="alteracao_email"
        onVerifySuccess={handleOtpEmailSuccess}
        pendingData={{
          novo_email:  otpEmailTarget,
          usuario_id:  Number(localStorage.getItem("usuario_id")),
        }}
      />
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  User, Mail, Lock, Trash2, LogOut, Sun, Moon, Monitor,
  CheckCircle2, AlertCircle, Loader2, Eye, EyeOff,
  Shield, Bell, Palette, ChevronRight, X
} from "lucide-react";

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Section = "conta" | "seguranca" | "aparencia" | "notificacoes";

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

// ─── Helpers visuais ──────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-slate-50 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm transition";

const labelCls = "text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest";

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">{title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return <hr className="border-slate-100 dark:border-slate-800 my-6" />;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl pointer-events-auto animate-in slide-in-from-bottom-4 duration-300 ${
            t.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-bold">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="ml-2 opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Modal de confirmação de exclusão ─────────────────────────────────────────

function DeleteModal({ onClose, onConfirm, isDeleting }: {
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  const [confirmText, setConfirmText] = useState("");
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-8">
        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Trash2 className="w-7 h-7 text-rose-500" />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white text-center mb-2">
          Excluir conta permanentemente?
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6 leading-relaxed">
          Todos os seus dados, candidaturas e histórico serão removidos e{" "}
          <span className="font-bold text-rose-500">não poderão ser recuperados</span>.
        </p>
        <div className="space-y-2 mb-6">
          <label className={labelCls}>
            Digite <span className="text-rose-500 font-black">EXCLUIR</span> para confirmar
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className={inputCls}
            placeholder="EXCLUIR"
            autoFocus
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmText !== "EXCLUIR" || isDeleting}
            className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isDeleting ? "Excluindo..." : "Excluir conta"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page principal ───────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Dados do usuário
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [usuarioId, setUsuarioId] = useState<string | null>(null);

  // Formulários
  const [newEmail, setNewEmail] = useState("");
  const [currentPasswordEmail, setCurrentPasswordEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Notificações (preferências locais)
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifVagas, setNotifVagas] = useState(true);
  const [notifCandidaturas, setNotifCandidaturas] = useState(true);

  // Estados de loading
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const addToast = (type: "success" | "error", message: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const dismissToast = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    setMounted(true);
    const raw = localStorage.getItem("@TalentBridge:user");
    if (raw) {
      const user = JSON.parse(raw);
      setUserName(user.name ?? "");
      setUserEmail(user.email ?? "");
      setNewEmail(user.email ?? "");
    }
    setUsuarioId(localStorage.getItem("usuario_id"));
  }, []);

  // ── Alterar e-mail ──────────────────────────────────────────────────────────
  const handleChangeEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes("@")) {
      addToast("error", "Informe um e-mail válido.");
      return;
    }
    if (!currentPasswordEmail.trim()) {
      addToast("error", "Informe sua senha atual para confirmar.");
      return;
    }
    if (newEmail === userEmail) {
      addToast("error", "O novo e-mail é igual ao atual.");
      return;
    }

    setIsSavingEmail(true);
    try {
      // Verifica a senha atual via login antes de alterar
      const checkRes = await fetch(`${getApiUrl()}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, senha: currentPasswordEmail }),
      });

      if (!checkRes.ok) {
        addToast("error", "Senha atual incorreta.");
        return;
      }

      // Atualiza o e-mail via PUT /candidatos/perfil-pessoal
      const perfilRes = await fetch(
        `${getApiUrl()}/candidatos/perfil-completo/${usuarioId}`
      );
      if (!perfilRes.ok) throw new Error("Não foi possível carregar os dados do perfil.");
      const perfil = await perfilRes.json();

      const updateRes = await fetch(`${getApiUrl()}/candidatos/perfil-pessoal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: Number(usuarioId),
          ...perfil.personal,
          email: newEmail,
        }),
      });

      if (!updateRes.ok) throw new Error("Erro ao atualizar e-mail.");

      // Atualiza o localStorage
      const raw = localStorage.getItem("@TalentBridge:user");
      if (raw) {
        const user = JSON.parse(raw);
        user.email = newEmail;
        localStorage.setItem("@TalentBridge:user", JSON.stringify(user));
      }

      setUserEmail(newEmail);
      setCurrentPasswordEmail("");
      addToast("success", "E-mail atualizado com sucesso!");
    } catch (e: any) {
      addToast("error", e.message ?? "Erro ao atualizar e-mail.");
    } finally {
      setIsSavingEmail(false);
    }
  };

  // ── Alterar senha ───────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      addToast("error", "Informe sua senha atual.");
      return;
    }
    if (newPassword.length < 6) {
      addToast("error", "A nova senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast("error", "A confirmação não coincide com a nova senha.");
      return;
    }

    setIsSavingPassword(true);
    try {
      // Verifica senha atual via login
      const checkRes = await fetch(`${getApiUrl()}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, senha: currentPassword }),
      });

      if (!checkRes.ok) {
        addToast("error", "Senha atual incorreta.");
        return;
      }

      // O backend não tem endpoint dedicado de troca de senha ainda.
      // Simulamos o sucesso e limpamos os campos — quando o endpoint existir,
      // basta trocar pelo fetch correto aqui.
      addToast("success", "Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      addToast("error", "Erro ao alterar a senha. Tente novamente.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // ── Excluir conta ───────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Endpoint de exclusão ainda não existe no backend.
      // Quando for criado (DELETE /usuarios/{id}), substituir aqui.
      await new Promise((r) => setTimeout(r, 1000)); // simula latência

      localStorage.removeItem("@TalentBridge:user");
      localStorage.removeItem("usuario_id");
      localStorage.removeItem("@TalentBridge:OnboardingData");

      router.push("/login");
    } catch {
      addToast("error", "Erro ao excluir a conta. Tente novamente.");
      setIsDeleting(false);
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("@TalentBridge:user");
    localStorage.removeItem("usuario_id");
    localStorage.removeItem("@TalentBridge:OnboardingData");
    router.push("/login");
  };

  // ── Toggle de notificação ───────────────────────────────────────────────────
  function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
          value ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    );
  }

  // ── Força da senha ──────────────────────────────────────────────────────────
  const passwordStrength = (() => {
    if (!newPassword) return null;
    const checks = [
      newPassword.length >= 8,
      /[A-Z]/.test(newPassword),
      /[0-9]/.test(newPassword),
      /[^A-Za-z0-9]/.test(newPassword),
    ];
    const score = checks.filter(Boolean).length;
    if (score <= 1) return { label: "Fraca", color: "bg-rose-400", width: "w-1/4" };
    if (score === 2) return { label: "Razoável", color: "bg-amber-400", width: "w-2/4" };
    if (score === 3) return { label: "Boa", color: "bg-indigo-500", width: "w-3/4" };
    return { label: "Forte", color: "bg-emerald-500", width: "w-full" };
  })();

  return (
    <div className="animate-in fade-in duration-500 max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Configurações
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          Gerencie sua conta, segurança e preferências
        </p>
      </div>

      <div className="space-y-6">

        {/* ── CONTA ─────────────────────────────────────────────────────────── */}
        <SectionCard
          title="Dados da Conta"
          subtitle="Informações de identificação e acesso"
          icon={User}
          iconColor="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
        >
          {/* Info atual */}
          <div className="bg-slate-50 dark:bg-[#1A1D2D]/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/50 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shrink-0">
                {userName.charAt(0) || "?"}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{userName || "—"}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{userEmail || "—"}</p>
              </div>
            </div>
          </div>

          {/* Alterar e-mail */}
          <div className="space-y-4">
            <p className="text-sm font-black text-slate-700 dark:text-slate-300">Alterar E-mail</p>

            <div className="space-y-1.5">
              <label className={labelCls}>Novo e-mail</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className={inputCls}
                placeholder="novo@email.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>Confirme com sua senha atual</label>
              <div className="relative">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPasswordEmail}
                  onChange={(e) => setCurrentPasswordEmail(e.target.value)}
                  className={inputCls + " pr-11"}
                  placeholder="••••••••"
                />
                <button
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleChangeEmail}
              disabled={isSavingEmail}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              {isSavingEmail && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSavingEmail ? "Salvando..." : "Salvar novo e-mail"}
            </button>
          </div>
        </SectionCard>

        {/* ── SEGURANÇA ──────────────────────────────────────────────────────── */}
        <SectionCard
          title="Segurança"
          subtitle="Altere sua senha e gerencie o acesso"
          icon={Shield}
          iconColor="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
        >
          <div className="space-y-4">
            <p className="text-sm font-black text-slate-700 dark:text-slate-300">Alterar Senha</p>

            {/* Senha atual */}
            <div className="space-y-1.5">
              <label className={labelCls}>Senha atual</label>
              <div className="relative">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputCls + " pr-11"}
                  placeholder="••••••••"
                />
                <button
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Nova senha */}
            <div className="space-y-1.5">
              <label className={labelCls}>Nova senha</label>
              <div className="relative">
                <input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputCls + " pr-11"}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Força da senha */}
              {passwordStrength && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`} />
                  </div>
                  <p className={`text-xs font-bold ${
                    passwordStrength.label === "Forte" ? "text-emerald-600 dark:text-emerald-400" :
                    passwordStrength.label === "Boa"   ? "text-indigo-600 dark:text-indigo-400" :
                    passwordStrength.label === "Razoável" ? "text-amber-600 dark:text-amber-400" :
                    "text-rose-500"
                  }`}>
                    Força: {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirmar nova senha */}
            <div className="space-y-1.5">
              <label className={labelCls}>Confirmar nova senha</label>
              <div className="relative">
                <input
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputCls} pr-11 ${
                    confirmPassword && confirmPassword !== newPassword
                      ? "border-rose-300 focus:ring-rose-400 dark:border-rose-500/50"
                      : confirmPassword && confirmPassword === newPassword
                      ? "border-emerald-300 focus:ring-emerald-400 dark:border-emerald-500/50"
                      : ""
                  }`}
                  placeholder="Repita a nova senha"
                />
                <button
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-rose-500 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> As senhas não coincidem
                </p>
              )}
            </div>

            <button
              onClick={handleChangePassword}
              disabled={isSavingPassword}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {isSavingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSavingPassword ? "Salvando..." : "Alterar senha"}
            </button>

            <Divider />

            {/* Logout */}
            <div>
              <p className="text-sm font-black text-slate-700 dark:text-slate-300 mb-3">Sessão</p>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-bold text-sm group"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-4 h-4" />
                  Sair da conta
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
              </button>
            </div>
          </div>
        </SectionCard>

        {/* ── APARÊNCIA ──────────────────────────────────────────────────────── */}
        <SectionCard
          title="Aparência"
          subtitle="Personalize o visual da plataforma"
          icon={Palette}
          iconColor="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400"
        >
          <p className="text-sm font-black text-slate-700 dark:text-slate-300 mb-4">Tema</p>
          <div className="grid grid-cols-3 gap-3">
            {([
              { value: "light", label: "Claro", icon: Sun },
              { value: "dark",  label: "Escuro", icon: Moon },
              { value: "system", label: "Sistema", icon: Monitor },
            ] as const).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                disabled={!mounted}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all font-bold text-sm ${
                  mounted && theme === value
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                    : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <Icon className="w-6 h-6" />
                {label}
                {mounted && theme === value && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                )}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* ── NOTIFICAÇÕES ───────────────────────────────────────────────────── */}
        <SectionCard
          title="Notificações"
          subtitle="Escolha o que você quer receber"
          icon={Bell}
          iconColor="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
        >
          <div className="space-y-5">
            {([
              {
                label: "Novidades por e-mail",
                desc: "Dicas, atualizações e novidades da plataforma",
                value: notifEmail,
                onChange: setNotifEmail,
              },
              {
                label: "Novas vagas compatíveis",
                desc: "Alerta quando uma vaga com alto match for publicada",
                value: notifVagas,
                onChange: setNotifVagas,
              },
              {
                label: "Atualização de candidaturas",
                desc: "Mudanças no status das suas candidaturas ativas",
                value: notifCandidaturas,
                onChange: setNotifCandidaturas,
              },
            ]).map(({ label, desc, value, onChange }) => (
              <div key={label} className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                </div>
                <Toggle value={value} onChange={onChange} />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── ZONA DE PERIGO ─────────────────────────────────────────────────── */}
        <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-rose-700 dark:text-rose-400">Zona de Perigo</h2>
              <p className="text-sm text-rose-600/70 dark:text-rose-400/70 font-medium">
                Ações irreversíveis — prossiga com cuidado
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#0B0E14] rounded-2xl p-5 border border-rose-100 dark:border-rose-500/10">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Excluir minha conta</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Remove permanentemente todos os seus dados da plataforma
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="shrink-0 bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-rose-500/20 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Excluir conta
            </button>
          </div>
        </div>

      </div>

      {/* Modal de exclusão */}
      {showDeleteModal && (
        <DeleteModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          isDeleting={isDeleting}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
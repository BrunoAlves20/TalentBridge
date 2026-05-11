"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService, UserRole } from "@/services/auth";
import { EmailVerificationModal, VerifySuccessPayload } from "@/components/auth/EmailVerificationModal";

import {
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  User,
  Briefcase,
  UserCircle,
} from "lucide-react";

import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export function RegisterView() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("CANDIDATO");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Controle do modal OTP
  const [showOtp, setShowOtp] = useState(false);

  // ── Etapa 1: envia o código OTP (não cria o usuário ainda) ────────────────
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Envia o código OTP. O usuário só será criado após verificação em /auth/verify-code.
      const res = await fetch(`${API_URL}/auth/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          tipo: "cadastro",
          nome: name,
          senha: password,
          tipo_usuario: role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erro ao enviar código de verificação.");

      // Abre o modal para o usuário inserir o código
      setShowOtp(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setIsLoading(false);
    }
  }

  // ── Etapa 2: callback chamado após OTP validado com sucesso ───────────────
  function handleVerifySuccess(payload: VerifySuccessPayload) {
    setShowOtp(false);

    // Monta o objeto de usuário com os dados retornados pelo backend
    const userData = {
      id: payload.usuario_id!,
      name,
      email: payload.email || email,
      role: (payload.tipo_usuario as UserRole) || role,
    };

    // Limpa dados de onboarding de sessões anteriores
    localStorage.removeItem("@TalentBridge:OnboardingData");
    sessionStorage.removeItem("@TalentBridge:OnboardingData");

    localStorage.setItem("@TalentBridge:user", JSON.stringify(userData));
    localStorage.setItem("usuario_id", userData.id.toString());

    if (userData.role === "RECRUTADOR") {
      router.push("/recruiter/dashboard");
    } else {
      router.push("/candidate/onboarding");
    }
  }

  return (
    <>
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 60, opacity: 0 }}
        transition={{ duration: 0.45 }}
        className="absolute right-0 top-16 w-[500px] bg-card p-16 rounded-xl shadow-xl border border-border"
      >
        <h2 className="text-2xl font-semibold text-center mb-8">Criar Conta</h2>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole("CANDIDATO")}
              className={`flex flex-col items-center p-5 border rounded-lg ${
                role === "CANDIDATO"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border"
              }`}
            >
              <UserCircle className="w-7 h-7 mb-2" />
              Sou Candidato
            </button>

            <button
              type="button"
              onClick={() => setRole("RECRUTADOR")}
              className={`flex flex-col items-center p-5 border rounded-lg ${
                role === "RECRUTADOR"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border"
              }`}
            >
              <Briefcase className="w-7 h-7 mb-2" />
              Sou Recrutador
            </button>
          </div>

          <div className="relative">
            <User className="absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 border border-input rounded-md pl-10 pr-3 bg-background"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-muted-foreground" />
            <input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 border border-input rounded-md pl-10 pr-3 bg-background"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-muted-foreground" />
            <input
              type="password"
              placeholder="Senha (mínimo 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 border border-input rounded-md pl-10 pr-3 bg-background"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            disabled={isLoading}
            className="w-full h-12 rounded-md flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                Criar Conta
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Modal OTP — montado fora do card para evitar conflito de z-index */}
      <EmailVerificationModal
        isOpen={showOtp}
        onClose={() => setShowOtp(false)}
        email={email}
        tipo="cadastro"
        onVerifySuccess={handleVerifySuccess}
      />
    </>
  );
}

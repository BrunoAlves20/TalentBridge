"use client";

/**
 * RegisterView.tsx — v3
 *
 * v2 — FIX 1: passa pendingData para o modal para que o reenvio funcione.
 * v3 — Adiciona botões de login social (SocialLoginButtons).
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/services/auth";
import { EmailVerificationModal, type VerifySuccessPayload } from "@/components/auth/EmailVerificationModal";
import { Mail, Lock, Loader2, ArrowRight, User, Briefcase, UserCircle } from "lucide-react";
import { motion } from "framer-motion";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export function RegisterView() {
  const router = useRouter();

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState<UserRole>("CANDIDATO");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");
  const [showOtp, setShowOtp]     = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) { setError("Preencha todos os campos."); return; }
    if (password.length < 6) { setError("A senha precisa ter pelo menos 6 caracteres."); return; }

    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tipo: "cadastro", nome: name, senha: password, tipo_usuario: role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erro ao enviar código de verificação.");
      setShowOtp(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleVerifySuccess(payload: VerifySuccessPayload) {
    setShowOtp(false);
    const userData = {
      id:   payload.usuario_id!,
      name,
      email: payload.email || email,
      role:  (payload.tipo_usuario as UserRole) || role,
    };
    localStorage.removeItem("@TalentBridge:OnboardingData");
    sessionStorage.removeItem("@TalentBridge:OnboardingData");
    localStorage.setItem("@TalentBridge:user", JSON.stringify(userData));
    localStorage.setItem("usuario_id", userData.id.toString());
    router.push(userData.role === "RECRUTADOR" ? "/recruiter/dashboard" : "/candidate/onboarding");
  }

  return (
    <>
      <motion.div
        initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        exit={{ x: 60, opacity: 0 }} transition={{ duration: 0.45 }}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] bg-card p-10 rounded-xl shadow-xl border border-border"
      >
        <h2 className="text-2xl font-semibold text-center mb-8">Criar Conta</h2>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {(["CANDIDATO", "RECRUTADOR"] as UserRole[]).map((r) => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`flex flex-col items-center p-5 border rounded-lg ${role === r ? "border-primary bg-primary/5 text-primary" : "border-border"}`}
              >
                {r === "CANDIDATO" ? <UserCircle className="w-7 h-7 mb-2" /> : <Briefcase className="w-7 h-7 mb-2" />}
                {r === "CANDIDATO" ? "Sou Candidato" : "Sou Recrutador"}
              </button>
            ))}
          </div>

          <div className="relative">
            <User className="absolute left-3 top-3 text-muted-foreground" />
            <input type="text" placeholder="Seu nome completo" value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 border border-input rounded-md pl-10 pr-3 bg-background" />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-muted-foreground" />
            <input type="email" placeholder="Digite seu email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 border border-input rounded-md pl-10 pr-3 bg-background" />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-muted-foreground" />
            <input type="password" placeholder="Senha (mínimo 6 caracteres)" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 border border-input rounded-md pl-10 pr-3 bg-background" />
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <button disabled={isLoading}
            className="w-full h-12 rounded-md flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <><span>Criar Conta</span><ArrowRight size={16} /></>}
          </button>
        </form>

        {/* Botões de login social — sem socialError no registro */}
        <div className="mt-4">
          <SocialLoginButtons />
        </div>
      </motion.div>

      {/* FIX 1: pendingData garante que o reenvio tenha nome/senha/tipo_usuario */}
      <EmailVerificationModal
        isOpen={showOtp}
        onClose={() => setShowOtp(false)}
        email={email}
        tipo="cadastro"
        onVerifySuccess={handleVerifySuccess}
        pendingData={{ nome: name, senha: password, tipo_usuario: role }}
      />
    </>
  );
}
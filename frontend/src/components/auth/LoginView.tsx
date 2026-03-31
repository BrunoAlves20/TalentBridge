"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import { Mail, Lock, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function LoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [onboardingNotice, setOnboardingNotice] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    setError("");
    setOnboardingNotice(false);

    try {
      const user = await authService.login(email, password);

      localStorage.setItem("@TalentBridge:user", JSON.stringify(user));
      localStorage.setItem("usuario_id", user.id.toString());

      if (user.role === "RECRUTADOR") {
        router.push("/recruiter/dashboard");
      } else if (user.onboarding_completo) {
        router.push("/candidate/dashboard");
      } else {
        setOnboardingNotice(true);
        router.push("/candidate/onboarding");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao realizar login.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -60, opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="absolute left-0 top-16 w-[500px] bg-card p-24 rounded-xl shadow-xl border border-border"
    >
      <h2 className="text-2xl font-semibold text-center mb-8">Fazer Login</h2>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <input
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 border border-input rounded-md pl-10 pr-3 bg-background focus:ring-2 focus:ring-ring outline-none"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <input
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 border border-input rounded-md pl-10 pr-3 bg-background focus:ring-2 focus:ring-ring outline-none"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {onboardingNotice && (
          <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-500/10 p-3 rounded-md border border-amber-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Por favor, finalize a montagem do seu perfil para acessar a plataforma.</span>
          </div>
        )}

        <button
          disabled={isLoading}
          className="w-full h-12 rounded-md flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <>
              ENTRAR
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}

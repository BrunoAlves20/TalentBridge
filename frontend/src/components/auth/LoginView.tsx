"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth";
import { Mail, Lock, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

interface LoginViewProps {
  onForgotPassword?: () => void;
}

export function LoginView({ onForgotPassword }: LoginViewProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");
  const [onboardingNotice, setOnboardingNotice] = useState(false);

  // Lê o erro de login social vindo da URL (?social_error=cancelled etc.)
  const socialError = searchParams.get("social_error");

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

      // Limpa dados do Onboarding em cache para evitar conflito entre usuários
      localStorage.removeItem("@TalentBridge:OnboardingData");
      sessionStorage.removeItem("@TalentBridge:OnboardingData");

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
      className="relative md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2 w-full md:w-[500px] max-w-[500px] mx-auto bg-card p-6 sm:p-10 md:p-16 lg:p-24 rounded-xl shadow-xl border border-border"
    >
      <h2 className="text-2xl font-semibold text-center mb-8">Fazer Login</h2>

      <form onSubmit={handleLogin} className="space-y-6" noValidate>
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-1.5">
            E-mail
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={18}
              aria-hidden="true"
            />
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              aria-required="true"
              aria-invalid={!!error || undefined}
              aria-describedby={error ? "login-error" : undefined}
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 border border-input rounded-md pl-10 pr-3 bg-background focus:ring-2 focus:ring-ring outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-foreground mb-1.5">
            Senha
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={18}
              aria-hidden="true"
            />
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              aria-required="true"
              aria-invalid={!!error || undefined}
              aria-describedby={error ? "login-error" : undefined}
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 border border-input rounded-md pl-10 pr-3 bg-background focus:ring-2 focus:ring-ring outline-none"
            />
          </div>
        </div>

        {onForgotPassword && (
          <div className="text-right -mt-2">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-indigo-500 hover:text-indigo-600 transition min-h-[44px] inline-flex items-center"
            >
              Esqueceu a senha?
            </button>
          </div>
        )}

        {error && (
          <div
            id="login-error"
            role="alert"
            aria-live="assertive"
            className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20"
          >
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {onboardingNotice && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 text-amber-600 text-sm bg-amber-500/10 p-3 rounded-md border border-amber-500/20"
          >
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Por favor, finalize a montagem do seu perfil para acessar a plataforma.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className="w-full h-12 rounded-md flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5" aria-hidden="true" />
          ) : (
            <>
              ENTRAR
              <ArrowRight size={16} aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {/* Botões de login social com tratamento de erro de URL */}
      <div className="mt-4">
        <SocialLoginButtons socialError={socialError} />
      </div>
    </motion.div>
  );
}
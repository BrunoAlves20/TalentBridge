"use client";

/**
 * app/auth/social/callback/page.tsx
 * ----------------------------------
 * Página intermediária que recebe o redirecionamento do backend após o OAuth.
 *
 * O backend redireciona para:
 *   /auth/social/callback?token=...&user_id=...&nome=...&email=...&role=...&onboarding_completo=true|false
 *
 * Esta página lê os parâmetros, salva no localStorage e redireciona para
 * a rota correta (dashboard ou onboarding).
 */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SocialCallbackPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const token              = searchParams.get("token");
    const userId             = searchParams.get("user_id");
    const nome               = searchParams.get("nome");
    const email              = searchParams.get("email");
    const role               = searchParams.get("role");
    const onboardingCompleto = searchParams.get("onboarding_completo") === "true";

    if (!token || !userId || !email || !role) {
      setError("Dados de autenticação incompletos. Redirecionando...");
      setTimeout(() => router.replace("/auth/login?social_error=dados_incompletos"), 2000);
      return;
    }

    // Persiste a sessão exatamente como o LoginView faz
    const userData = {
      id:                  parseInt(userId, 10),
      name:                decodeURIComponent(nome ?? ""),
      email:               decodeURIComponent(email),
      role,
      onboarding_completo: onboardingCompleto,
    };

    localStorage.removeItem("@TalentBridge:OnboardingData");
    sessionStorage.removeItem("@TalentBridge:OnboardingData");
    localStorage.setItem("@TalentBridge:user", JSON.stringify(userData));
    localStorage.setItem("@TalentBridge:token", token);
    localStorage.setItem("usuario_id", userId);

    // Redireciona conforme o perfil
    if (role === "RECRUTADOR") {
      router.replace("/recruiter/dashboard");
    } else if (onboardingCompleto) {
      router.replace("/candidate/dashboard");
    } else {
      router.replace("/candidate/onboarding");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
      {error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : (
        <>
          <Loader2 className="animate-spin h-8 w-8" />
          <p className="text-sm">Finalizando login social...</p>
        </>
      )}
    </div>
  );
}
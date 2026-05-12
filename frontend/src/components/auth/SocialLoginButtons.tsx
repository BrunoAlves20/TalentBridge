"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

interface SocialLoginButtonsProps {
  /** Mensagem de erro vinda da URL (ex: social_error=cancelled) */
  socialError?: string | null;
}

/**
 * Ícone SVG oficial do Google (seguindo as brand guidelines).
 */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.185l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

/**
 * Ícone SVG oficial do LinkedIn (seguindo as brand guidelines).
 */
function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <rect width="18" height="18" rx="3" fill="#0A66C2" />
      <path
        fill="#fff"
        d="M4.5 7.2H6.6v6.3H4.5V7.2zm1.05-3.15a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1zM7.8 7.2h2.01v.86h.03c.28-.53.96-1.08 1.98-1.08 2.12 0 2.51 1.39 2.51 3.2v3.32h-2.1V10.5c0-.79-.01-1.8-1.1-1.8-1.1 0-1.27.86-1.27 1.74v3.06H7.8V7.2z"
      />
    </svg>
  );
}

export function SocialLoginButtons({ socialError }: SocialLoginButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<"google" | "linkedin" | null>(null);

  function handleSocialLogin(provider: "google" | "linkedin") {
    setLoadingProvider(provider);
    // Redireciona o navegador para o backend, que faz o redirect para o provedor
    window.location.href = `${API_URL}/auth/social/${provider}/login`;
  }

  const errorMessages: Record<string, string> = {
    cancelled:         "Login social cancelado pelo usuário.",
    falha_provedor:    "Não foi possível conectar ao provedor. Tente novamente.",
    dados_incompletos: "Não foi possível obter seus dados do provedor social.",
    banco_indisponivel:"Serviço temporariamente indisponível. Tente mais tarde.",
    erro_interno:      "Ocorreu um erro inesperado. Tente novamente.",
    provider_invalido: "Provedor de login não suportado.",
  };

  const errorMsg = socialError ? (errorMessages[socialError] ?? "Erro no login social.") : null;

  return (
    <div className="w-full space-y-3">
      {/* Mensagem de erro vinda do callback */}
      {errorMsg && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Divisor */}
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">ou continue com</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Botão Google */}
      <button
        type="button"
        onClick={() => handleSocialLogin("google")}
        disabled={loadingProvider !== null}
        aria-label="Continuar com Google"
        className="
          w-full h-11 flex items-center justify-center gap-3 rounded-md border border-border
          bg-background hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed
          text-sm font-medium text-foreground
        "
      >
        {loadingProvider === "google" ? (
          <Loader2 className="animate-spin h-4 w-4" />
        ) : (
          <GoogleIcon />
        )}
        Continuar com Google
      </button>

      {/* Botão LinkedIn */}
      <button
        type="button"
        onClick={() => handleSocialLogin("linkedin")}
        disabled={loadingProvider !== null}
        aria-label="Continuar com LinkedIn"
        className="
          w-full h-11 flex items-center justify-center gap-3 rounded-md border border-border
          bg-background hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed
          text-sm font-medium text-foreground
        "
      >
        {loadingProvider === "linkedin" ? (
          <Loader2 className="animate-spin h-4 w-4" />
        ) : (
          <LinkedInIcon />
        )}
        Continuar com LinkedIn
      </button>
    </div>
  );
}

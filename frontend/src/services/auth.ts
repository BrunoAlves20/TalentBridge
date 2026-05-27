// frontend/src/services/auth.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const TOKEN_KEY = "@TalentBridge:token";

// Cookies usados pelo middleware (server-side) — espelho do localStorage.
const AUTH_COOKIE = "tb_token";
const ROLE_COOKIE = "tb_role";

export type UserRole = "CANDIDATO" | "RECRUTADOR";

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  onboarding_completo?: boolean;
}

/** Lê o JWT do localStorage (somente no cliente). */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Helper para montar headers autenticados em chamadas à API. */
export function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getAuthToken();
  return {
    ...(extra || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Wrapper sobre fetch que injeta o JWT automaticamente e trata 401
 * deslogando o usuário e redirecionando para /auth/login.
 * Use em vez de fetch() para qualquer chamada autenticada.
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (init.body && !headers.has("Content-Type") && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(input, { ...init, headers });
  if (res.status === 401 && typeof window !== "undefined") {
    // Token inválido/expirado — limpa sessão e redireciona.
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("@TalentBridge:user");
    localStorage.removeItem("usuario_id");
    localStorage.removeItem("@TalentBridge:OnboardingData");
    clearSessionCookies();
    const current = window.location.pathname + window.location.search;
    // Evita loop se já estamos na página de login.
    if (!window.location.pathname.startsWith("/auth/")) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(current)}&session_expired=1`;
    }
  }
  return res;
}

/**
 * Persiste a sessão: token no localStorage (para a UI) e em cookies
 * (para o middleware do Next ler server-side e proteger rotas).
 * Chamado por login normal, fluxo OTP e callback social.
 */
export function persistSession(token: string, role: UserRole | string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  // SameSite=Lax + path=/ — não é httpOnly porque o backend não emite Set-Cookie.
  // O middleware só checa presença, não confia no conteúdo (backend valida o JWT).
  const maxAgeSec = 60 * 60 * 8; // 8h (alinhado a JWT_EXPIRE_MINUTES default 60min × margem)
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax`;
  document.cookie = `${ROLE_COOKIE}=${encodeURIComponent(role)}; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax`;
}

/** Limpa cookies de sessão (complemento ao localStorage no logout). */
export function clearSessionCookies() {
  if (typeof window === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${ROLE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/usuarios/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha: password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Erro ao fazer login");

    // Armazena o JWT + cookies para middleware (protege rotas server-side).
    if (data.access_token) {
      persistSession(data.access_token, data.usuario.role);
    }

    return {
      id: data.usuario.id,
      name: data.usuario.nome,
      email: data.usuario.email,
      role: data.usuario.role,
      onboarding_completo: data.usuario.onboarding_completo,
    };
  },

  // O cadastro acontece via fluxo OTP (POST /auth/send-code + /auth/verify-code),
  // chamados diretamente em components/auth/RegisterView.tsx. Não há método
  // register() aqui — o endpoint legado POST /usuarios/cadastro foi removido.

  logout() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("@TalentBridge:user");
    localStorage.removeItem("usuario_id");
    localStorage.removeItem("@TalentBridge:OnboardingData");
    clearSessionCookies();
  },
};

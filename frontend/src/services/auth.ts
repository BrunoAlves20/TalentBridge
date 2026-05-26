// frontend/src/services/auth.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const TOKEN_KEY = "@TalentBridge:token";

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

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/usuarios/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha: password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Erro ao fazer login");

    // Armazena o JWT para chamadas subsequentes (ex.: simulador)
    if (typeof window !== "undefined" && data.access_token) {
      localStorage.setItem(TOKEN_KEY, data.access_token);
    }

    return {
      id: data.usuario.id,
      name: data.usuario.nome,
      email: data.usuario.email,
      role: data.usuario.role,
      onboarding_completo: data.usuario.onboarding_completo,
    };
  },

  async register(name: string, email: string, password: string, role: UserRole) {
    const response = await fetch(`${API_URL}/usuarios/cadastro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: name, email, senha: password, tipo_usuario: role }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Erro ao cadastrar usuário");

    return data; // { mensagem: "...", id: 1 }
  },

  logout() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("@TalentBridge:user");
    localStorage.removeItem("usuario_id");
    localStorage.removeItem("@TalentBridge:OnboardingData");
  },
};

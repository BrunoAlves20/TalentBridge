// frontend/src/services/auth.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export type UserRole = "CANDIDATO" | "RECRUTADOR";

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  onboarding_completo?: boolean;
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
};

// frontend/src/services/simulator.ts
//
// Cliente do Simulador de Entrevistas com IA.
// Todas as rotas exigem JWT (Bearer). Use authHeaders() do auth.ts.

import { authHeaders } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export type Role = "assistant" | "user";

export interface SimulatorMessage {
  id: number;
  role: Role;
  conteudo: string;
  criado_em?: string;
}

export interface SimulatorSession {
  id: number;
  titulo: string | null;
  cargo_alvo: string | null;
  status: "EM_ANDAMENTO" | "FINALIZADA";
  feedback?: string | null;
  criado_em?: string;
  finalizado_em?: string | null;
  mensagens: SimulatorMessage[];
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = "Erro ao processar requisição.";
    try {
      const j = await res.json();
      detail = j.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const simulatorService = {
  async createSession(input: { titulo?: string; cargo_alvo?: string } = {}): Promise<SimulatorSession> {
    const res = await fetch(`${API_URL}/simulador/sessoes`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(input),
    });
    return handle<SimulatorSession>(res);
  },

  async sendMessage(sessaoId: number, conteudo: string): Promise<SimulatorSession> {
    const res = await fetch(`${API_URL}/simulador/sessoes/${sessaoId}/mensagens`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ conteudo }),
    });
    return handle<SimulatorSession>(res);
  },

  async finalize(sessaoId: number): Promise<SimulatorSession> {
    const res = await fetch(`${API_URL}/simulador/sessoes/${sessaoId}/finalizar`, {
      method: "POST",
      headers: authHeaders(),
    });
    return handle<SimulatorSession>(res);
  },

  async getSession(sessaoId: number): Promise<SimulatorSession> {
    const res = await fetch(`${API_URL}/simulador/sessoes/${sessaoId}`, {
      headers: authHeaders(),
    });
    return handle<SimulatorSession>(res);
  },
};

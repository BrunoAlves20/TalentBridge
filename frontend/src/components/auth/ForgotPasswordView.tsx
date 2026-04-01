"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, KeyRound, Lock, Loader2, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type Stage = "email" | "codigo" | "nova-senha" | "sucesso";

interface ForgotPasswordViewProps {
  onBack: () => void;
}

export function ForgotPasswordView({ onBack }: ForgotPasswordViewProps) {
  const [stage, setStage] = useState<Stage>("email");

  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Etapa 1: solicitar código ──────────────────────────────────────────────
  async function handleSolicitarCodigo(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError("Informe seu e-mail."); return; }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/usuarios/esqueceu-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erro ao solicitar código.");
      // O backend retorna encontrado: false se o e-mail não existir no banco
      if (data.encontrado === false) {
        setError("Nenhuma conta encontrada com este e-mail.");
        return;
      }
      setStage("codigo");
    } catch (err: any) {
      setError(err?.message || "Erro ao solicitar código.");
    } finally {
      setIsLoading(false);
    }
  }

  // ── Etapa 2: verificar código ──────────────────────────────────────────────
  async function handleVerificarCodigo(e: React.FormEvent) {
    e.preventDefault();
    if (codigo.length !== 6) { setError("O código deve ter 6 dígitos."); return; }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/usuarios/verificar-codigo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Código inválido ou expirado.");
      setStage("nova-senha");
    } catch (err: any) {
      setError(err?.message || "Código inválido.");
    } finally {
      setIsLoading(false);
    }
  }

  // ── Etapa 3: redefinir senha ───────────────────────────────────────────────
  async function handleRedefinirSenha(e: React.FormEvent) {
    e.preventDefault();
    if (novaSenha.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    if (novaSenha !== confirmarSenha) { setError("As senhas não coincidem."); return; }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/usuarios/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo, nova_senha: novaSenha }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erro ao redefinir senha.");
      setStage("sucesso");
    } catch (err: any) {
      setError(err?.message || "Erro ao redefinir senha.");
    } finally {
      setIsLoading(false);
    }
  }

  // ── Renderização por etapa ─────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -60, opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-card p-14 rounded-xl shadow-xl border border-border"
    >
      {/* Indicador de etapas */}
      {stage !== "sucesso" && (
        <div className="flex items-center gap-2 mb-8">
          {(["email", "codigo", "nova-senha"] as Stage[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  stage === s
                    ? "bg-indigo-600 text-white"
                    : ["email", "codigo", "nova-senha"].indexOf(stage) > i
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {["email", "codigo", "nova-senha"].indexOf(stage) > i ? "✓" : i + 1}
              </div>
              {i < 2 && <div className="h-px w-8 bg-border" />}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ── Etapa 1: E-mail ─────────────────────────────── */}
        {stage === "email" && (
          <motion.div key="email" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <h2 className="text-2xl font-semibold mb-2">Esqueceu a senha?</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Informe seu e-mail e enviaremos um código de verificação.
            </p>
            <form onSubmit={handleSolicitarCodigo} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <input
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 border border-input rounded-md pl-10 pr-3 bg-background focus:ring-2 focus:ring-ring outline-none"
                />
              </div>
              {error && <ErrorMessage message={error} />}
              <button
                disabled={isLoading}
                className="w-full h-12 rounded-md flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <><span>Enviar código</span><ArrowRight size={16} /></>}
              </button>
              <button type="button" onClick={onBack} className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
                <ArrowLeft size={14} /> Voltar ao login
              </button>
            </form>
          </motion.div>
        )}

        {/* ── Etapa 2: Código ─────────────────────────────── */}
        {stage === "codigo" && (
          <motion.div key="codigo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <h2 className="text-2xl font-semibold mb-2">Digite o código</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Enviamos um código de 6 dígitos para <strong>{email}</strong>.
            </p>
            <form onSubmit={handleVerificarCodigo} className="space-y-5">
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                  className="w-full h-12 border border-input rounded-md pl-10 pr-3 bg-background focus:ring-2 focus:ring-ring outline-none tracking-[0.4em] text-center font-mono text-lg"
                />
              </div>
              {error && <ErrorMessage message={error} />}
              <button
                disabled={isLoading}
                className="w-full h-12 rounded-md flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <><span>Verificar código</span><ArrowRight size={16} /></>}
              </button>
              <button type="button" onClick={() => { setStage("email"); setError(""); }} className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
                <ArrowLeft size={14} /> Reenviar código
              </button>
            </form>
          </motion.div>
        )}

        {/* ── Etapa 3: Nova senha ──────────────────────────── */}
        {stage === "nova-senha" && (
          <motion.div key="nova-senha" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <h2 className="text-2xl font-semibold mb-2">Nova senha</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Crie uma nova senha para a sua conta.
            </p>
            <form onSubmit={handleRedefinirSenha} className="space-y-5">
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <input
                  type="password"
                  placeholder="Nova senha (mínimo 6 caracteres)"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full h-12 border border-input rounded-md pl-10 pr-3 bg-background focus:ring-2 focus:ring-ring outline-none"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <input
                  type="password"
                  placeholder="Confirmar nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full h-12 border border-input rounded-md pl-10 pr-3 bg-background focus:ring-2 focus:ring-ring outline-none"
                />
              </div>
              {error && <ErrorMessage message={error} />}
              <button
                disabled={isLoading}
                className="w-full h-12 rounded-md flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <><span>Redefinir senha</span><ArrowRight size={16} /></>}
              </button>
            </form>
          </motion.div>
        )}

        {/* ── Sucesso ──────────────────────────────────────── */}
        {stage === "sucesso" && (
          <motion.div key="sucesso" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-8 gap-5">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Senha redefinida!</h2>
              <p className="text-muted-foreground text-sm">Sua senha foi atualizada com sucesso. Faça login com a nova senha.</p>
            </div>
            <button
              onClick={onBack}
              className="w-full h-12 rounded-md flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition"
            >
              Ir para o Login <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

"use client";

/**
 * EmailVerificationModal.tsx — v2
 *
 * FIX 1 — Reenvio: recebe `pendingData` como prop e o repassa no body do
 *          POST /auth/send-code. Sem isso o reenvio de cadastro falhava com
 *          400 "informe nome, senha e tipo_usuario".
 */

import { useEffect, useRef, useState, useCallback, KeyboardEvent, ClipboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, AlertCircle, Mail, RefreshCw } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";
const TIMER_SEGUNDOS = 120;

type VerifyStatus = "idle" | "loading" | "success" | "error";
type ResendStatus = "idle" | "loading" | "sent" | "error";

export interface VerifySuccessPayload {
  mensagem: string;
  usuario_id?: number;
  email?: string;
  tipo_usuario?: string;
  novo_email?: string;
}

/** Dados extras repassados no body do /auth/send-code durante reenvio */
export interface OtpPendingData {
  nome?: string;
  senha?: string;
  tipo_usuario?: string;
  novo_email?: string;
  usuario_id?: number;
}

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  tipo: "cadastro" | "recuperacao" | "alteracao_email";
  onVerifySuccess: (payload: VerifySuccessPayload) => void;
  /**
   * FIX 1 — Dados pendentes para reenvio.
   * cadastro:        { nome, senha, tipo_usuario }
   * alteracao_email: { novo_email, usuario_id }
   * recuperacao:     { senha }
   */
  pendingData?: OtpPendingData;
}

const TITULO: Record<string, string> = {
  cadastro: "Confirmar Cadastro",
  recuperacao: "Redefinir Senha",
  alteracao_email: "Confirmar Novo E-mail",
};

const DESCRICAO: Record<string, string> = {
  cadastro: "Enviamos um código de 6 dígitos para o e-mail informado para confirmar seu cadastro.",
  recuperacao: "Enviamos um código de 6 dígitos para redefinir sua senha.",
  alteracao_email: "Enviamos um código de 6 dígitos para o novo e-mail informado.",
};

export function EmailVerificationModal({
  isOpen,
  onClose,
  email,
  tipo,
  onVerifySuccess,
  pendingData = {},
}: EmailVerificationModalProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [segundosRestantes, setSegundosRestantes] = useState(TIMER_SEGUNDOS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("idle");
  const [resendStatus, setResendStatus] = useState<ResendStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const codigoCompleto = digits.join("");
  const timerExpirado = segundosRestantes === 0;
  const podeVerificar = codigoCompleto.length === 6 && verifyStatus !== "loading" && verifyStatus !== "success";

  const iniciarTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSegundosRestantes(TIMER_SEGUNDOS);
    timerRef.current = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (isOpen) {
      iniciarTimer();
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isOpen, iniciarTimer]);

  useEffect(() => {
    if (!isOpen) {
      setDigits(Array(6).fill(""));
      setVerifyStatus("idle");
      setResendStatus("idle");
      setErrorMsg("");
    }
  }, [isOpen]);

  // DEV_MODE: pré-preenche os campos com 000000 ao abrir o modal
  useEffect(() => {
    if (isOpen && DEV_MODE) {
      setDigits(["0", "0", "0", "0", "0", "0"]);
    }
  }, [isOpen]);

  const timerFormatado = `${String(Math.floor(segundosRestantes / 60)).padStart(2, "0")}:${String(
    segundosRestantes % 60
  ).padStart(2, "0")}`;

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const novoDigits = [...digits];
    novoDigits[index] = digit;
    setDigits(novoDigits);
    if (errorMsg) setErrorMsg("");
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const novoDigits = [...digits];
        novoDigits[index] = "";
        setDigits(novoDigits);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const novoDigits = [...digits];
        novoDigits[index - 1] = "";
        setDigits(novoDigits);
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const texto = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!texto) return;
    const novoDigits = Array(6).fill("");
    texto.split("").forEach((char, i) => { novoDigits[i] = char; });
    setDigits(novoDigits);
    const proximoVazio = novoDigits.findIndex((d) => !d);
    setTimeout(() => inputRefs.current[proximoVazio === -1 ? 5 : proximoVazio]?.focus(), 0);
  }

  async function handleVerificar() {
    if (!podeVerificar) return;
    setVerifyStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo: codigoCompleto, tipo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Código inválido ou expirado.");
      setVerifyStatus("success");
      setTimeout(() => onVerifySuccess(data as VerifySuccessPayload), 800);
    } catch (err: unknown) {
      setVerifyStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erro ao verificar o código.");
      setDigits(Array(6).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }

  // FIX 1: inclui pendingData no body para que o backend aceite o reenvio
  async function handleReenviar() {
    if (!timerExpirado || resendStatus === "loading") return;
    setResendStatus("loading");
    setErrorMsg("");
    try {
      const body: Record<string, unknown> = { email, tipo, ...pendingData };

      const res = await fetch(`${API_URL}/auth/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erro ao reenviar o código.");

      setResendStatus("sent");
      setDigits(Array(6).fill(""));
      setVerifyStatus("idle");
      iniciarTimer();

      // DEV_MODE: pré-preenche novamente após reenvio
      if (DEV_MODE) {
        setDigits(["0", "0", "0", "0", "0", "0"]);
      }

      setTimeout(() => inputRefs.current[0]?.focus(), 100);
      setTimeout(() => setResendStatus("idle"), 3000);
    } catch (err: unknown) {
      setResendStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erro ao reenviar o código.");
      setTimeout(() => setResendStatus("idle"), 4000);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
            onClick={() => { if (verifyStatus !== "loading") onClose(); }}
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-[210] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-8">

              {verifyStatus !== "loading" && verifyStatus !== "success" && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition"
                  aria-label="Fechar modal"
                ><X size={18} /></button>
              )}

              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                  <Mail className="text-indigo-600 dark:text-indigo-400" size={26} />
                </div>
              </div>

              <h2 className="text-xl font-semibold text-center text-foreground mb-2">{TITULO[tipo]}</h2>
              <p className="text-sm text-center text-muted-foreground mb-1">{DESCRICAO[tipo]}</p>
              <p className="text-sm text-center font-medium text-indigo-600 dark:text-indigo-400 mb-6 break-all">{email}</p>

              {DEV_MODE && (
                <p className="text-xs text-center text-amber-500 mb-4">
                  ⚙ Modo dev — campos pré-preenchidos com 000000
                </p>
              )}

              {verifyStatus === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 py-6"
                >
                  <CheckCircle2 className="text-green-500" size={48} />
                  <p className="text-green-600 dark:text-green-400 font-medium text-center">Código verificado com sucesso!</p>
                </motion.div>
              ) : (
                <>
                  <div className="flex justify-center gap-3 mb-5">
                    {digits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={i === 0 ? handlePaste : undefined}
                        disabled={verifyStatus === "loading"}
                        className={`w-11 text-center text-xl font-bold border rounded-lg bg-background focus:outline-none transition
                          ${verifyStatus === "error" ? "border-red-400 focus:ring-2 focus:ring-red-400" : "border-input focus:ring-2 focus:ring-indigo-500"}
                          disabled:opacity-50 disabled:cursor-not-allowed`}
                        style={{ height: "3.25rem" }}
                      />
                    ))}
                  </div>

                  <AnimatePresence>
                    {errorMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4"
                      >
                        <AlertCircle size={15} className="shrink-0" /><span>{errorMsg}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleVerificar} disabled={!podeVerificar}
                    className="w-full h-12 rounded-lg flex items-center justify-center gap-2 font-medium
                      bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition
                      disabled:opacity-40 disabled:cursor-not-allowed mb-4"
                  >
                    {verifyStatus === "loading" ? <><Loader2 className="animate-spin" size={18} />Verificando...</> : "Verificar Código"}
                  </button>

                  <div className="flex flex-col items-center gap-2">
                    {!timerExpirado ? (
                      <p className="text-sm text-muted-foreground">
                        Código expira em{" "}
                        <span className={`font-mono font-semibold ${segundosRestantes <= 30 ? "text-red-500" : "text-foreground"}`}>
                          {timerFormatado}
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm text-amber-600 dark:text-amber-400">O código expirou. Solicite um novo abaixo.</p>
                    )}

                    <button
                      onClick={handleReenviar}
                      disabled={!timerExpirado || resendStatus === "loading"}
                      className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400
                        hover:underline transition disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                    >
                      {resendStatus === "loading" ? <><Loader2 className="animate-spin" size={14} />Reenviando...</>
                        : resendStatus === "sent" ? <><CheckCircle2 size={14} className="text-green-500" /><span className="text-green-600 dark:text-green-400">Código reenviado!</span></>
                        : resendStatus === "error" ? <><AlertCircle size={14} />Erro ao reenviar</>
                        : <><RefreshCw size={14} />Reenviar código</>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
"use client";

/**
 * EmailVerificationModal.tsx
 * --------------------------
 * Modal reutilizável de verificação OTP de 6 dígitos.
 *
 * Props:
 *   isOpen          — controla visibilidade
 *   onClose         — chamado ao fechar (X ou clique fora)
 *   email           — e-mail que receberá / recebeu o código
 *   tipo            — 'cadastro' | 'recuperacao' | 'alteracao_email'
 *   onVerifySuccess — callback chamado após verificação bem-sucedida
 *                     recebe o objeto de resposta do backend
 *
 * Fluxo:
 *   1. Modal abre → timer de 2 min começa imediatamente
 *   2. Usuário digita os 6 dígitos (foco automático, backspace, paste)
 *   3. Ao completar os 6 campos → botão "Verificar" fica ativo
 *   4. "Reenviar" só habilita após o timer chegar a 00:00
 *   5. Ao reenviar → novo código, timer reinicia
 */

import { useEffect, useRef, useState, useCallback, KeyboardEvent, ClipboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, AlertCircle, Mail, RefreshCw } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const TIMER_SEGUNDOS = 120; // 2 minutos

type VerifyStatus = "idle" | "loading" | "success" | "error";
type ResendStatus = "idle" | "loading" | "sent" | "error";

export interface VerifySuccessPayload {
  mensagem: string;
  usuario_id?: number;
  email?: string;
  tipo_usuario?: string;
  novo_email?: string;
}

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  tipo: "cadastro" | "recuperacao" | "alteracao_email";
  onVerifySuccess: (payload: VerifySuccessPayload) => void;
}

// ── Label por tipo ────────────────────────────────────────────────────────────
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
}: EmailVerificationModalProps) {
  // 6 inputs individuais
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer
  const [segundosRestantes, setSegundosRestantes] = useState(TIMER_SEGUNDOS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Status
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("idle");
  const [resendStatus, setResendStatus] = useState<ResendStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const codigoCompleto = digits.join("");
  const timerExpirado = segundosRestantes === 0;
  const podeVerificar = codigoCompleto.length === 6 && verifyStatus !== "loading" && verifyStatus !== "success";

  // ── Timer ─────────────────────────────────────────────────────────────────

  const iniciarTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSegundosRestantes(TIMER_SEGUNDOS);
    timerRef.current = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (isOpen) {
      iniciarTimer();
      // Foca o primeiro input ao abrir
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, iniciarTimer]);

  // Reset ao fechar
  useEffect(() => {
    if (!isOpen) {
      setDigits(Array(6).fill(""));
      setVerifyStatus("idle");
      setResendStatus("idle");
      setErrorMsg("");
    }
  }, [isOpen]);

  // ── Formata o timer para MM:SS ────────────────────────────────────────────

  const timerFormatado = `${String(Math.floor(segundosRestantes / 60)).padStart(2, "0")}:${String(
    segundosRestantes % 60
  ).padStart(2, "0")}`;

  // ── Handlers dos inputs ───────────────────────────────────────────────────

  function handleChange(index: number, value: string) {
    // Aceita apenas dígitos
    const digit = value.replace(/\D/g, "").slice(-1);
    const novoDigits = [...digits];
    novoDigits[index] = digit;
    setDigits(novoDigits);

    // Limpa erro ao digitar
    if (errorMsg) setErrorMsg("");

    // Avança foco
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        // Apaga o dígito atual
        const novoDigits = [...digits];
        novoDigits[index] = "";
        setDigits(novoDigits);
      } else if (index > 0) {
        // Volta ao anterior e apaga
        inputRefs.current[index - 1]?.focus();
        const novoDigits = [...digits];
        novoDigits[index - 1] = "";
        setDigits(novoDigits);
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const texto = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!texto) return;

    const novoDigits = Array(6).fill("");
    texto.split("").forEach((char, i) => {
      novoDigits[i] = char;
    });
    setDigits(novoDigits);

    // Foca o último dígito colado (ou o próximo campo vazio)
    const proximoVazio = novoDigits.findIndex((d) => !d);
    const focusIndex = proximoVazio === -1 ? 5 : proximoVazio;
    setTimeout(() => inputRefs.current[focusIndex]?.focus(), 0);
  }

  // ── Verificar código ──────────────────────────────────────────────────────

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

      if (!res.ok) {
        throw new Error(data.detail || "Código inválido ou expirado.");
      }

      setVerifyStatus("success");
      // Pequeno delay para o usuário ver o feedback visual de sucesso
      setTimeout(() => {
        onVerifySuccess(data as VerifySuccessPayload);
      }, 800);
    } catch (err: unknown) {
      setVerifyStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erro ao verificar o código.");
      // Limpa os campos e volta ao primeiro input
      setDigits(Array(6).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }

  // ── Reenviar código ───────────────────────────────────────────────────────

  async function handleReenviar() {
    if (!timerExpirado || resendStatus === "loading") return;
    setResendStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/auth/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tipo }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Erro ao reenviar o código.");
      }

      setResendStatus("sent");
      setDigits(Array(6).fill(""));
      setVerifyStatus("idle");
      iniciarTimer();
      setTimeout(() => inputRefs.current[0]?.focus(), 100);

      // Reset do label "Código reenviado" após 3s
      setTimeout(() => setResendStatus("idle"), 3000);
    } catch (err: unknown) {
      setResendStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erro ao reenviar o código.");
      setTimeout(() => setResendStatus("idle"), 4000);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (verifyStatus !== "loading") onClose();
            }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-8">

              {/* Botão fechar */}
              {verifyStatus !== "loading" && verifyStatus !== "success" && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition"
                  aria-label="Fechar modal"
                >
                  <X size={18} />
                </button>
              )}

              {/* Ícone do topo */}
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                  <Mail className="text-indigo-600 dark:text-indigo-400" size={26} />
                </div>
              </div>

              {/* Título e descrição */}
              <h2 className="text-xl font-semibold text-center text-foreground mb-2">
                {TITULO[tipo]}
              </h2>
              <p className="text-sm text-center text-muted-foreground mb-1">
                {DESCRICAO[tipo]}
              </p>
              <p className="text-sm text-center font-medium text-indigo-600 dark:text-indigo-400 mb-6 break-all">
                {email}
              </p>

              {/* Estado de sucesso */}
              {verifyStatus === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 py-6"
                >
                  <CheckCircle2 className="text-green-500" size={48} />
                  <p className="text-green-600 dark:text-green-400 font-medium text-center">
                    Código verificado com sucesso!
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Inputs de dígitos */}
                  <div className="flex justify-center gap-3 mb-5">
                    {digits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={i === 0 ? handlePaste : undefined}
                        disabled={verifyStatus === "loading"}
                        className={`w-11 h-13 text-center text-xl font-bold border rounded-lg
                          bg-background focus:outline-none transition
                          ${verifyStatus === "error"
                            ? "border-red-400 focus:ring-2 focus:ring-red-400"
                            : "border-input focus:ring-2 focus:ring-indigo-500"
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed`}
                        style={{ height: "3.25rem" }}
                      />
                    ))}
                  </div>

                  {/* Mensagem de erro */}
                  <AnimatePresence>
                    {errorMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4"
                      >
                        <AlertCircle size={15} className="shrink-0" />
                        <span>{errorMsg}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Botão verificar */}
                  <button
                    onClick={handleVerificar}
                    disabled={!podeVerificar}
                    className="w-full h-12 rounded-lg flex items-center justify-center gap-2 font-medium
                      bg-gradient-to-r from-indigo-600 to-purple-600 text-white
                      hover:opacity-90 transition
                      disabled:opacity-40 disabled:cursor-not-allowed mb-4"
                  >
                    {verifyStatus === "loading" ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Verificando...
                      </>
                    ) : (
                      "Verificar Código"
                    )}
                  </button>

                  {/* Timer e reenvio */}
                  <div className="flex flex-col items-center gap-2">
                    {!timerExpirado ? (
                      <p className="text-sm text-muted-foreground">
                        Código expira em{" "}
                        <span className={`font-mono font-semibold ${segundosRestantes <= 30 ? "text-red-500" : "text-foreground"}`}>
                          {timerFormatado}
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        O código expirou. Solicite um novo abaixo.
                      </p>
                    )}

                    <button
                      onClick={handleReenviar}
                      disabled={!timerExpirado || resendStatus === "loading"}
                      className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400
                        hover:underline transition
                        disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                    >
                      {resendStatus === "loading" ? (
                        <>
                          <Loader2 className="animate-spin" size={14} />
                          Reenviando...
                        </>
                      ) : resendStatus === "sent" ? (
                        <>
                          <CheckCircle2 size={14} className="text-green-500" />
                          <span className="text-green-600 dark:text-green-400">Código reenviado!</span>
                        </>
                      ) : resendStatus === "error" ? (
                        <>
                          <AlertCircle size={14} />
                          Erro ao reenviar
                        </>
                      ) : (
                        <>
                          <RefreshCw size={14} />
                          Reenviar código
                        </>
                      )}
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

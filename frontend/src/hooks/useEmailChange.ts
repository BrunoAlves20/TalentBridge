/**
 * useEmailChange.ts
 * -----------------
 * Hook que encapsula o fluxo completo de alteração de e-mail com OTP:
 *
 *   1. Usuário informa o novo e-mail e clica em "Alterar"
 *   2. Hook chama POST /auth/send-code → backend envia código para o NOVO e-mail
 *   3. Modal OTP é aberto (controlado pelo state `otpOpen`)
 *   4. Usuário insere o código → POST /auth/verify-code → backend atualiza o e-mail
 *   5. Hook atualiza o localStorage e chama `onSuccess(novoEmail)`
 *
 * Uso:
 *   const { otpOpen, otpEmail, isLoading, error, iniciarAlteracao, handleOtpSuccess, fecharOtp } = useEmailChange({
 *     usuarioId,
 *     onSuccess: (novoEmail) => setUserEmail(novoEmail),
 *   });
 */

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

interface UseEmailChangeOptions {
  usuarioId: string | number | null;
  onSuccess?: (novoEmail: string) => void;
}

export function useEmailChange({ usuarioId, onSuccess }: UseEmailChangeOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState(""); // novo e-mail para o qual o OTP foi enviado

  /**
   * Etapa 1: valida o novo e-mail e envia o código OTP.
   * Abre o modal OTP se o envio for bem-sucedido.
   */
  async function iniciarAlteracao(novoEmail: string): Promise<void> {
    if (!novoEmail || !novoEmail.includes("@")) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (!usuarioId) {
      setError("Sessão inválida. Faça login novamente.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: novoEmail,   // e-mail que receberá o código
          tipo: "alteracao_email",
          novo_email: novoEmail,
          usuario_id: Number(usuarioId),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erro ao enviar código de verificação.");

      setOtpEmail(novoEmail);
      setOtpOpen(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar alteração de e-mail.");
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Etapa 2: chamado pelo EmailVerificationModal após verificação bem-sucedida.
   * O backend já atualizou o e-mail no banco; aqui atualizamos o estado local.
   */
  function handleOtpSuccess(payload: { novo_email?: string }) {
    const emailAtualizado = payload.novo_email || otpEmail;

    // Atualiza o localStorage para manter a sessão sincronizada
    try {
      const raw = localStorage.getItem("@TalentBridge:user");
      if (raw) {
        const user = JSON.parse(raw);
        user.email = emailAtualizado;
        localStorage.setItem("@TalentBridge:user", JSON.stringify(user));
      }
    } catch {
      // Falha silenciosa — o dado do banco já foi atualizado
    }

    setOtpOpen(false);
    setOtpEmail("");
    onSuccess?.(emailAtualizado);
  }

  function fecharOtp() {
    setOtpOpen(false);
  }

  function limparErro() {
    setError("");
  }

  return {
    isLoading,
    error,
    otpOpen,
    otpEmail,
    iniciarAlteracao,
    handleOtpSuccess,
    fecharOtp,
    limparErro,
  };
}

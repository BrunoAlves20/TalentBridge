"""
email_service.py
----------------
Serviço centralizado de envio de e-mails via Gmail (SMTP + App Password).

Variáveis de ambiente necessárias no .env:
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=seuemail@gmail.com
    SMTP_PASS=sua_senha_de_app   ← gere em https://myaccount.google.com/apppasswords
    EMAIL_FROM=TalentBridge <seuemail@gmail.com>

Uso:
    from services.email_service import enviar_codigo_verificacao
    enviar_codigo_verificacao(destinatario="user@ex.com", codigo="482910", tipo="cadastro")
"""

import os
import secrets
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

EXPIRACAO_MINUTOS = 2  # tempo exibido no e-mail (deve ser igual ao do router)


# ── Geração de código seguro ──────────────────────────────────────────────────

def gerar_codigo_otp() -> str:
    """
    Gera um código numérico de 6 dígitos criptograficamente seguro.
    Usa secrets.randbelow(900000) + 100000 para garantir sempre 6 dígitos.
    """
    return str(secrets.randbelow(900_000) + 100_000)


# ── Templates de e-mail ───────────────────────────────────────────────────────

def _template_cadastro(codigo: str) -> tuple[str, str]:
    """Retorna (assunto, html) para o tipo cadastro."""
    assunto = "Confirme seu cadastro — TalentBridge"
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; margin: 0;">
        <div style="max-width: 480px; margin: auto; background: white;
                    border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,.1);">
          <h2 style="color: #4f46e5; margin: 0 0 4px;">TalentBridge</h2>
          <p style="color: #6b7280; margin: 0 0 28px; font-size: 14px;">Plataforma de Recrutamento Inteligente</p>
          <h3 style="color: #111827; margin: 0 0 16px;">Confirme seu cadastro</h3>
          <p style="color: #374151; line-height: 1.6;">
            Bem-vindo! Use o código abaixo para confirmar seu e-mail e concluir o cadastro.
            Ele é válido por <strong>{EXPIRACAO_MINUTOS} minutos</strong>.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <span style="font-size: 38px; font-weight: bold; letter-spacing: 12px;
                         color: #4f46e5; background: #eef2ff; padding: 18px 28px;
                         border-radius: 10px; display: inline-block;">
              {codigo}
            </span>
          </div>
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">
            Se você não criou esta conta, ignore este e-mail com segurança.
          </p>
        </div>
      </body>
    </html>
    """
    return assunto, html


def _template_recuperacao(codigo: str) -> tuple[str, str]:
    """Retorna (assunto, html) para o tipo recuperacao."""
    assunto = "Redefinição de senha — TalentBridge"
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; margin: 0;">
        <div style="max-width: 480px; margin: auto; background: white;
                    border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,.1);">
          <h2 style="color: #4f46e5; margin: 0 0 4px;">TalentBridge</h2>
          <p style="color: #6b7280; margin: 0 0 28px; font-size: 14px;">Plataforma de Recrutamento Inteligente</p>
          <h3 style="color: #111827; margin: 0 0 16px;">Redefinição de Senha</h3>
          <p style="color: #374151; line-height: 1.6;">
            Recebemos uma solicitação para redefinir a senha da sua conta.
            Use o código abaixo — válido por <strong>{EXPIRACAO_MINUTOS} minutos</strong>.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <span style="font-size: 38px; font-weight: bold; letter-spacing: 12px;
                         color: #4f46e5; background: #eef2ff; padding: 18px 28px;
                         border-radius: 10px; display: inline-block;">
              {codigo}
            </span>
          </div>
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">
            Se você não solicitou esta redefinição, ignore este e-mail. Sua senha permanece inalterada.
          </p>
        </div>
      </body>
    </html>
    """
    return assunto, html


def _template_alteracao_email(codigo: str) -> tuple[str, str]:
    """Retorna (assunto, html) para o tipo alteracao_email."""
    assunto = "Confirme seu novo e-mail — TalentBridge"
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; margin: 0;">
        <div style="max-width: 480px; margin: auto; background: white;
                    border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,.1);">
          <h2 style="color: #4f46e5; margin: 0 0 4px;">TalentBridge</h2>
          <p style="color: #6b7280; margin: 0 0 28px; font-size: 14px;">Plataforma de Recrutamento Inteligente</p>
          <h3 style="color: #111827; margin: 0 0 16px;">Confirme seu novo e-mail</h3>
          <p style="color: #374151; line-height: 1.6;">
            Para concluir a alteração do seu endereço de e-mail, insira o código abaixo.
            Ele é válido por <strong>{EXPIRACAO_MINUTOS} minutos</strong>.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <span style="font-size: 38px; font-weight: bold; letter-spacing: 12px;
                         color: #4f46e5; background: #eef2ff; padding: 18px 28px;
                         border-radius: 10px; display: inline-block;">
              {codigo}
            </span>
          </div>
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">
            Se você não solicitou esta alteração, ignore este e-mail.
          </p>
        </div>
      </body>
    </html>
    """
    return assunto, html


_TEMPLATES = {
    "cadastro": _template_cadastro,
    "recuperacao": _template_recuperacao,
    "alteracao_email": _template_alteracao_email,
}


# ── Envio ─────────────────────────────────────────────────────────────────────

def enviar_codigo_verificacao(destinatario: str, codigo: str, tipo: str) -> None:
    """
    Envia um e-mail com o código OTP para o destinatário.

    Args:
        destinatario: endereço de e-mail do receptor.
        codigo:       string de 6 dígitos gerada por gerar_codigo_otp().
        tipo:         'cadastro' | 'recuperacao' | 'alteracao_email'

    Raises:
        RuntimeError: se as variáveis SMTP não estiverem configuradas.
        Exception:    se o servidor SMTP rejeitar o envio.
    """
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASS", "")
    email_from = os.getenv("EMAIL_FROM", smtp_user)

    if not smtp_user or not smtp_pass:
        raise RuntimeError(
            "Variáveis SMTP_USER e SMTP_PASS não configuradas no .env. "
            "Gere uma Senha de App em https://myaccount.google.com/apppasswords"
        )

    template_fn = _TEMPLATES.get(tipo, _template_cadastro)
    assunto, html_body = template_fn(codigo)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = assunto
    msg["From"] = email_from
    msg["To"] = destinatario
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, destinatario, msg.as_string())
        logger.info(f"[EmailService] Código '{tipo}' enviado para {destinatario}")
    except smtplib.SMTPAuthenticationError:
        logger.error("[EmailService] Falha de autenticação SMTP. Verifique SMTP_USER e SMTP_PASS.")
        raise
    except smtplib.SMTPException as exc:
        logger.error(f"[EmailService] Erro SMTP ao enviar para {destinatario}: {exc}")
        raise

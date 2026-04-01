"""
=============================================================================
REDEFINIÇÃO DE SENHA — VERSÃO DE PRODUÇÃO (com envio real de e-mail)
=============================================================================

COMO ATIVAR:
1. Instale a dependência:
       pip install python-dotenv

2. Crie um arquivo .env na pasta /backend com as seguintes variáveis:

       SMTP_HOST=smtp.gmail.com          # Servidor SMTP do seu provedor
       SMTP_PORT=587                      # Porta (587 = TLS / 465 = SSL)
       SMTP_USER=seuemail@gmail.com       # E-mail remetente
       SMTP_PASS=sua_senha_de_app         # Senha de app (não a senha normal)
       EMAIL_FROM=TalentBridge <seuemail@gmail.com>

   Para Gmail: gere uma "Senha de App" em:
   https://myaccount.google.com/apppasswords

3. No arquivo routers/auth.py, SUBSTITUA o bloco de routers de
   redefinição de senha pelos três endpoints definidos aqui.

   Mais fácil ainda: no main.py, registre este router adicional:
       from routers import auth_email
       app.include_router(auth_email.router)
   E REMOVA os três endpoints de teste do auth.py.

=============================================================================
"""

import os
import smtplib
import random
import string
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta

import bcrypt
from fastapi import APIRouter, HTTPException
from database import get_db_connection
from schemas import EsqueceuSenhaRequest, VerificarCodigoRequest, RedefinirSenhaRequest

# Carrega variáveis do .env se o python-dotenv estiver instalado
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # Em produção real, garanta que python-dotenv está instalado

router = APIRouter(
    prefix="/usuarios",
    tags=["Autenticação"],
)

EXPIRACAO_MINUTOS = 15


def _gerar_codigo() -> str:
    """Gera um código numérico aleatório de 6 dígitos."""
    return "".join(random.choices(string.digits, k=6))


def _enviar_email_codigo(destinatario: str, codigo: str) -> None:
    """
    Dispara o e-mail com o código de verificação via SMTP.
    Lança uma exceção se o envio falhar.
    """
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASS", "")
    email_from = os.getenv("EMAIL_FROM", smtp_user)

    if not smtp_user or not smtp_pass:
        raise RuntimeError(
            "Variáveis SMTP_USER e SMTP_PASS não configuradas no .env"
        )

    # ── Corpo do e-mail ──────────────────────────────────────────────────────
    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 480px; margin: auto; background: white;
                    border-radius: 12px; padding: 36px; box-shadow: 0 2px 8px rgba(0,0,0,.1);">
          <h2 style="color: #4f46e5; margin-bottom: 8px;">TalentBridge</h2>
          <h3 style="color: #111; margin-bottom: 24px;">Redefinição de Senha</h3>
          <p style="color: #555;">
            Recebemos uma solicitação para redefinir a senha da sua conta.
            Use o código abaixo — ele é válido por <strong>{EXPIRACAO_MINUTOS} minutos</strong>.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px;
                         color: #4f46e5; background: #eef2ff; padding: 16px 28px;
                         border-radius: 8px;">
              {codigo}
            </span>
          </div>
          <p style="color: #999; font-size: 13px;">
            Se você não solicitou esta redefinição, ignore este e-mail.
            Sua senha não será alterada.
          </p>
        </div>
      </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Código de Redefinição de Senha — TalentBridge"
    msg["From"] = email_from
    msg["To"] = destinatario
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    # ── Envio via SMTP com TLS ───────────────────────────────────────────────
    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.ehlo()
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_user, destinatario, msg.as_string())


# =============================================================================
# ENDPOINTS
# =============================================================================

@router.post("/esqueceu-senha")
def esqueceu_senha(dados: EsqueceuSenhaRequest):
    """
    [PRODUÇÃO] Gera um código aleatório de 6 dígitos e envia ao e-mail do usuário.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (dados.email,))
        usuario = cursor.fetchone()

        # Resposta genérica por segurança (não revela se o e-mail existe)
        if not usuario:
            return {"mensagem": "Se este e-mail estiver cadastrado, você receberá um código."}

        # Invalida códigos antigos do mesmo usuário
        cursor.execute(
            "DELETE FROM codigos_redefinicao_senha WHERE usuario_id = %s",
            (usuario["id"],)
        )

        # Gera e persiste o novo código
        codigo = _gerar_codigo()
        expira_em = datetime.now() + timedelta(minutes=EXPIRACAO_MINUTOS)
        cursor.execute(
            "INSERT INTO codigos_redefinicao_senha (usuario_id, codigo, expira_em) VALUES (%s, %s, %s)",
            (usuario["id"], codigo, expira_em)
        )
        conn.commit()

        # Envia o e-mail — se falhar, faz rollback e retorna 502
        try:
            _enviar_email_codigo(dados.email, codigo)
        except Exception as mail_err:
            conn.rollback()
            raise HTTPException(
                status_code=502,
                detail=f"Não foi possível enviar o e-mail de redefinição. Detalhes: {str(mail_err)}"
            )

        return {"mensagem": "Se este e-mail estiver cadastrado, você receberá um código."}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.post("/verificar-codigo")
def verificar_codigo(dados: VerificarCodigoRequest):
    """
    Valida o código informado (sem consumi-lo).
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (dados.email,))
        usuario = cursor.fetchone()
        if not usuario:
            raise HTTPException(status_code=400, detail="Código inválido ou expirado.")

        cursor.execute(
            """
            SELECT id FROM codigos_redefinicao_senha
            WHERE usuario_id = %s AND codigo = %s AND usado = FALSE AND expira_em > NOW()
            """,
            (usuario["id"], dados.codigo)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=400, detail="Código inválido ou expirado.")

        return {"mensagem": "Código válido. Você pode redefinir sua senha."}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.post("/redefinir-senha")
def redefinir_senha(dados: RedefinirSenhaRequest):
    """
    Redefine a senha após validação do código. Marca o código como usado.
    """
    if len(dados.nova_senha) < 6:
        raise HTTPException(status_code=400, detail="A nova senha precisa ter pelo menos 6 caracteres.")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (dados.email,))
        usuario = cursor.fetchone()
        if not usuario:
            raise HTTPException(status_code=400, detail="Código inválido ou expirado.")

        cursor.execute(
            """
            SELECT id FROM codigos_redefinicao_senha
            WHERE usuario_id = %s AND codigo = %s AND usado = FALSE AND expira_em > NOW()
            """,
            (usuario["id"], dados.codigo)
        )
        registro = cursor.fetchone()
        if not registro:
            raise HTTPException(status_code=400, detail="Código inválido ou expirado.")

        nova_hash = bcrypt.hashpw(dados.nova_senha.encode("utf-8"), bcrypt.gensalt())
        cursor.execute(
            "UPDATE usuarios SET senha_hash = %s WHERE id = %s",
            (nova_hash.decode("utf-8"), usuario["id"])
        )
        cursor.execute(
            "UPDATE codigos_redefinicao_senha SET usado = TRUE WHERE id = %s",
            (registro["id"],)
        )
        conn.commit()
        return {"mensagem": "Senha redefinida com sucesso!"}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    finally:
        cursor.close()
        conn.close()

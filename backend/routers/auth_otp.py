"""
routers/auth_otp.py — v2
-------------------------
Correções aplicadas:

  FIX 1 — Reenvio de cadastro: o endpoint send-code já recebia nome/senha/tipo_usuario
           no payload original. O fix está no frontend (EmailVerificationModal pendingData).
           Nenhuma alteração necessária aqui para o FIX 1.

  FIX 2 — Recuperação de senha: a resposta genérica ("se este e-mail estiver cadastrado…")
           foi substituída por um HTTP 404 explícito quando o e-mail não existe.
           Isso permite que o ForgotPasswordView exiba o erro ao usuário em vez de
           avançar silenciosamente para o modal OTP.

  FIX 3 — alteracao_email: já estava correto (valida Hunter + duplicata antes de enviar).
           Nenhuma alteração necessária.
"""

import os
import json
from datetime import datetime, timedelta

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from jose import JWTError

from database import get_db_connection
from services.email_service import gerar_codigo_otp, enviar_codigo_verificacao
from services.auth_service import hash_password, create_access_token, decode_access_token
from services.hunter_service import verify_email as hunter_verify

router = APIRouter(
    prefix="/auth",
    tags=["OTP / Verificação"],
)

EXPIRACAO_MINUTOS = 2
COOLDOWN_SEGUNDOS = 120

DEV_MODE = os.getenv("DEV_MODE", "false").lower() == "true"


# ── Schemas ───────────────────────────────────────────────────────────────────

class SendCodeRequest(BaseModel):
    email: EmailStr
    tipo: str
    nome: Optional[str] = None
    senha: Optional[str] = None
    tipo_usuario: Optional[str] = None
    novo_email: Optional[str] = None
    usuario_id: Optional[int] = None


class VerifyCodeRequest(BaseModel):
    email: EmailStr
    codigo: str
    tipo: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_usuario_id_por_email(cursor, email: str) -> Optional[int]:
    cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
    row = cursor.fetchone()
    return row["id"] if row else None


def _checar_cooldown(cursor, ref_id: str, tipo: str) -> None:
    cursor.execute(
        """
        SELECT criado_em FROM codigos_verificacao
        WHERE ref_id = %s AND tipo = %s AND usado = FALSE
        ORDER BY criado_em DESC LIMIT 1
        """,
        (str(ref_id), tipo),
    )
    row = cursor.fetchone()
    if row:
        criado = row["criado_em"]
        if isinstance(criado, str):
            criado = datetime.fromisoformat(criado)
        segundos_passados = (datetime.now() - criado.replace(tzinfo=None)).total_seconds()
        if segundos_passados < COOLDOWN_SEGUNDOS:
            restante = int(COOLDOWN_SEGUNDOS - segundos_passados)
            raise HTTPException(
                status_code=429,
                detail=f"Aguarde {restante} segundos antes de solicitar um novo código.",
            )


def _salvar_codigo(cursor, ref_id: str, codigo: str, tipo: str, dados_pendentes: Optional[dict]) -> None:
    cursor.execute(
        "UPDATE codigos_verificacao SET usado = TRUE WHERE ref_id = %s AND tipo = %s AND usado = FALSE",
        (str(ref_id), tipo),
    )
    expira_em = datetime.now() + timedelta(minutes=EXPIRACAO_MINUTOS)
    cursor.execute(
        """
        INSERT INTO codigos_verificacao (ref_id, codigo, tipo, expira_em, dados_pendentes)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (
            str(ref_id),
            codigo,
            tipo,
            expira_em,
            json.dumps(dados_pendentes) if dados_pendentes else None,
        ),
    )


# ── POST /auth/send-code ──────────────────────────────────────────────────────

def _exigir_auth_alteracao_email(tipo: str, usuario_id: int | None, authorization: str | None) -> None:
    """
    Para tipo=alteracao_email exige JWT válido cujo sub bate com usuario_id.
    Outros tipos (cadastro/recuperacao) são públicos.
    """
    if tipo != "alteracao_email":
        return
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Token de autenticação obrigatório para alterar e-mail.")
    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = decode_access_token(token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido.")
    sub = int(payload.get("sub") or 0)
    if not usuario_id or sub != usuario_id:
        raise HTTPException(status_code=403, detail="Você só pode alterar o e-mail da sua própria conta.")


@router.post("/send-code", status_code=200)
def send_code(dados: SendCodeRequest, authorization: str | None = Header(default=None)):
    tipo = dados.tipo
    if tipo not in ("cadastro", "recuperacao", "alteracao_email"):
        raise HTTPException(status_code=400, detail="Tipo inválido. Use: cadastro | recuperacao | alteracao_email")

    _exigir_auth_alteracao_email(tipo, dados.usuario_id, authorization)

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:

        # ── MODO DE DESENVOLVIMENTO ───────────────────────────────────────────
        if DEV_MODE:
            # Determina o ref_id conforme o tipo (igual ao fluxo real)
            if tipo == "cadastro":
                ref_id = dados.email
                dados_pendentes = {
                    "nome": dados.nome or "Dev User",
                    "email": dados.email,
                    "senha": dados.senha or "dev123",
                    "tipo_usuario": dados.tipo_usuario or "CANDIDATO",
                }
            elif tipo == "recuperacao":
                usuario_id = _get_usuario_id_por_email(cursor, dados.email)
                if not usuario_id:
                    raise HTTPException(
                        status_code=404,
                        detail="Não encontramos uma conta com este e-mail.",
                    )
                ref_id = usuario_id
                dados_pendentes = {"nova_senha": dados.senha}
            else:  # alteracao_email
                ref_id = dados.usuario_id
                dados_pendentes = {"novo_email": dados.novo_email}

            _salvar_codigo(cursor, ref_id, "000000", tipo, dados_pendentes)
            conn.commit()
            return {"mensagem": f"[DEV] Código 000000 gerado para {tipo}. Nenhum e-mail enviado."}
        # ── FIM MODO DE DESENVOLVIMENTO ───────────────────────────────────────

        # ── CADASTRO ──────────────────────────────────────────────────────────
        if tipo == "cadastro":
            if not dados.nome or not dados.senha or not dados.tipo_usuario:
                raise HTTPException(
                    status_code=400,
                    detail="Para cadastro, informe: nome, senha e tipo_usuario.",
                )
            if not hunter_verify(dados.email):
                raise HTTPException(
                    status_code=400,
                    detail="Este e-mail não parece ser real. Use um e-mail válido.",
                )
            cursor.execute("SELECT id FROM usuarios WHERE email = %s", (dados.email,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

            ref_id = dados.email
            _checar_cooldown(cursor, ref_id, tipo)

            codigo = gerar_codigo_otp()
            _salvar_codigo(cursor, ref_id, codigo, tipo, {
                "nome": dados.nome,
                "email": dados.email,
                "senha": dados.senha,
                "tipo_usuario": dados.tipo_usuario,
            })
            # Enviar ANTES de commitar — se SMTP falhar, o rollback no except
            # impede de gravar um código que o usuário nunca receberá.
            enviar_codigo_verificacao(dados.email, codigo, tipo)
            conn.commit()
            return {"mensagem": "Código de verificação enviado para o e-mail informado."}

        # ── RECUPERAÇÃO DE SENHA ──────────────────────────────────────────────
        if tipo == "recuperacao":
            if not dados.senha:
                raise HTTPException(
                    status_code=400,
                    detail="Para recuperacao, informe a nova senha desejada.",
                )

            usuario_id = _get_usuario_id_por_email(cursor, dados.email)

            # FIX 2: retorna 404 explícito para que o frontend exiba o erro ao usuário.
            # A resposta genérica anterior ("se este e-mail estiver cadastrado…") impedia
            # o frontend de saber se deveria abrir o modal OTP ou mostrar erro.
            if not usuario_id:
                raise HTTPException(
                    status_code=404,
                    detail="Não encontramos uma conta com este e-mail. Verifique e tente novamente.",
                )

            _checar_cooldown(cursor, usuario_id, tipo)

            codigo = gerar_codigo_otp()
            _salvar_codigo(cursor, usuario_id, codigo, tipo, {"nova_senha": dados.senha})
            # Enviar antes de commitar — se SMTP falhar, rollback impede
            # gravar código que o usuário nunca receberá.
            enviar_codigo_verificacao(dados.email, codigo, tipo)
            conn.commit()
            return {"mensagem": "Código enviado. Verifique sua caixa de entrada."}

        # ── ALTERAÇÃO DE E-MAIL ───────────────────────────────────────────────
        if tipo == "alteracao_email":
            if not dados.novo_email or not dados.usuario_id:
                raise HTTPException(
                    status_code=400,
                    detail="Para alteracao_email, informe: novo_email e usuario_id.",
                )
            # Verifica duplicata
            cursor.execute("SELECT id FROM usuarios WHERE email = %s", (dados.novo_email,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Este e-mail já está em uso por outra conta.")

            # Valida com Hunter (e-mail ainda não verificado)
            if not hunter_verify(dados.novo_email):
                raise HTTPException(
                    status_code=400,
                    detail="O novo e-mail não parece ser real. Use um e-mail válido.",
                )

            _checar_cooldown(cursor, dados.usuario_id, tipo)

            codigo = gerar_codigo_otp()
            _salvar_codigo(cursor, dados.usuario_id, codigo, tipo, {"novo_email": dados.novo_email})
            # Código enviado para o NOVO e-mail (é ele que precisa ser confirmado).
            # Enviar antes de commitar (rollback se SMTP falhar).
            enviar_codigo_verificacao(dados.novo_email, codigo, tipo)
            conn.commit()
            return {"mensagem": "Código enviado para o novo e-mail. Verifique sua caixa de entrada."}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    finally:
        cursor.close()
        conn.close()


# ── POST /auth/verify-code ────────────────────────────────────────────────────

@router.post("/verify-code", status_code=200)
def verify_code(dados: VerifyCodeRequest, authorization: str | None = Header(default=None)):
    tipo = dados.tipo
    if tipo not in ("cadastro", "recuperacao", "alteracao_email"):
        raise HTTPException(status_code=400, detail="Tipo inválido.")
    if len(dados.codigo) != 6 or not dados.codigo.isdigit():
        raise HTTPException(status_code=400, detail="O código deve conter exatamente 6 dígitos.")

    # Para alteracao_email exige JWT. Validamos contra o usuario_id contido
    # em dados_pendentes mais tarde (depois de carregar o registro).
    auth_user_id_para_alteracao: int | None = None
    if tipo == "alteracao_email":
        if not authorization or not authorization.lower().startswith("bearer "):
            raise HTTPException(status_code=401, detail="Token de autenticação obrigatório para alterar e-mail.")
        token = authorization.split(" ", 1)[1].strip()
        try:
            payload = decode_access_token(token)
        except JWTError:
            raise HTTPException(status_code=401, detail="Token inválido.")
        auth_user_id_para_alteracao = int(payload.get("sub") or 0)

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        if tipo == "cadastro":
            ref_id = dados.email
        elif tipo == "alteracao_email":
            # Para alteracao_email, dados.email é o NOVO e-mail (não existe no banco ainda).
            # O ref_id salvo em send-code foi o usuario_id (int). Recuperamos buscando
            # pelo novo_email dentro de dados_pendentes via JSON_EXTRACT.
            cursor.execute(
                """
                SELECT ref_id FROM codigos_verificacao
                WHERE tipo = 'alteracao_email' AND codigo = %s AND usado = FALSE
                  AND JSON_UNQUOTE(JSON_EXTRACT(dados_pendentes, '$.novo_email')) = %s
                ORDER BY criado_em DESC LIMIT 1
                """,
                (dados.codigo, dados.email),
            )
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=400, detail="Código incorreto. Verifique e tente novamente.")
            ref_id = row["ref_id"]
            # Bloqueia troca de e-mail de outra conta: ref_id (usuario_id salvo
            # no send-code) deve bater com o sub do JWT.
            try:
                ref_id_int = int(ref_id)
            except (TypeError, ValueError):
                raise HTTPException(status_code=400, detail="Referência inválida.")
            if auth_user_id_para_alteracao != ref_id_int:
                raise HTTPException(status_code=403, detail="Você só pode confirmar alteração da sua própria conta.")
        else:
            # recuperacao: dados.email é o e-mail atual já cadastrado no banco
            ref_id = _get_usuario_id_por_email(cursor, dados.email)
            if not ref_id:
                raise HTTPException(status_code=400, detail="Código inválido ou expirado.")

        cursor.execute(
            """
            SELECT id, dados_pendentes, expira_em
            FROM codigos_verificacao
            WHERE ref_id = %s AND codigo = %s AND tipo = %s AND usado = FALSE
            ORDER BY criado_em DESC LIMIT 1
            """,
            (str(ref_id), dados.codigo, tipo),
        )
        registro = cursor.fetchone()

        if not registro:
            raise HTTPException(status_code=400, detail="Código incorreto. Verifique e tente novamente.")

        expira_em = registro["expira_em"]
        if isinstance(expira_em, str):
            expira_em = datetime.fromisoformat(expira_em)
        if datetime.now() > expira_em.replace(tzinfo=None):
            raise HTTPException(status_code=400, detail="Este código expirou. Solicite um novo.")

        cursor.execute("UPDATE codigos_verificacao SET usado = TRUE WHERE id = %s", (registro["id"],))

        raw = registro["dados_pendentes"]
        pendentes: dict = json.loads(raw) if raw else {}

        if tipo == "cadastro":
            nome        = pendentes.get("nome", "")
            email       = pendentes.get("email", dados.email)
            senha       = pendentes.get("senha", "")
            tipo_usuario = pendentes.get("tipo_usuario", "CANDIDATO")
            if not nome or not senha:
                raise HTTPException(status_code=400, detail="Dados de cadastro ausentes. Reinicie o fluxo.")
            cursor.execute(
                "INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario) VALUES (%s, %s, %s, %s)",
                (nome, email, hash_password(senha), tipo_usuario),
            )
            novo_id = cursor.lastrowid

            # Cria a linha de perfil correspondente já no cadastro, para que
            # exista um registro mínimo em perfis_candidatos / perfis_recrutadores
            # mesmo antes do onboarding. Os campos são preenchidos depois.
            if tipo_usuario == "RECRUTADOR":
                # empresa e cargo são NOT NULL no schema → usa string vazia como placeholder.
                cursor.execute(
                    """
                    INSERT IGNORE INTO perfis_recrutadores
                        (usuario_id, empresa, cargo, telefone, site_empresa, foto_perfil)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (novo_id, "", "", None, None, None),
                )
            else:
                cursor.execute(
                    """
                    INSERT IGNORE INTO perfis_candidatos
                        (usuario_id, telefone, genero, idade, estado, cidade, cep,
                         linkedin, github, portfolio, sobre_mim, foto_perfil)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (novo_id, None, None, None, None, None, None,
                     None, None, None, None, None),
                )

            conn.commit()

            # Gera o JWT do usuário recém-cadastrado para que ele já
            # entre logado no sistema (sem precisar passar pelo /usuarios/login).
            access_token = create_access_token(
                user_id=novo_id,
                email=email,
                role=tipo_usuario,
            )

            return {
                "mensagem": "Cadastro confirmado com sucesso!",
                "usuario_id": novo_id,
                "email": email,
                "tipo_usuario": tipo_usuario,
                "access_token": access_token,
                "token_type": "bearer",
            }

        if tipo == "recuperacao":
            nova_senha = pendentes.get("nova_senha", "")
            if not nova_senha or len(nova_senha) < 6:
                raise HTTPException(status_code=400, detail="Senha inválida nos dados pendentes. Reinicie o fluxo.")
            cursor.execute("UPDATE usuarios SET senha_hash = %s WHERE id = %s", (hash_password(nova_senha), ref_id))
            conn.commit()
            return {"mensagem": "Senha redefinida com sucesso!"}

        if tipo == "alteracao_email":
            novo_email = pendentes.get("novo_email", "")
            if not novo_email:
                raise HTTPException(status_code=400, detail="Novo e-mail ausente nos dados pendentes. Reinicie o fluxo.")
            cursor.execute("UPDATE usuarios SET email = %s WHERE id = %s", (novo_email, ref_id))
            conn.commit()
            return {"mensagem": "E-mail alterado com sucesso!", "novo_email": novo_email}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    finally:
        cursor.close()
        conn.close()
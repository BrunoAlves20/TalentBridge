"""
routers/auth_otp.py
--------------------
Endpoints de verificação OTP por e-mail para três fluxos:
  • cadastro        — confirma o e-mail antes de criar o usuário
  • recuperacao     — valida identidade antes de redefinir senha
  • alteracao_email — confirma o novo e-mail antes de atualizá-lo no banco

Prefixo: /auth
Tags:    ["OTP / Verificação"]

Regras de negócio implementadas:
  ✔ Bloqueio de reenvio (cooldown de 120 s — igual ao timer do frontend)
  ✔ Atomicidade: dados sensíveis só são gravados após validação do código
  ✔ Expiração verificada exclusivamente no backend
  ✔ Código consumido (usado=TRUE) imediatamente após uso
  ✔ Geração segura via secrets.randbelow()
"""

import json
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional

from database import get_db_connection
from services.email_service import gerar_codigo_otp, enviar_codigo_verificacao
from services.auth_service import hash_password
from services.hunter_service import verify_email as hunter_verify

router = APIRouter(
    prefix="/auth",
    tags=["OTP / Verificação"],
)

# Tempo de vida do código em minutos — deve ser igual ao EXPIRACAO_MINUTOS do email_service
EXPIRACAO_MINUTOS = 2

# Cooldown mínimo entre reenvios (segundos) — evita spam de API
COOLDOWN_SEGUNDOS = 120


# ── Schemas ───────────────────────────────────────────────────────────────────

class SendCodeRequest(BaseModel):
    email: EmailStr
    tipo: str  # 'cadastro' | 'recuperacao' | 'alteracao_email'
    # Campos opcionais usados para persistência temporária (dados pendentes)
    nome: Optional[str] = None          # cadastro
    senha: Optional[str] = None         # cadastro | recuperacao
    tipo_usuario: Optional[str] = None  # cadastro
    novo_email: Optional[str] = None    # alteracao_email
    usuario_id: Optional[int] = None    # recuperacao | alteracao_email


class VerifyCodeRequest(BaseModel):
    email: EmailStr
    codigo: str
    tipo: str  # 'cadastro' | 'recuperacao' | 'alteracao_email'


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_usuario_id_por_email(cursor, email: str) -> Optional[int]:
    cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
    row = cursor.fetchone()
    return row["id"] if row else None


def _checar_cooldown(cursor, usuario_id_ref: str, tipo: str) -> None:
    """
    Verifica se já existe um código recente (dentro do cooldown) para evitar reenvio abusivo.
    usuario_id_ref pode ser o ID real ou um e-mail (para cadastros ainda não criados).
    """
    cursor.execute(
        """
        SELECT criado_em FROM codigos_verificacao
        WHERE ref_id = %s AND tipo = %s AND usado = FALSE
        ORDER BY criado_em DESC LIMIT 1
        """,
        (str(usuario_id_ref), tipo),
    )
    row = cursor.fetchone()
    if row:
        criado = row["criado_em"]
        # Normaliza para datetime sem timezone
        if isinstance(criado, str):
            criado = datetime.fromisoformat(criado)
        agora = datetime.now()
        segundos_passados = (agora - criado.replace(tzinfo=None)).total_seconds()
        if segundos_passados < COOLDOWN_SEGUNDOS:
            restante = int(COOLDOWN_SEGUNDOS - segundos_passados)
            raise HTTPException(
                status_code=429,
                detail=f"Aguarde {restante} segundos antes de solicitar um novo código.",
            )


def _salvar_codigo(cursor, ref_id: str, codigo: str, tipo: str, dados_pendentes: Optional[dict]) -> None:
    """
    Invalida códigos antigos do mesmo tipo e insere o novo código.
    dados_pendentes é serializado como JSON na coluna dados_pendentes.
    """
    # Invalida anteriores (evita acúmulo de registros ativos)
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

@router.post("/send-code", status_code=200)
def send_code(dados: SendCodeRequest):
    """
    Gera e envia um código OTP de 6 dígitos por e-mail.

    Tipos suportados:
      • cadastro        — valida Hunter, bloqueia duplicata, envia código. O usuário
                          NÃO é criado aqui; só será criado em /verify-code.
      • recuperacao     — verifica se o e-mail existe, envia código.
      • alteracao_email — envia código para o NOVO e-mail informado em novo_email.
    """
    tipo = dados.tipo
    if tipo not in ("cadastro", "recuperacao", "alteracao_email"):
        raise HTTPException(status_code=400, detail="Tipo inválido. Use: cadastro | recuperacao | alteracao_email")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        # ── CADASTRO ──────────────────────────────────────────────────────────
        if tipo == "cadastro":
            if not dados.nome or not dados.senha or not dados.tipo_usuario:
                raise HTTPException(
                    status_code=400,
                    detail="Para cadastro, informe: nome, senha e tipo_usuario.",
                )
            # Validação Hunter
            if not hunter_verify(dados.email):
                raise HTTPException(
                    status_code=400,
                    detail="Este e-mail não parece ser real. Use um e-mail válido.",
                )
            # Bloqueia duplicata antes de qualquer coisa
            cursor.execute("SELECT id FROM usuarios WHERE email = %s", (dados.email,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

            # ref_id para cadastro = o próprio e-mail (usuário ainda não existe)
            ref_id = dados.email
            _checar_cooldown(cursor, ref_id, tipo)

            codigo = gerar_codigo_otp()
            dados_pendentes = {
                "nome": dados.nome,
                "email": dados.email,
                "senha": dados.senha,          # será hasheada em /verify-code
                "tipo_usuario": dados.tipo_usuario,
            }
            _salvar_codigo(cursor, ref_id, codigo, tipo, dados_pendentes)
            conn.commit()

            enviar_codigo_verificacao(dados.email, codigo, tipo)
            return {"mensagem": "Código de verificação enviado para o e-mail informado."}

        # ── RECUPERAÇÃO DE SENHA ──────────────────────────────────────────────
        if tipo == "recuperacao":
            if not dados.senha:
                raise HTTPException(
                    status_code=400,
                    detail="Para recuperacao, informe a nova senha desejada.",
                )
            usuario_id = _get_usuario_id_por_email(cursor, dados.email)
            # Resposta genérica por segurança — não revela se o e-mail existe
            if not usuario_id:
                return {"mensagem": "Se este e-mail estiver cadastrado, você receberá um código."}

            _checar_cooldown(cursor, usuario_id, tipo)

            codigo = gerar_codigo_otp()
            dados_pendentes = {"nova_senha": dados.senha}
            _salvar_codigo(cursor, usuario_id, codigo, tipo, dados_pendentes)
            conn.commit()

            enviar_codigo_verificacao(dados.email, codigo, tipo)
            return {"mensagem": "Se este e-mail estiver cadastrado, você receberá um código."}

        # ── ALTERAÇÃO DE E-MAIL ───────────────────────────────────────────────
        if tipo == "alteracao_email":
            if not dados.novo_email or not dados.usuario_id:
                raise HTTPException(
                    status_code=400,
                    detail="Para alteracao_email, informe: novo_email e usuario_id.",
                )
            # Verifica se o novo e-mail já está em uso
            cursor.execute("SELECT id FROM usuarios WHERE email = %s", (dados.novo_email,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Este e-mail já está em uso por outra conta.")

            # Valida o novo e-mail via Hunter
            if not hunter_verify(dados.novo_email):
                raise HTTPException(
                    status_code=400,
                    detail="O novo e-mail não parece ser real. Use um e-mail válido.",
                )

            _checar_cooldown(cursor, dados.usuario_id, tipo)

            codigo = gerar_codigo_otp()
            dados_pendentes = {"novo_email": dados.novo_email}
            _salvar_codigo(cursor, dados.usuario_id, codigo, tipo, dados_pendentes)
            conn.commit()

            # O código é enviado para o NOVO e-mail (é ele que precisa ser confirmado)
            enviar_codigo_verificacao(dados.novo_email, codigo, tipo)
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
def verify_code(dados: VerifyCodeRequest):
    """
    Valida o código OTP e executa a ação final atômica conforme o tipo:
      • cadastro        → cria o usuário na tabela usuarios
      • recuperacao     → atualiza a senha do usuário
      • alteracao_email → atualiza o e-mail do usuário
    """
    tipo = dados.tipo
    if tipo not in ("cadastro", "recuperacao", "alteracao_email"):
        raise HTTPException(status_code=400, detail="Tipo inválido.")

    if len(dados.codigo) != 6 or not dados.codigo.isdigit():
        raise HTTPException(status_code=400, detail="O código deve conter exatamente 6 dígitos.")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        # Define o ref_id conforme o tipo
        if tipo == "cadastro":
            ref_id = dados.email  # e-mail usado como ref antes do usuário existir
        else:
            ref_id_row = _get_usuario_id_por_email(cursor, dados.email)
            if not ref_id_row:
                raise HTTPException(status_code=400, detail="Código inválido ou expirado.")
            ref_id = ref_id_row

        # Busca o código válido
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

        # Verifica expiração no backend (fonte da verdade)
        expira_em = registro["expira_em"]
        if isinstance(expira_em, str):
            expira_em = datetime.fromisoformat(expira_em)
        if datetime.now() > expira_em.replace(tzinfo=None):
            raise HTTPException(
                status_code=400,
                detail="Este código expirou. Solicite um novo.",
            )

        # Marca como usado ANTES de executar a ação (evita race condition)
        cursor.execute(
            "UPDATE codigos_verificacao SET usado = TRUE WHERE id = %s",
            (registro["id"],),
        )

        # Deserializa dados pendentes
        raw = registro["dados_pendentes"]
        pendentes: dict = json.loads(raw) if raw else {}

        # ── Ação final atômica ────────────────────────────────────────────────
        if tipo == "cadastro":
            nome = pendentes.get("nome", "")
            email = pendentes.get("email", dados.email)
            senha = pendentes.get("senha", "")
            tipo_usuario = pendentes.get("tipo_usuario", "CANDIDATO")

            if not nome or not senha:
                raise HTTPException(status_code=400, detail="Dados de cadastro ausentes. Reinicie o fluxo.")

            senha_hash = hash_password(senha)
            cursor.execute(
                "INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario) VALUES (%s, %s, %s, %s)",
                (nome, email, senha_hash, tipo_usuario),
            )
            novo_id = cursor.lastrowid
            conn.commit()
            return {
                "mensagem": "Cadastro confirmado com sucesso!",
                "usuario_id": novo_id,
                "email": email,
                "tipo_usuario": tipo_usuario,
            }

        if tipo == "recuperacao":
            nova_senha = pendentes.get("nova_senha", "")
            if not nova_senha or len(nova_senha) < 6:
                raise HTTPException(status_code=400, detail="Senha inválida nos dados pendentes. Reinicie o fluxo.")

            usuario_id = ref_id
            nova_hash = hash_password(nova_senha)
            cursor.execute(
                "UPDATE usuarios SET senha_hash = %s WHERE id = %s",
                (nova_hash, usuario_id),
            )
            conn.commit()
            return {"mensagem": "Senha redefinida com sucesso!"}

        if tipo == "alteracao_email":
            novo_email = pendentes.get("novo_email", "")
            if not novo_email:
                raise HTTPException(status_code=400, detail="Novo e-mail ausente nos dados pendentes. Reinicie o fluxo.")

            usuario_id = ref_id
            cursor.execute(
                "UPDATE usuarios SET email = %s WHERE id = %s",
                (novo_email, usuario_id),
            )
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

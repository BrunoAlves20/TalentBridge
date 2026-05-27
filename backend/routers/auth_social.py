"""
routers/auth_social.py
-----------------------
Rotas OAuth para login social via Google e LinkedIn.

Fluxo:
  1. GET /auth/social/{provider}/login     → redireciona para o provedor
  2. GET /auth/social/{provider}/callback  → recebe o code, autentica/cria usuário,
                                             redireciona para o frontend com o JWT
"""

import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse

from database import get_db_connection
from services.auth_service import create_access_token
from services.social_auth_service import (
    get_google_auth_url,
    get_linkedin_auth_url,
    get_google_user_info,
    get_linkedin_user_info,
)

router = APIRouter(
    prefix="/auth/social",
    tags=["Login Social"],
)

# URL base do frontend — usada no redirecionamento pós-login
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Provedores suportados
PROVIDERS = ("google", "linkedin")


# ── GET /auth/social/{provider}/login ─────────────────────────────────────────

@router.get("/{provider}/login")
def social_login(provider: str):
    """
    Redireciona o usuário para a página de autorização do provedor social.
    O frontend aponta para esta rota ao clicar em "Continuar com Google/LinkedIn".
    """
    if provider not in PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Provedor '{provider}' não suportado.")

    if provider == "google":
        url = get_google_auth_url()
    else:
        url = get_linkedin_auth_url()

    return RedirectResponse(url)


# ── GET /auth/social/{provider}/callback ──────────────────────────────────────

@router.get("/{provider}/callback")
def social_callback(provider: str, code: str = None, error: str = None):
    """
    Endpoint de callback OAuth.

    Lógica de verificação/criação de usuário:
      1. Busca pelo social_id + social_provider (login recorrente).
      2. Se não achar, busca pelo e-mail:
         a. Se achar → vincula o social_id à conta existente.
         b. Se não achar → cria nova conta sem senha.
      3. Gera JWT e redireciona para o frontend.

    Em caso de erro ou cancelamento pelo usuário, redireciona com ?error=...
    """
    # Usuário cancelou o login no provedor
    if error or not code:
        return RedirectResponse(f"{FRONTEND_URL}/auth/login?social_error=cancelled")

    if provider not in PROVIDERS:
        return RedirectResponse(f"{FRONTEND_URL}/auth/login?social_error=provider_invalido")

    # Obtém dados do perfil do provedor
    try:
        if provider == "google":
            perfil = get_google_user_info(code)
        else:
            perfil = get_linkedin_user_info(code)
    except HTTPException:
        return RedirectResponse(f"{FRONTEND_URL}/auth/login?social_error=falha_provedor")

    social_id = perfil["social_id"]
    email     = perfil["email"]
    nome      = perfil["nome"]

    if not social_id or not email:
        return RedirectResponse(f"{FRONTEND_URL}/auth/login?social_error=dados_incompletos")

    conn = get_db_connection()
    if not conn:
        return RedirectResponse(f"{FRONTEND_URL}/auth/login?social_error=banco_indisponivel")

    cursor = conn.cursor(dictionary=True)
    try:
        usuario = None

        # ── 1. Busca por social_id + provider ─────────────────────────────────
        cursor.execute(
            "SELECT id, nome, email, tipo_usuario FROM usuarios WHERE social_id = %s AND social_provider = %s",
            (social_id, provider),
        )
        usuario = cursor.fetchone()

        if not usuario:
            # ── 2. Busca pelo e-mail ───────────────────────────────────────────
            cursor.execute(
                "SELECT id, nome, email, tipo_usuario FROM usuarios WHERE email = %s",
                (email,),
            )
            usuario_email = cursor.fetchone()

            if usuario_email:
                # 2a. Vincula o social_id à conta existente
                cursor.execute(
                    "UPDATE usuarios SET social_id = %s, social_provider = %s WHERE id = %s",
                    (social_id, provider, usuario_email["id"]),
                )
                conn.commit()
                usuario = usuario_email
            else:
                # 2b. Cria nova conta social (sem senha)
                cursor.execute(
                    """
                    INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario, social_id, social_provider)
                    VALUES (%s, %s, NULL, 'CANDIDATO', %s, %s)
                    """,
                    (nome, email, social_id, provider),
                )
                novo_id = cursor.lastrowid

                # Login social cria sempre como CANDIDATO → cria a linha de
                # perfil mínima para manter consistência com o cadastro normal.
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
                cursor.execute(
                    "SELECT id, nome, email, tipo_usuario FROM usuarios WHERE id = %s",
                    (novo_id,),
                )
                usuario = cursor.fetchone()

        # Verifica se o onboarding foi concluído (cidade preenchida = passou
        # pelo passo 1 do onboarding). A linha pode existir vazia desde o
        # cadastro inicial.
        cursor.execute(
            "SELECT cidade FROM perfis_candidatos WHERE usuario_id = %s",
            (usuario["id"],),
        )
        perfil_row = cursor.fetchone()
        tem_perfil = bool(perfil_row and perfil_row["cidade"])

        # Gera JWT do sistema
        token = create_access_token(
            user_id=usuario["id"],
            email=usuario["email"],
            role=usuario["tipo_usuario"],
        )

        # Redireciona para o frontend passando token e dados básicos via query params
        redirect_base = (
            f"{FRONTEND_URL}/auth/social/callback"
            f"?token={token}"
            f"&user_id={usuario['id']}"
            f"&nome={usuario['nome']}"
            f"&email={usuario['email']}"
            f"&role={usuario['tipo_usuario']}"
            f"&onboarding_completo={'true' if tem_perfil else 'false'}"
        )
        return RedirectResponse(redirect_base)

    except Exception as e:
        # Loga a stack para diagnóstico em produção (sem isso, debug é impossível).
        import logging, traceback
        logging.getLogger(__name__).error(
            "[auth_social] Erro inesperado no callback: %s\n%s", e, traceback.format_exc()
        )
        conn.rollback()
        return RedirectResponse(f"{FRONTEND_URL}/auth/login?social_error=erro_interno")
    finally:
        cursor.close()
        conn.close()

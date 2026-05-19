"""
services/social_auth_service.py
--------------------------------
Lógica de integração com as APIs OAuth do Google e LinkedIn:
  - Construção das URLs de autorização
  - Troca do authorization code pelo access_token
  - Obtenção dos dados de perfil do usuário
"""

import os
import httpx
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

# ── Configurações Google ───────────────────────────────────────────────────────
GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI  = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/social/google/callback")

GOOGLE_AUTH_URL  = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USER_URL  = "https://www.googleapis.com/oauth2/v3/userinfo"
GOOGLE_SCOPES    = "openid profile email"

# ── Configurações LinkedIn ─────────────────────────────────────────────────────
LINKEDIN_CLIENT_ID     = os.getenv("LINKEDIN_CLIENT_ID", "")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET", "")
LINKEDIN_REDIRECT_URI  = os.getenv("LINKEDIN_REDIRECT_URI", "http://localhost:8000/auth/social/linkedin/callback")

LINKEDIN_AUTH_URL  = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_USER_URL  = "https://api.linkedin.com/v2/userinfo"
LINKEDIN_SCOPES    = "openid profile email"


# ── URLs de autorização ────────────────────────────────────────────────────────

def get_google_auth_url() -> str:
    """Retorna a URL de autorização do Google para redirecionar o usuário."""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID não configurado no .env")
    params = (
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope={GOOGLE_SCOPES.replace(' ', '%20')}"
        f"&access_type=offline"
        f"&prompt=select_account"
    )
    return GOOGLE_AUTH_URL + params


def get_linkedin_auth_url() -> str:
    """Retorna a URL de autorização do LinkedIn para redirecionar o usuário."""
    if not LINKEDIN_CLIENT_ID:
        raise HTTPException(status_code=500, detail="LINKEDIN_CLIENT_ID não configurado no .env")
    params = (
        f"?response_type=code"
        f"&client_id={LINKEDIN_CLIENT_ID}"
        f"&redirect_uri={LINKEDIN_REDIRECT_URI}"
        f"&scope={LINKEDIN_SCOPES.replace(' ', '%20')}"
    )
    return LINKEDIN_AUTH_URL + params


# ── Troca de código por token ──────────────────────────────────────────────────

def _exchange_google_code(code: str) -> str:
    """Troca o authorization code do Google por um access_token."""
    with httpx.Client() as client:
        response = client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Falha ao obter token do Google.")
    return response.json().get("access_token", "")


def _exchange_linkedin_code(code: str) -> str:
    """Troca o authorization code do LinkedIn por um access_token."""
    with httpx.Client() as client:
        response = client.post(
            LINKEDIN_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": LINKEDIN_REDIRECT_URI,
                "client_id": LINKEDIN_CLIENT_ID,
                "client_secret": LINKEDIN_CLIENT_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Falha ao obter token do LinkedIn.")
    return response.json().get("access_token", "")


# ── Obtenção de perfil ─────────────────────────────────────────────────────────

def get_google_user_info(code: str) -> dict:
    """
    Dado o authorization code do Google, retorna:
      { "social_id": str, "email": str, "nome": str }
    """
    access_token = _exchange_google_code(code)
    with httpx.Client() as client:
        response = client.get(
            GOOGLE_USER_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Falha ao obter dados do perfil do Google.")
    data = response.json()
    return {
        "social_id": data.get("sub", ""),
        "email":     data.get("email", ""),
        "nome":      data.get("name", data.get("email", "Usuário Google")),
    }


def get_linkedin_user_info(code: str) -> dict:
    """
    Dado o authorization code do LinkedIn, retorna:
      { "social_id": str, "email": str, "nome": str }

    Utiliza o endpoint OpenID Connect /v2/userinfo (LinkedIn OpenID Connect),
    que retorna sub, email e name em uma única chamada — sem necessidade de
    múltiplas requisições às APIs v2 legadas.
    """
    access_token = _exchange_linkedin_code(code)
    with httpx.Client() as client:
        response = client.get(
            LINKEDIN_USER_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Falha ao obter dados do perfil do LinkedIn.")
    data = response.json()
    nome = data.get("name") or f"{data.get('given_name', '')} {data.get('family_name', '')}".strip()
    return {
        "social_id": data.get("sub", ""),
        "email":     data.get("email", ""),
        "nome":      nome or "Usuário LinkedIn",
    }
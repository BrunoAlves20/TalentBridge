"""
Configuração compartilhada pelos testes pytest.

Os testes batem direto na API rodando (DEV_MODE=true) — não há mock de banco.
Para rodar:
    docker compose up -d
    pytest backend/tests/ -v

Variável de ambiente opcional:
    API_BASE_URL=http://localhost:8000  (default)
"""

import os
import time
import uuid
import pytest
import httpx


API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

# Credenciais do seed (todos com a mesma senha).
SEED_PASSWORD = "senha123"
SEED_RECRUTADOR_EMAIL = "ana.recrutadora@techsolutions.com"
SEED_CANDIDATO_EMAIL = "lucas.almeida@exemplo.com"


@pytest.fixture(scope="session")
def client():
    """Cliente HTTP reutilizável apontando para a API rodando."""
    with httpx.Client(base_url=API_BASE_URL, timeout=15.0) as c:
        # Sanity: confirma que a API está de pé.
        r = c.get("/health")
        assert r.status_code == 200, f"API não está respondendo em {API_BASE_URL}"
        yield c


@pytest.fixture(scope="session")
def login_recrutador(client):
    """Loga como Ana (recrutadora do seed) e retorna (id, token, headers)."""
    r = client.post(
        "/usuarios/login",
        json={"email": SEED_RECRUTADOR_EMAIL, "senha": SEED_PASSWORD},
    )
    assert r.status_code == 200, f"Login Ana falhou: {r.text}"
    data = r.json()
    token = data["access_token"]
    user_id = data["usuario"]["id"]
    return {
        "id": user_id,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }


@pytest.fixture(scope="session")
def login_candidato(client):
    """Loga como Lucas (candidato do seed) e retorna (id, token, headers)."""
    r = client.post(
        "/usuarios/login",
        json={"email": SEED_CANDIDATO_EMAIL, "senha": SEED_PASSWORD},
    )
    assert r.status_code == 200, f"Login Lucas falhou: {r.text}"
    data = r.json()
    token = data["access_token"]
    user_id = data["usuario"]["id"]
    return {
        "id": user_id,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }


@pytest.fixture
def novo_email():
    """Gera um e-mail único para testes que criam conta."""
    return f"test.{uuid.uuid4().hex[:12]}@exemplo.com"


@pytest.fixture
def criar_candidato_temp(client, novo_email):
    """
    Cria um candidato novo via fluxo OTP (DEV_MODE: código 000000),
    retorna (id, email, token, headers). Limpa no final.
    """
    payload = {
        "email": novo_email,
        "tipo": "cadastro",
        "nome": "Teste Pytest",
        "senha": "senha123",
        "tipo_usuario": "CANDIDATO",
    }
    r1 = client.post("/auth/send-code", json=payload)
    assert r1.status_code == 200, f"send-code falhou: {r1.text}"

    r2 = client.post(
        "/auth/verify-code",
        json={"email": novo_email, "codigo": "000000", "tipo": "cadastro"},
    )
    assert r2.status_code == 200, f"verify-code falhou: {r2.text}"
    data = r2.json()

    user_info = {
        "id": data["usuario_id"],
        "email": novo_email,
        "token": data["access_token"],
        "headers": {"Authorization": f"Bearer {data['access_token']}"},
    }
    yield user_info

    # Cleanup
    try:
        client.delete(f"/usuarios/{user_info['id']}", headers=user_info["headers"])
    except Exception:
        pass

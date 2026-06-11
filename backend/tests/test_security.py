"""
Testes de segurança: garante que endpoints protegidos rejeitam acesso
sem JWT e que usuários não conseguem acessar dados alheios.
"""

import pytest


# ── 1. Rotas que devem exigir JWT (401 sem header) ──────────────────────────

@pytest.mark.parametrize("method,path", [
    ("PUT",    "/usuarios/senha"),
    ("DELETE", "/usuarios/1"),
    ("GET",    "/usuarios/1/preferencias"),
    ("PUT",    "/usuarios/1/preferencias"),
    ("POST",   "/candidatos/onboarding"),
    ("GET",    "/candidatos/perfil-completo/1"),
    ("PUT",    "/candidatos/perfil-pessoal"),
    ("GET",    "/candidatos/baixar-cv/1"),
    ("GET",    "/candidatos/verificar-cv/1"),
    ("POST",   "/recrutador/vagas"),
    ("PUT",    "/recrutador/vagas/1"),
    ("DELETE", "/recrutador/vagas/1"),
    ("GET",    "/recrutador/minhas-vagas/1"),
    ("GET",    "/recrutador/pipeline/1/candidatos"),
    ("PUT",    "/recrutador/candidaturas/1/status"),
    ("GET",    "/recrutador/dashboard/1"),
    ("GET",    "/recrutador/ranking/1"),
    ("POST",   "/vagas/salvar"),
    ("GET",    "/vagas/salvas/1"),
    ("POST",   "/vagas/candidatar"),
    ("GET",    "/vagas/minhas-candidaturas/1"),
])
def test_endpoint_exige_jwt(client, method, path):
    """Sem header Authorization, todas essas rotas devem retornar 401."""
    r = client.request(method, path, json={})
    assert r.status_code == 401, (
        f"{method} {path} respondeu {r.status_code} (esperado 401). Body: {r.text}"
    )


# ── 2. Rotas que devem permanecer públicas ──────────────────────────────────

@pytest.mark.parametrize("path", [
    "/health",
    "/vagas/abertas",
    "/docs",
])
def test_endpoint_publico_responde_sem_token(client, path):
    r = client.get(path)
    assert r.status_code in (200, 307), (
        f"{path} respondeu {r.status_code} (esperado 200 ou redirect)"
    )


# ── 3. Cross-user access bloqueado ──────────────────────────────────────────

def test_candidato_nao_acessa_dashboard_recrutador(client, login_candidato):
    """Candidato com JWT tenta acessar dashboard de recrutador — deve dar 403."""
    r = client.get(
        f"/recrutador/dashboard/{login_candidato['id']}",
        headers=login_candidato["headers"],
    )
    # require_recrutador deve barrar com 403.
    assert r.status_code == 403


def test_recrutador_nao_edita_vaga_alheia(client, login_recrutador):
    """Recrutador A tenta editar vaga do recrutador B (id=2 do seed) — 404 (escondido)."""
    # vaga 3 do seed pertence ao recrutador 2 (Bruno), não à Ana (id 1)
    r = client.put(
        "/recrutador/vagas/3",
        headers=login_recrutador["headers"],
        json={
            "recrutador_id": login_recrutador["id"],
            "titulo": "Hack",
            "descricao": "x",
            "modalidade": "REMOTO",
            "status": "ABERTA",
        },
    )
    # 404 (recurso não encontrado para esse recrutador) é resposta aceitável.
    assert r.status_code in (403, 404)


def test_recrutador_nao_ve_pipeline_alheio(client, login_recrutador):
    """Tentar ver pipeline de vaga de outro recrutador → 403."""
    r = client.get(
        "/recrutador/pipeline/3/candidatos",  # vaga 3 = Bruno
        headers=login_recrutador["headers"],
    )
    assert r.status_code == 403


def test_candidato_nao_edita_perfil_alheio(client, login_candidato, criar_candidato_temp):
    """Candidato A tenta salvar onboarding com usuario_id do candidato B."""
    vitima = criar_candidato_temp
    payload = {
        "usuario_id": vitima["id"],  # ID da vítima
        "personal": {
            "fullName": "HACKEADO",
            "email": "hack@x.com", "phone": "", "gender": "", "age": "",
            "state": "", "city": "Hackolândia", "zipCode": "",
            "linkedin": "", "github": "", "portfolio": "", "about": "",
        },
        "education": [],
        "experience": [],
        "stacks": [],
        "softSkills": [],
    }
    r = client.post(
        "/candidatos/onboarding",
        headers=login_candidato["headers"],  # Lucas
        json=payload,
    )
    assert r.status_code == 403


def test_token_invalido_devolve_401(client):
    r = client.get(
        "/usuarios/1/preferencias",
        headers={"Authorization": "Bearer token_invalido_aleatorio"},
    )
    assert r.status_code == 401

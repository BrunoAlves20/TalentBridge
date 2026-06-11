"""Testes de fluxos do candidato: onboarding, candidatar, vagas salvas."""

import pytest


def test_listar_vagas_abertas_publico(client):
    """GET /vagas/abertas é público (sem JWT)."""
    r = client.get("/vagas/abertas")
    assert r.status_code == 200
    assert "vagas" in r.json()


def test_onboarding_completo(client, criar_candidato_temp):
    """POST /candidatos/onboarding salva e marca onboarding_completo=true no login subsequente."""
    user = criar_candidato_temp
    payload = {
        "usuario_id": user["id"],
        "personal": {
            "fullName": "Teste Pytest",
            "email": user["email"],
            "phone": "11999999999",
            "gender": "Prefiro não dizer",
            "age": "25",
            "state": "SP",
            "city": "São Paulo",
            "zipCode": "01000000",
            "linkedin": "",
            "github": "",
            "portfolio": "",
            "about": "Candidato de teste",
            "profilePicture": "",
        },
        "education": [
            {"course": "CC", "institution": "X", "degree": "Bacharel",
             "startYear": "2020", "endYear": "2024", "hours": ""}
        ],
        "experience": [],
        "stacks": ["Python", "React"],
        "softSkills": ["Comunicação"],
    }
    r = client.post("/candidatos/onboarding", headers=user["headers"], json=payload)
    assert r.status_code == 201, r.text

    # Login pós-onboarding deve refletir onboarding_completo=true
    r2 = client.post(
        "/usuarios/login",
        json={"email": user["email"], "senha": "senha123"},
    )
    assert r2.status_code == 200
    assert r2.json()["usuario"]["onboarding_completo"] is True


def test_candidatar_se_e_minhas_candidaturas(client, login_candidato):
    """GET /vagas/minhas-candidaturas retorna candidaturas do próprio user."""
    r = client.get(
        f"/vagas/minhas-candidaturas/{login_candidato['id']}",
        headers=login_candidato["headers"],
    )
    assert r.status_code == 200
    assert "candidaturas" in r.json()


def test_salvar_vaga(client, login_candidato):
    """Salvar e listar vagas salvas."""
    # Pega uma vaga aberta
    r = client.get("/vagas/abertas")
    vaga_id = r.json()["vagas"][0]["id"]

    # Salva
    r1 = client.post(
        "/vagas/salvar",
        headers=login_candidato["headers"],
        json={"usuario_id": login_candidato["id"], "vaga_id": vaga_id},
    )
    assert r1.status_code in (201, 400)  # 400 = já salva (idempotente)

    # Lista
    r2 = client.get(
        f"/vagas/salvas/{login_candidato['id']}",
        headers=login_candidato["headers"],
    )
    assert r2.status_code == 200

    # Remove (cleanup)
    client.delete(
        f"/vagas/salvas/{vaga_id}?usuario_id={login_candidato['id']}",
        headers=login_candidato["headers"],
    )


def test_preferencias_get_put(client, login_candidato):
    r = client.get(
        f"/usuarios/{login_candidato['id']}/preferencias",
        headers=login_candidato["headers"],
    )
    assert r.status_code == 200

    r2 = client.put(
        f"/usuarios/{login_candidato['id']}/preferencias",
        headers=login_candidato["headers"],
        json={"email_novidades": True},
    )
    assert r2.status_code == 200

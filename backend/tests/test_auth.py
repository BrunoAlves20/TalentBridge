"""Testes de autenticação: login, fluxo OTP, perfil mínimo, deleção de conta."""

import pytest


def test_login_seed_recrutador(client):
    r = client.post(
        "/usuarios/login",
        json={"email": "ana.recrutadora@techsolutions.com", "senha": "senha123"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert data["usuario"]["role"] == "RECRUTADOR"


def test_login_seed_candidato(client):
    r = client.post(
        "/usuarios/login",
        json={"email": "lucas.almeida@exemplo.com", "senha": "senha123"},
    )
    assert r.status_code == 200
    assert r.json()["usuario"]["role"] == "CANDIDATO"


def test_login_senha_errada(client):
    r = client.post(
        "/usuarios/login",
        json={"email": "ana.recrutadora@techsolutions.com", "senha": "errada"},
    )
    assert r.status_code == 401


def test_login_email_inexistente(client):
    r = client.post(
        "/usuarios/login",
        json={"email": "nao_existe@x.com", "senha": "qualquer"},
    )
    assert r.status_code == 401


def test_otp_cadastro_dev_mode_cria_perfil_candidato(client, novo_email):
    """DEV_MODE: send-code + verify-code (000000) → cria usuário + perfis_candidatos."""
    r1 = client.post(
        "/auth/send-code",
        json={
            "email": novo_email,
            "tipo": "cadastro",
            "nome": "Pytest Cand",
            "senha": "senha123",
            "tipo_usuario": "CANDIDATO",
        },
    )
    assert r1.status_code == 200

    r2 = client.post(
        "/auth/verify-code",
        json={"email": novo_email, "codigo": "000000", "tipo": "cadastro"},
    )
    assert r2.status_code == 200
    data = r2.json()
    assert data["tipo_usuario"] == "CANDIDATO"
    assert "access_token" in data

    novo_id = data["usuario_id"]
    headers = {"Authorization": f"Bearer {data['access_token']}"}

    # Confirma que perfis_candidatos foi criado (vazio) via /perfil-completo.
    r3 = client.get(f"/candidatos/perfil-completo/{novo_id}", headers=headers)
    assert r3.status_code == 200
    # Cidade vazia = onboarding incompleto.
    assert r3.json()["personal"]["city"] == ""

    # Limpa
    client.delete(f"/usuarios/{novo_id}", headers=headers)


def test_otp_cadastro_recrutador(client, novo_email):
    r1 = client.post(
        "/auth/send-code",
        json={
            "email": novo_email,
            "tipo": "cadastro",
            "nome": "Pytest Recrut",
            "senha": "senha123",
            "tipo_usuario": "RECRUTADOR",
        },
    )
    assert r1.status_code == 200
    r2 = client.post(
        "/auth/verify-code",
        json={"email": novo_email, "codigo": "000000", "tipo": "cadastro"},
    )
    assert r2.status_code == 200
    assert r2.json()["tipo_usuario"] == "RECRUTADOR"

    novo_id = r2.json()["usuario_id"]
    headers = {"Authorization": f"Bearer {r2.json()['access_token']}"}
    client.delete(f"/usuarios/{novo_id}", headers=headers)


def test_verify_code_invalido(client, novo_email):
    """verify-code com código não-existente retorna 400."""
    r = client.post(
        "/auth/verify-code",
        json={"email": novo_email, "codigo": "123456", "tipo": "cadastro"},
    )
    assert r.status_code == 400


def test_delete_conta_bug_fix(client, criar_candidato_temp):
    """Regressão: DELETE /usuarios/{id} não pode dar 500 por causa de codigos_verificacao."""
    user = criar_candidato_temp
    r = client.delete(f"/usuarios/{user['id']}", headers=user["headers"])
    # Pode ser 200 (sucesso). NUNCA pode ser 500 (era o bug original).
    assert r.status_code == 200, f"DELETE conta falhou com {r.status_code}: {r.text}"


def test_delete_conta_alheia_bloqueada(client, criar_candidato_temp, login_candidato):
    """Usuário não pode deletar conta de outro."""
    vitima = criar_candidato_temp
    # login_candidato é o Lucas (id != vítima)
    r = client.delete(
        f"/usuarios/{vitima['id']}",
        headers=login_candidato["headers"],
    )
    assert r.status_code == 403

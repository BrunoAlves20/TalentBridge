"""Testes de fluxos do recrutador: CRUD de vagas, pipeline, dashboard."""

import pytest


def test_listar_minhas_vagas(client, login_recrutador):
    r = client.get(
        f"/recrutador/minhas-vagas/{login_recrutador['id']}",
        headers=login_recrutador["headers"],
    )
    assert r.status_code == 200
    vagas = r.json()["vagas"]
    assert len(vagas) >= 1, "Ana do seed deveria ter vagas"


def test_dashboard_traz_candidatos(client, login_recrutador):
    r = client.get(
        f"/recrutador/dashboard/{login_recrutador['id']}",
        headers=login_recrutador["headers"],
    )
    assert r.status_code == 200
    data = r.json()
    assert "candidatos_recentes" in data
    assert "candidatos_por_etapa" in data


def test_crud_vaga_completo(client, login_recrutador):
    """POST → PUT → DELETE de uma vaga."""
    # POST
    r1 = client.post(
        "/recrutador/vagas",
        headers=login_recrutador["headers"],
        json={
            "recrutador_id": login_recrutador["id"],  # ignorado pelo backend
            "titulo": "Vaga Pytest",
            "departamento": "Eng",
            "descricao": "Teste",
            "requisitos": "Python",
            "modalidade": "REMOTO",
            "localizacao": "",
            "faixa_salarial": "",
        },
    )
    assert r1.status_code == 201, r1.text
    vaga_id = r1.json()["id"]

    # PUT
    r2 = client.put(
        f"/recrutador/vagas/{vaga_id}",
        headers=login_recrutador["headers"],
        json={
            "recrutador_id": login_recrutador["id"],
            "titulo": "Vaga Pytest EDIT",
            "departamento": "Eng",
            "descricao": "Teste",
            "requisitos": "Python, FastAPI",
            "modalidade": "REMOTO",
            "localizacao": "",
            "faixa_salarial": "",
            "status": "PAUSADA",
        },
    )
    assert r2.status_code == 200, r2.text

    # DELETE
    r3 = client.delete(
        f"/recrutador/vagas/{vaga_id}",
        headers=login_recrutador["headers"],
    )
    assert r3.status_code == 200


def test_pipeline_de_vaga(client, login_recrutador):
    """Lista candidatos em uma vaga do próprio recrutador."""
    # Pega a primeira vaga do recrutador
    r = client.get(
        f"/recrutador/minhas-vagas/{login_recrutador['id']}",
        headers=login_recrutador["headers"],
    )
    vagas = r.json()["vagas"]
    assert vagas, "Sem vagas para testar pipeline"
    vaga_id = vagas[0]["id"]

    r2 = client.get(
        f"/recrutador/pipeline/{vaga_id}/candidatos",
        headers=login_recrutador["headers"],
    )
    assert r2.status_code == 200
    assert "candidatos" in r2.json()


def test_ranking_recrutador(client, login_recrutador):
    r = client.get(
        f"/recrutador/ranking/{login_recrutador['id']}",
        headers=login_recrutador["headers"],
    )
    assert r.status_code == 200
    assert "ranking" in r.json()


def test_atualizar_status_candidatura_para_novos_status(client, login_recrutador):
    """PROPOSTA e CONTRATADO devem ser aceitos pelo backend."""
    # Pega uma candidatura existente de uma vaga da Ana
    r = client.get(
        f"/recrutador/minhas-vagas/{login_recrutador['id']}",
        headers=login_recrutador["headers"],
    )
    vagas = r.json()["vagas"]
    for v in vagas:
        rp = client.get(
            f"/recrutador/pipeline/{v['id']}/candidatos",
            headers=login_recrutador["headers"],
        )
        candidatos = rp.json()["candidatos"]
        if candidatos:
            cand_id = candidatos[0]["candidatura_id"]
            # Aceita PROPOSTA
            r1 = client.put(
                f"/recrutador/candidaturas/{cand_id}/status",
                headers=login_recrutador["headers"],
                json={"status": "PROPOSTA"},
            )
            assert r1.status_code == 200, r1.text
            # Aceita CONTRATADO
            r2 = client.put(
                f"/recrutador/candidaturas/{cand_id}/status",
                headers=login_recrutador["headers"],
                json={"status": "CONTRATADO"},
            )
            assert r2.status_code == 200, r2.text
            # Restaura
            client.put(
                f"/recrutador/candidaturas/{cand_id}/status",
                headers=login_recrutador["headers"],
                json={"status": "ENVIADO"},
            )
            return
    pytest.skip("Sem candidaturas no seed para testar mudança de status")


def test_rejeita_status_invalido(client, login_recrutador):
    """Backend deve rejeitar status fora do enum."""
    r = client.put(
        "/recrutador/candidaturas/1/status",
        headers=login_recrutador["headers"],
        json={"status": "INVENTADO"},
    )
    assert r.status_code == 422

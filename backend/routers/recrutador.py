from fastapi import APIRouter, Depends, HTTPException
from database import get_db_connection
from dependencies import require_recrutador
from schemas import VagaCreate, VagaUpdate, CandidaturaStatusUpdate

router = APIRouter(
    prefix="/recrutador",
    tags=["Recrutador"],
)

# Filtro unificado para candidatos não rejeitados (Resolve o bug de duplicação BE-06)
FILTRO_CANDIDATOS_ATIVOS = "c.status != 'REJEITADO'"

# ==============================================================================
# VAGAS
# ==============================================================================

@router.post("/vagas", status_code=201)
def criar_vaga(dados: VagaCreate, current_user: dict = Depends(require_recrutador)):
    """
    Cria uma nova vaga associada ao recrutador logado.
    O recrutador_id do payload é ignorado — usamos o sub do JWT.
    """
    recrutador_id = current_user["user_id"]

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO vagas (recrutador_id, titulo, departamento, descricao, requisitos,
                               modalidade, localizacao, faixa_salarial, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'ABERTA')
            """,
            (
                recrutador_id,
                dados.titulo,
                dados.departamento,
                dados.descricao,
                dados.requisitos,
                dados.modalidade,
                dados.localizacao,
                dados.faixa_salarial,
            ),
        )
        conn.commit()
        return {"mensagem": "Vaga criada com sucesso!", "id": cursor.lastrowid}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar vaga: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.put("/vagas/{vaga_id}")
def editar_vaga(vaga_id: int, dados: VagaUpdate, current_user: dict = Depends(require_recrutador)):
    """
    Edita uma vaga existente. Só permite editar vaga do próprio recrutador.
    O recrutador_id do payload é ignorado — usamos o sub do JWT.
    """
    recrutador_id = current_user["user_id"]

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM vagas WHERE id = %s AND recrutador_id = %s",
            (vaga_id, recrutador_id),
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Vaga não encontrada ou sem permissão.")

        cursor.execute(
            """
            UPDATE vagas
            SET titulo = %s, departamento = %s, descricao = %s, requisitos = %s,
                modalidade = %s, localizacao = %s, faixa_salarial = %s, status = %s
            WHERE id = %s
            """,
            (
                dados.titulo,
                dados.departamento,   # ✅ CORRIGIDO: campo estava faltando
                dados.descricao,
                dados.requisitos,
                dados.modalidade,
                dados.localizacao,
                dados.faixa_salarial,
                dados.status,
                vaga_id,
            ),
        )
        conn.commit()
        return {"mensagem": "Vaga atualizada com sucesso!"}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao editar vaga: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.delete("/vagas/{vaga_id}")
def deletar_vaga(vaga_id: int, current_user: dict = Depends(require_recrutador)):
    """
    Exclui uma vaga. Só permite excluir vaga do próprio recrutador.
    Arquiva candidaturas associadas alterando o status para REJEITADO antes de deletar.
    """
    recrutador_id = current_user["user_id"]

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM vagas WHERE id = %s AND recrutador_id = %s",
            (vaga_id, recrutador_id),
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Vaga não encontrada ou sem permissão.")

        cursor.execute(
            "UPDATE candidaturas SET status = 'REJEITADO' WHERE vaga_id = %s",
            (vaga_id,),
        )
        cursor.execute("DELETE FROM vagas WHERE id = %s", (vaga_id,))
        conn.commit()
        return {"mensagem": "Vaga excluída com sucesso!"}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao excluir vaga: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.get("/minhas-vagas/{recrutador_id}")
def listar_vagas_do_recrutador(recrutador_id: int, current_user: dict = Depends(require_recrutador)):
    """
    Lista todas as vagas do recrutador autenticado.
    Só permite ver vagas do próprio recrutador.
    """
    if recrutador_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Acesso negado.")
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT v.id, v.titulo, v.departamento, v.descricao, v.requisitos, v.modalidade,
                   v.localizacao, v.faixa_salarial, v.status, v.criado_em,
                   COUNT(c.id) AS total_candidatos
            FROM vagas v
            LEFT JOIN candidaturas c ON c.vaga_id = v.id
            WHERE v.recrutador_id = %s
            GROUP BY v.id
            ORDER BY v.criado_em DESC
            """,
            (recrutador_id,),
        )
        vagas = cursor.fetchall()

        for vaga in vagas:
            if vaga.get("criado_em"):
                vaga["criado_em"] = vaga["criado_em"].isoformat()

        return {"vagas": vagas}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar vagas: {str(e)}")
    finally:
        cursor.close()
        conn.close()


# ==============================================================================
# CANDIDATOS DE UMA VAGA (Pipeline)
# ==============================================================================

@router.get("/pipeline/{vaga_id}/candidatos")
def listar_candidatos_da_vaga(vaga_id: int, current_user: dict = Depends(require_recrutador)):
    """
    Retorna todos os candidatos de uma vaga com perfil completo e status
    da candidatura. Alimenta a tela de Pipeline.
    Só permite ver candidatos de vagas do próprio recrutador.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        # Valida ownership da vaga.
        cursor.execute("SELECT recrutador_id FROM vagas WHERE id = %s", (vaga_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Vaga não encontrada.")
        if row["recrutador_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Você não tem acesso a essa vaga.")
        cursor.execute(
            f"""
            SELECT
                c.id          AS candidatura_id,
                c.status      AS status_candidatura,
                c.data_candidatura,
                u.id          AS usuario_id,
                u.nome,
                u.email,
                p.cidade,
                p.estado,
                p.telefone,
                p.linkedin,
                p.sobre_mim,
                p.foto_perfil
            FROM candidaturas c
            JOIN usuarios u ON u.id = c.candidato_id
            LEFT JOIN perfis_candidatos p ON p.usuario_id = c.candidato_id
            WHERE c.vaga_id = %s AND {FILTRO_CANDIDATOS_ATIVOS}
            ORDER BY c.data_candidatura DESC
            """,
            (vaga_id,),
        )
        candidatos_raw = cursor.fetchall()

        resultado = []
        for cand in candidatos_raw:
            usuario_id = cand["usuario_id"]

            cursor.execute(
                "SELECT nome FROM hard_skills WHERE usuario_id = %s", (usuario_id,)
            )
            hard_skills = [row["nome"] for row in cursor.fetchall()]

            cursor.execute(
                "SELECT nome FROM soft_skills WHERE usuario_id = %s", (usuario_id,)
            )
            soft_skills = [row["nome"] for row in cursor.fetchall()]

            if cand.get("data_candidatura"):
                cand["data_candidatura"] = cand["data_candidatura"].isoformat()

            resultado.append({**cand, "hard_skills": hard_skills, "soft_skills": soft_skills})

        return {"candidatos": resultado}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar candidatos: {str(e)}")
    finally:
        cursor.close()
        conn.close()


# ==============================================================================
# STATUS DA CANDIDATURA
# ==============================================================================

# ✅ Status válidos do banco
# Pipeline visual (5 etapas): Triagem → Teste Técnico → Entrevista → Proposta → Contratado
# Estados internos correspondentes:
#   ENVIADO    → Triagem
#   EM_ANALISE → Teste Técnico
#   ENTREVISTA → Entrevista
#   PROPOSTA   → Proposta
#   CONTRATADO → Contratado (status final positivo)
#   APROVADO   → legado, mantido para compatibilidade com bancos antigos
#   REJEITADO  → candidatura descartada
STATUSES_VALIDOS = {
    "ENVIADO", "EM_ANALISE", "ENTREVISTA", "PROPOSTA",
    "CONTRATADO", "APROVADO", "REJEITADO",
}

@router.put("/candidaturas/{candidatura_id}/status")
def atualizar_status_candidatura(
    candidatura_id: int,
    dados: CandidaturaStatusUpdate,
    current_user: dict = Depends(require_recrutador),
):
    """
    Atualiza o status de uma candidatura.
    Status válidos: ENVIADO | EM_ANALISE | ENTREVISTA | PROPOSTA | CONTRATADO | APROVADO | REJEITADO
    Só permite mover candidaturas de vagas do próprio recrutador.
    """
    if dados.status not in STATUSES_VALIDOS:
        raise HTTPException(
            status_code=422,
            detail=f"Status inválido. Use um de: {', '.join(STATUSES_VALIDOS)}"
        )

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        # Valida que a candidatura pertence a uma vaga do recrutador autenticado.
        cursor.execute(
            """
            SELECT v.recrutador_id
            FROM candidaturas c
            JOIN vagas v ON v.id = c.vaga_id
            WHERE c.id = %s
            """,
            (candidatura_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Candidatura não encontrada.")
        if row["recrutador_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Você não tem acesso a essa candidatura.")

        cursor.execute(
            "UPDATE candidaturas SET status = %s WHERE id = %s",
            (dados.status, candidatura_id),
        )
        conn.commit()
        return {"mensagem": f"Status atualizado para {dados.status}."}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar status: {str(e)}")
    finally:
        cursor.close()
        conn.close()


# ==============================================================================
# DASHBOARD
# ==============================================================================

@router.get("/dashboard/{recrutador_id}")
def obter_dashboard(recrutador_id: int, current_user: dict = Depends(require_recrutador)):
    """
    Retorna dados agregados para o Dashboard do recrutador.
    Só permite ver dashboard do próprio recrutador.
    """
    if recrutador_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Acesso negado.")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT status, COUNT(*) AS total
            FROM vagas
            WHERE recrutador_id = %s
            GROUP BY status
            """,
            (recrutador_id,),
        )
        vagas_por_status = {row["status"]: row["total"] for row in cursor.fetchall()}

        cursor.execute(
            """
            SELECT c.status, COUNT(*) AS total
            FROM candidaturas c
            JOIN vagas v ON v.id = c.vaga_id
            WHERE v.recrutador_id = %s
            GROUP BY c.status
            """,
            (recrutador_id,),
        )
        candidatos_por_etapa = {row["status"]: row["total"] for row in cursor.fetchall()}

        total_candidatos = sum(candidatos_por_etapa.values())
        # Conta tanto CONTRATADO (status novo) quanto APROVADO (legado) como "aprovados".
        aprovados = candidatos_por_etapa.get("CONTRATADO", 0) + candidatos_por_etapa.get("APROVADO", 0)
        taxa_conversao = round((aprovados / total_candidatos * 100), 1) if total_candidatos > 0 else 0.0

        cursor.execute(
            """
            SELECT c.id AS candidatura_id,
                   u.id AS usuario_id, u.nome, u.email,
                   c.status AS status_candidatura, c.data_candidatura,
                   v.id AS vaga_id, v.titulo AS vaga_titulo
            FROM candidaturas c
            JOIN usuarios u ON u.id = c.candidato_id
            JOIN vagas v ON v.id = c.vaga_id
            WHERE v.recrutador_id = %s
            ORDER BY c.data_candidatura DESC
            LIMIT 5
            """,
            (recrutador_id,),
        )
        candidatos_recentes = cursor.fetchall()
        for c in candidatos_recentes:
            if c.get("data_candidatura"):
                c["data_candidatura"] = c["data_candidatura"].isoformat()

        return {
            "vagas_abertas": vagas_por_status.get("ABERTA", 0),
            "vagas_pausadas": vagas_por_status.get("PAUSADA", 0),
            "vagas_encerradas": vagas_por_status.get("ENCERRADA", 0),
            "total_candidatos": total_candidatos,
            "candidatos_por_etapa": candidatos_por_etapa,
            "taxa_conversao": taxa_conversao,
            "candidatos_recentes": candidatos_recentes,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter dashboard: {str(e)}")
    finally:
        cursor.close()
        conn.close()


# ==============================================================================
# RANKING
# ==============================================================================

@router.get("/ranking/{recrutador_id}")
def obter_ranking(
    recrutador_id: int,
    vaga_id: int = None,
    current_user: dict = Depends(require_recrutador),
):
    if recrutador_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Acesso negado.")
    """
    Lista candidatos ordenados por match score.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        if vaga_id:
            cursor.execute(
                "SELECT id, titulo, requisitos FROM vagas WHERE recrutador_id = %s AND id = %s",
                (recrutador_id, vaga_id),
            )
        else:
            cursor.execute(
                "SELECT id, titulo, requisitos FROM vagas WHERE recrutador_id = %s AND status = 'ABERTA'",
                (recrutador_id,),
            )
        vagas = cursor.fetchall()

        if not vagas:
            return {"ranking": []}

        ids_vagas = [v["id"] for v in vagas]
        placeholders = ",".join(["%s"] * len(ids_vagas))

        cursor.execute(
            f"""
            SELECT DISTINCT
                u.id AS usuario_id, u.nome, u.email,
                c.id AS candidatura_id, c.status AS status_candidatura, c.vaga_id,
                p.cidade, p.estado, p.foto_perfil, p.sobre_mim
            FROM candidaturas c
            JOIN usuarios u ON u.id = c.candidato_id
            LEFT JOIN perfis_candidatos p ON p.usuario_id = c.candidato_id
            WHERE c.vaga_id IN ({placeholders}) AND {FILTRO_CANDIDATOS_ATIVOS}
            """,
            ids_vagas,
        )
        candidatos = cursor.fetchall()

        resultado = []
        vagas_dict = {v["id"]: v for v in vagas}

        for cand in candidatos:
            usuario_id = cand["usuario_id"]
            vaga = vagas_dict.get(cand["vaga_id"], {})
            requisitos_vaga = vaga.get("requisitos", "") or ""

            cursor.execute(
                "SELECT nome FROM hard_skills WHERE usuario_id = %s", (usuario_id,)
            )
            hard_skills = [row["nome"].lower() for row in cursor.fetchall()]

            cursor.execute(
                "SELECT nome FROM soft_skills WHERE usuario_id = %s", (usuario_id,)
            )
            soft_skills = [row["nome"] for row in cursor.fetchall()]

            # Match por palavra inteira (não substring) para evitar falsos
            # positivos tipo "java" casar dentro de "javascript".
            import re as _re
            requisitos_lower = requisitos_vaga.lower()
            matches = [
                s for s in hard_skills
                if _re.search(rf"(?<![a-z0-9+#]){_re.escape(s)}(?![a-z0-9+#])", requisitos_lower)
            ]
            match_score = round(len(matches) / len(hard_skills) * 100) if hard_skills else 0

            resultado.append({
                "candidatura_id": cand["candidatura_id"],
                "usuario_id": usuario_id,
                "nome": cand["nome"],
                "email": cand["email"],
                "cidade": cand["cidade"],
                "estado": cand["estado"],
                "foto_perfil": cand["foto_perfil"],
                "sobre_mim": cand["sobre_mim"],
                "vaga_id": cand["vaga_id"],
                "vaga_titulo": vaga.get("titulo", ""),
                "status_candidatura": cand["status_candidatura"],
                "hard_skills": [s for s in hard_skills],
                "soft_skills": soft_skills,
                "skills_compativeis": matches,
                "match_score": match_score,
            })

        resultado.sort(key=lambda x: x["match_score"], reverse=True)
        return {"ranking": resultado, "vagas_filtradas": [v["titulo"] for v in vagas]}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter ranking: {str(e)}")
    finally:
        cursor.close()
        conn.close()
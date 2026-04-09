from fastapi import APIRouter, HTTPException
from database import get_db_connection
from schemas import VagaCreate, VagaUpdate, CandidaturaStatusUpdate

router = APIRouter(
    prefix="/recrutador",
    tags=["Recrutador"],
)


# ==============================================================================
# VAGAS
# ==============================================================================

@router.post("/vagas", status_code=201)
def criar_vaga(dados: VagaCreate):
    """Cria uma nova vaga associada ao recrutador logado."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO vagas (recrutador_id, titulo, descricao, requisitos,
                               modalidade, localizacao, faixa_salarial, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'ABERTA')
            """,
            (
                dados.recrutador_id,
                dados.titulo,
                dados.descricao,
                dados.requisitos,
                dados.modalidade,
                dados.localizacao,
                dados.faixa_salarial,
            ),
        )
        conn.commit()
        return {"mensagem": "Vaga criada com sucesso!", "id": cursor.lastrowid}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar vaga: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.put("/vagas/{vaga_id}")
def editar_vaga(vaga_id: int, dados: VagaUpdate):
    """Edita uma vaga existente. Valida que ela pertence ao recrutador."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM vagas WHERE id = %s AND recrutador_id = %s",
            (vaga_id, dados.recrutador_id),
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Vaga não encontrada ou sem permissão.")

        cursor.execute(
            """
            UPDATE vagas
            SET titulo = %s, descricao = %s, requisitos = %s,
                modalidade = %s, localizacao = %s, faixa_salarial = %s, status = %s
            WHERE id = %s
            """,
            (
                dados.titulo,
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
def deletar_vaga(vaga_id: int, recrutador_id: int):
    """
    Exclui uma vaga. Valida propriedade e arquiva candidaturas associadas
    alterando o status para REJEITADO antes de deletar.
    """
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

        # Arquiva candidaturas antes de deletar (integridade referencial)
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


@router.get("/vagas/{recrutador_id}")
def listar_vagas_do_recrutador(recrutador_id: int):
    """
    Lista todas as vagas do recrutador com o contador real de candidatos
    por vaga (alimenta Dashboard e Gerenciar Vagas).
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT v.id, v.titulo, v.descricao, v.requisitos, v.modalidade,
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

        # Serializa datetime para string
        for vaga in vagas:
            if vaga.get("criado_em"):
                vaga["criado_em"] = vaga["criado_em"].isoformat()

        return {"vagas": vagas}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar vagas: {str(e)}")
    finally:
        cursor.close()
        conn.close()


# ==============================================================================
# CANDIDATOS DE UMA VAGA (Pipeline)
# ==============================================================================

@router.get("/vagas/{vaga_id}/candidatos")
def listar_candidatos_da_vaga(vaga_id: int):
    """
    Retorna todos os candidatos de uma vaga com perfil completo e status
    da candidatura. Alimenta a tela de Pipeline.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
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
            WHERE c.vaga_id = %s
            ORDER BY c.data_candidatura DESC
            """,
            (vaga_id,),
        )
        candidatos_raw = cursor.fetchall()

        # Busca as skills de cada candidato
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

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar candidatos: {str(e)}")
    finally:
        cursor.close()
        conn.close()


# ==============================================================================
# STATUS DA CANDIDATURA (avançar pipeline / descartar)
# ==============================================================================

@router.put("/candidaturas/{candidatura_id}/status")
def atualizar_status_candidatura(candidatura_id: int, dados: CandidaturaStatusUpdate):
    """
    Atualiza o status de uma candidatura.
    Status válidos: ENVIADO | EM_ANALISE | ENTREVISTA | APROVADO | REJEITADO
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM candidaturas WHERE id = %s", (candidatura_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Candidatura não encontrada.")

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
def obter_dashboard(recrutador_id: int):
    """
    Retorna dados agregados para o Dashboard do recrutador:
    total de vagas abertas, total de candidatos, candidatos por etapa
    do pipeline e taxa de conversão.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        # Total de vagas por status
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

        # Candidatos por etapa do pipeline (apenas vagas deste recrutador)
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
        aprovados = candidatos_por_etapa.get("APROVADO", 0)
        taxa_conversao = round((aprovados / total_candidatos * 100), 1) if total_candidatos > 0 else 0.0

        # Candidatos recentes (últimos 5)
        cursor.execute(
            """
            SELECT u.id AS usuario_id, u.nome, u.email,
                   c.status AS status_candidatura, c.data_candidatura,
                   v.titulo AS vaga_titulo
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

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter dashboard: {str(e)}")
    finally:
        cursor.close()
        conn.close()


# ==============================================================================
# RANKING
# ==============================================================================

@router.get("/ranking/{recrutador_id}")
def obter_ranking(recrutador_id: int, vaga_id: int = None):
    """
    Lista candidatos ordenados por match score em relação às vagas do recrutador.
    O match score é calculado pela proporção de hard_skills do candidato
    que batem com os requisitos da vaga.
    Aceita filtro opcional por vaga_id.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        # Busca vagas do recrutador (com filtro opcional)
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

        # Busca todos os candidatos com candidatura nessas vagas
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
            WHERE c.vaga_id IN ({placeholders})
            """,
            ids_vagas,
        )
        candidatos = cursor.fetchall()

        # Calcula match score para cada candidato x vaga
        resultado = []
        vagas_dict = {v["id"]: v for v in vagas}

        for cand in candidatos:
            usuario_id = cand["usuario_id"]
            vaga = vagas_dict.get(cand["vaga_id"], {})
            requisitos_vaga = vaga.get("requisitos", "") or ""

            # Hard skills do candidato
            cursor.execute(
                "SELECT nome FROM hard_skills WHERE usuario_id = %s", (usuario_id,)
            )
            hard_skills = [row["nome"].lower() for row in cursor.fetchall()]

            cursor.execute(
                "SELECT nome FROM soft_skills WHERE usuario_id = %s", (usuario_id,)
            )
            soft_skills = [row["nome"] for row in cursor.fetchall()]

            # Match: quantas skills do candidato aparecem nos requisitos da vaga
            requisitos_lower = requisitos_vaga.lower()
            matches = [s for s in hard_skills if s in requisitos_lower]
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
                "skills_compatíveis": matches,
                "match_score": match_score,
            })

        # Ordena por match_score decrescente
        resultado.sort(key=lambda x: x["match_score"], reverse=True)

        return {"ranking": resultado, "vagas_filtradas": [v["titulo"] for v in vagas]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter ranking: {str(e)}")
    finally:
        cursor.close()
        conn.close() 
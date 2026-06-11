from fastapi import APIRouter, Depends, HTTPException
from database import get_db_connection
from dependencies import get_current_user
from schemas import CandidaturaCreate, VagaSalvaCreate

router = APIRouter(
    prefix="/vagas",
    tags=["Vagas"],
)


# ==============================================================================
# VAGAS ABERTAS (listagem pública para candidatos)
# ==============================================================================

@router.get("/abertas")
def listar_vagas_abertas(modalidade: str = None, busca: str = None):
    """
    Lista todas as vagas com status ABERTA.
    Filtros opcionais:
      - modalidade: REMOTO | PRESENCIAL | HIBRIDO
      - busca: texto livre — filtra por título, descrição ou requisitos
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT
                v.id, v.titulo, v.departamento, v.descricao, v.requisitos,
                v.modalidade, v.localizacao, v.faixa_salarial, v.criado_em,
                u.nome AS nome_recrutador,
                pr.empresa,
                COUNT(c.id) AS total_candidatos
            FROM vagas v
            JOIN usuarios u ON u.id = v.recrutador_id
            LEFT JOIN perfis_recrutadores pr ON pr.usuario_id = v.recrutador_id
            LEFT JOIN candidaturas c ON c.vaga_id = v.id
            WHERE v.status = 'ABERTA'
        """
        params = []

        if modalidade:
            query += " AND v.modalidade = %s"
            params.append(modalidade.upper())

        if busca:
            query += " AND (v.titulo LIKE %s OR v.descricao LIKE %s OR v.requisitos LIKE %s)"
            like = f"%{busca}%"
            params.extend([like, like, like])

        query += " GROUP BY v.id ORDER BY v.criado_em DESC"

        cursor.execute(query, params)
        vagas = cursor.fetchall()

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
# VAGAS SALVAS
# ==============================================================================

@router.post("/salvar", status_code=201)
def salvar_vaga(dados: VagaSalvaCreate, current_user: dict = Depends(get_current_user)):
    if dados.usuario_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Você só pode salvar vagas para sua própria conta.")
    """
    Salva uma vaga na lista de interesse do candidato.
    Retorna 409 se a vaga já estiver salva pelo mesmo candidato.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        # Garante que a vaga existe
        cursor.execute("SELECT id FROM vagas WHERE id = %s", (dados.vaga_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Vaga não encontrada.")

        # Verifica duplicidade (a tabela já tem UNIQUE KEY, mas preferimos
        # retornar uma mensagem amigável antes de chegar no banco)
        cursor.execute(
            "SELECT id FROM vagas_salvas WHERE usuario_id = %s AND vaga_id = %s",
            (dados.usuario_id, dados.vaga_id),
        )
        if cursor.fetchone():
            raise HTTPException(status_code=409, detail="Vaga já está salva.")

        cursor.execute(
            "INSERT INTO vagas_salvas (usuario_id, vaga_id) VALUES (%s, %s)",
            (dados.usuario_id, dados.vaga_id),
        )
        conn.commit()
        return {"mensagem": "Vaga salva com sucesso!", "id": cursor.lastrowid}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao salvar vaga: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.get("/salvas/{usuario_id}")
def listar_vagas_salvas(usuario_id: int, current_user: dict = Depends(get_current_user)):
    if usuario_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Acesso negado.")
    """
    Lista todas as vagas salvas por um candidato com os detalhes completos
    da vaga e empresa. Alimenta a tela /candidate/saved.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT
                vs.id          AS salvo_id,
                vs.data_salvamento,
                v.id           AS vaga_id,
                v.titulo,
                v.departamento,
                v.descricao,
                v.requisitos,
                v.modalidade,
                v.localizacao,
                v.faixa_salarial,
                v.status       AS status_vaga,
                pr.empresa,
                pr.foto_perfil AS logo_empresa
            FROM vagas_salvas vs
            JOIN vagas v ON v.id = vs.vaga_id
            JOIN usuarios u ON u.id = v.recrutador_id
            LEFT JOIN perfis_recrutadores pr ON pr.usuario_id = v.recrutador_id
            WHERE vs.usuario_id = %s
            ORDER BY vs.data_salvamento DESC
            """,
            (usuario_id,),
        )
        salvas = cursor.fetchall()

        for item in salvas:
            if item.get("data_salvamento"):
                item["data_salvamento"] = item["data_salvamento"].isoformat()

        return {"vagas_salvas": salvas}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar vagas salvas: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.delete("/salvas/{vaga_id}")
def remover_vaga_salva(vaga_id: int, usuario_id: int, current_user: dict = Depends(get_current_user)):
    if usuario_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Acesso negado.")
    """
    Remove uma vaga da lista de salvas do candidato.
    O usuario_id é obrigatório via query param para garantir que o candidato
    só possa remover os próprios vínculos.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM vagas_salvas WHERE vaga_id = %s AND usuario_id = %s",
            (vaga_id, usuario_id),
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Vaga salva não encontrada.")

        cursor.execute(
            "DELETE FROM vagas_salvas WHERE vaga_id = %s AND usuario_id = %s",
            (vaga_id, usuario_id),
        )
        conn.commit()
        return {"mensagem": "Vaga removida da lista de salvas."}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao remover vaga salva: {str(e)}")
    finally:
        cursor.close()
        conn.close()


# ==============================================================================
# CANDIDATURAS
# ==============================================================================

@router.post("/candidatar", status_code=201)
def candidatar_se(dados: CandidaturaCreate, current_user: dict = Depends(get_current_user)):
    if dados.candidato_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Você só pode se candidatar pelo seu próprio usuário.")
    """
    Registra a candidatura de um candidato a uma vaga.
    Retorna 409 se já houver candidatura para o mesmo par (vaga, candidato).
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, status FROM vagas WHERE id = %s", (dados.vaga_id,))
        vaga = cursor.fetchone()
        if not vaga:
            raise HTTPException(status_code=404, detail="Vaga não encontrada.")
        if vaga["status"] != "ABERTA":
            raise HTTPException(status_code=400, detail="Esta vaga não está mais aceitando candidaturas.")

        cursor.execute(
            "SELECT id FROM candidaturas WHERE vaga_id = %s AND candidato_id = %s",
            (dados.vaga_id, dados.candidato_id),
        )
        if cursor.fetchone():
            raise HTTPException(status_code=409, detail="Você já se candidatou a esta vaga.")

        cursor.execute(
            "INSERT INTO candidaturas (vaga_id, candidato_id, status) VALUES (%s, %s, 'ENVIADO')",
            (dados.vaga_id, dados.candidato_id),
        )
        conn.commit()
        return {"mensagem": "Candidatura enviada com sucesso!", "id": cursor.lastrowid}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao candidatar-se: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.get("/minhas-candidaturas/{candidato_id}")
def listar_minhas_candidaturas(candidato_id: int, current_user: dict = Depends(get_current_user)):
    if candidato_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Acesso negado.")
    """
    Lista o histórico completo de candidaturas de um candidato com status,
    datas e dados da vaga/empresa. Alimenta a tela /candidate/applications.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT
                c.id           AS candidatura_id,
                c.status       AS status_candidatura,
                c.data_candidatura,
                v.id           AS vaga_id,
                v.titulo,
                v.departamento,
                v.modalidade,
                v.localizacao,
                v.faixa_salarial,
                v.requisitos,
                pr.empresa,
                pr.foto_perfil AS logo_empresa
            FROM candidaturas c
            JOIN vagas v ON v.id = c.vaga_id
            JOIN usuarios u ON u.id = v.recrutador_id
            LEFT JOIN perfis_recrutadores pr ON pr.usuario_id = v.recrutador_id
            WHERE c.candidato_id = %s
            ORDER BY c.data_candidatura DESC
            """,
            (candidato_id,),
        )
        candidaturas = cursor.fetchall()

        for c in candidaturas:
            if c.get("data_candidatura"):
                c["data_candidatura"] = c["data_candidatura"].isoformat()

        return {"candidaturas": candidaturas}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar candidaturas: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.delete("/candidaturas/{candidatura_id}")
def cancelar_candidatura(candidatura_id: int, candidato_id: int, current_user: dict = Depends(get_current_user)):
    if candidato_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Você só pode cancelar suas próprias candidaturas.")
    """
    Cancela uma candidatura. Só o próprio candidato pode cancelar e apenas
    enquanto o status ainda for ENVIADO.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, status FROM candidaturas WHERE id = %s AND candidato_id = %s",
            (candidatura_id, candidato_id),
        )
        cand = cursor.fetchone()
        if not cand:
            raise HTTPException(status_code=404, detail="Candidatura não encontrada.")
        if cand["status"] != "ENVIADO":
            raise HTTPException(
                status_code=400,
                detail="Não é possível cancelar uma candidatura que já está em análise.",
            )

        cursor.execute("DELETE FROM candidaturas WHERE id = %s", (candidatura_id,))
        conn.commit()
        return {"mensagem": "Candidatura cancelada com sucesso."}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao cancelar candidatura: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.get("/{vaga_id}")
def obter_vaga(vaga_id: int, candidato_id: int = None):
    """
    Retorna os detalhes completos de uma vaga específica.
    Se candidato_id for informado, inclui se o candidato já se candidatou
    e se a vaga está salva.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT
                v.id, v.titulo, v.departamento, v.descricao, v.requisitos,
                v.modalidade, v.localizacao, v.faixa_salarial, v.status, v.criado_em,
                u.nome AS nome_recrutador,
                pr.empresa, pr.site_empresa, pr.foto_perfil AS logo_empresa
            FROM vagas v
            JOIN usuarios u ON u.id = v.recrutador_id
            LEFT JOIN perfis_recrutadores pr ON pr.usuario_id = v.recrutador_id
            WHERE v.id = %s
            """,
            (vaga_id,),
        )
        vaga = cursor.fetchone()
        if not vaga:
            raise HTTPException(status_code=404, detail="Vaga não encontrada.")

        if vaga.get("criado_em"):
            vaga["criado_em"] = vaga["criado_em"].isoformat()

        # Valores padrão — sobrescritos se candidato_id for informado
        vaga["ja_candidatou"] = False
        vaga["candidatura_id"] = None
        vaga["status_candidatura"] = None
        vaga["esta_salva"] = False
        vaga["salvo_id"] = None

        if candidato_id:
            cursor.execute(
                "SELECT id, status FROM candidaturas WHERE vaga_id = %s AND candidato_id = %s",
                (vaga_id, candidato_id),
            )
            row = cursor.fetchone()
            if row:
                vaga["ja_candidatou"] = True
                vaga["candidatura_id"] = row["id"]
                vaga["status_candidatura"] = row["status"]

            cursor.execute(
                "SELECT id FROM vagas_salvas WHERE vaga_id = %s AND usuario_id = %s",
                (vaga_id, candidato_id),
            )
            salva = cursor.fetchone()
            if salva:
                vaga["esta_salva"] = True
                vaga["salvo_id"] = salva["id"]

        return vaga

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter vaga: {str(e)}")
    finally:
        cursor.close()
        conn.close()
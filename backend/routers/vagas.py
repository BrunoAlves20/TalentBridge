from fastapi import APIRouter, HTTPException
from database import get_db_connection
from schemas import CandidaturaCreate

router = APIRouter(
    prefix="/vagas",
    tags=["Vagas"],
)


@router.get("/abertas")
def listar_vagas_abertas(modalidade: str = None, busca: str = None):
    """
    Lista todas as vagas com status ABERTA.
    Aceita filtros opcionais:
      - modalidade: REMOTO | PRESENCIAL | HIBRIDO
      - busca: texto livre para filtrar por título ou descrição
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


@router.get("/{vaga_id}")
def obter_vaga(vaga_id: int, candidato_id: int = None):
    """
    Retorna os detalhes de uma vaga específica.
    Se candidato_id for informado, inclui se o candidato já se candidatou.
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

        vaga["ja_candidatou"] = False
        vaga["candidatura_id"] = None
        vaga["status_candidatura"] = None

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

        return vaga

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter vaga: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.post("/candidatar", status_code=201)
def candidatar_se(dados: CandidaturaCreate):
    """
    Candidata um candidato a uma vaga.
    Retorna erro 409 se o candidato já se candidatou.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        # Valida se a vaga existe e está aberta
        cursor.execute(
            "SELECT id, status FROM vagas WHERE id = %s",
            (dados.vaga_id,),
        )
        vaga = cursor.fetchone()
        if not vaga:
            raise HTTPException(status_code=404, detail="Vaga não encontrada.")
        if vaga["status"] != "ABERTA":
            raise HTTPException(status_code=400, detail="Esta vaga não está mais aceitando candidaturas.")

        # Verifica candidatura duplicada
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
def listar_minhas_candidaturas(candidato_id: int):
    """
    Lista todas as candidaturas de um candidato com detalhes da vaga e empresa.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT
                c.id AS candidatura_id,
                c.status AS status_candidatura,
                c.data_candidatura,
                v.id AS vaga_id,
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
def cancelar_candidatura(candidatura_id: int, candidato_id: int):
    """
    Cancela (remove) uma candidatura. Só o próprio candidato pode cancelar.
    Só permite cancelar se o status for ENVIADO.
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
                detail="Não é possível cancelar uma candidatura que já está em análise."
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
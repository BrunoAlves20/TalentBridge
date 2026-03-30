from fastapi import APIRouter, HTTPException
from database import get_db_connection
from schemas import OnboardingPayload, PerfilUpdate

router = APIRouter(
    prefix="/candidatos",
    tags=["Candidatos"],
)


@router.post("/onboarding", status_code=201)
def salvar_onboarding(dados: OnboardingPayload):
    """
    Salva (ou atualiza) o perfil completo do candidato:
    dados pessoais, formações, experiências, hard skills e soft skills.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor()
    try:
        # 1. Sincroniza apenas o nome na tabela principal (mantém o e-mail original do cadastro)
        cursor.execute(
            "UPDATE usuarios SET nome = %s WHERE id = %s",
            (dados.personal.fullName, dados.usuario_id),
        )

        # 2. Upsert do perfil principal
        cursor.execute(
            """
            INSERT INTO perfis_candidatos
                (usuario_id, telefone, genero, idade, estado, cidade, cep,
                 linkedin, github, portfolio, sobre_mim, foto_perfil)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                telefone    = VALUES(telefone),
                genero      = VALUES(genero),
                idade       = VALUES(idade),
                estado      = VALUES(estado),
                cidade      = VALUES(cidade),
                cep         = VALUES(cep),
                linkedin    = VALUES(linkedin),
                github      = VALUES(github),
                portfolio   = VALUES(portfolio),
                sobre_mim   = VALUES(sobre_mim),
                foto_perfil = VALUES(foto_perfil)
            """,
            (
                dados.usuario_id,
                dados.personal.phone,
                dados.personal.gender,
                dados.personal.age,
                dados.personal.state,
                dados.personal.city,
                dados.personal.zipCode,
                dados.personal.linkedin,
                dados.personal.github,
                dados.personal.portfolio,
                dados.personal.about,
                dados.personal.profilePicture,
            ),
        )

        # 3. Clean Slate — remove listas antigas para re-inserção limpa
        cursor.execute("DELETE FROM formacoes   WHERE usuario_id = %s", (dados.usuario_id,))
        cursor.execute("DELETE FROM experiencias WHERE usuario_id = %s", (dados.usuario_id,))
        cursor.execute("DELETE FROM hard_skills  WHERE usuario_id = %s", (dados.usuario_id,))
        cursor.execute("DELETE FROM soft_skills  WHERE usuario_id = %s", (dados.usuario_id,))

        # 4. Formações
        for ed in dados.education:
            cursor.execute(
                """
                INSERT INTO formacoes (usuario_id, curso, instituicao, grau, ano_inicio, ano_fim, horas)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (dados.usuario_id, ed.course, ed.institution, ed.degree, ed.startYear, ed.endYear, ed.hours),
            )

        # 5. Experiências
        for exp in dados.experience:
            cursor.execute(
                """
                INSERT INTO experiencias
                    (usuario_id, empresa, cargo, mes_inicio, ano_inicio, mes_fim, ano_fim, atual, descricao)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    dados.usuario_id,
                    exp.company,
                    exp.role,
                    exp.startMonth,
                    exp.startYear,
                    exp.endMonth,
                    exp.endYear,
                    exp.isCurrent,
                    exp.description,
                ),
            )

        # 6. Hard Skills (Stacks)
        for skill in dados.stacks:
            cursor.execute(
                "INSERT INTO hard_skills (usuario_id, nome) VALUES (%s, %s)",
                (dados.usuario_id, skill),
            )

        # 7. Soft Skills
        for skill in dados.softSkills:
            cursor.execute(
                "INSERT INTO soft_skills (usuario_id, nome) VALUES (%s, %s)",
                (dados.usuario_id, skill),
            )

        conn.commit()
        return {"mensagem": "Perfil do candidato salvo com sucesso!"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao salvar onboarding: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.get("/perfil-completo/{usuario_id}")
def obter_perfil_completo(usuario_id: int):
    """Retorna o perfil completo do candidato (dados pessoais, formações, experiências e skills)."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        # Dados pessoais (join entre usuarios e perfis_candidatos)
        cursor.execute(
            """
            SELECT u.nome, u.email,
                   p.telefone, p.genero, p.idade, p.estado, p.cidade, p.cep,
                   p.linkedin, p.github, p.portfolio, p.sobre_mim, p.foto_perfil
            FROM usuarios u
            LEFT JOIN perfis_candidatos p ON u.id = p.usuario_id
            WHERE u.id = %s
            """,
            (usuario_id,),
        )
        pessoal = cursor.fetchone()

        if not pessoal:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")

        cursor.execute("SELECT * FROM formacoes   WHERE usuario_id = %s", (usuario_id,))
        formacoes = cursor.fetchall()

        cursor.execute("SELECT * FROM experiencias WHERE usuario_id = %s", (usuario_id,))
        experiencias = cursor.fetchall()

        cursor.execute("SELECT nome FROM hard_skills WHERE usuario_id = %s", (usuario_id,))
        hard_skills = [row["nome"] for row in cursor.fetchall()]

        cursor.execute("SELECT nome FROM soft_skills WHERE usuario_id = %s", (usuario_id,))
        soft_skills = [row["nome"] for row in cursor.fetchall()]

        return {
            "personal": {
                "fullName":       pessoal["nome"],
                "email":          pessoal["email"],
                "phone":          pessoal["telefone"]   or "",
                "gender":         pessoal["genero"]     or "",
                "age":            pessoal["idade"]      or "",
                "state":          pessoal["estado"]     or "",
                "city":           pessoal["cidade"]     or "",
                "zipCode":        pessoal["cep"]        or "",
                "linkedin":       pessoal["linkedin"]   or "",
                "github":         pessoal["github"]     or "",
                "portfolio":      pessoal["portfolio"]  or "",
                "about":          pessoal["sobre_mim"]  or "",
                "profilePicture": pessoal["foto_perfil"] or "",
            },
            "education": [
                {
                    "id":          f["id"],
                    "course":      f["curso"],
                    "institution": f["instituicao"],
                    "degree":      f["grau"],
                    "startYear":   f["ano_inicio"],
                    "endYear":     f["ano_fim"],
                    "hours":       f["horas"],
                }
                for f in formacoes
            ],
            "experience": [
                {
                    "id":          e["id"],
                    "company":     e["empresa"],
                    "role":        e["cargo"],
                    "startMonth":  e["mes_inicio"],
                    "startYear":   e["ano_inicio"],
                    "endMonth":    e["mes_fim"],
                    "endYear":     e["ano_fim"],
                    "isCurrent":   bool(e["atual"]),
                    "description": e["descricao"],
                }
                for e in experiencias
            ],
            "stacks":     hard_skills,
            "softSkills": soft_skills,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.put("/perfil-pessoal")
def atualizar_perfil_pessoal(dados: PerfilUpdate):
    """Atualiza apenas os dados pessoais do candidato (sem mexer em listas de skills/experiências)."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE usuarios SET nome = %s, email = %s WHERE id = %s",
            (dados.fullName, dados.email, dados.usuario_id),
        )

        cursor.execute(
            """
            UPDATE perfis_candidatos
            SET telefone  = %s, genero    = %s, idade     = %s,
                estado    = %s, cidade    = %s, cep       = %s,
                linkedin  = %s, github    = %s, portfolio = %s,
                sobre_mim = %s, foto_perfil = %s
            WHERE usuario_id = %s
            """,
            (
                dados.phone, dados.gender, dados.age,
                dados.state, dados.city,  dados.zipCode,
                dados.linkedin, dados.github, dados.portfolio,
                dados.about, dados.profilePicture,
                dados.usuario_id,
            ),
        )

        conn.commit()
        return {"mensagem": "Dados pessoais atualizados com sucesso!"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar: {str(e)}")
    finally:
        cursor.close()
        conn.close()
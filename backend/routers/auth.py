import json

from fastapi import APIRouter, HTTPException
from database import get_db_connection
from schemas import (
    UsuarioCreate, UsuarioLogin,
    AlterarSenhaRequest, PreferenciasUpdate,
)
from services.auth_service import hash_password, verify_password, create_access_token
from services.hunter_service import verify_email as hunter_verify

router = APIRouter(
    prefix="/usuarios",
    tags=["Autenticação"],
)


# ==============================================================================
# CADASTRO E LOGIN
# ==============================================================================

@router.post("/cadastro", status_code=201)
def cadastrar_usuario(dados: UsuarioCreate):
    """
    Registra um novo usuário (candidato ou recrutador).

    ⚠ Este endpoint cria o usuário SEM verificação de e-mail.
    Para o fluxo com OTP (recomendado), use POST /auth/send-code
    com tipo='cadastro' seguido de POST /auth/verify-code.

    Mantido para compatibilidade e testes via /docs.
    """
    if not hunter_verify(dados.email):
        raise HTTPException(
            status_code=400,
            detail="Este e-mail não parece ser real. Use um e-mail válido.",
        )

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (dados.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

        senha_hash = hash_password(dados.senha)
        cursor.execute(
            "INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario) VALUES (%s, %s, %s, %s)",
            (dados.nome, dados.email, senha_hash, dados.tipo_usuario),
        )
        conn.commit()
        return {"mensagem": "Usuário cadastrado com sucesso!", "id": cursor.lastrowid}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.post("/login")
def login_usuario(dados: UsuarioLogin):
    """
    Autentica o usuário e retorna um JWT (access_token) junto com os dados
    do usuário e a flag `onboarding_completo`.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, nome, email, senha_hash, tipo_usuario FROM usuarios WHERE email = %s",
            (dados.email,),
        )
        usuario = cursor.fetchone()

        if not usuario:
            raise HTTPException(status_code=401, detail="E-mail não encontrado.")

        if not verify_password(dados.senha, usuario["senha_hash"]):
            raise HTTPException(status_code=401, detail="Senha incorreta.")

        cursor.execute(
            "SELECT usuario_id FROM perfis_candidatos WHERE usuario_id = %s",
            (usuario["id"],),
        )
        tem_perfil = cursor.fetchone() is not None

        token = create_access_token(
            user_id=usuario["id"],
            email=usuario["email"],
            role=usuario["tipo_usuario"],
        )

        return {
            "mensagem": "Login realizado com sucesso!",
            "access_token": token,
            "token_type": "bearer",
            "usuario": {
                "id": usuario["id"],
                "nome": usuario["nome"],
                "email": usuario["email"],
                "role": usuario["tipo_usuario"],
                "onboarding_completo": tem_perfil,
            },
        }

    except HTTPException:
        raise
    finally:
        cursor.close()
        conn.close()


# ==============================================================================
# GESTÃO DE CONTA
# ==============================================================================

@router.put("/senha")
def alterar_senha(dados: AlterarSenhaRequest):
    """
    Altera a senha do usuário autenticado.
    Exige a senha atual para confirmar identidade antes de gravar a nova.
    """
    if len(dados.nova_senha) < 6:
        raise HTTPException(status_code=400, detail="A nova senha precisa ter pelo menos 6 caracteres.")

    if dados.senha_atual == dados.nova_senha:
        raise HTTPException(status_code=400, detail="A nova senha não pode ser igual à senha atual.")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, senha_hash FROM usuarios WHERE id = %s",
            (dados.usuario_id,),
        )
        usuario = cursor.fetchone()
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")

        if not verify_password(dados.senha_atual, usuario["senha_hash"]):
            raise HTTPException(status_code=400, detail="Senha atual incorreta.")

        nova_hash = hash_password(dados.nova_senha)
        cursor.execute(
            "UPDATE usuarios SET senha_hash = %s WHERE id = %s",
            (nova_hash, dados.usuario_id),
        )
        conn.commit()
        return {"mensagem": "Senha alterada com sucesso!"}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao alterar senha: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.delete("/{usuario_id}")
def excluir_conta(usuario_id: int):
    """
    Exclui permanentemente a conta do usuário e todos os dados associados.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM usuarios WHERE id = %s", (usuario_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")

        # codigos_redefinicao_senha removida — substituída por codigos_verificacao
        tabelas_dependentes = [
            "candidaturas",
            "vagas_salvas",
            "hard_skills",
            "soft_skills",
            "formacoes",
            "experiencias",
            "perfis_candidatos",
            "perfis_recrutadores",
            "codigos_verificacao",  # limpa OTPs pendentes do usuário
        ]
        for tabela in tabelas_dependentes:
            cursor.execute(f"DELETE FROM {tabela} WHERE usuario_id = %s", (usuario_id,))

        # codigos_verificacao usa ref_id (pode ser int ou email) — limpa por ref_id também
        cursor.execute(
            "DELETE FROM codigos_verificacao WHERE ref_id = %s",
            (str(usuario_id),),
        )

        cursor.execute("DELETE FROM usuarios WHERE id = %s", (usuario_id,))
        conn.commit()
        return {"mensagem": "Conta excluída com sucesso."}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao excluir conta: {str(e)}")
    finally:
        cursor.close()
        conn.close()


# ==============================================================================
# PREFERÊNCIAS DE NOTIFICAÇÃO
# ==============================================================================

@router.get("/{usuario_id}/preferencias")
def obter_preferencias(usuario_id: int):
    """Retorna as preferências de notificação do candidato."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT preferencias FROM usuarios WHERE id = %s", (usuario_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")

        PREFERENCIAS_PADRAO = {
            "email_candidatura": True,
            "email_status": True,
            "email_novidades": False,
        }

        prefs_raw = row["preferencias"]
        if prefs_raw is None:
            preferencias = PREFERENCIAS_PADRAO
        elif isinstance(prefs_raw, str):
            try:
                preferencias = json.loads(prefs_raw)
            except json.JSONDecodeError:
                preferencias = PREFERENCIAS_PADRAO
        else:
            preferencias = prefs_raw

        return {"preferencias": preferencias}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter preferências: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.put("/{usuario_id}/preferencias")
def atualizar_preferencias(usuario_id: int, dados: PreferenciasUpdate):
    """Persiste as preferências de notificação (merge com as existentes)."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT preferencias FROM usuarios WHERE id = %s", (usuario_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")

        prefs_atual = {}
        if row["preferencias"]:
            if isinstance(row["preferencias"], str):
                try:
                    prefs_atual = json.loads(row["preferencias"])
                except json.JSONDecodeError:
                    prefs_atual = {}
            else:
                prefs_atual = row["preferencias"]

        novas = dados.model_dump(exclude_none=True)
        prefs_atualizadas = {**prefs_atual, **novas}

        cursor.execute(
            "UPDATE usuarios SET preferencias = %s WHERE id = %s",
            (json.dumps(prefs_atualizadas), usuario_id),
        )
        conn.commit()
        return {"mensagem": "Preferências atualizadas.", "preferencias": prefs_atualizadas}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar preferências: {str(e)}")
    finally:
        cursor.close()
        conn.close()

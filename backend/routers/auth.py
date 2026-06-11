import json

from fastapi import APIRouter, Depends, HTTPException
from database import get_db_connection
from dependencies import get_current_user
from schemas import (
    UsuarioLogin,
    AlterarSenhaRequest, PreferenciasUpdate,
)
from services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter(
    prefix="/usuarios",
    tags=["Autenticação"],
)


# ==============================================================================
# LOGIN
# ==============================================================================
# O cadastro de novos usuários acontece via fluxo OTP em
# POST /auth/send-code + POST /auth/verify-code (routers/auth_otp.py).
# O antigo POST /usuarios/cadastro foi removido — criava usuários sem
# verificação de e-mail e duplicava o fluxo OTP.

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

        # Considera o onboarding concluído apenas se o perfil tiver pelo menos
        # cidade preenchida (campo obrigatório do passo 1 do onboarding).
        # A linha pode existir vazia desde o cadastro inicial.
        cursor.execute(
            "SELECT cidade FROM perfis_candidatos WHERE usuario_id = %s",
            (usuario["id"],),
        )
        perfil_row = cursor.fetchone()
        tem_perfil = bool(perfil_row and perfil_row["cidade"])

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
def alterar_senha(dados: AlterarSenhaRequest, current_user: dict = Depends(get_current_user)):
    """
    Altera a senha do usuário autenticado.
    Exige a senha atual para confirmar identidade antes de gravar a nova.
    O usuario_id do payload é IGNORADO — usamos o sub do JWT para evitar
    que um usuário troque a senha de outro.
    """
    if len(dados.nova_senha) < 6:
        raise HTTPException(status_code=400, detail="A nova senha precisa ter pelo menos 6 caracteres.")

    if dados.senha_atual == dados.nova_senha:
        raise HTTPException(status_code=400, detail="A nova senha não pode ser igual à senha atual.")

    usuario_id = current_user["user_id"]

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, senha_hash FROM usuarios WHERE id = %s",
            (usuario_id,),
        )
        usuario = cursor.fetchone()
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")

        if not verify_password(dados.senha_atual, usuario["senha_hash"]):
            raise HTTPException(status_code=400, detail="Senha atual incorreta.")

        nova_hash = hash_password(dados.nova_senha)
        cursor.execute(
            "UPDATE usuarios SET senha_hash = %s WHERE id = %s",
            (nova_hash, usuario_id),
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
def excluir_conta(usuario_id: int, current_user: dict = Depends(get_current_user)):
    """
    Exclui permanentemente a conta do usuário e todos os dados associados.
    Só o próprio usuário pode deletar sua conta (JWT == path).
    """
    if usuario_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Você só pode excluir sua própria conta.")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT email FROM usuarios WHERE id = %s", (usuario_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")
        email_usuario = row["email"]

        # Todas as tabelas dependentes têm ON DELETE CASCADE na FK para usuarios.id,
        # então só precisamos deletar o usuário — o MySQL limpa o resto.
        # EXCEÇÃO: codigos_verificacao usa ref_id (string), sem FK formal.
        # Limpamos pelos dois possíveis valores: usuario_id (recuperação/alteração)
        # e email (cadastro pendente).
        cursor.execute(
            "DELETE FROM codigos_verificacao WHERE ref_id IN (%s, %s)",
            (str(usuario_id), email_usuario),
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
def obter_preferencias(usuario_id: int, current_user: dict = Depends(get_current_user)):
    """Retorna as preferências de notificação do candidato."""
    if usuario_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Acesso negado.")
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
def atualizar_preferencias(
    usuario_id: int,
    dados: PreferenciasUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Persiste as preferências de notificação (merge com as existentes)."""
    if usuario_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Acesso negado.")
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

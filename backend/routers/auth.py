import json
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException
from database import get_db_connection
from schemas import (
    UsuarioCreate, UsuarioLogin,
    EsqueceuSenhaRequest, VerificarCodigoRequest, RedefinirSenhaRequest,
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

    Fluxo:
      1. Valida o e-mail via Hunter.io — bloqueia se for inválido/inexistente.
      2. Verifica duplicidade no banco.
      3. Gera hash bcrypt da senha via auth_service.
      4. Insere o registro.
    """
    # 1. Validação Hunter
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
        # 2. Duplicidade
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (dados.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

        # 3. Hash via auth_service (passlib/bcrypt)
        senha_hash = hash_password(dados.senha)

        # 4. Inserção
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

        # Compara senha com hash via auth_service
        if not verify_password(dados.senha, usuario["senha_hash"]):
            raise HTTPException(status_code=401, detail="Senha incorreta.")

        cursor.execute(
            "SELECT usuario_id FROM perfis_candidatos WHERE usuario_id = %s",
            (usuario["id"],),
        )
        tem_perfil = cursor.fetchone() is not None

        # Gera o JWT
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

        tabelas_dependentes = [
            "candidaturas",
            "vagas_salvas",
            "hard_skills",
            "soft_skills",
            "formacoes",
            "experiencias",
            "perfis_candidatos",
            "perfis_recrutadores",
            "codigos_redefinicao_senha",
        ]
        for tabela in tabelas_dependentes:
            cursor.execute(f"DELETE FROM {tabela} WHERE usuario_id = %s", (usuario_id,))

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
        cursor.execute(
            "SELECT preferencias FROM usuarios WHERE id = %s",
            (usuario_id,),
        )
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
        cursor.execute(
            "SELECT preferencias FROM usuarios WHERE id = %s",
            (usuario_id,),
        )
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


# ==============================================================================
# REDEFINIÇÃO DE SENHA
# ==============================================================================

CODIGO_TESTE = "123456"
EXPIRACAO_MINUTOS = 15


@router.post("/esqueceu-senha")
def esqueceu_senha(dados: EsqueceuSenhaRequest):
    """[VERSÃO TESTE] Simula o envio de código de verificação (código fixo: 123456)."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (dados.email,))
        usuario = cursor.fetchone()
        if not usuario:
            return {"mensagem": "Se este e-mail estiver cadastrado, você receberá um código."}

        cursor.execute(
            "DELETE FROM codigos_redefinicao_senha WHERE usuario_id = %s",
            (usuario["id"],),
        )
        expira_em = datetime.now() + timedelta(minutes=EXPIRACAO_MINUTOS)
        cursor.execute(
            "INSERT INTO codigos_redefinicao_senha (usuario_id, codigo, expira_em) VALUES (%s, %s, %s)",
            (usuario["id"], CODIGO_TESTE, expira_em),
        )
        conn.commit()
        print(f"[TESTE] Código de redefinição para {dados.email}: {CODIGO_TESTE}")
        return {"mensagem": "Se este e-mail estiver cadastrado, você receberá um código."}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.post("/verificar-codigo")
def verificar_codigo(dados: VerificarCodigoRequest):
    """Valida se o código informado é correto e está dentro do prazo."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (dados.email,))
        usuario = cursor.fetchone()
        if not usuario:
            raise HTTPException(status_code=400, detail="Código inválido ou expirado.")

        cursor.execute(
            """
            SELECT id FROM codigos_redefinicao_senha
            WHERE usuario_id = %s AND codigo = %s AND usado = FALSE AND expira_em > NOW()
            """,
            (usuario["id"], dados.codigo),
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=400, detail="Código inválido ou expirado.")

        return {"mensagem": "Código válido. Você pode redefinir sua senha."}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.post("/redefinir-senha")
def redefinir_senha(dados: RedefinirSenhaRequest):
    """Redefine a senha do usuário após validação do código."""
    if len(dados.nova_senha) < 6:
        raise HTTPException(status_code=400, detail="A nova senha precisa ter pelo menos 6 caracteres.")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (dados.email,))
        usuario = cursor.fetchone()
        if not usuario:
            raise HTTPException(status_code=400, detail="Código inválido ou expirado.")

        cursor.execute(
            """
            SELECT id FROM codigos_redefinicao_senha
            WHERE usuario_id = %s AND codigo = %s AND usado = FALSE AND expira_em > NOW()
            """,
            (usuario["id"], dados.codigo),
        )
        registro = cursor.fetchone()
        if not registro:
            raise HTTPException(status_code=400, detail="Código inválido ou expirado.")

        nova_hash = hash_password(dados.nova_senha)
        cursor.execute(
            "UPDATE usuarios SET senha_hash = %s WHERE id = %s",
            (nova_hash, usuario["id"]),
        )
        cursor.execute(
            "UPDATE codigos_redefinicao_senha SET usado = TRUE WHERE id = %s",
            (registro["id"],),
        )
        conn.commit()
        return {"mensagem": "Senha redefinida com sucesso!"}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    finally:
        cursor.close()
        conn.close()
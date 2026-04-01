import bcrypt
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from database import get_db_connection
from schemas import UsuarioCreate, UsuarioLogin, EsqueceuSenhaRequest, VerificarCodigoRequest, RedefinirSenhaRequest

router = APIRouter(
    prefix="/usuarios",
    tags=["Autenticação"],
)


@router.post("/cadastro", status_code=201)
def cadastrar_usuario(dados: UsuarioCreate):
    """Registra um novo usuário (candidato ou recrutador)."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor()
    try:
        # Verifica duplicidade de e-mail
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (dados.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

        # Hash seguro da senha
        senha_hash = bcrypt.hashpw(dados.senha.encode("utf-8"), bcrypt.gensalt())

        cursor.execute(
            "INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario) VALUES (%s, %s, %s, %s)",
            (dados.nome, dados.email, senha_hash.decode("utf-8"), dados.tipo_usuario),
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
    Autentica o usuário e retorna seus dados junto com a flag
    `onboarding_completo`, indicando ao frontend se o perfil já foi preenchido.
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

        if not bcrypt.checkpw(dados.senha.encode("utf-8"), usuario["senha_hash"].encode("utf-8")):
            raise HTTPException(status_code=401, detail="Senha incorreta.")

        # Verifica se o candidato já passou pelo onboarding
        cursor.execute(
            "SELECT usuario_id FROM perfis_candidatos WHERE usuario_id = %s",
            (usuario["id"],),
        )
        tem_perfil = cursor.fetchone() is not None

        return {
            "mensagem": "Login realizado com sucesso!",
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

# =============================================================================
# REDEFINIÇÃO DE SENHA — VERSÃO DE TESTE
# Usa o código fixo "123456" sem enviar nenhum e-mail real.
# Para ativar a versão de produção (com envio de e-mail),
# substitua este bloco pelo conteúdo de routers/auth_email.py
# =============================================================================

CODIGO_TESTE = "123456"
EXPIRACAO_MINUTOS = 15


@router.post("/esqueceu-senha")
def esqueceu_senha(dados: EsqueceuSenhaRequest):
    """
    [VERSÃO TESTE] Simula o envio de código de verificação.
    O código sempre será '123456' — nenhum e-mail é enviado de verdade.
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco.")

    cursor = conn.cursor(dictionary=True)
    try:
        # Verifica se o e-mail existe
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (dados.email,))
        usuario = cursor.fetchone()
        if not usuario:
            # Por segurança retornamos sucesso mesmo se o e-mail não existir
            return {"mensagem": "Se este e-mail estiver cadastrado, você receberá um código."}

        # Remove códigos antigos do mesmo usuário
        cursor.execute(
            "DELETE FROM codigos_redefinicao_senha WHERE usuario_id = %s",
            (usuario["id"],)
        )

        # Insere o código fixo de teste com validade de 15 minutos
        expira_em = datetime.now() + timedelta(minutes=EXPIRACAO_MINUTOS)
        cursor.execute(
            "INSERT INTO codigos_redefinicao_senha (usuario_id, codigo, expira_em) VALUES (%s, %s, %s)",
            (usuario["id"], CODIGO_TESTE, expira_em)
        )
        conn.commit()

        # Em produção aqui seria disparado o envio de e-mail
        # Para teste, logamos no console:
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
    """
    Valida se o código informado é correto e ainda está dentro do prazo.
    Não consome o código — ele ainda poderá ser usado na etapa de redefinição.
    """
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
            (usuario["id"], dados.codigo)
        )
        registro = cursor.fetchone()
        if not registro:
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
    """
    Redefine a senha do usuário após validação do código.
    Marca o código como 'usado' para impedir reutilização.
    """
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

        # Valida o código mais uma vez antes de alterar a senha
        cursor.execute(
            """
            SELECT id FROM codigos_redefinicao_senha
            WHERE usuario_id = %s AND codigo = %s AND usado = FALSE AND expira_em > NOW()
            """,
            (usuario["id"], dados.codigo)
        )
        registro = cursor.fetchone()
        if not registro:
            raise HTTPException(status_code=400, detail="Código inválido ou expirado.")

        # Gera o hash da nova senha e atualiza
        nova_hash = bcrypt.hashpw(dados.nova_senha.encode("utf-8"), bcrypt.gensalt())
        cursor.execute(
            "UPDATE usuarios SET senha_hash = %s WHERE id = %s",
            (nova_hash.decode("utf-8"), usuario["id"])
        )

        # Marca o código como usado para evitar reaproveitamento
        cursor.execute(
            "UPDATE codigos_redefinicao_senha SET usado = TRUE WHERE id = %s",
            (registro["id"],)
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

import bcrypt
from fastapi import APIRouter, HTTPException
from database import get_db_connection
from schemas import UsuarioCreate, UsuarioLogin

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
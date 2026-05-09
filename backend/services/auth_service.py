import os
import logging
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext

load_dotenv()

logger = logging.getLogger(__name__)

# ── Configurações JWT ─────────────────────────────────────────────────────────

SECRET_KEY: str = os.getenv("JWT_SECRET", "")
if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET não definido no .env")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", 60))

# ── Hashing de senhas ─────────────────────────────────────────────────────────

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Retorna o hash bcrypt da senha fornecida."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Compara a senha em texto plano com o hash armazenado."""
    return pwd_context.verify(plain, hashed)


# ── JWT ───────────────────────────────────────────────────────────────────────

def create_access_token(user_id: int, email: str, role: str) -> str:
    """
    Gera um access token JWT com:
      - sub   : ID do usuário (como string)
      - email : e-mail do usuário
      - role  : CANDIDATO | RECRUTADOR
      - exp   : expiração baseada em JWT_EXPIRE_MINUTES
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Decodifica e valida o token JWT.
    Lança JWTError se o token for inválido ou estiver expirado.
    Retorna o payload como dicionário.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as exc:
        logger.warning(f"Token JWT inválido: {exc}")
        raise
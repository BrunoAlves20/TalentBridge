from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError

from services.auth_service import decode_access_token

# Extrai o token do header: Authorization: Bearer <token>
_bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> dict:
    """
    Dependência FastAPI que protege rotas autenticadas.

    Extrai o token JWT do header Authorization, valida-o e retorna o payload
    com os dados do usuário:

        {
            "user_id": int,
            "email": str,
            "role": "CANDIDATO" | "RECRUTADOR"
        }

    Lança 401 se:
      - O header Authorization estiver ausente
      - O token for inválido ou expirado
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação não fornecido.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_access_token(credentials.credentials)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    email = payload.get("email")
    role = payload.get("role")

    if not user_id or not email or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token com dados incompletos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {"user_id": int(user_id), "email": email, "role": role}


def require_candidato(current_user: dict = Depends(get_current_user)) -> dict:
    """Garante que o usuário autenticado seja do tipo CANDIDATO."""
    if current_user["role"] != "CANDIDATO":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a candidatos.",
        )
    return current_user


def require_recrutador(current_user: dict = Depends(get_current_user)) -> dict:
    """Garante que o usuário autenticado seja do tipo RECRUTADOR."""
    if current_user["role"] != "RECRUTADOR":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a recrutadores.",
        )
    return current_user
import os
import logging

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

HUNTER_API_KEY: str = os.getenv("HUNTER_API_KEY", "")
HUNTER_ENDPOINT = "https://api.hunter.io/v2/email-verifier"
HUNTER_TIMEOUT_SECONDS = 8

# Em DEV_MODE o fluxo é fail-open total para não exigir chave externa em dev.
# Em produção (DEV_MODE=false) qualquer falha torna-se fail-closed por segurança.
DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"

# Resultados que permitem prosseguir
_RESULTADOS_PERMITIDOS = {"deliverable", "risky"}


def _fallback(email: str, motivo: str) -> bool:
    """Decide o que fazer quando a Hunter falha — depende do modo."""
    if DEV_MODE:
        logger.warning(f"[Hunter] {motivo} — fail-open (DEV_MODE) para {email}.")
        return True
    logger.error(f"[Hunter] {motivo} — fail-closed (produção) para {email}.")
    return False


def verify_email(email: str) -> bool:
    """
    Consulta a API Hunter.io para verificar se o e-mail é real e entregável.

    Retorna:
      - True  → e-mail deliverable/risky (permitir cadastro)
      - False → e-mail undeliverable/unknown (bloquear)

    Em caso de falha (timeout, 5xx, chave ausente):
      - DEV_MODE=true  → retorna True (fail-open) para não atrapalhar testes locais
      - DEV_MODE=false → retorna False (fail-closed) para não aceitar e-mail não validado
    """
    if not HUNTER_API_KEY:
        return _fallback(email, "HUNTER_API_KEY não configurada")

    try:
        response = httpx.get(
            HUNTER_ENDPOINT,
            params={"email": email, "api_key": HUNTER_API_KEY},
            timeout=HUNTER_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        data = response.json()
        result: str = data.get("data", {}).get("result", "unknown")

        logger.info(f"[Hunter] {email} → resultado: {result}")

        if result == "risky":
            logger.warning(f"[Hunter] E-mail com risco aceito: {email}")

        return result in _RESULTADOS_PERMITIDOS

    except httpx.TimeoutException:
        return _fallback(email, "Timeout na Hunter.io")
    except httpx.HTTPStatusError as exc:
        return _fallback(email, f"HTTP {exc.response.status_code} na Hunter.io")
    except Exception as exc:
        return _fallback(email, f"Erro inesperado: {exc}")
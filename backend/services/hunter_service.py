import os
import logging

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

HUNTER_API_KEY: str = os.getenv("HUNTER_API_KEY", "")
HUNTER_ENDPOINT = "https://api.hunter.io/v2/email-verifier"
HUNTER_TIMEOUT_SECONDS = 8

# Resultados que permitem prosseguir
_RESULTADOS_PERMITIDOS = {"deliverable", "risky"}


def verify_email(email: str) -> bool:
    """
    Consulta a API Hunter.io para verificar se o e-mail é real e entregável.

    Retorna:
      - True  → e-mail é deliverable ou risky (permitir cadastro)
      - False → e-mail é undeliverable ou unknown (bloquear)

    Comportamento de resiliência (fail-open):
      Se a API da Hunter estiver indisponível (timeout, erro 5xx ou chave ausente),
      o método loga o erro e retorna True para não bloquear o usuário por
      falha de terceiros.
    """
    if not HUNTER_API_KEY:
        logger.warning(
            "[Hunter] HUNTER_API_KEY não configurada — verificação ignorada (fail-open)."
        )
        return True

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
        logger.error(f"[Hunter] Timeout ao verificar {email} — fail-open aplicado.")
        return True
    except httpx.HTTPStatusError as exc:
        logger.error(
            f"[Hunter] Erro HTTP {exc.response.status_code} ao verificar {email} "
            f"— fail-open aplicado."
        )
        return True
    except Exception as exc:
        logger.error(f"[Hunter] Erro inesperado ao verificar {email}: {exc} — fail-open aplicado.")
        return True
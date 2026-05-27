"""
Service do Simulador de Entrevistas com IA.

Usa o Google Gemini para conduzir uma entrevista simulada baseada no histórico
da sessão e (opcionalmente) no cargo-alvo. Também gera um feedback final
estruturado quando o candidato pede para encerrar a simulação.

Em DEV_MODE (sem GEMINI_API_KEY ou com DEV_MODE=true), o service entra em
modo determinístico, devolvendo respostas pré-formatadas para que o frontend
continue funcionando sem custo de API.
"""

import os
import logging
from typing import List, Dict, Optional

from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

logger = logging.getLogger(__name__)

GEMINI_MODEL = "gemini-flash-latest"
DEV_MODE = os.getenv("DEV_MODE", "false").lower() == "true"

_SYSTEM_PROMPT = """
Você é um Recrutador Virtual sênior da TalentBridge conduzindo uma entrevista simulada
em português brasileiro. Seu objetivo é treinar o candidato com perguntas técnicas e
comportamentais relevantes ao cargo que ele almeja.

Regras obrigatórias:
- Responda SEMPRE em português brasileiro, tom profissional mas acolhedor.
- Faça UMA pergunta por vez. Nunca emende várias.
- Comece reconhecendo brevemente a resposta anterior (1 frase) e em seguida faça a próxima pergunta.
- Alterne entre perguntas técnicas (stack, arquitetura, decisões) e comportamentais (método STAR).
- Use o cargo-alvo, quando informado, para guiar a profundidade técnica.
- Não invente vagas reais nem prometa contratação.
- Mantenha cada resposta com no máximo 4 frases curtas.
"""

_FEEDBACK_PROMPT = """
Você é um coach de carreira sênior. Analise a entrevista simulada abaixo e produza um
feedback final estruturado em português brasileiro, com no máximo 250 palavras.

Use exatamente este formato em Markdown:

**Pontos Fortes**
- (3 bullets curtos baseados nas respostas do candidato)

**Pontos a Melhorar**
- (3 bullets curtos e acionáveis)

**Nota Final:** X/10

**Próximo Passo Recomendado:** (uma única frase prática)

Não inclua nada além desse formato.
"""


# ── Respostas determinísticas para DEV_MODE ──────────────────────────────────
_DEV_QUESTIONS = [
    "Excelente! Para começarmos, me conte sobre um projeto que te orgulha — qual foi seu papel e qual problema ele resolveu?",
    "Interessante. E quando você se depara com um conflito de prioridades (ex: bug crítico vs. feature com prazo), como decide o que atacar primeiro?",
    "Bom raciocínio. Pensando em arquitetura, se você precisasse escalar esse sistema para 10x mais usuários, quais decisões técnicas tomaria primeiro?",
    "Ótimo. Agora me dê um exemplo usando o método STAR de uma vez em que você precisou influenciar uma decisão técnica do time.",
    "Última pergunta: onde você se vê daqui a 3 anos, e como esta vaga ajuda nesse caminho?",
]

_DEV_FEEDBACK = (
    "**Pontos Fortes**\n"
    "- Clareza ao descrever experiência técnica\n"
    "- Boa estrutura de raciocínio nas respostas comportamentais\n"
    "- Demonstra senioridade ao falar de trade-offs\n\n"
    "**Pontos a Melhorar**\n"
    "- Inclua mais métricas concretas (ex: 'reduzi o tempo em 40%')\n"
    "- Use o método STAR de forma mais consistente\n"
    "- Conecte cada resposta ao impacto no produto/negócio\n\n"
    "**Nota Final:** 7/10\n\n"
    "**Próximo Passo Recomendado:** Pratique 2 respostas-STAR completas antes da próxima entrevista real."
)


def _is_dev_mode() -> bool:
    """Considera DEV se a flag estiver ativa OU se não houver chave configurada."""
    return DEV_MODE or not os.getenv("GEMINI_API_KEY")


def _build_gemini_contents(history: List[Dict[str, str]], cargo_alvo: Optional[str]) -> str:
    """
    Monta um prompt único concatenando o system prompt + contexto da entrevista.
    O Gemini Flash aceita texto puro com bom desempenho.
    """
    partes = [_SYSTEM_PROMPT.strip()]
    if cargo_alvo:
        partes.append(f"\nCargo-alvo do candidato: {cargo_alvo}")
    partes.append("\n--- Histórico da entrevista ---")
    for msg in history:
        autor = "Recrutador" if msg["role"] == "assistant" else "Candidato"
        partes.append(f"{autor}: {msg['content']}")
    partes.append("\nRecrutador:")  # Pede a próxima resposta da IA
    return "\n".join(partes)


def gerar_proxima_pergunta(
    history: List[Dict[str, str]],
    cargo_alvo: Optional[str] = None,
) -> str:
    """
    Recebe o histórico completo da sessão e devolve a próxima fala do recrutador IA.

    O histórico vem do banco: lista de dicts com {"role": "assistant"|"user", "content": str}.
    A última mensagem do histórico deve ser uma resposta do usuário.
    """
    if _is_dev_mode():
        # Conta quantas respostas o usuário já deu e devolve a pergunta correspondente
        respostas_usuario = sum(1 for m in history if m["role"] == "user")
        idx = max(0, min(respostas_usuario - 1, len(_DEV_QUESTIONS) - 1))
        logger.info(f"[Simulador DEV_MODE] Devolvendo pergunta determinística #{idx}")
        return _DEV_QUESTIONS[idx]

    try:
        from google import genai
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        prompt = _build_gemini_contents(history, cargo_alvo)
        resposta = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
        texto = (resposta.text or "").strip()
        if not texto:
            raise ValueError("Gemini devolveu resposta vazia.")
        return texto
    except Exception as e:
        logger.error(f"[Simulador] Erro ao gerar pergunta via Gemini: {e}")
        raise HTTPException(
            status_code=502,
            detail="Não conseguimos gerar a próxima pergunta agora. Tente novamente em instantes.",
        )


def gerar_feedback_final(
    history: List[Dict[str, str]],
    cargo_alvo: Optional[str] = None,
) -> str:
    """
    Recebe o histórico completo e devolve um feedback estruturado em Markdown.
    """
    if _is_dev_mode():
        logger.info("[Simulador DEV_MODE] Devolvendo feedback determinístico")
        return _DEV_FEEDBACK

    try:
        from google import genai
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        partes = [_FEEDBACK_PROMPT.strip()]
        if cargo_alvo:
            partes.append(f"\nCargo-alvo do candidato: {cargo_alvo}")
        partes.append("\n--- Entrevista ---")
        for msg in history:
            autor = "Recrutador" if msg["role"] == "assistant" else "Candidato"
            partes.append(f"{autor}: {msg['content']}")
        prompt = "\n".join(partes)

        resposta = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
        texto = (resposta.text or "").strip()
        if not texto:
            raise ValueError("Gemini devolveu feedback vazio.")
        return texto
    except Exception as e:
        logger.error(f"[Simulador] Erro ao gerar feedback via Gemini: {e}")
        raise HTTPException(
            status_code=502,
            detail="Não conseguimos gerar o feedback agora. Tente novamente em instantes.",
        )

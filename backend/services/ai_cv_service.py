import os
import re
import json
import logging
from google import genai
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

GEMINI_MODEL = "gemini-flash-latest"

_PROMPT_TEMPLATE = """
Você é um recrutador especialista em RH. Extraia as informações do currículo abaixo e retorne o resultado **EXATAMENTE** neste formato JSON, sem nenhum texto adicional antes ou depois.

Regras:
- Se não encontrar uma informação, deixe a string vazia "".
- Em datas, use o formato de mês em números (ex: "03") e ano (ex: "2023"). Se não tiver mês, deixe vazio.
- Em 'isCurrent', use true ou false (booleano, sem aspas).
- 'stacks' são ferramentas técnicas (ex: React, Python).
- 'softSkills' são habilidades comportamentais (ex: Liderança).
- Resuma a experiência profissional na chave 'about' se não houver um resumo claro.

Estrutura JSON Obrigatória:
{{
    "personal": {{"fullName": "", "email": "", "phone": "", "gender": "", "age": "", "state": "", "city": "", "zipCode": "", "linkedin": "", "github": "", "portfolio": "", "about": ""}},
    "education": [{{"course": "", "institution": "", "degree": "", "startYear": "", "endYear": "", "hours": ""}}],
    "experience": [{{"company": "", "role": "", "startMonth": "", "startYear": "", "endMonth": "", "endYear": "", "isCurrent": false, "description": ""}}],
    "stacks": [],
    "softSkills": []
}}

Currículo:
{texto_curriculo}
"""

_MARKDOWN_JSON_RE = re.compile(r"```json\n?|```\n?")


def extrair_dados_curriculo_via_gemini(texto_curriculo: str) -> dict:
    """
    Envia o texto de um currículo para o Gemini e retorna um dicionário
    com os dados estruturados extraídos.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Chave da API do Gemini não configurada.")

    prompt = _PROMPT_TEMPLATE.format(texto_curriculo=texto_curriculo)

    try:
        client = genai.Client(api_key=api_key)
        resposta = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
        texto_resposta = resposta.text
    except Exception as e:
        logger.error(f"Erro na chamada à API do Gemini: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao comunicar com a IA: {e}")

    # Remove blocos de markdown que o Gemini eventualmente adiciona (```json ... ```)
    texto_limpo = _MARKDOWN_JSON_RE.sub("", texto_resposta).strip()

    try:
        dados = json.loads(texto_limpo)
    except json.JSONDecodeError:
        logger.error(f"JSON inválido retornado pelo Gemini: {texto_limpo}")
        raise HTTPException(
            status_code=500,
            detail="A IA retornou uma resposta em formato inválido. Tente novamente.",
        )

    logger.info("Dados do currículo extraídos com sucesso via Gemini.")
    return dados

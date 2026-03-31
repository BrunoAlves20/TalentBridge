import os
import shutil
import logging
from pathlib import Path

import PyPDF2
from fastapi import UploadFile, HTTPException

logger = logging.getLogger(__name__)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def salvar_upload_localmente(upload_file: UploadFile, usuario_id: int) -> str:
    """
    Salva o arquivo enviado pelo usuário em disco.

    Returns:
        Caminho completo do arquivo salvo.
    """
    nome_arquivo = f"user_{usuario_id}_{Path(upload_file.filename or 'arquivo').name}"
    caminho_arquivo = os.path.join(UPLOAD_DIR, nome_arquivo)

    try:
        with open(caminho_arquivo, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        logger.info(f"Arquivo salvo em: {caminho_arquivo}")
        return caminho_arquivo
    except OSError as e:
        logger.error(f"Erro ao salvar arquivo: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao salvar arquivo: {e}")


def extrair_texto_pdf(caminho_arquivo: str) -> str:
    """
    Lê um arquivo PDF do disco e extrai seu conteúdo de texto.

    Raises:
        HTTPException 400: se o PDF não contiver texto extraível (ex: PDF escaneado).
        HTTPException 500: se ocorrer um erro de leitura inesperado.
    """
    texto = ""

    try:
        with open(caminho_arquivo, "rb") as pdf_file:
            leitor = PyPDF2.PdfReader(pdf_file)
            for pagina in leitor.pages:
                texto_pagina = pagina.extract_text()
                if texto_pagina:
                    texto += texto_pagina + "\n"
    except OSError as e:
        logger.error(f"Erro ao ler PDF '{caminho_arquivo}': {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar o arquivo PDF: {e}")

    if not texto.strip():
        raise HTTPException(
            status_code=400,
            detail="Não foi possível extrair texto deste PDF. Ele pode ser uma imagem escaneada.",
        )

    logger.info(
        f"Texto extraído com sucesso de '{caminho_arquivo}' ({len(texto)} caracteres)."
    )
    return texto

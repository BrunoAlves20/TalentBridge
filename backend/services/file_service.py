import os
import shutil
import logging
import PyPDF2
from fastapi import UploadFile, HTTPException

logger = logging.getLogger(__name__)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def salvar_upload_localmente(upload_file: UploadFile, usuario_id: int) -> str:
    """
    Salva o arquivo enviado pelo usuário em disco.

    Args:
        upload_file: Arquivo recebido via FastAPI (UploadFile).
        usuario_id:  ID do usuário dono do arquivo.

    Returns:
        Caminho completo do arquivo salvo no disco.
    """
    nome_arquivo = f"user_{usuario_id}_{upload_file.filename}"
    caminho_arquivo = os.path.join(UPLOAD_DIR, nome_arquivo)

    try:
        with open(caminho_arquivo, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        logger.info(f"Arquivo salvo em: {caminho_arquivo}")
        return caminho_arquivo
    except Exception as e:
        logger.error(f"Erro ao salvar arquivo: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao salvar arquivo: {str(e)}")


def extrair_texto_pdf(caminho_arquivo: str) -> str:
    """
    Lê um arquivo PDF do disco e extrai seu conteúdo de texto.

    Args:
        caminho_arquivo: Caminho absoluto ou relativo do arquivo PDF.

    Returns:
        String com todo o texto extraído do PDF.

    Raises:
        HTTPException 400: Se o PDF não contiver texto extraível (ex: PDF de imagem).
    """
    texto_curriculo = ""

    try:
        with open(caminho_arquivo, "rb") as pdf_file:
            leitor_pdf = PyPDF2.PdfReader(pdf_file)
            for pagina in leitor_pdf.pages:
                texto_extraido = pagina.extract_text()
                if texto_extraido:
                    texto_curriculo += texto_extraido + "\n"
    except Exception as e:
        logger.error(f"Erro ao ler PDF '{caminho_arquivo}': {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar o arquivo PDF: {str(e)}")

    if not texto_curriculo.strip():
        raise HTTPException(
            status_code=400,
            detail="Não foi possível extrair texto deste PDF. Ele pode ser uma imagem escaneada.",
        )

    logger.info(f"Texto extraído com sucesso de '{caminho_arquivo}' ({len(texto_curriculo)} caracteres).")
    return texto_curriculo
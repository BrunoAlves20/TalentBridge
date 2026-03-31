import os
import glob
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse
from services.file_service import salvar_upload_localmente, extrair_texto_pdf, UPLOAD_DIR
from services.ai_cv_service import extrair_dados_curriculo_via_gemini

router = APIRouter(
    prefix="/candidatos",
    tags=["Inteligência Artificial"],
)


@router.post("/extrair-cv")
async def extrair_cv(usuario_id: int = Form(...), curriculo: UploadFile = File(...)):
    """
    Recebe um PDF de currículo, extrai o texto e usa o Google Gemini
    para estruturar os dados do candidato em JSON.
    """
    caminho_arquivo = salvar_upload_localmente(curriculo, usuario_id)
    texto_curriculo = extrair_texto_pdf(caminho_arquivo)
    dados_extraidos = extrair_dados_curriculo_via_gemini(texto_curriculo)

    return {
        "mensagem": "Currículo processado com sucesso via Inteligência Artificial",
        "dados": dados_extraidos,
    }


def _encontrar_arquivo_cv(usuario_id: int) -> str | None:
    """Retorna o caminho do CV do usuário ou None se não existir."""
    padrao = os.path.join(UPLOAD_DIR, f"user_{usuario_id}_*")
    arquivos = glob.glob(padrao)
    return arquivos[0] if arquivos else None


def _nome_original(caminho: str, usuario_id: int) -> str:
    """Remove o prefixo user_ID_ do nome do arquivo."""
    return os.path.basename(caminho).replace(f"user_{usuario_id}_", "", 1)


@router.get("/verificar-cv/{usuario_id}")
async def verificar_cv(usuario_id: int):
    """Verifica se o usuário possui um currículo salvo no servidor."""
    caminho = _encontrar_arquivo_cv(usuario_id)
    if caminho:
        return {"existe": True, "nome_arquivo": _nome_original(caminho, usuario_id)}
    return {"existe": False}


@router.get("/baixar-cv/{usuario_id}")
async def baixar_cv(usuario_id: int):
    """Permite o download do currículo salvo do usuário."""
    caminho = _encontrar_arquivo_cv(usuario_id)
    if not caminho:
        raise HTTPException(status_code=404, detail="Currículo não encontrado.")

    return FileResponse(
        path=caminho,
        filename=_nome_original(caminho, usuario_id),
        media_type="application/octet-stream",
    )

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
    Recebe um arquivo PDF de currículo, extrai o texto e usa o Google Gemini
    para estruturar os dados do candidato em JSON.
    """
    # 1. Persiste o arquivo em disco via file_service
    caminho_arquivo = salvar_upload_localmente(curriculo, usuario_id)

    # 2. Extrai o texto bruto do PDF via file_service
    texto_curriculo = extrair_texto_pdf(caminho_arquivo)

    # 3. Envia para o Gemini e recebe o dicionário estruturado via ai_service
    dados_extraidos = extrair_dados_curriculo_via_gemini(texto_curriculo)

    return {
        "mensagem": "Currículo processado com sucesso via Inteligência Artificial",
        "caminho_arquivo": caminho_arquivo,
        "dados": dados_extraidos,
    }


@router.get("/verificar-cv/{usuario_id}")
async def verificar_cv(usuario_id: int):
    """
    Verifica se o usuário possui um currículo salvo no servidor.
    """
    padrao = os.path.join(UPLOAD_DIR, f"user_{usuario_id}_*")
    arquivos = glob.glob(padrao)
    
    if arquivos:
        # Retorna o nome do arquivo original (removendo o prefixo user_ID_)
        nome_completo = os.path.basename(arquivos[0])
        nome_original = nome_completo.replace(f"user_{usuario_id}_", "", 1)
        return {"existe": True, "nome_arquivo": nome_original}
    
    return {"existe": False}


@router.get("/baixar-cv/{usuario_id}")
async def baixar_cv(usuario_id: int):
    """
    Permite o download do currículo salvo do usuário.
    """
    padrao = os.path.join(UPLOAD_DIR, f"user_{usuario_id}_*")
    arquivos = glob.glob(padrao)
    
    if not arquivos:
        raise HTTPException(status_code=404, detail="Currículo não encontrado.")
    
    caminho_arquivo = arquivos[0]
    nome_completo = os.path.basename(caminho_arquivo)
    nome_original = nome_completo.replace(f"user_{usuario_id}_", "", 1)
    
    return FileResponse(
        path=caminho_arquivo,
        filename=nome_original,
        media_type='application/octet-stream'
    )
import os
import glob
from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse
from dependencies import get_current_user
from services.file_service import salvar_upload_localmente, extrair_texto_pdf, UPLOAD_DIR
from services.ai_cv_service import extrair_dados_curriculo_via_gemini

router = APIRouter(
    prefix="/candidatos",
    tags=["Inteligência Artificial"],
)

# Limites de upload (defensivos contra DoS por arquivos enormes).
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf"}


@router.post("/extrair-cv")
async def extrair_cv(
    usuario_id: int = Form(...),
    curriculo: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Recebe um PDF de currículo, extrai o texto e usa o Google Gemini
    para estruturar os dados do candidato em JSON.
    Só permite enviar para o próprio usuário (JWT == form.usuario_id).
    """
    if usuario_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Você só pode enviar seu próprio CV.")

    # Valida extensão.
    nome = curriculo.filename or ""
    ext = os.path.splitext(nome)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de arquivo não permitido. Use: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Lê o conteúdo para validar tamanho (UploadFile carrega lazy).
    contents = await curriculo.read()
    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"Arquivo muito grande. Máx: {MAX_UPLOAD_SIZE // (1024*1024)}MB",
        )
    # Rebobina o stream para o file_service ler de novo.
    await curriculo.seek(0)

    caminho_arquivo = salvar_upload_localmente(curriculo, usuario_id)
    try:
        texto_curriculo = extrair_texto_pdf(caminho_arquivo)
        dados_extraidos = extrair_dados_curriculo_via_gemini(texto_curriculo)
    except HTTPException:
        # remove arquivo se a IA falhar, para não acumular lixo
        if os.path.exists(caminho_arquivo):
            try:
                os.remove(caminho_arquivo)
            except OSError:
                pass
        raise
    except Exception as e:
        if os.path.exists(caminho_arquivo):
            try:
                os.remove(caminho_arquivo)
            except OSError:
                pass
        raise HTTPException(status_code=500, detail=f"Erro ao processar CV: {str(e)}")

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
async def verificar_cv(usuario_id: int, current_user: dict = Depends(get_current_user)):
    """
    Verifica se o usuário possui um currículo salvo no servidor.
    Permitido para: o próprio candidato OU qualquer recrutador autenticado.
    """
    if current_user["role"] != "RECRUTADOR" and usuario_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Acesso negado.")
    caminho = _encontrar_arquivo_cv(usuario_id)
    if caminho:
        return {"existe": True, "nome_arquivo": _nome_original(caminho, usuario_id)}
    return {"existe": False}


@router.get("/baixar-cv/{usuario_id}")
async def baixar_cv(usuario_id: int, current_user: dict = Depends(get_current_user)):
    """
    Permite o download do currículo salvo do usuário.
    Permitido para: o próprio candidato OU qualquer recrutador autenticado.
    """
    if current_user["role"] != "RECRUTADOR" and usuario_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Acesso negado.")

    caminho = _encontrar_arquivo_cv(usuario_id)
    if not caminho:
        raise HTTPException(status_code=404, detail="Currículo não encontrado.")

    return FileResponse(
        path=caminho,
        filename=_nome_original(caminho, usuario_id),
        media_type="application/octet-stream",
    )

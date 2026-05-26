"""
Router do Simulador de Entrevistas com IA.

Endpoints (prefixo /simulador):
  - POST /sessoes                       → cria uma nova sessão e devolve a saudação inicial da IA
  - GET  /sessoes                       → lista sessões do usuário autenticado
  - GET  /sessoes/{sessao_id}           → detalha uma sessão (mensagens + status)
  - POST /sessoes/{sessao_id}/mensagens → envia uma resposta do candidato e recebe a próxima pergunta
  - POST /sessoes/{sessao_id}/finalizar → encerra a sessão e gera o feedback final
  - DELETE /sessoes/{sessao_id}         → apaga uma sessão (e suas mensagens)
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from database import get_db_connection
from dependencies import get_current_user
from services.ai_interview_service import gerar_proxima_pergunta, gerar_feedback_final

router = APIRouter(prefix="/simulador", tags=["Simulador de Entrevistas IA"])


# ── Schemas ──────────────────────────────────────────────────────────────────
class CriarSessaoIn(BaseModel):
    titulo: Optional[str] = Field(default=None, max_length=255)
    cargo_alvo: Optional[str] = Field(default=None, max_length=255)


class EnviarMensagemIn(BaseModel):
    conteudo: str = Field(..., min_length=1, max_length=4000)


class MensagemOut(BaseModel):
    id: int
    role: str
    conteudo: str
    criado_em: Optional[str] = None


class SessaoOut(BaseModel):
    id: int
    titulo: Optional[str]
    cargo_alvo: Optional[str]
    status: str
    feedback: Optional[str] = None
    criado_em: Optional[str] = None
    finalizado_em: Optional[str] = None
    mensagens: List[MensagemOut] = []


# ── Saudação inicial ─────────────────────────────────────────────────────────
_WELCOME_MESSAGE = (
    "Olá! Sou o seu Recrutador Virtual da TalentBridge. Vou simular uma entrevista técnica "
    "e comportamental para você chegar preparado na entrevista real. Pode me contar um pouco "
    "sobre você e a vaga que está almejando?"
)


# ── Helpers ──────────────────────────────────────────────────────────────────
def _db():
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=503, detail="Banco de dados indisponível.")
    return conn


def _row_to_mensagem(row: Dict[str, Any]) -> MensagemOut:
    return MensagemOut(
        id=row["id"],
        role=row["role"],
        conteudo=row["conteudo"],
        criado_em=row["criado_em"].isoformat() if row.get("criado_em") else None,
    )


def _carregar_sessao(sessao_id: int, usuario_id: int) -> Dict[str, Any]:
    conn = _db()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(
            "SELECT * FROM simulador_sessoes WHERE id=%s AND usuario_id=%s",
            (sessao_id, usuario_id),
        )
        sessao = cur.fetchone()
        if not sessao:
            raise HTTPException(status_code=404, detail="Sessão não encontrada.")

        cur.execute(
            "SELECT id, role, conteudo, criado_em FROM simulador_mensagens "
            "WHERE sessao_id=%s ORDER BY id ASC",
            (sessao_id,),
        )
        mensagens = cur.fetchall()
        sessao["mensagens"] = mensagens
        return sessao
    finally:
        conn.close()


def _historico_para_ia(mensagens: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    return [{"role": m["role"], "content": m["conteudo"]} for m in mensagens]


# ── Endpoints ────────────────────────────────────────────────────────────────
@router.post("/sessoes", status_code=status.HTTP_201_CREATED)
def criar_sessao(payload: CriarSessaoIn, user: dict = Depends(get_current_user)):
    """Cria uma nova sessão e já grava a saudação inicial da IA."""
    conn = _db()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO simulador_sessoes (usuario_id, titulo, cargo_alvo) VALUES (%s, %s, %s)",
            (user["user_id"], payload.titulo, payload.cargo_alvo),
        )
        sessao_id = cur.lastrowid

        cur.execute(
            "INSERT INTO simulador_mensagens (sessao_id, role, conteudo) VALUES (%s, %s, %s)",
            (sessao_id, "assistant", _WELCOME_MESSAGE),
        )
        conn.commit()
        cur.close()
    finally:
        conn.close()

    return _carregar_sessao(sessao_id, user["user_id"])


@router.get("/sessoes")
def listar_sessoes(user: dict = Depends(get_current_user)):
    conn = _db()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(
            "SELECT id, titulo, cargo_alvo, status, criado_em, finalizado_em "
            "FROM simulador_sessoes WHERE usuario_id=%s ORDER BY id DESC",
            (user["user_id"],),
        )
        rows = cur.fetchall()
        return {"sessoes": rows}
    finally:
        conn.close()


@router.get("/sessoes/{sessao_id}")
def detalhar_sessao(sessao_id: int, user: dict = Depends(get_current_user)):
    sessao = _carregar_sessao(sessao_id, user["user_id"])
    return sessao


@router.post("/sessoes/{sessao_id}/mensagens")
def enviar_mensagem(
    sessao_id: int,
    payload: EnviarMensagemIn,
    user: dict = Depends(get_current_user),
):
    """Recebe uma resposta do candidato, gera a próxima pergunta e devolve ambas."""
    sessao = _carregar_sessao(sessao_id, user["user_id"])
    if sessao["status"] == "FINALIZADA":
        raise HTTPException(status_code=400, detail="Sessão já finalizada.")

    conn = _db()
    try:
        cur = conn.cursor()
        # 1) Grava a mensagem do usuário
        cur.execute(
            "INSERT INTO simulador_mensagens (sessao_id, role, conteudo) VALUES (%s, %s, %s)",
            (sessao_id, "user", payload.conteudo),
        )
        conn.commit()
        cur.close()
    finally:
        conn.close()

    # 2) Recarrega histórico atualizado e pede a próxima pergunta à IA
    sessao = _carregar_sessao(sessao_id, user["user_id"])
    historico = _historico_para_ia(sessao["mensagens"])
    proxima = gerar_proxima_pergunta(historico, cargo_alvo=sessao.get("cargo_alvo"))

    # 3) Grava a resposta da IA
    conn = _db()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO simulador_mensagens (sessao_id, role, conteudo) VALUES (%s, %s, %s)",
            (sessao_id, "assistant", proxima),
        )
        conn.commit()
        cur.close()
    finally:
        conn.close()

    return _carregar_sessao(sessao_id, user["user_id"])


@router.post("/sessoes/{sessao_id}/finalizar")
def finalizar_sessao(sessao_id: int, user: dict = Depends(get_current_user)):
    sessao = _carregar_sessao(sessao_id, user["user_id"])
    if sessao["status"] == "FINALIZADA":
        return sessao  # idempotente

    historico = _historico_para_ia(sessao["mensagens"])
    feedback = gerar_feedback_final(historico, cargo_alvo=sessao.get("cargo_alvo"))

    conn = _db()
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE simulador_sessoes "
            "SET status=%s, feedback=%s, finalizado_em=CURRENT_TIMESTAMP "
            "WHERE id=%s AND usuario_id=%s",
            ("FINALIZADA", feedback, sessao_id, user["user_id"]),
        )
        cur.execute(
            "INSERT INTO simulador_mensagens (sessao_id, role, conteudo) VALUES (%s, %s, %s)",
            (sessao_id, "assistant", feedback),
        )
        conn.commit()
        cur.close()
    finally:
        conn.close()

    return _carregar_sessao(sessao_id, user["user_id"])


@router.delete("/sessoes/{sessao_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_sessao(sessao_id: int, user: dict = Depends(get_current_user)):
    conn = _db()
    try:
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM simulador_sessoes WHERE id=%s AND usuario_id=%s",
            (sessao_id, user["user_id"]),
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Sessão não encontrada.")
        conn.commit()
        cur.close()
    finally:
        conn.close()
    return None

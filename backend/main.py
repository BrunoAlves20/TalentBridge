import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import auth, candidatos, inteligencias, recrutador, vagas, auth_otp, simulador
from routers.auth_social import router as auth_social_router
from database import init_db

load_dotenv()


# ── Lifespan (substitui o @app.on_event("startup") deprecado) ────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="TalentBridge API",
    version="2.5.0",
    description=(
        "Plataforma de recrutamento com extração de currículos via IA, verificação OTP, "
        "login social (Google e LinkedIn) e simulador de entrevistas com IA."
    ),
    lifespan=lifespan,
)


# ── CORS ──────────────────────────────────────────────────────────────────────
# Em produção, configure CORS_ORIGINS no .env separando por vírgula:
#   CORS_ORIGINS=https://app.talentbridge.com,https://www.talentbridge.com
_default_origins = "http://localhost:3000,http://127.0.0.1:3000"
_origins_env = os.getenv("CORS_ORIGINS", _default_origins)
_allow_origins = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Healthcheck ───────────────────────────────────────────────────────────────
@app.get("/health", tags=["Sistema"])
def health():
    return {"status": "ok"}


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)             # /usuarios     — login, senha, preferências
app.include_router(auth_otp.router)         # /auth         — send-code, verify-code (OTP)
app.include_router(auth_social_router)      # /auth/social  — Google e LinkedIn OAuth
app.include_router(candidatos.router)       # /candidatos
app.include_router(inteligencias.router)    # /candidatos/* — extração de CV via IA
app.include_router(recrutador.router)       # /recrutador
app.include_router(vagas.router)            # /vagas
app.include_router(simulador.router)        # /simulador    — Simulador de Entrevistas IA

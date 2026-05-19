from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, candidatos, inteligencias, recrutador, vagas, auth_otp
from routers.auth_social import router as auth_social_router
from database import init_db

app = FastAPI(
    title="TalentBridge API",
    version="2.4.0",
    description="Plataforma de recrutamento com extração de currículos via IA, verificação OTP e login social (Google e LinkedIn).",
)

# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup():
    init_db()

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)             # /usuarios — login, senha, preferências
app.include_router(auth_otp.router)         # /auth     — send-code, verify-code (OTP)
app.include_router(auth_social_router)      # /auth/social — Google e LinkedIn OAuth
app.include_router(candidatos.router)       # /candidatos
app.include_router(inteligencias.router)    # /inteligencias
app.include_router(recrutador.router)       # /recrutador
app.include_router(vagas.router)            # /vagas
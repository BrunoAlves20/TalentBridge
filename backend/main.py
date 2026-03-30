from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, candidatos, inteligencias

app = FastAPI(
    title="TalentBridge API",
    version="2.0.0",
    description="Plataforma de recrutamento com extração de currículos via IA.",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(candidatos.router)
app.include_router(inteligencias.router)
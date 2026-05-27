# Backend — TalentBridge

A documentação principal está no **README na raiz do projeto**.
Consulte: [`../README.md`](../README.md)

## Estrutura desta pasta

- `main.py` — entrypoint do FastAPI, registra todos os routers e configura CORS.
- `database.py` — conexão MySQL e `init_db()` (executa `Database/db.sql` + `seed.sql`).
- `dependencies.py` — `get_current_user`, `require_candidato`, `require_recrutador` (auth via JWT Bearer).
- `schemas.py` — modelos Pydantic compartilhados entre routers.
- `routers/` — endpoints por domínio (`auth`, `auth_otp`, `auth_social`, `candidatos`, `recrutador`, `vagas`, `simulador`, `inteligencias`).
- `services/` — integrações externas (Gemini, Hunter.io, SMTP, OAuth) e helpers de auth/file.
- `tests/` — suíte pytest (rode com `pytest backend/tests/`).

## Quick start (apenas backend, sem Docker)

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Linux/Mac
# venv\Scripts\activate           # Windows PowerShell

pip install -r requirements.txt

# Configure backend/.env (copie de .env.example)
# DB_HOST=localhost  (ou outro host MySQL acessível)

uvicorn main:app --reload --port 8000
```

A documentação Swagger interativa fica em http://localhost:8000/docs.

from pydantic import BaseModel, EmailStr
from typing import List, Optional


# ── Autenticação ──────────────────────────────────────────────────────────────
# UsuarioCreate foi removido — o cadastro acontece via fluxo OTP definido
# inline em routers/auth_otp.py (SendCodeRequest / VerifyCodeRequest).


class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str


# ── Onboarding ────────────────────────────────────────────────────────────────

class PersonalData(BaseModel):
    fullName: str
    email: str
    phone: str
    gender: str
    age: str
    profilePicture: Optional[str] = ""
    state: str
    city: str
    zipCode: str
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    portfolio: Optional[str] = ""
    about: str


class EducationData(BaseModel):
    course: str
    institution: str
    degree: str
    startYear: str
    endYear: str
    hours: Optional[str] = ""


class ExperienceData(BaseModel):
    company: str
    role: str
    startMonth: str
    startYear: str
    endMonth: Optional[str] = ""
    endYear: Optional[str] = ""
    isCurrent: bool
    description: str


class OnboardingPayload(BaseModel):
    usuario_id: int
    personal: PersonalData
    education: List[EducationData]
    experience: List[ExperienceData]
    stacks: List[str]
    softSkills: List[str]


# ── Gestão de Conta ───────────────────────────────────────────────────────────
# EsqueceuSenhaRequest, VerificarCodigoRequest e RedefinirSenhaRequest foram
# removidos — o fluxo de recuperação de senha agora usa POST /auth/send-code
# e POST /auth/verify-code (routers/auth_otp.py + tabela codigos_verificacao).

class AlterarSenhaRequest(BaseModel):
    usuario_id: int
    senha_atual: str
    nova_senha: str


class PreferenciasUpdate(BaseModel):
    """
    Todos os campos são opcionais — apenas os enviados serão atualizados
    (merge com as preferências existentes no banco).
    """
    email_candidatura: Optional[bool] = None
    email_status: Optional[bool] = None
    email_novidades: Optional[bool] = None


# ── Perfil candidato ──────────────────────────────────────────────────────────

class PerfilUpdate(BaseModel):
    usuario_id: int
    fullName: str
    email: str
    phone: str
    gender: str
    age: str
    state: str
    city: str
    zipCode: str
    linkedin: str
    github: str
    portfolio: str
    about: str
    profilePicture: Optional[str] = ""


# ── Recrutador — Vagas ────────────────────────────────────────────────────────

class VagaCreate(BaseModel):
    recrutador_id: int
    titulo: str
    departamento: Optional[str] = ""
    descricao: str
    requisitos: Optional[str] = ""
    modalidade: str = "PRESENCIAL"
    localizacao: Optional[str] = ""
    faixa_salarial: Optional[str] = ""


class VagaUpdate(BaseModel):
    recrutador_id: int
    titulo: str
    departamento: Optional[str] = ""
    descricao: str
    requisitos: Optional[str] = ""
    modalidade: str = "PRESENCIAL"
    localizacao: Optional[str] = ""
    faixa_salarial: Optional[str] = ""
    status: str = "ABERTA"


# ── Recrutador — Candidaturas ─────────────────────────────────────────────────

class CandidaturaStatusUpdate(BaseModel):
    status: str


# ── Candidato — Candidaturas ──────────────────────────────────────────────────

class CandidaturaCreate(BaseModel):
    vaga_id: int
    candidato_id: int


# ── Candidato — Vagas Salvas ──────────────────────────────────────────────────

class VagaSalvaCreate(BaseModel):
    usuario_id: int
    vaga_id: int

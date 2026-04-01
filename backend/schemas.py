from pydantic import BaseModel, EmailStr
from typing import List, Optional


# ── Autenticação ──────────────────────────────────────────────────────────────

class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    tipo_usuario: str


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


# ── Redefinição de Senha ──────────────────────────────────────────────────────

class EsqueceuSenhaRequest(BaseModel):
    email: EmailStr


class VerificarCodigoRequest(BaseModel):
    email: EmailStr
    codigo: str


class RedefinirSenhaRequest(BaseModel):
    email: EmailStr
    codigo: str
    nova_senha: str

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
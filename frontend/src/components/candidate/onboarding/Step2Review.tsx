"use client";

import { useState, useEffect } from "react";
import { User, GraduationCap, Sparkles, CheckCircle, ChevronRight, ChevronLeft, AlertCircle, Plus, Link } from "lucide-react";

export interface Step2Data {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    gender: string;
    age: string;
    profilePicture: string;
    state: string;
    city: string;
    zipCode: string;
    linkedin: string;
    github: string;
    portfolio: string;
    about: string;
  };
  education: {
    id: number;
    course: string;
    institution: string;
    degree: string;
    startYear: string;
    endYear: string;
    hours: string;
  }[];
}

interface Step2ReviewProps {
  method: "ai" | "manual";
  onNext: (data: Step2Data) => void;
  onBack: () => void;
  initialData?: Step2Data | null;
}

const BRAZIL_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", 
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", 
  "SP", "SE", "TO"
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());
const FUTURE_YEARS = Array.from({ length: 10 }, (_, i) => (currentYear + i + 1).toString());
const ALL_YEARS = [...FUTURE_YEARS.reverse(), ...YEARS]; 

const mockAiData: Step2Data = {
  personal: {
    fullName: "Lucas Rafael Martins",
    email: "lucas.martins@email.com",
    phone: "(11) 98765-4321",
    gender: "Masculino",
    age: "28",
    profilePicture: "https://github.com/lucasmartins.png",
    state: "SP",
    city: "São Paulo",
    zipCode: "01000-000",
    linkedin: "linkedin.com/in/lucasmartinsdev",
    github: "github.com/lucasmartins",
    portfolio: "lucasmartins.dev",
    about: "Engenheiro de Software apaixonado por criar interfaces rápidas e acessíveis. Especialista em ecossistema React e Next.js com foco intenso na experiência do usuário e escalabilidade de arquitetura front-end."
  },
  education: [
    {
      id: 1,
      course: "Engenharia de Software",
      institution: "Universidade de São Paulo (USP)",
      degree: "Superior",
      startYear: "2016",
      endYear: "2020",
      hours: "4000"
    }
  ]
};

const emptyData: Step2Data = {
  personal: {
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    age: "",
    profilePicture: "",
    state: "",
    city: "",
    zipCode: "",
    linkedin: "",
    github: "",
    portfolio: "",
    about: ""
  },
  education: [
    {
      id: 1,
      course: "",
      institution: "",
      degree: "",
      startYear: "",
      endYear: "",
      hours: ""
    }
  ]
};

export function Step2Review({ method, onNext, onBack, initialData }: Step2ReviewProps) {
  const [formData, setFormData] = useState<Step2Data>(initialData || (method === "ai" ? mockAiData : emptyData));
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;
    
    if (name === "phone") {
      let v = value.replace(/\D/g, "");
      if (v.length > 11) v = v.slice(0, 11);
      if (v.length > 10) value = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
      else if (v.length > 5) value = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
      else if (v.length > 2) value = v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
      else value = v;
    } else if (name === "zipCode") {
      let v = value.replace(/\D/g, "");
      if (v.length > 8) v = v.slice(0, 8);
      if (v.length > 5) value = v.replace(/^(\d{5})(\d{1,3}).*/, "$1-$2");
      else value = v;
    }

    setFormData(prev => ({
      ...prev,
      personal: { ...prev.personal, [name]: value }
    }));
    if (showError) setShowError(false);
  };

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        personal: { ...prev.personal, profilePicture: imageUrl }
      }));
      if (showError) setShowError(false);
    }
  };

  const handleEducationChange = (id: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(ed => ed.id === id ? { ...ed, [field]: value } : ed)
    }));
  };

  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { id: Date.now(), course: "", institution: "", degree: "", startYear: "", endYear: "", hours: "" }]
    }));
  };
  const handleRemoveEducation = (id: number) => {
    setFormData(prev => ({ ...prev, education: prev.education.filter(ed => ed.id !== id) }));
  };

  const validateAndNext = () => {
    const p = formData.personal;
    
    if (!p.fullName.trim() || !p.email.trim() || !p.phone.trim() || !p.gender || !p.age.trim() || !p.state || !p.city.trim() || !p.zipCode.trim() || !p.about.trim()) {
      setErrorMessage("Preencha todas as informações obrigatórias da seção 1. Dados Pessoais.");
      setShowError(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validação Robusta de Formações Acadêmicas
    const isEducationTotallyEmpty = (ed: any) => 
      !ed.course.trim() && !ed.institution.trim() && !ed.degree.trim() && !ed.startYear.trim() && !ed.endYear.trim();
    
    const isEducationPartiallyFilled = (ed: any) => 
      !isEducationTotallyEmpty(ed) && 
      (!ed.course.trim() || !ed.institution.trim() || !ed.degree.trim() || !ed.startYear.trim() || !ed.endYear.trim());

    if (formData.education.some(isEducationPartiallyFilled)) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios das formações acadêmicas iniciadas.");
      setShowError(true);
      return;
    }

    if (formData.education.length > 1 && formData.education.some(isEducationTotallyEmpty)) {
      setErrorMessage("Você possui formulários de formação acadêmica vazios. Por favor, preencha-os ou remova-os.");
      setShowError(true);
      return;
    }
    // --- NOVA VALIDAÇÃO DE DATAS: Ano Fim não pode ser menor que Ano Início ---
    for (const ed of formData.education) {
      if (!isEducationTotallyEmpty(ed)) {
        if (parseInt(ed.endYear) < parseInt(ed.startYear)) {
          setErrorMessage(`Atenção: O ano de conclusão (${ed.endYear}) não pode ser menor que o ano de início (${ed.startYear}) no curso de ${ed.course || 'Formação'}.`);
          setShowError(true);
          return;
        }
      }
    }

    setShowError(false);
    onNext(formData);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 mb-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Dados do Perfil
          </h2>
          {method === "ai" ? (
            <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 w-fit mx-auto rounded-full border border-emerald-200 dark:border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
              Nossa IA extraiu seus dados com sucesso! Confirme as informações abaixo.
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 font-medium bg-slate-100 dark:bg-[#1A1D2D] px-4 py-2 w-fit mx-auto rounded-full border border-slate-200 dark:border-slate-800">
              <AlertCircle className="w-4 h-4" />
              Preencha as seções essenciais antes de adicionar sua experiência.
            </div>
          )}
        </div>

        <form id="step2-form" onSubmit={(e) => { e.preventDefault(); validateAndNext(); }} className="space-y-8 relative">
          {showError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 sticky top-4 z-50 shadow-lg">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="font-bold text-sm">{errorMessage}</p>
            </div>
          )}

          {/* 1: DADOS PESSOAIS */}
          <div className={`bg-white dark:bg-[#0B0E14] rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-300 ${showError && errorMessage.includes("Dados Pessoais") ? 'border-2 border-rose-400 dark:border-rose-500 shadow-rose-500/10' : 'border border-slate-200 dark:border-slate-800/50'}`}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${showError && errorMessage.includes("Dados Pessoais") ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'}`}>
                <User className="w-5 h-5" />
              </div>
              <h3 className={`text-xl font-bold ${showError && errorMessage.includes("Dados Pessoais") ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                1. Dados Pessoais <span className="text-rose-500 ml-1">*</span>
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Nome Completo <span className="text-rose-500">*</span></label>
                <input type="text" name="fullName" value={formData.personal.fullName} onChange={handlePersonalChange} className="w-full font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Seu nome completo" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">E-mail <span className="text-rose-500">*</span></label>
                <input type="email" name="email" value={formData.personal.email} onChange={handlePersonalChange} className="w-full font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="exemplo@email.com" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Telefone <span className="text-rose-500">*</span></label>
                <input type="text" name="phone" value={formData.personal.phone} onChange={handlePersonalChange} className="w-full font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="(00) 00000-0000" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Gênero <span className="text-rose-500">*</span></label>
                <select name="gender" value={formData.personal.gender} onChange={handlePersonalChange} className="w-full font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Não-binário">Não-binário</option>
                  <option value="Outro">Outro</option>
                  <option value="Prefiro não informar">Prefiro não informar</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Idade <span className="text-rose-500">*</span></label>
                <input type="number" min="14" max="100" name="age" value={formData.personal.age} onChange={handlePersonalChange} className="w-full font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Ex: 25" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
              <div className="space-y-2 md:col-span-1">
                <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Estado <span className="text-rose-500">*</span></label>
                <select name="state" value={formData.personal.state} onChange={handlePersonalChange} className="w-full font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                  <option value="">UF</option>
                  {BRAZIL_STATES.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Cidade <span className="text-rose-500">*</span></label>
                <input type="text" name="city" value={formData.personal.city} onChange={handlePersonalChange} className="w-full font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Sua cidade" />
              </div>
              <div className="space-y-2 md:col-span-1">
                <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">CEP <span className="text-rose-500">*</span></label>
                <input type="text" name="zipCode" value={formData.personal.zipCode} onChange={handlePersonalChange} className="w-full font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="00000-000" />
              </div>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 block mb-1">Sobre mim <span className="text-rose-500">*</span></label>
                <textarea 
                  name="about"
                  value={formData.personal.about} 
                  onChange={handlePersonalChange} 
                  rows={4}
                  className="w-full font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none" 
                  placeholder="Fale um pouco sobre você, sua trajetória e seus objetivos profissionais (min. 50 caracteres)..." 
                />
                <p className="text-xs text-slate-400 font-medium text-right mt-1">{formData.personal.about.length} caracteres</p>
              </div>
            </div>
          </div>

          {/* 2: FOTO E LINKS */}
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Link className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                2. Foto e Links
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Foto de Perfil <span className="text-emerald-400 lowercase font-medium tracking-normal ml-1">(Opcional)</span></label>
                <input type="file" accept="image/png, image/jpeg" onChange={handleProfilePictureUpload} className="w-full font-medium text-slate-900 dark:text-slate-400 bg-slate-50 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 transition-all file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-500/20 dark:file:text-emerald-400 hover:file:bg-emerald-100 dark:hover:file:bg-emerald-500/30 cursor-pointer" />
                {formData.personal.profilePicture && formData.personal.profilePicture.startsWith("blob:") && (
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 pl-1">✓ Imagem carregada </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">LinkedIn URL <span className="text-emerald-400 lowercase font-medium tracking-normal ml-1">(Opcional)</span></label>
                <input type="text" name="linkedin" value={formData.personal.linkedin} onChange={handlePersonalChange} className="w-full font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="linkedin.com/..." />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">GitHub URL <span className="text-emerald-400 lowercase font-medium tracking-normal ml-1">(Opcional)</span></label>
                <input type="text" name="github" value={formData.personal.github} onChange={handlePersonalChange} className="w-full font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="github.com/..." />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Portfólio URL <span className="text-emerald-400 lowercase font-medium tracking-normal ml-1">(Opcional)</span></label>
                <input type="text" name="portfolio" value={formData.personal.portfolio} onChange={handlePersonalChange} className="w-full font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="seu-site.com" />
              </div>
            </div>
          </div>

          {/* 3: FORMAÇÃO ACADÊMICA */}
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">3. Formação Acadêmica</h3>
              </div>
              <button type="button" onClick={handleAddEducation} className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 hover:text-sky-700 font-bold text-sm bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 transition-colors px-3 py-1.5 rounded-lg border border-sky-200 dark:border-sky-500/20">
                <Plus className="w-4 h-4" /> Nova
              </button>
            </div>
            
            <div className="space-y-6">
              {formData.education.map((ed) => (
                <div key={ed.id} className="relative bg-slate-50 dark:bg-[#1A1D2D]/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                  {formData.education.length > 1 && (
                    <button type="button" onClick={() => handleRemoveEducation(ed.id)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors text-xs font-bold uppercase tracking-widest">Remover</button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-2">
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Curso / Título</label>
                      <input type="text" value={ed.course} onChange={(e) => handleEducationChange(ed.id, 'course', e.target.value)} className="w-full font-medium text-slate-900 dark:text-white bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-sky-500" placeholder="Ex: Análise e Desenvolvimento de Sistemas" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Instituição</label>
                      <input type="text" value={ed.institution} onChange={(e) => handleEducationChange(ed.id, 'institution', e.target.value)} className="w-full font-medium text-slate-900 dark:text-white bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-sky-500" placeholder="Ex: Faculdade X" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                    <div className="col-span-2 md:col-span-1 space-y-2">
                      <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Grau</label>
                      <select value={ed.degree} onChange={(e) => handleEducationChange(ed.id, 'degree', e.target.value)} className="w-full font-medium text-slate-900 dark:text-white bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-sky-500">
                        <option value="">Selecione</option>
                        <option value="Fundamental">Fundamental</option>
                        <option value="Médio">Médio / Colegial</option>
                        <option value="Técnico">Ensino Técnico</option>
                        <option value="Superior">Ensino Superior / Bacharelado</option>
                        <option value="Pós-graduação">Pós-graduação</option>
                        <option value="Mestrado">Mestrado</option>
                        <option value="Doutorado">Doutorado</option>
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-1 space-y-2">
                      <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Ano Início</label>
                      <select value={ed.startYear} onChange={(e) => handleEducationChange(ed.id, 'startYear', e.target.value)} className="w-full font-medium text-slate-900 dark:text-white bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-sky-500">
                        <option value="" disabled>Selecione</option>
                        {ALL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-1 space-y-2">
                      <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Ano Fim</label>
                      <select value={ed.endYear} onChange={(e) => handleEducationChange(ed.id, 'endYear', e.target.value)} className="w-full font-medium text-slate-900 dark:text-white bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-sky-500">
                        <option value="" disabled>Selecione</option>
                        {ALL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-1 space-y-2">
                      <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Horas (Opcional)</label>
                      <input type="text" value={ed.hours} onChange={(e) => handleEducationChange(ed.id, 'hours', e.target.value)} className="w-full font-medium text-slate-900 dark:text-white bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-sky-500" placeholder="Ex: 3600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

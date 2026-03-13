"use client";

import { useState, useEffect } from "react";
import { Briefcase, Wrench, CheckCircle, ChevronRight, ChevronLeft, AlertCircle, Plus, CalendarDays, HeartHandshake } from "lucide-react";

export interface Step3Data {
  experience: {
    id: number;
    company: string;
    role: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    isCurrent: boolean;
    description: string;
  }[];
  stacks: string[];
  softSkills: string[];
}

interface Step3SkillsProps {
  method: "ai" | "manual";
  onBack: () => void;
  onComplete: (data: Step3Data) => void;
  initialData?: Step3Data | null;
}

const STACKS_BY_CATEGORY: Record<string, string[]> = {
  "Frontend": ["JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular", "Tailwind CSS", "SASS"],
  "Backend": ["Node.js", "Python", "Java", "C#", "C++", "Ruby", "PHP", "Go", "Rust"],
  "Banco de Dados": ["SQL", "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "Redis"],
  "Cloud & DevOps": ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "CI/CD"],
  "Design & UX": ["Figma", "UX/UI Design", "Framer Motion"],
  "Dados e IA": ["Power BI", "Data Analysis", "Machine Learning", "Data Engineering"],
  "Outros / Metodologias": ["Scrum", "Agile", "Jest", "Cypress", "Git", "GitHub/GitLab"]
};

const SOFT_SKILLS = [
  "Comunicação Efetiva", "Trabalho em Equipe", "Liderança", "Resolução de Problemas", 
  "Pensamento Crítico", "Adaptabilidade", "Gestão de Tempo", "Inteligência Emocional",
  "Criatividade", "Proatividade", "Empatia", "Negociação", "Foco no Cliente",
  "Atenção aos Detalhes", "Aprendizado Contínuo", "Resiliência", "Ética Profissional",
  "Mentoria", "Feedback Construtivo", "Oratória"
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());
const FUTURE_YEARS = Array.from({ length: 10 }, (_, i) => (currentYear + i + 1).toString());
const ALL_YEARS = [...FUTURE_YEARS.reverse(), ...YEARS]; 

const MONTHS = [
  { value: "01", label: "Janeiro" }, { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" }, { value: "04", label: "Abril" },
  { value: "05", label: "Maio" }, { value: "06", label: "Junho" },
  { value: "07", label: "Julho" }, { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" }, { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" }, { value: "12", label: "Dezembro" },
];

const mockAiData: Step3Data = {
  experience: [
    {
      id: 1,
      company: "TechNova Solutions",
      role: "Engenheiro Front-End Sênior",
      startMonth: "01",
      startYear: "2021",
      endMonth: "",
      endYear: "",
      isCurrent: true,
      description: "Liderou a migração de um monolito legado para uma arquitetura moderna com Next.js (App Router) e React, aumentando a performance em 45%. Implementou o Design System focado em Acessibilidade e UX/UI."
    },
    {
      id: 2,
      company: "Creative Web Agency",
      role: "Desenvolvedor Front-End Pleno",
      startMonth: "02",
      startYear: "2018",
      endMonth: "12",
      endYear: "2020",
      isCurrent: false,
      description: "Desenvolvimento de interfaces modernas e responsivas usando React e Tailwind CSS. Integração com APIs RESTful e GraphQL. Colaboração com a equipe de Design no Figma para garantir o Pixel Perfect."
    }
  ],
  stacks: ["Next.js", "React", "TypeScript", "Tailwind CSS", "UX/UI Design", "Framer Motion", "Jest", "Git"],
  softSkills: ["Comunicação Efetiva", "Trabalho em Equipe", "Resolução de Problemas", "Adaptabilidade"]
};

const emptyData: Step3Data = {
  experience: [{ id: 1, company: "", role: "", startMonth: "", startYear: "", endMonth: "", endYear: "", isCurrent: false, description: "" }],
  stacks: [],
  softSkills: []
};

export function Step3Skills({ method, onBack, onComplete, initialData }: Step3SkillsProps) {
  const [formData, setFormData] = useState<Step3Data>(initialData || (method === "ai" ? mockAiData : emptyData));
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // States para inputs customizados
  const [customStack, setCustomStack] = useState("");
  const [showStackInput, setShowStackInput] = useState(false);
  const [customSoftSkill, setCustomSoftSkill] = useState("");
  const [showSoftSkillInput, setShowSoftSkillInput] = useState(false);

  const handleExperienceChange = (id: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => {
        if (exp.id === id) {
          const updatedExp = { ...exp, [field]: value };
          if (field === 'isCurrent' && value === true) {
            updatedExp.endMonth = "";
            updatedExp.endYear = "";
          }
          return updatedExp;
        }
        return exp;
      })
    }));
  };

  const handleAddExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: Date.now(), company: "", role: "", startMonth: "", startYear: "", endMonth: "", endYear: "", isCurrent: false, description: "" }]
    }));
  };

  const handleRemoveExperience = (id: number) => {
    setFormData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
  };

  const toggleStack = (skill: string) => {
    setFormData(prev => {
      const current = prev.stacks;
      if (current.includes(skill)) return { ...prev, stacks: current.filter(s => s !== skill) };
      if (current.length >= 10) return prev;
      return { ...prev, stacks: [...current, skill] };
    });
    if (showError) setShowError(false);
  };

  const addCustomStack = () => {
    const trimmed = customStack.trim();
    if (!trimmed) {
      setShowStackInput(false);
      return;
    }
    
    // Verifica se já existe (case-insensitive)
    const exists = formData.stacks.some(s => s.toLowerCase() === trimmed.toLowerCase());
    if (!exists && formData.stacks.length < 10) {
      toggleStack(trimmed);
    }
    
    setCustomStack("");
    setShowStackInput(false);
  };

  const toggleSoftSkill = (skill: string) => {
    setFormData(prev => {
      const current = prev.softSkills;
      if (current.includes(skill)) return { ...prev, softSkills: current.filter(s => s !== skill) };
      if (current.length >= 10) return prev;
      return { ...prev, softSkills: [...current, skill] };
    });
    if (showError) setShowError(false);
  };

  const addCustomSoftSkill = () => {
    const trimmed = customSoftSkill.trim();
    if (!trimmed) {
      setShowSoftSkillInput(false);
      return;
    }
    
    const exists = formData.softSkills.some(s => s.toLowerCase() === trimmed.toLowerCase());
    if (!exists && formData.softSkills.length < 10) {
      toggleSoftSkill(trimmed);
    }
    
    setCustomSoftSkill("");
    setShowSoftSkillInput(false);
  };

  const validateAndComplete = () => {
    if (formData.stacks.length < 3) {
      setErrorMessage("Selecione no mínimo 3 tecnologias na seção de Stacks (Hard-Skills).");
      setShowError(true);
      window.scrollTo({ top: document.getElementById('section-stacks')?.offsetTop || 0 - 100, behavior: 'smooth' });
      return;
    }
    if (formData.softSkills.length < 3) {
      setErrorMessage("Selecione no mínimo 3 qualidades na seção de Habilidades (Soft-Skills).");
      setShowError(true);
      window.scrollTo({ top: document.getElementById('section-soft-skills')?.offsetTop || 0 - 100, behavior: 'smooth' });
      return;
    }
    // Validação Robusta de Experiências Profissionais
    const isExperienceTotallyEmpty = (exp: any) => 
      !exp.company.trim() && !exp.role.trim() && !exp.startMonth.trim() && !exp.startYear.trim() && !exp.description.trim();
    
    const isExperiencePartiallyFilled = (exp: any) => 
      !isExperienceTotallyEmpty(exp) && 
      (!exp.company.trim() || !exp.role.trim() || !exp.startMonth.trim() || !exp.startYear.trim() || !exp.description.trim());

    if (formData.experience.some(isExperiencePartiallyFilled)) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios das experiências profissionais iniciadas.");
      setShowError(true);
      return;
    }

    if (formData.experience.length > 1 && formData.experience.some(isExperienceTotallyEmpty)) {
      setErrorMessage("Você possui formulários de experiência profissional vazios. Por favor, preencha-os ou remova-os.");
      setShowError(true);
      return;
    }

    setShowError(false);
    onComplete(formData);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500 mb-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Suas Habilidades
          </h2>
          <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 font-medium bg-slate-100 dark:bg-[#1A1D2D] px-4 py-2 w-fit mx-auto rounded-full border border-slate-200 dark:border-slate-800">
            Adicione sua experiência e habilidades finais para completar seu perfil!
          </div>
        </div>

        <form id="step3-form" onSubmit={(e) => { e.preventDefault(); validateAndComplete(); }} className="space-y-8 relative">
          {showError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 sticky top-4 z-50 shadow-lg">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="font-bold text-sm">{errorMessage}</p>
            </div>
          )}

          {/* 3: EXPERIÊNCIA PROFISSIONAL */}
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">3. Experiência Profissional</h3>
              </div>
              <button type="button" onClick={handleAddExperience} className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-bold text-sm bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 transition-colors px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-500/20">
                <Plus className="w-4 h-4" /> Nova
              </button>
            </div>
            
            <div className="space-y-6">
              {formData.experience.map((exp) => (
                <div key={exp.id} className="relative bg-slate-50 dark:bg-[#1A1D2D]/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                  {formData.experience.length > 1 && (
                    <button type="button" onClick={() => handleRemoveExperience(exp.id)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors text-xs font-bold uppercase tracking-widest">Remover</button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 mt-2">
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Cargo</label>
                      <input type="text" value={exp.role} onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)} className="w-full font-medium text-slate-900 dark:text-white bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex: Front-End Sênior" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Empresa</label>
                      <input type="text" value={exp.company} onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)} className="w-full font-medium text-slate-900 dark:text-white bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex: TechCorp" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-3">
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" /> Início
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <select value={exp.startMonth} onChange={(e) => handleExperienceChange(exp.id, 'startMonth', e.target.value)} className="w-full font-medium text-slate-900 dark:text-white bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="" disabled>Mês</option>
                          {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                        <select value={exp.startYear} onChange={(e) => handleExperienceChange(exp.id, 'startYear', e.target.value)} className="w-full font-medium text-slate-900 dark:text-white bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="" disabled>Ano</option>
                          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" /> Fim {exp.isCurrent && "(Atual)"}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <select value={exp.endMonth} onChange={(e) => handleExperienceChange(exp.id, 'endMonth', e.target.value)} disabled={exp.isCurrent} className="w-full font-medium text-slate-900 dark:text-white bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40 disabled:bg-slate-50 dark:disabled:bg-slate-900 transition-all">
                          <option value="" disabled>{exp.isCurrent ? "-" : "Mês"}</option>
                          {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                        <select value={exp.endYear} onChange={(e) => handleExperienceChange(exp.id, 'endYear', e.target.value)} disabled={exp.isCurrent} className="w-full font-medium text-slate-900 dark:text-white bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40 disabled:bg-slate-50 dark:disabled:bg-slate-900 transition-all">
                          <option value="" disabled>{exp.isCurrent ? "-" : "Ano"}</option>
                          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-6 ml-1">
                    <input type="checkbox" id={`current-${exp.id}`} checked={exp.isCurrent} onChange={(e) => handleExperienceChange(exp.id, 'isCurrent', e.target.checked)} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 bg-white cursor-pointer" />
                    <label htmlFor={`current-${exp.id}`} className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">Trabalho atualmente aqui</label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Principais conquistas / Descricao</label>
                    <textarea rows={3} value={exp.description} onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)} className="w-full font-medium text-slate-900 dark:text-white bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Descreva suas responsabilidades e impacto..." />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4: STACKS */}
          <div id="section-stacks" className={`bg-white dark:bg-[#0B0E14] rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-300 ${showError && errorMessage.includes("Stacks") ? 'border-2 border-rose-400 dark:border-rose-500 shadow-rose-500/10' : 'border border-slate-200 dark:border-slate-800/50'}`}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${showError && errorMessage.includes("Stacks") ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20' : 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 text-purple-400'}`}>
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className={`text-xl font-bold ${showError && errorMessage.includes("Stacks") ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                  4. Stacks (Hard-Skills) <span className="text-rose-500 ml-1">*</span>
                </h3>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${formData.stacks.length < 3 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {formData.stacks.length} / 10
                </span>
              </div>
            </div>

            <div className="space-y-8">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Selecione de 3 a 10 tecnologias.</p>
              
              <div className="space-y-6">
                {Object.entries(STACKS_BY_CATEGORY).map(([category, skillsList]) => {
                  return (
                    <div key={category} className="space-y-3">
                      <h4 className="text-[11px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">{category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {skillsList.map(skill => {
                          const isSelected = formData.stacks.includes(skill);
                          const isMaxedOut = formData.stacks.length >= 10 && !isSelected;
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleStack(skill)}
                              disabled={isMaxedOut}
                              className={`px-3 py-1.5 font-bold text-sm rounded-xl transition-all border ${
                                isSelected 
                                  ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/30 hover:bg-purple-700' 
                                  : 'bg-white dark:bg-[#1A1D2D]/30 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-600/50 hover:bg-purple-50 dark:hover:bg-purple-900/10'
                              } ${isMaxedOut ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 hover:border-slate-200' : ''}`}
                            >
                              {skill}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                {/* Seção de Stacks Customizadas */}
                {formData.stacks.some(s => !Object.values(STACKS_BY_CATEGORY).flat().includes(s)) && (
                  <div className="space-y-3">
                    <h4 className="text-[11px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">Suas Stacks</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.stacks.filter(s => !Object.values(STACKS_BY_CATEGORY).flat().includes(s)).map(skill => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleStack(skill)}
                          className="px-3 py-1.5 font-bold text-sm rounded-xl transition-all border bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/30 hover:bg-purple-700"
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input para Nova Stack customizada */}
                <div className="pt-2">
                  {!showStackInput ? (
                    <button
                      type="button"
                      onClick={() => setShowStackInput(true)}
                      disabled={formData.stacks.length >= 10}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" /> Outra tecnologia
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                      <input
                        autoFocus
                        type="text"
                        value={customStack}
                        onChange={(e) => setCustomStack(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomStack())}
                        placeholder="Ex: Svelte, Firebase..."
                        className="bg-white dark:bg-[#0B0E14] border border-indigo-200 dark:border-indigo-500/30 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 w-full max-w-xs"
                      />
                      <button
                        type="button"
                        onClick={addCustomStack}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-500 transition-colors"
                      >
                        Adicionar
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowStackInput(false); setCustomStack(""); }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xs p-2"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 5: SOFT-SKILLS */}
          <div id="section-soft-skills" className={`bg-white dark:bg-[#0B0E14] rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-300 ${showError && errorMessage.includes("Soft-Skills") ? 'border-2 border-rose-400 dark:border-rose-500 shadow-rose-500/10' : 'border border-slate-200 dark:border-slate-800/50'}`}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${showError && errorMessage.includes("Soft-Skills") ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20' : 'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400'}`}>
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className={`text-xl font-bold ${showError && errorMessage.includes("Soft-Skills") ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                  5. Habilidades (Soft-Skills) <span className="text-rose-500 ml-1">*</span>
                </h3>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${formData.softSkills.length < 3 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {formData.softSkills.length} / 10
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Selecione de 3 a 10 qualidades interpessoais que mais se destacam no seu perfil.</p>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-[11px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">Sugestões</h4>
                  <div className="flex flex-wrap gap-2">
                    {SOFT_SKILLS.map(skill => {
                      const isSelected = formData.softSkills.includes(skill);
                      const isMaxedOut = formData.softSkills.length >= 10 && !isSelected;
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSoftSkill(skill)}
                          disabled={isMaxedOut}
                          className={`px-3 py-1.5 font-bold text-sm rounded-xl transition-all border ${
                            isSelected 
                              ? 'bg-pink-600 border-pink-600 text-white shadow-md shadow-pink-500/30 hover:bg-pink-700' 
                              : 'bg-white dark:bg-[#1A1D2D]/30 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-pink-300 dark:hover:border-pink-600/50 hover:bg-pink-50 dark:hover:bg-pink-900/10'
                          } ${isMaxedOut ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 hover:border-slate-200' : ''}`}
                        >
                          {skill}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Seção de Soft Skills Customizadas */}
                {formData.softSkills.some(s => !SOFT_SKILLS.includes(s)) && (
                  <div className="space-y-3">
                    <h4 className="text-[11px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">Suas Habilidades</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.softSkills.filter(s => !SOFT_SKILLS.includes(s)).map(skill => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSoftSkill(skill)}
                          className="px-3 py-1.5 font-bold text-sm rounded-xl transition-all border bg-pink-600 border-pink-600 text-white shadow-md shadow-pink-500/30 hover:bg-pink-700"
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input para Nova Soft Skill customizada */}
                <div className="pt-2">
                  {!showSoftSkillInput ? (
                    <button
                      type="button"
                      onClick={() => setShowSoftSkillInput(true)}
                      disabled={formData.softSkills.length >= 10}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" /> Outra habilidade
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                      <input
                        autoFocus
                        type="text"
                        value={customSoftSkill}
                        onChange={(e) => setCustomSoftSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSoftSkill())}
                        placeholder="Digite sua habilidade..."
                        className="bg-white dark:bg-[#0B0E14] border border-pink-200 dark:border-pink-500/30 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-pink-500 w-full max-w-xs"
                      />
                      <button
                        type="button"
                        onClick={addCustomSoftSkill}
                        className="bg-pink-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-pink-500 transition-colors"
                      >
                        Adicionar
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowSoftSkillInput(false); setCustomSoftSkill(""); }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xs p-2"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

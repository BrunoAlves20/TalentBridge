"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Step3Skills, Step3Data } from "@/components/candidate/onboarding/Step3Skills";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

export default function Passo3Page() {
  const router = useRouter();
  const { extractionMethod, step2Data, step3Data, setStep3Data, clearOnboardingData } = useOnboarding();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSavingToDB, setIsSavingToDB] = useState(false);

  useEffect(() => {
    // Redireciona se não tiver método escolhido e não estiver no meio do processo de salvar
    if (!extractionMethod && !isCompleting && !isSavingToDB) {
      router.replace("/candidate/onboarding/passo1");
    }
  }, [extractionMethod, isCompleting, isSavingToDB, router]);

  if (!extractionMethod && !isCompleting && !isSavingToDB) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Redirecionando...</p>
      </div>
    );
  }

  // --- A FUNÇÃO QUE REALMENTE SALVA NO MYSQL ---
  const handleSaveToDatabase = async (data3: Step3Data) => {
    setIsSavingToDB(true);
    setIsCompleting(true);
    setStep3Data(data3); // Salva no context por segurança

    const usuarioId = localStorage.getItem("usuario_id");

    // Validações de segurança
    if (!usuarioId) {
      alert("Erro: Faça login novamente para salvar seu perfil.");
      setIsSavingToDB(false);
      return;
    }

    if (!step2Data) {
      alert("Erro: Os dados do Passo 2 foram perdidos. Por favor, volte e preencha novamente.");
      setIsSavingToDB(false);
      return;
    }

    try {
      // 1. Monta o Payload para a nossa API FastAPI
      const payload = {
        usuario_id: Number(usuarioId),
        personal: step2Data.personal,
        education: step2Data.education,
        experience: data3.experience,
        stacks: data3.stacks,
        softSkills: data3.softSkills
      };

      // 2. Dispara a requisição
      const response = await fetch("http://127.0.0.1:8000/candidatos/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro ao salvar o perfil no banco de dados.");
      }

      // 3. Sucesso! Limpa os dados temporários e manda pro Dashboard
      clearOnboardingData();
      
      // Pequeno truque para forçar a atualização do usuário local para evitar loop
      const localUserRaw = localStorage.getItem("@TalentBridge:user");
      if (localUserRaw) {
         const localUser = JSON.parse(localUserRaw);
         localUser.onboarding_completo = true;
         localStorage.setItem("@TalentBridge:user", JSON.stringify(localUser));
      }

      router.push("/candidate/dashboard");

    } catch (error: any) {
      console.error("Erro na API:", error);
      alert(error.message);
      setIsSavingToDB(false);
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 relative">
      
      {/* OVERLAY DE CARREGAMENTO PARA IMPEDIR MÚLTIPLOS CLIQUES */}
      {isSavingToDB && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 dark:bg-[#0B0E14]/80 backdrop-blur-sm rounded-3xl h-full min-h-[500px]">
          <Loader2 className="w-14 h-14 text-indigo-600 animate-spin mb-4" />
          <p className="font-bold text-xl text-indigo-700 dark:text-indigo-400">
            Montando seu perfil de candidato...
          </p>
          <p className="text-sm text-slate-500 mt-2">Isso pode levar alguns segundos.</p>
        </div>
      )}

      <Step3Skills 
        method={extractionMethod || "manual"}
        initialData={step3Data}
        onBack={() => {
          router.push("/candidate/onboarding/passo2");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        // O formulário de Step3Skills vai chamar ESSA função quando validado
        onComplete={(data) => handleSaveToDatabase(data)} 
      />

      {/* Botões de Navegação Estáticos da equipe de Frontend */}
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
        <button 
          onClick={() => {
            router.push("/candidate/onboarding/passo2");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          disabled={isSavingToDB}
          className="group w-full sm:w-auto text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-6 py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1A1D2D] bg-white dark:bg-[#0B0E14] disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Voltar para Dados</span>
        </button>

        <button 
          type="submit"
          form="step3-form" // Isso dispara o onComplete dentro do Step3Skills
          disabled={isSavingToDB}
          className="group relative w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white pl-8 pr-12 sm:pr-14 py-3.5 rounded-2xl text-lg font-black transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-3 overflow-hidden disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-wait"
        >
          <CheckCircle className="w-5 h-5 text-indigo-200 group-hover:text-white transition-colors" />
          <span>Salvar Perfil e Acessar Painel</span>
          <ChevronRight className="w-5 h-5 -translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all absolute right-5 sm:right-6 hidden sm:block delay-75" />
        </button>
      </div>
    </div>
  );
}
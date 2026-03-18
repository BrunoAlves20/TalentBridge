"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Step3Skills } from "@/components/candidate/onboarding/Step3Skills";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

export default function Passo3Page() {
  const router = useRouter();
  const { extractionMethod, step3Data, setStep3Data, clearOnboardingData } = useOnboarding();
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    // Se não tiver método e não estiver finalizando o cadastro, volta pro começo
    if (!extractionMethod && !isCompleting) {
      router.replace("/candidate/onboarding/passo1");
    }
  }, [extractionMethod, isCompleting, router]);

  if (!extractionMethod && !isCompleting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <Step3Skills 
        method={extractionMethod || "manual"}
        initialData={step3Data}
        onBack={() => {
          router.push("/candidate/onboarding/passo2");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onComplete={(data) => {
          setIsCompleting(true);
          setStep3Data(data);
          
          // Aqui integrariamos a API final usando os dados combinados do context
          
          // Após a API retornar sucesso, limpamos o Storage
          clearOnboardingData();
          
          // Por fim, empurramos para o Dashboard sem interrupção
          router.push("/candidate/dashboard");
        }}
      />

      {/* Botões de Navegação Estáticos na Página */}
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
        <button 
          onClick={() => {
            router.push("/candidate/onboarding/passo2");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="group w-full sm:w-auto text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-6 py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1A1D2D] bg-white dark:bg-[#0B0E14]"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Voltar para Dados</span>
        </button>

        <button 
          type="submit"
          form="step3-form"
          className="group relative w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white pl-8 pr-12 sm:pr-14 py-3.5 rounded-2xl text-lg font-black transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-3 overflow-hidden"
        >
          <CheckCircle className="w-5 h-5 text-indigo-200 group-hover:text-white transition-colors" />
          <span>Salvar Perfil e Acessar Painel</span>
          <ChevronRight className="w-5 h-5 -translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all absolute right-5 sm:right-6 hidden sm:block delay-75" />
        </button>
      </div>
    </div>
  );
}

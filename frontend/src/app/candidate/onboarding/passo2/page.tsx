"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Step2Review } from "@/components/candidate/onboarding/Step2Review";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function Passo2Page() {
  const router = useRouter();
  const { extractionMethod, step2Data, setStep2Data } = useOnboarding();

  useEffect(() => {
    // Se não escolheu método, volta pro passo 1
    if (!extractionMethod) {
      router.replace("/candidate/onboarding/passo1");
    }
  }, [extractionMethod, router]);

  if (!extractionMethod) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <Step2Review 
        method={extractionMethod}
        initialData={step2Data}
        onBack={() => {
          router.push("/candidate/onboarding/passo1");
        }}
        onNext={(data) => {
          setStep2Data(data);
          router.push("/candidate/onboarding/passo3");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Botões de Navegação Estáticos na Página */}
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
        <button 
          onClick={() => router.push("/candidate/onboarding/passo1")}
          className="group w-full sm:w-auto text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-6 py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1A1D2D] bg-white dark:bg-[#0B0E14]"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Voltar</span>
        </button>

        <button 
          type="submit"
          form="step2-form"
          className="group w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-2xl text-lg font-black transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-3"
        >
          <span>Próximo Passo</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

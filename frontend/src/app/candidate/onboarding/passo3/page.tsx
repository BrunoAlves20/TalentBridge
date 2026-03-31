"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Step3Skills, Step3Data } from "@/components/candidate/onboarding/Step3Skills";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { API_URL } from "@/lib/api";

export default function Passo3Page() {
  const router = useRouter();
  const { extractionMethod, step2Data, step3Data, setStep3Data, clearOnboardingData } =
    useOnboarding();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!extractionMethod && !isSaving) {
      router.replace("/candidate/onboarding/passo1");
    }
  }, [extractionMethod, isSaving, router]);

  if (!extractionMethod && !isSaving) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Redirecionando...</p>
      </div>
    );
  }

  const handleSaveToDatabase = async (data3: Step3Data) => {
    setIsSaving(true);
    setSaveError(null);
    setStep3Data(data3);

    const usuarioId = localStorage.getItem("usuario_id");

    if (!usuarioId) {
      setSaveError("Sessão expirada. Faça login novamente para salvar seu perfil.");
      setIsSaving(false);
      return;
    }

    if (!step2Data) {
      setSaveError("Os dados do Passo 2 foram perdidos. Volte e preencha novamente.");
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        usuario_id: Number(usuarioId),
        personal: step2Data.personal,
        education: step2Data.education,
        experience: data3.experience,
        stacks: data3.stacks,
        softSkills: data3.softSkills,
      };

      const response = await fetch(`${API_URL}/candidatos/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro ao salvar o perfil no banco de dados.");
      }

      clearOnboardingData();

      // Marca onboarding como completo no storage local para evitar loop de redirect
      const localUserRaw = localStorage.getItem("@TalentBridge:user");
      if (localUserRaw) {
        const localUser = JSON.parse(localUserRaw);
        localUser.onboarding_completo = true;
        localStorage.setItem("@TalentBridge:user", JSON.stringify(localUser));
      }

      router.push("/candidate/dashboard");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido. Tente novamente.";
      setSaveError(message);
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 relative">
      {isSaving && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 dark:bg-[#0B0E14]/80 backdrop-blur-sm rounded-3xl h-full min-h-[500px]">
          <Loader2 className="w-14 h-14 text-indigo-600 animate-spin mb-4" />
          <p className="font-bold text-xl text-indigo-700 dark:text-indigo-400">
            Montando seu perfil de candidato...
          </p>
          <p className="text-sm text-slate-500 mt-2">Isso pode levar alguns segundos.</p>
        </div>
      )}

      {saveError && (
        <div className="max-w-4xl mx-auto flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-2xl px-5 py-4 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <Step3Skills
        method={extractionMethod ?? "manual"}
        initialData={step3Data}
        onBack={() => {
          router.push("/candidate/onboarding/passo2");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onComplete={handleSaveToDatabase}
      />

      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
        <button
          onClick={() => {
            router.push("/candidate/onboarding/passo2");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          disabled={isSaving}
          className="group w-full sm:w-auto text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-6 py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1A1D2D] bg-white dark:bg-[#0B0E14] disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Voltar para Dados</span>
        </button>

        <button
          type="submit"
          form="step3-form"
          disabled={isSaving}
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

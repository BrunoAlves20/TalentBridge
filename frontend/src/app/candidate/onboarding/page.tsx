"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Loader2 } from "lucide-react";

export default function CandidateOnboardingIndexPage() {
  const router = useRouter();
  const { extractionMethod, step2Data } = useOnboarding();

  useEffect(() => {
    // Sempre começa no passo1 se o método não foi escolhido ainda.
    // Isso evita que dados residuais no storage pulem o passo1 para
    // um usuário que nunca completou o onboarding.
    if (!extractionMethod) {
      router.replace("/candidate/onboarding/passo1");
      return;
    }
    // Se escolheu o método mas ainda não revisou os dados → passo2
    if (!step2Data) {
      router.replace("/candidate/onboarding/passo2");
      return;
    }
    // Dados do passo2 existem → passo3
    router.replace("/candidate/onboarding/passo3");
  }, [extractionMethod, step2Data, router]);

  // Loading state enquanto a verificação acontece
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
      <p className="text-slate-500 dark:text-slate-400 font-medium">Carregando seu progresso...</p>
    </div>
  );
}
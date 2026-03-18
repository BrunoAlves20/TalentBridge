"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Loader2 } from "lucide-react";

export default function CandidateOnboardingIndexPage() {
  const router = useRouter();
  const { extractionMethod, step2Data } = useOnboarding();

  useEffect(() => {
    // Redirecionamento inteligente baseado no que já existe no Context
    if (!extractionMethod) {
      router.replace("/candidate/onboarding/passo1");
    } else if (extractionMethod && !step2Data) {
      router.replace("/candidate/onboarding/passo2");
    } else {
      router.replace("/candidate/onboarding/passo3");
    }
  }, [extractionMethod, step2Data, router]);

  // Loading state enquanto a verificação acontece
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
      <p className="text-slate-500 dark:text-slate-400 font-medium">Carregando seu progresso...</p>
    </div>
  );
}

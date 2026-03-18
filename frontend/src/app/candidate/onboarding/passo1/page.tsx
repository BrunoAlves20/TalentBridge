"use client";

import { useRouter } from "next/navigation";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Step1Choice } from "@/components/candidate/onboarding/Step1Choice";

export default function Passo1Page() {
  const router = useRouter();
  const { setExtractionMethod } = useOnboarding();

  const handleSelectMethod = (method: "ai" | "manual") => {
    setExtractionMethod(method);
    router.push("/candidate/onboarding/passo2");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return <Step1Choice onSelectMethod={handleSelectMethod} />;
}

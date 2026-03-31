"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Step2Data } from "@/components/candidate/onboarding/Step2Review";
import { Step3Data } from "@/components/candidate/onboarding/Step3Skills";

interface OnboardingContextType {
  extractionMethod: "ai" | "manual" | null;
  setExtractionMethod: (method: "ai" | "manual" | null) => void;
  step2Data: Step2Data | null;
  setStep2Data: (data: Step2Data | null) => void;
  step3Data: Step3Data | null;
  setStep3Data: (data: Step3Data | null) => void;
  clearOnboardingData: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = "@TalentBridge:OnboardingData";
const EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 horas

interface StoredData {
  extractionMethod: "ai" | "manual" | null;
  step2Data: Step2Data | null;
  step3Data: Step3Data | null;
  timestamp: number;
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [extractionMethod, setExtractionMethod] = useState<"ai" | "manual" | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [step3Data, setStep3Data] = useState<Step3Data | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Carrega dados do storage na montagem
  useEffect(() => {
    try {
      const storedRaw =
        sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);

      if (storedRaw) {
        const parsed: StoredData = JSON.parse(storedRaw);
        const isExpired = Date.now() - parsed.timestamp > EXPIRATION_MS;

        if (!isExpired) {
          if (parsed.extractionMethod) setExtractionMethod(parsed.extractionMethod);
          if (parsed.step2Data) setStep2Data(parsed.step2Data);
          if (parsed.step3Data) setStep3Data(parsed.step3Data);
        } else {
          localStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error("Erro ao ler dados de onboarding", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Persiste no storage sempre que os dados mudarem
  useEffect(() => {
    if (!isInitialized) return;

    try {
      const jsonStr = JSON.stringify({
        extractionMethod,
        step2Data,
        step3Data,
        timestamp: Date.now(),
      } satisfies StoredData);

      sessionStorage.setItem(STORAGE_KEY, jsonStr);
      localStorage.setItem(STORAGE_KEY, jsonStr);
    } catch (e) {
      console.error("Erro ao salvar dados de onboarding", e);
    }
  }, [extractionMethod, step2Data, step3Data, isInitialized]);

  const clearOnboardingData = () => {
    setExtractionMethod(null);
    setStep2Data(null);
    setStep3Data(null);
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <OnboardingContext.Provider
      value={{
        extractionMethod,
        setExtractionMethod,
        step2Data,
        setStep2Data,
        step3Data,
        setStep3Data,
        clearOnboardingData,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding deve ser usado dentro de um OnboardingProvider");
  }
  return context;
}

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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

interface StoredData {
  extractionMethod: "ai" | "manual" | null;
  step2Data: Step2Data | null;
  step3Data: Step3Data | null;
  timestamp: number;
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [extractionMethod, setExtractionMethodState] = useState<"ai" | "manual" | null>(null);
  const [step2Data, setStep2DataState] = useState<Step2Data | null>(null);
  const [step3Data, setStep3DataState] = useState<Step3Data | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Carrega dados iniciais do sessionStorage ou localStorage no mount
  useEffect(() => {
    try {
      // Prioridade para Session Storage (recém fechou e abriu a mesma aba do fluxo)
      const sessionData = sessionStorage.getItem(STORAGE_KEY);
      const localData = localStorage.getItem(STORAGE_KEY);
      
      const storedRaw = sessionData || localData;
      
      if (storedRaw) {
        const parsed: StoredData = JSON.parse(storedRaw);
        
        // Verifica se os dados tem menos de 24h
        const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
        
        if (!isExpired) {
          if (parsed.extractionMethod) setExtractionMethodState(parsed.extractionMethod);
          if (parsed.step2Data) setStep2DataState(parsed.step2Data);
          if (parsed.step3Data) setStep3DataState(parsed.step3Data);
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

  // Salva nos storages sempre que houver mudanças relevantes
  useEffect(() => {
    if (!isInitialized) return;

    try {
      const dataToStore: StoredData = {
        extractionMethod,
        step2Data,
        step3Data,
        timestamp: Date.now()
      };
      
      const jsonStr = JSON.stringify(dataToStore);
      sessionStorage.setItem(STORAGE_KEY, jsonStr);
      localStorage.setItem(STORAGE_KEY, jsonStr);
    } catch (e) {
      console.error("Erro ao salvar dados de onboarding", e);
    }
  }, [extractionMethod, step2Data, step3Data, isInitialized]);

  const setExtractionMethod = (method: "ai" | "manual" | null) => setExtractionMethodState(method);
  const setStep2Data = (data: Step2Data | null) => setStep2DataState(data);
  const setStep3Data = (data: Step3Data | null) => setStep3DataState(data);

  const clearOnboardingData = () => {
    setExtractionMethodState(null);
    setStep2DataState(null);
    setStep3DataState(null);
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  };

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
      {isInitialized ? children : null}
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

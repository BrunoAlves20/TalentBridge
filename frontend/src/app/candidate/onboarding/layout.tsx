"use client";

import { OnboardingProvider } from "@/contexts/OnboardingContext";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 antialiased font-sans selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-200">
        <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative min-h-screen">
          
          {/* Decorative Elements */}
          <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-50 dark:from-indigo-500/5 to-transparent pointer-events-none" />

          <div className="relative z-10 w-full">
            {/* Header do Logo Simples */}
            <header className="flex justify-center mb-16 animate-in fade-in slide-in-from-top-8 duration-700 delay-150 fill-mode-both">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-600/20">
                  T
                </div>
                <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
                  Talent<span className="text-indigo-600 dark:text-indigo-400">Bridge</span>
                </span>
              </div>
            </header>

            {/* Renderização das sub-páginas (Step1, Step2, Step3) */}
            {children}
            
          </div>
        </main>
      </div>
    </OnboardingProvider>
  );
}

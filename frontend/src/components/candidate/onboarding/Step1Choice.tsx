"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileEdit, Sparkles, Loader2, File, CheckCircle2 } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext"; // Importação do contexto adicionada

interface Step1ChoiceProps {
  onSelectMethod: (method: "ai" | "manual") => void;
}

export function Step1Choice({ onSelectMethod }: Step1ChoiceProps) {
  const { setStep2Data, setStep3Data } = useOnboarding(); // Pegando as funções de salvar dados
  const [selectedOption, setSelectedOption] = useState<"ai" | "manual" | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "extracting" | "done">("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (file: File) => {
    setError(null);
    
    // Validar extensão
    const allowedExtensions = [".pdf", ".docx"];
    const fileName = file.name.toLowerCase();
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidExtension) {
      setError("Por favor, envie um arquivo PDF ou DOCX.");
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("O arquivo deve ter no máximo 5MB.");
      return;
    }

    setSelectedFile(file);
    startExtractionSimulation(file);
  };

  // --- A FUNÇÃO INTEGRADA COM O BACKEND (FASTAPI) ---
  const startExtractionSimulation = async (file: File) => {
    setUploadState("uploading");
    
    const usuarioId = localStorage.getItem("usuario_id");
    if (!usuarioId) {
      setError("Erro: Usuário não identificado. Faça login novamente.");
      setUploadState("idle");
      return;
    }

    try {
      // 1. Prepara o envio do Arquivo
      const formData = new FormData();
      formData.append("curriculo", file);
      formData.append("usuario_id", usuarioId);

      // Simula um tempinho de "Upload" para a barra de progresso rodar
      await new Promise(resolve => setTimeout(resolve, 800));
      setUploadState("extracting");

      // 2. Dispara o arquivo para o Python
      const response = await fetch("http://127.0.0.1:8000/candidatos/extrair-cv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro ao processar o currículo.");
      }

      // 3. Recebe a resposta mágica da IA
      const responseData = await response.json();
      const extracted = responseData.dados;

      // Mantém a animação de "Extraindo" rodando um pouco para dar uma sensação premium
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Recupera o e-mail original do usuário logado para garantir que não seja sobrescrito
      const localUserRaw = localStorage.getItem("@TalentBridge:user");
      let originalEmail = "";
      if (localUserRaw) {
        const user = JSON.parse(localUserRaw);
        originalEmail = user.email;
      }

      // 4. Normaliza os dados da IA garantindo id único em cada item
      //    (o Gemini não retorna id, mas o Step2/Step3 usa key={item.id} no map)
      const normalizedEducation = (extracted.education ?? []).map(
        (ed: any, i: number) => ({ ...ed, id: ed.id ?? Date.now() + i })
      );
      const normalizedExperience = (extracted.experience ?? []).map(
        (exp: any, i: number) => ({ ...exp, id: exp.id ?? Date.now() + 1000 + i })
      );

      setStep2Data({
        personal: {
          ...extracted.personal,
          email: originalEmail || extracted.personal.email // Prioriza o e-mail do cadastro
        },
        education: normalizedEducation,
      });
      setStep3Data({
        experience: normalizedExperience,
        stacks: extracted.stacks ?? [],
        softSkills: extracted.softSkills ?? [],
      });

      // 5. Sucesso Visual e Redirecionamento
      setUploadState("done");
      
      setTimeout(() => {
        onSelectMethod("ai");
      }, 1200);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro de conexão com o servidor. Tente novamente.");
      setUploadState("idle");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploadState !== "idle") return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Como você deseja montar o seu perfil?
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Você pode usar nossa Inteligência Artificial para extrair dados do seu currículo atual ou preencher tudo manualmente.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* Card IA */}
        <button
          onClick={() => setSelectedOption("ai")}
          className={`relative text-left p-8 rounded-3xl border-2 transition-all duration-300 group ${
            selectedOption === "ai"
              ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-500"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0E14] hover:border-indigo-300 dark:hover:border-indigo-700/50"
          }`}
        >
          <div className="absolute -top-4 -right-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transform group-hover:scale-105 transition-transform">
            <Sparkles className="w-3.5 h-3.5" /> Recomendado
          </div>
          
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
            selectedOption === "ai" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
          }`}>
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            Extração Inteligente com IA
          </h3>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Envie seu currículo em PDF ou Word e nossa IA preencherá automaticamente todos os seus dados em segundos. Mais rápido e prático.
          </p>
        </button>

        {/* Card Manual */}
        <button
          onClick={() => setSelectedOption("manual")}
          className={`relative text-left p-8 rounded-3xl border-2 transition-all duration-300 group ${
            selectedOption === "manual"
              ? "border-slate-600 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-500"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0E14] hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
            selectedOption === "manual" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          }`}>
            <FileEdit className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
            Preencher Manualmente
          </h3>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Siga o passo a passo para preencher seu perfil com suas experiências, habilidades e informações de contato manualmente.
          </p>
        </button>
      </div>

      {/* Áreas de Ação baseadas na escolha */}
      <div className="min-h-[220px] flex justify-center">
        {selectedOption === "ai" && (
          <div className="w-full max-w-2xl animate-in zoom-in-95 duration-300">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf,.docx" 
              className="hidden" 
            />
            
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => uploadState === "idle" && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
                uploadState === "idle" 
                  ? "border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-400 cursor-pointer dark:border-indigo-500/30 dark:bg-indigo-500/5 dark:hover:bg-indigo-500/10"
                  : "border-indigo-200 bg-slate-50 cursor-default dark:border-slate-800 dark:bg-[#0B0E14]"
              } ${error ? "border-rose-300 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/5" : ""}`}
            >
              {uploadState === "idle" && (
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-full shadow-sm flex items-center justify-center border transition-colors ${
                    error ? "bg-white dark:bg-slate-800 border-rose-200 text-rose-500" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-indigo-500"
                  }`}>
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold mb-1 ${error ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
                      {error ? error : "Clique ou arraste seu currículo aqui"}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Suporta PDF, DOCX (Máx. 5MB)</p>
                  </div>
                </div>
              )}

              {uploadState === "uploading" && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <File className="w-12 h-12 text-indigo-400 animate-pulse" />
                  <div className="w-full max-w-xs bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden relative border border-slate-100 dark:border-slate-700">
                    <div className="bg-indigo-600 h-2.5 rounded-full absolute left-0 top-0 bottom-0 transition-all duration-1000 w-full" style={{ background: 'linear-gradient(90deg, #4f46e5, #818cf8, #4f46e5)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }}></div>
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Enviando {selectedFile?.name}...</p>
                </div>
              )}

              {uploadState === "extracting" && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin relative z-10" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-indigo-700 dark:text-indigo-400">A IA está extraindo seus dados...</p>
                    <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">Isso leva apenas alguns segundos.</p>
                  </div>
                </div>
              )}

              {uploadState === "done" && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">Extração concluída com sucesso!</p>
                    <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">Avançando para revisão...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedOption === "manual" && (
          <div className="animate-in zoom-in-95 duration-300 flex items-center justify-center">
            <button 
              onClick={() => onSelectMethod("manual")}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white px-10 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-[1.02] shadow-xl shadow-slate-900/10 dark:shadow-white/10"
            >
              Continuar Manualmente
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
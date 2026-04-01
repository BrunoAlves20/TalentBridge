"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService, UserRole } from "@/services/auth";

import {
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  User,
  Briefcase,
  UserCircle
} from "lucide-react";

import { motion } from "framer-motion";

export function RegisterView() {

  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState<UserRole>("CANDIDATO");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {

    e.preventDefault();

    if (!name || !email || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Recebe a resposta do backend (que contém apenas { mensagem, id })
      const response = await authService.register(
        name,
        email,
        password,
        role
      );

      // 2. Monta o objeto completo localmente para não quebrar o padrão que o frontend espera
      const userData = {
        id: response.id,
        name: name,
        email: email,
        role: role
      };

      // 3. Salva no Storage
      localStorage.setItem("@TalentBridge:user", JSON.stringify(userData));
      localStorage.setItem("usuario_id", response.id.toString());

      // 4. [BUG FIX] Limpa dados de onboarding de sessões anteriores para evitar
      //    que informações de outro usuário apareçam no fluxo de cadastro do currículo.
      localStorage.removeItem("@TalentBridge:OnboardingData");
      sessionStorage.removeItem("@TalentBridge:OnboardingData");

      // 4. Correção do Bug de Redirecionamento: Usamos o estado 'role' local em vez do retorno da API!
      if (role === "RECRUTADOR") {
        router.push("/recruiter/dashboard");
      } else {
        // Redireciona o candidato para a tela correta de Onboarding
        router.push("/candidate/onboarding");
      }

    } catch (err: any) {

      setError(err?.message || "Erro ao criar conta.");

    } finally {

      setIsLoading(false);

    }

  }

  return (

    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 60, opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="absolute right-0 top-16 w-[500px] bg-card p-16 rounded-xl shadow-xl border border-border"
    >

      <h2 className="text-2xl font-semibold text-center mb-8">
        Criar Conta
      </h2>

      <form onSubmit={handleRegister} className="space-y-6">

        <div className="grid grid-cols-2 gap-4">

          <button
            type="button"
            onClick={() => setRole("CANDIDATO")}
            className={`flex flex-col items-center p-5 border rounded-lg ${
              role === "CANDIDATO"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border"
            }`}
          >
            <UserCircle className="w-7 h-7 mb-2" />
            Sou Candidato
          </button>

          <button
            type="button"
            onClick={() => setRole("RECRUTADOR")}
            className={`flex flex-col items-center p-5 border rounded-lg ${
              role === "RECRUTADOR"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border"
            }`}
          >
            <Briefcase className="w-7 h-7 mb-2" />
            Sou Recrutador
          </button>

        </div>

        <div className="relative">
          <User className="absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-12 border border-input rounded-md pl-10 pr-3 bg-background"
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-3 text-muted-foreground" />
          <input
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 border border-input rounded-md pl-10 pr-3 bg-background"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3 text-muted-foreground" />
          <input
            type="password"
            placeholder="Senha (mínimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 border border-input rounded-md pl-10 pr-3 bg-background"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <button
          disabled={isLoading}
          className="w-full h-12 rounded-md flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
        >

          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <>
              Criar Conta
              <ArrowRight size={16} />
            </>
          )}

        </button>

      </form>

    </motion.div>

  );
}
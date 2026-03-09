"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { LoginView } from "./LoginView";
import { RegisterView } from "./RegisterView";

type Mode = "login" | "register";

export function LoginRegisterView() {

  const [mode, setMode] = useState<Mode>("login");

  function toggleMode() {
    setMode(prev => (prev === "login" ? "register" : "login"));
  }

  return (

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-background flex items-center justify-center p-10"
    >

      <div className="relative w-[1100px] h-[720px]">

        {/* PAINEL ANIMADO */}

        <motion.div
          layout
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className={`
          absolute top-0 h-full w-[60%]
          rounded-2xl shadow-2xl
          flex flex-col justify-center items-center
          text-white text-center p-14
          bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600
          shadow-[0_0_80px_rgba(99,102,241,0.35)]
          ${mode === "login" ? "right-0" : "left-0"}
          `}
        >

          {mode === "login" ? (

            <div>

              <h1 className="text-5xl font-bold mb-4">
                BEM-VINDO!
              </h1>

              <p className="opacity-90 mb-8 max-w-sm">
                Entre com seus dados para acessar a plataforma
              </p>

              <button
                onClick={toggleMode}
                className="px-8 py-3 bg-white/10 backdrop-blur border border-white/20 text-white rounded-md font-semibold hover:bg-white/20 transition"
              >
                CRIAR CONTA
              </button>

            </div>

          ) : (

            <div>

              <h1 className="text-5xl font-bold mb-4">
                Bem-vindo!
              </h1>

              <p className="opacity-90 mb-8 max-w-sm">
                Já possui uma conta? Faça login para acessar.
              </p>

              <button
                onClick={toggleMode}
                className="px-8 py-3 bg-white/10 backdrop-blur border border-white/20 text-white rounded-md font-semibold hover:bg-white/20 transition"
              >
                Fazer Login
              </button>

            </div>

          )}

        </motion.div>

        {/* FORMULÁRIOS */}

        {mode === "login" ? (
          <LoginView />
        ) : (
          <RegisterView />
        )}

      </div>

    </motion.div>

  );
}
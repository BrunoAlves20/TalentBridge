"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  BrainCircuit, Send, RotateCcw,
  Mic, MicOff, Lightbulb, User, Loader2,
  CheckCircle2, Clock, Star, Flag,
} from "lucide-react";

import { simulatorService, SimulatorMessage } from "@/services/simulator";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Tip {
  icon: React.ElementType;
  text: string;
}

// ─── Dados estáticos da UI ───────────────────────────────────────────────────

const TIPS: Tip[] = [
  { icon: Star, text: "Seja específico e use exemplos reais do seu histórico profissional." },
  { icon: Clock, text: "Respostas entre 1-2 minutos são ideais para perguntas comportamentais." },
  { icon: CheckCircle2, text: "Use o método STAR: Situação, Tarefa, Ação e Resultado." },
  { icon: Lightbulb, text: "Relate suas skills às necessidades da vaga que está disputando." },
];

const SUGGESTED_ANSWERS = [
  "Sou desenvolvedor frontend com 4 anos de experiência em React e TypeScript.",
  "Estou buscando uma vaga de Tech Lead em uma empresa de tecnologia.",
  "Meu maior desafio foi liderar a migração de um monolito para microsserviços.",
];

// ─── Componentes auxiliares ──────────────────────────────────────────────────

function MessageBubble({ message }: { message: SimulatorMessage }) {
  const isAssistant = message.role === "assistant";
  const ts = message.criado_em ? new Date(message.criado_em) : new Date();
  return (
    <div className={`flex gap-3 ${isAssistant ? "" : "flex-row-reverse"}`}>
      <div
        className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${
          isAssistant
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
        }`}
      >
        {isAssistant ? <BrainCircuit className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>

      <div className={`max-w-[75%] ${isAssistant ? "" : "items-end"} flex flex-col gap-1`}>
        <div
          className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed font-medium whitespace-pre-wrap ${
            isAssistant
              ? "bg-white dark:bg-[#1A1D2D] border border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 rounded-tl-sm"
              : "bg-indigo-600 text-white rounded-tr-sm"
          }`}
        >
          {message.conteudo}
        </div>
        <span className="text-[10px] text-slate-400 px-1">
          {ts.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/30">
        <BrainCircuit className="w-5 h-5 text-white" />
      </div>
      <div className="bg-white dark:bg-[#1A1D2D] border border-slate-100 dark:border-slate-800/80 px-5 py-3.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function SimulatorPage() {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<SimulatorMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [finalizada, setFinalizada] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingInit, setLoadingInit] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Conta apenas mensagens do usuário (perguntas respondidas)
  const msgCount = messages.filter((m) => m.role === "user").length;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ─── Inicialização da sessão ────────────────────────────────────────────────
  const startSession = useCallback(async () => {
    setLoadingInit(true);
    setError(null);
    try {
      const sess = await simulatorService.createSession({});
      setSessionId(sess.id);
      setMessages(sess.mensagens);
      setFinalizada(sess.status === "FINALIZADA");
      setSessionStarted(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Não foi possível iniciar o simulador.";
      // Se for 401, provavelmente o usuário não está logado
      if (msg.toLowerCase().includes("token") || msg.toLowerCase().includes("autentic")) {
        setError("Você precisa estar logado para usar o simulador. Faça login e tente novamente.");
      } else {
        setError(msg);
      }
    } finally {
      setLoadingInit(false);
    }
  }, []);

  useEffect(() => {
    void startSession();
  }, [startSession]);

  // ─── Enviar resposta ────────────────────────────────────────────────────────
  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping || !sessionId || finalizada) return;

    setSessionStarted(true);
    setInput("");

    // Otimismo: mostra a mensagem do usuário imediatamente
    const optimistic: SimulatorMessage = {
      id: Date.now(),
      role: "user",
      conteudo: trimmed,
      criado_em: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setIsTyping(true);
    setError(null);

    try {
      const sess = await simulatorService.sendMessage(sessionId, trimmed);
      setMessages(sess.mensagens);
      setFinalizada(sess.status === "FINALIZADA");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao enviar resposta.";
      setError(msg);
      // Remove a mensagem otimista (não foi gravada)
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  // ─── Encerrar sessão e pedir feedback ──────────────────────────────────────
  const handleFinalize = async () => {
    if (!sessionId || finalizada || isTyping) return;
    setIsTyping(true);
    setError(null);
    try {
      const sess = await simulatorService.finalize(sessionId);
      setMessages(sess.mensagens);
      setFinalizada(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao finalizar sessão.");
    } finally {
      setIsTyping(false);
    }
  };

  // ─── Reset / nova sessão ────────────────────────────────────────────────────
  const handleReset = async () => {
    setMessages([]);
    setInput("");
    setIsTyping(false);
    setSessionStarted(false);
    setFinalizada(false);
    setSessionId(null);
    await startSession();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
              <BrainCircuit className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Simulador de Entrevista
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium sm:ml-[52px]">
            Recrutador Virtual com IA · {msgCount} {msgCount === 1 ? "resposta" : "respostas"} nesta sessão
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!finalizada && messages.length > 1 && (
            <button
              type="button"
              onClick={handleFinalize}
              disabled={isTyping}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl border border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all text-sm font-bold disabled:opacity-50"
            >
              <Flag className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Encerrar & Receber Feedback</span>
              <span className="sm:hidden">Encerrar</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            disabled={isTyping || loadingInit}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-bold disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Nova Sessão
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Dicas mobile (acordeão nativo) — substituem o sidebar em < lg */}
      <details className="lg:hidden mb-4 bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm group">
        <summary className="cursor-pointer list-none p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition min-h-[44px]">
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${error ? "bg-rose-500" : "bg-emerald-500"}`} aria-hidden="true" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Status & Dicas do Coach
            </span>
          </span>
          <span className="text-xs font-bold text-slate-400 group-open:hidden">Mostrar</span>
          <span className="text-xs font-bold text-slate-400 hidden group-open:inline">Ocultar</span>
        </summary>
        <div className="px-4 pb-4 space-y-4 border-t border-slate-100 dark:border-slate-800/50 pt-4">
          {/* Status */}
          <div>
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Status da Sessão</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between bg-slate-50 dark:bg-slate-800/30 px-3 py-2 rounded-lg">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Respondidas</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400">{msgCount}</span>
              </div>
              <div className="flex justify-between bg-slate-50 dark:bg-slate-800/30 px-3 py-2 rounded-lg">
                <span className="text-slate-500 dark:text-slate-400 font-medium">IA</span>
                <span className={`font-black ${error ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {error ? "Offline" : finalizada ? "Encerrada" : "Online"}
                </span>
              </div>
            </div>
          </div>
          {/* Dicas */}
          <div>
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Dicas do Coach</p>
            <ul className="space-y-2">
              {TIPS.map((tip, i) => {
                const Icon = tip.icon;
                return (
                  <li key={i} className="flex gap-2">
                    <Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{tip.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </details>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0">

        {/* Chat */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm min-h-[60vh] sm:min-h-[500px]">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {loadingInit && messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              </div>
            )}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Sugestões rápidas */}
          {!sessionStarted && !finalizada && !loadingInit && (
            <div className="px-6 pb-3 flex flex-wrap gap-2">
              {SUGGESTED_ANSWERS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs font-bold bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/30 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-xl transition-all"
                >
                  {s.length > 50 ? s.slice(0, 50) + "…" : s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800/50 flex gap-2 sm:gap-3 items-end">
            <label htmlFor="simulator-mic" className="sr-only">Microfone</label>
            <button
              id="simulator-mic"
              type="button"
              onClick={() => setMicActive(!micActive)}
              disabled={finalizada}
              aria-pressed={micActive}
              aria-label={micActive ? "Desativar microfone" : "Ativar microfone (em breve)"}
              className={`inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl border transition-all shrink-0 disabled:opacity-40 ${
                micActive
                  ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-500"
                  : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-indigo-300 hover:text-indigo-500"
              }`}
            >
              {micActive ? <MicOff className="w-5 h-5" aria-hidden="true" /> : <Mic className="w-5 h-5" aria-hidden="true" />}
            </button>

            <label htmlFor="simulator-input" className="sr-only">Sua resposta</label>
            <textarea
              id="simulator-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                finalizada
                  ? "Sessão finalizada. Clique em 'Nova Sessão' para começar outra."
                  : "Digite sua resposta... (Enter para enviar, Shift+Enter para nova linha)"
              }
              rows={2}
              disabled={isTyping || finalizada || loadingInit}
              className="flex-1 bg-slate-50 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-800 rounded-xl px-3 sm:px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 resize-none dark:text-white disabled:opacity-50 transition min-h-[44px]"
            />

            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping || finalizada || loadingInit}
              aria-label="Enviar resposta"
              className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-md shadow-indigo-500/20 shrink-0"
            >
              {isTyping ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Send className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Painel lateral de dicas (desktop) */}
        <div className="w-72 hidden lg:flex flex-col gap-4 shrink-0">

          {/* Status */}
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-4">
              Status da Sessão
            </p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Perguntas respondidas</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400">{msgCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Modo</span>
                <span className="font-black text-slate-700 dark:text-slate-300">Texto</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">IA</span>
                <span className={`font-black flex items-center gap-1 ${
                  error ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${error ? "bg-rose-500" : "bg-emerald-500"}`} />
                  {error ? "Offline" : finalizada ? "Sessão encerrada" : "Online"}
                </span>
              </div>
            </div>
          </div>

          {/* Dicas */}
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-5 shadow-sm flex-1">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-4">
              Dicas do Coach
            </p>
            <div className="space-y-4">
              {TIPS.map((tip, i) => {
                const Icon = tip.icon;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {tip.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Método STAR */}
          <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-5">
            <p className="text-[10px] uppercase font-black text-indigo-600 dark:text-indigo-400 tracking-widest mb-3">
              Método STAR
            </p>
            {[
              ["S", "Situação", "Contextualize o cenário"],
              ["T", "Tarefa", "Qual era seu papel"],
              ["A", "Ação", "O que você fez"],
              ["R", "Resultado", "Qual foi o impacto"],
            ].map(([letter, title, desc]) => (
              <div key={letter} className="flex gap-3 mb-3 last:mb-0">
                <span className="w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                  {letter}
                </span>
                <div>
                  <p className="text-xs font-black text-indigo-700 dark:text-indigo-300">{title}</p>
                  <p className="text-[11px] text-indigo-600/70 dark:text-indigo-400/70">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import {
  BrainCircuit, Send, RotateCcw, ChevronRight,
  Mic, MicOff, Lightbulb, User, Loader2,
  CheckCircle2, Clock, Star
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Role = "assistant" | "user";

interface Message {
  id: number;
  role: Role;
  content: string;
  timestamp: Date;
}

interface Tip {
  icon: React.ElementType;
  text: string;
}

// ─── Dados da sessão ──────────────────────────────────────────────────────────

const WELCOME_MESSAGE: Message = {
  id: 0,
  role: "assistant",
  content:
    "Olá! Sou o seu Recrutador Virtual da TalentBridge. Vou simular uma entrevista técnica e comportamental para que você possa chegar preparado na entrevista real. Pode me contar um pouco sobre você e a vaga que está almejando?",
  timestamp: new Date(),
};

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

// ─── Componentes ──────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isAssistant = message.role === "assistant";
  return (
    <div className={`flex gap-3 ${isAssistant ? "" : "flex-row-reverse"}`}>
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${
          isAssistant
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
        }`}
      >
        {isAssistant ? <BrainCircuit className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isAssistant ? "" : "items-end"} flex flex-col gap-1`}>
        <div
          className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed font-medium ${
            isAssistant
              ? "bg-white dark:bg-[#1A1D2D] border border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 rounded-tl-sm"
              : "bg-indigo-600 text-white rounded-tr-sm"
          }`}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-slate-400 px-1">
          {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
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

// ─── Respostas simuladas da IA ────────────────────────────────────────────────

const AI_RESPONSES = [
  "Excelente! Com essa experiência em React e TypeScript, você está bem posicionado. Me fale sobre um projeto complexo que você liderou — qual foi o maior desafio técnico e como você o resolveu?",
  "Interessante! E quando você se depara com um conflito de prioridades no time — por exemplo, um bug crítico em produção versus uma feature com prazo próximo — como você decide o que atacar primeiro?",
  "Boa resposta. Agora uma pergunta sobre arquitetura: se você precisasse redesenhar um sistema com alto volume de acessos simultâneos, quais estratégias de performance você aplicaria no frontend?",
  "Muito bem estruturado! Usando o método STAR, seu raciocínio ficou bem claro. Uma última pergunta: onde você se vê daqui a 3 anos, e como essa vaga contribui para esse objetivo?",
  "Parabéns pela simulação! Você demonstrou clareza técnica e boa capacidade de comunicação. Pontos de atenção: tente ser mais específico com métricas nos seus exemplos (ex: 'reduzi o tempo de carregamento em 40%'). Isso causa impacto muito maior em entrevistas reais.",
];

let aiResponseIndex = 0;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SimulatorPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setSessionStarted(true);
    setInput("");

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setMsgCount((c) => c + 1);
    setIsTyping(true);

    // Simula latência da IA
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const aiResponse = AI_RESPONSES[aiResponseIndex % AI_RESPONSES.length];
    aiResponseIndex++;

    const aiMsg: Message = {
      id: Date.now() + 1,
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
    inputRef.current?.focus();
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setIsTyping(false);
    setSessionStarted(false);
    setMsgCount(0);
    aiResponseIndex = 0;
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Simulador de Entrevista
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium ml-[52px]">
            Recrutador Virtual com IA · {msgCount} {msgCount === 1 ? "resposta" : "respostas"} nesta sessão
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-bold"
        >
          <RotateCcw className="w-4 h-4" />
          Nova Sessão
        </button>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">

        {/* Chat */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm min-h-[500px]">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Sugestões rápidas */}
          {!sessionStarted && (
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
          <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 flex gap-3 items-end">
            <button
              onClick={() => setMicActive(!micActive)}
              className={`p-3 rounded-xl border transition-all shrink-0 ${
                micActive
                  ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-500"
                  : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-indigo-300 hover:text-indigo-500"
              }`}
              title={micActive ? "Desativar microfone" : "Ativar microfone"}
            >
              {micActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua resposta... (Enter para enviar, Shift+Enter para nova linha)"
              rows={2}
              disabled={isTyping}
              className="flex-1 bg-slate-50 dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 resize-none dark:text-white disabled:opacity-50 transition"
            />

            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-md shadow-indigo-500/20 shrink-0"
            >
              {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Painel lateral de dicas */}
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
                <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Online
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
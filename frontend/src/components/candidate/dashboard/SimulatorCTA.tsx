import Link from "next/link";
import { BrainCircuit, ArrowRight, Sparkles } from "lucide-react";

export function SimulatorCTA() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-8 sm:p-10 text-white shadow-2xl shadow-indigo-500/20 group">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 opacity-10 blur-3xl rounded-full w-96 h-96 bg-white pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-20 -translate-x-10 opacity-20 blur-2xl rounded-full w-64 h-64 bg-indigo-300 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex-1 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest text-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exclusivo para Candidatos</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Pratique antes da sua entrevista real com a nossa <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-100">IA Inteligente</span>
          </h2>
          
          <p className="text-indigo-100/90 text-lg leading-relaxed font-medium">
            Converse com nosso recrutador virtual, receba feedback instantâneo sobre suas respostas e chegue preparado para conquistar a vaga dos seus sonhos.
          </p>
        </div>

        <div className="shrink-0 flex flex-col justify-center">
          <Link 
            href="/simulator" 
            className="group/btn relative inline-flex items-center justify-center bg-white text-indigo-700 font-bold px-8 py-4 rounded-2xl text-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3 group-hover/btn:-translate-x-1 transition-transform">
              <BrainCircuit className="w-6 h-6 text-indigo-600" />
              Treinar Agora
              <ArrowRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all absolute right-[-28px] text-indigo-600" />
            </span>
            {/* Hover shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/50 to-white/0 -translate-x-[150%] skew-x-[-15deg] group-hover/btn:animate-[shine_1.5s_ease-out_infinite]" />
          </Link>
        </div>
      </div>
    </div>
  );
}

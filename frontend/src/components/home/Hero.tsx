import { Sparkles } from "lucide-react";

export function Hero() {
    return (
        <section className="bg-background py-20 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-500 px-4 py-2 rounded-full mb-8 border border-indigo-500/20">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            Plataforma Inteligente de Recrutamento
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-extrabold text-foreground mb-6 leading-tight tracking-tight">
                        Conectando <span className="text-indigo-500">Empresas</span> aos
                        <br />
                        Melhores <span className="text-indigo-500">Talentos</span>
                    </h1>

                    <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                        Uma plataforma que revoluciona o recrutamento com IA. Empresas encontram
                        candidatos ideais, candidatos se preparam com nosso Coach de IA e chegam
                        prontos para impressionar.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-lg transition-transform hover:scale-105 active:scale-95 shadow-lg">
                            Encontrar Vagas
                        </button>
                        <button className="bg-card text-indigo-400 border border-slate-700 dark:border-indigo-500/30 px-8 py-4 rounded-lg transition-all hover:bg-indigo-500/10 active:scale-95">
                            Contratar Talentos
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

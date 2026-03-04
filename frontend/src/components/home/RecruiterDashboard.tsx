import { Award, TrendingUp, Users, Sparkles } from 'lucide-react';
import { mockCandidates } from '@/data/mockData';

export function RecruiterDashboard() {
    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 border-t border-border" id="empresas">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-4 py-2 rounded-full mb-6 relative">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">Motor de Ranking para Empresas</span>
                        <div className="absolute -inset-1 bg-indigo-500/20 blur-md rounded-full -z-10" />
                    </div>

                    <h2 className="text-4xl font-bold text-foreground mb-4">
                        Contrate Candidatos que Já Chegam Preparados
                    </h2>

                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Nosso ATS inteligente ranqueia candidatos por compatibilidade.
                        Destaque para aqueles que treinaram com nossa IA e estão prontos para impressionar.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">

                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-white text-2xl font-bold mb-2">
                                        Vaga: Desenvolvedor Front-end Sênior
                                    </h3>
                                    <p className="text-indigo-200 text-sm flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        Tech Solutions • São Paulo, SP • Remoto
                                    </p>
                                </div>

                                <div className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 px-6 py-3 text-center min-w-[140px]">
                                    <div className="text-white text-3xl font-bold tracking-tight">127</div>
                                    <div className="text-indigo-200 text-xs font-medium uppercase tracking-wider">Candidatos</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex justify-between items-end mb-8 border-b border-border pb-4">
                                <div>
                                    <h4 className="text-xl font-bold text-foreground">
                                        Top Candidatos por Match Score AI
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-1">A IA processou e ranqueou 127 perfis enviados.</p>
                                </div>
                                <button className="text-indigo-500 hover:text-indigo-400 text-sm font-semibold transition hidden sm:block">
                                    Ver Pipeline Completo →
                                </button>
                            </div>

                            <div className="space-y-4">
                                {mockCandidates.map((candidate, index) => (
                                    <div
                                        key={candidate.id}
                                        className="group bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 rounded-xl p-5 transition-all duration-300 hover:shadow-md border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 relative overflow-hidden"
                                    >
                                        {/* Background decorativo on hover */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 relative z-10">

                                            {/* Avatar & Badge */}
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={candidate.avatar}
                                                    alt={candidate.name}
                                                    className="w-20 h-20 rounded-full object-cover border-2 border-background shadow-md"
                                                />
                                                {index === 0 && (
                                                    <div className="absolute -bottom-2 -right-2 bg-amber-500 rounded-full p-1.5 shadow-lg border-2 border-background" title="Melhor Match Técnico">
                                                        <Award className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info principal */}
                                            <div className="flex-1 min-w-0 text-center sm:text-left">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                                    <h5 className="text-foreground font-bold text-lg truncate">
                                                        {candidate.name}
                                                    </h5>
                                                    {candidate.isPrepared && (
                                                        <span className="inline-flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                                            <Sparkles className="w-3 h-3" />
                                                            <span>Treinado com IA</span>
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-muted-foreground text-sm mb-3">
                                                    {candidate.role}
                                                </p>

                                                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                                    {candidate.skills.slice(0, 3).map((skill) => (
                                                        <span
                                                            key={skill}
                                                            className="bg-background text-foreground text-xs font-medium px-2.5 py-1 rounded-md border border-border"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Score e Botão CTA */}
                                            <div className="flex flex-col items-center sm:items-end w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border">
                                                <div className="flex items-center space-x-2">
                                                    <TrendingUp className={`w-5 h-5 ${candidate.matchScore >= 90 ? 'text-emerald-500' :
                                                        candidate.matchScore >= 80 ? 'text-indigo-500' :
                                                            'text-muted-foreground'
                                                        }`} />
                                                    <div className="text-right">
                                                        <div className={`text-3xl font-extrabold ${candidate.matchScore >= 90 ? 'text-emerald-500' :
                                                            candidate.matchScore >= 80 ? 'text-indigo-500' :
                                                                'text-muted-foreground'
                                                            }`}>
                                                            {candidate.matchScore}%
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold pb-1">
                                                            Fit Cultural e Técnico
                                                        </div>
                                                    </div>
                                                </div>

                                                <button className="w-full sm:w-auto mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                                                    Ver Currículo
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                            Publicar Vaga Totalmente Grátis
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
}

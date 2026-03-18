"use client";

import { useState } from 'react';
import { Mic, CheckCircle, Sparkles } from 'lucide-react';
import { aiInterviewQuestion, mockAIFeedback } from '@/data/mockData';

export function AICoachTeaser() {
    const [isRecording, setIsRecording] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    const handleMicClick = () => {
        setIsRecording(true);
        setTimeout(() => {
            setIsRecording(false);
            setShowFeedback(true);
        }, 2000);
    };

    const resetDemo = () => {
        setShowFeedback(false);
        setIsRecording(false);
    };

    return (
        <section className="py-20 bg-background transition-colors duration-300" id="candidatos">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-2 rounded-full mb-6 relative">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">Para Candidatos</span>
                        <div className="absolute -inset-1 bg-emerald-500/20 blur-md rounded-full -z-10" />
                    </div>

                    <h2 className="text-4xl font-bold text-foreground mb-4">
                        Prepare-se com Inteligência Artificial
                    </h2>

                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Nosso Coach de IA treina você para entrevistas reais.
                        Pratique respostas, receba feedback instantâneo e chegue confiante na entrevista.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="bg-card rounded-3xl p-8 shadow-2xl border border-border relative overflow-hidden">
                        {/* Glow Background Decorator */}
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

                        {!showFeedback ? (
                            <div className="space-y-6 relative z-10">
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-start space-x-4 mb-4">
                                        <div className="bg-indigo-600 rounded-xl p-3 shadow-md">
                                            <Sparkles className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wider">
                                                Pergunta do Coach IA
                                            </div>
                                            <p className="text-foreground text-lg leading-relaxed font-medium">
                                                "{aiInterviewQuestion}"
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center space-y-4 pt-4">
                                    <button
                                        onClick={handleMicClick}
                                        disabled={isRecording}
                                        className={`group relative ${isRecording
                                                ? 'bg-rose-500 animate-pulse scale-110 shadow-rose-500/50'
                                                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                                            } text-white rounded-full p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 disabled:hover:translate-y-0`}
                                    >
                                        <Mic className="w-10 h-10" />
                                    </button>

                                    <div className="text-center">
                                        <p className="text-foreground font-medium text-lg">
                                            {isRecording ? 'Ouvindo sua resposta...' : 'Clique para responder'}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {isRecording ? 'Fale naturalmente' : 'Use o microfone para praticar gratuitamente'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-border">
                                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                                        <h3 className="text-2xl font-bold text-foreground">
                                            Análise de Performance
                                        </h3>
                                    </div>

                                    <div className="space-y-6">
                                        {mockAIFeedback.map((feedback, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-foreground">
                                                        {feedback.category}
                                                    </span>
                                                    <span className="text-emerald-500 font-bold text-lg">
                                                        {feedback.score}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${feedback.score}%` }}
                                                    />
                                                </div>
                                                <span className="inline-block mt-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold py-1">
                                                    Diagnóstico: {feedback.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-center pt-4">
                                    <button
                                        onClick={resetDemo}
                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
                                    >
                                        Tentar Outra Pergunta <Sparkles className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 text-center">
                        <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-1">
                            Criar Conta e Começar Treino Gratuito
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

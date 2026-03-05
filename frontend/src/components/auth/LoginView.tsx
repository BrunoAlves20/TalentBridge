"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function LoginView() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const user = await authService.login(email, password);

            // Aqui idealmente você salvaria o token num Cookie e o User num Context.
            localStorage.setItem('@TalentBridge:user', JSON.stringify(user));

            // Redirecionamento Baseado em Role
            if (user.role === 'admin') {
                router.push('/recruiter/dashboard'); // Tela inicial do Recrutador
            } else {
                router.push('/candidate/dashboard'); // Tela inicial do Candidato
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground tracking-tight">
                    Acesse sua conta
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Ou{' '}
                    <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
                        crie seu cadastro gratuitamente
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-card py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-border">
                    <form className="space-y-6" onSubmit={handleLogin}>

                        {/* Campo E-mail */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground">
                                Endereço de E-mail
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="focus:ring-ring focus:border-ring block w-full pl-10 sm:text-sm border-input rounded-md bg-background text-foreground h-11 transition-all"
                                    placeholder="exemplo@talentbridge.com"
                                />
                            </div>
                        </div>

                        {/* Campo Senha */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-foreground">
                                Senha
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="focus:ring-ring focus:border-ring block w-full pl-10 sm:text-sm border-input rounded-md bg-background text-foreground h-11 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Mensagem de Erro */}
                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20 text-center animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        {/* Botão Submit */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Entrar na Plataforma
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                )}
                            </button>
                        </div>

                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-card text-muted-foreground">
                                    Dica de teste
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 text-xs text-center text-muted-foreground space-y-1 bg-muted p-4 rounded-md">
                            <p>👤 <strong>Candidato:</strong> candidato@teste.com (senha: 123456)</p>
                            <p>🏢 <strong>Recrutador:</strong> rh@teste.com (senha: 123456)</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

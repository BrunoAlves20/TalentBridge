"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, UserRole } from '@/services/auth';
import { User, Mail, Lock, Briefcase, UserCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function RegisterView() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Alterado para bater com o formato do banco de dados
    const [role, setRole] = useState<UserRole>('CANDIDATO');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Chama a nossa API Python
            const response = await authService.register(name, email, password, role);

            // Salva o ID gerado pelo banco para a tela de Perfil Pessoal usar
            localStorage.setItem('usuario_id', response.id.toString());

            // Redireciona baseado no tipo de usuário
            if (role === 'RECRUTADOR') {
                // Vai para a página do recrutador (que no momento pode estar vazia)
                router.push('/dashboard');
            } else {
                // Vai para a página "Feia mas Funcional" que criamos para adicionar os dados
                router.push('/area-candidato');
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
                    Crie sua conta
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Já tem uma conta?{' '}
                    <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                        Faça login aqui
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-card py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-border">
                    <form className="space-y-6" onSubmit={handleRegister}>

                        {/* Escolha de Perfil (Role) */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-3 shadow-sm">
                                Qual o seu objetivo?
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRole('CANDIDATO')}
                                    className={`relative flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${role === 'CANDIDATO'
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-border bg-background text-muted-foreground hover:border-border/80'
                                        }`}
                                >
                                    <UserCircle className="w-6 h-6 mb-2" />
                                    <span className="text-sm font-medium text-foreground">Sou Candidato</span>
                                    <span className="text-xs text-muted-foreground mt-1 text-center">Quero treinar e achar vagas</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setRole('RECRUTADOR')}
                                    className={`relative flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${role === 'RECRUTADOR'
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-border bg-background text-muted-foreground hover:border-border/80'
                                        }`}
                                >
                                    <Briefcase className="w-6 h-6 mb-2" />
                                    <span className="text-sm font-medium text-foreground">Sou Recrutador</span>
                                    <span className="text-xs text-muted-foreground mt-1 text-center">Quero contratar talentos</span>
                                </button>
                            </div>
                        </div>

                        {/* Nome Completo */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-foreground">
                                Nome completo {role === 'RECRUTADOR' && 'ou nome da Empresa'}
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="focus:ring-ring focus:border-ring block w-full pl-10 sm:text-sm border-input rounded-md bg-background text-foreground h-11 transition-all"
                                    placeholder={role === 'RECRUTADOR' ? "Tech Company LTDA" : "João da Silva"}
                                />
                            </div>
                        </div>

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
                                    placeholder={role === 'RECRUTADOR' ? "rh@empresa.com" : "exemplo@email.com"}
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
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="focus:ring-ring focus:border-ring block w-full pl-10 sm:text-sm border-input rounded-md bg-background text-foreground h-11 transition-all"
                                    placeholder="Mínimo de 6 caracteres"
                                />
                            </div>
                        </div>

                        {/* Mensagem de Erro (Vinda do Backend) */}
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
                                        {role === 'RECRUTADOR' ? "Criar conta de Recrutador" : "Criar conta de Candidato"}
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Navbar() {
    return (
        <nav className="border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo Antiga do Usuário Mantida */}
                    <div className="flex items-center space-x-2">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                            Talent Bridge
                        </span>
                    </div>

                    {/* Navegação */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="#features" className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors duration-200 font-medium">
                            Recursos
                        </Link>
                        <Link href="#candidatos" className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors duration-200 font-medium">
                            Para Candidatos
                        </Link>
                        <Link href="#empresas" className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors duration-200 font-medium">
                            Para Empresas
                        </Link>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* THEME TOGGLE BUTTON */}
                        <ThemeToggle />

                        {/* CTAs */}
                        <div className="flex items-center space-x-4 border-l border-slate-300 dark:border-slate-800 pl-4 md:pl-6">
                            <Link href="/login" className="hidden md:inline-flex text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                                Entrar
                            </Link>
                            <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                                Criar Conta
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

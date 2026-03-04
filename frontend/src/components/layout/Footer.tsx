import { Briefcase, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 pt-16 pb-8 transition-colors duration-300 border-t border-slate-200 dark:border-slate-800/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">Talent Bridge</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            Conectando empresas aos melhores talentos através de tecnologia e inteligência artificial.
                        </p>
                    </div>

                    {/* Candidatos Links */}
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Para Candidatos</h3>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <li>
                                <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                                    Encontrar Vagas
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                                    Coach de IA
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                                    Preparação para Entrevistas
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                                    Dicas de Carreira
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Empresas Links */}
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Para Empresas</h3>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <li>
                                <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                                    Publicar Vagas
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                                    ATS Inteligente
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                                    Planos e Preços
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                                    Cases de Sucesso
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contato Info */}
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Contato</h3>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li className="flex items-center space-x-2">
                                <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span>suporte.talentbridge@gmail.com</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span>(61) 99999-9999</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span>Faculdade Senac, Brasília, DF</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            © {new Date().getFullYear()} Talent Bridge. Todos os direitos reservados.
                        </p>
                        <div className="flex space-x-6 text-sm text-slate-600 dark:text-slate-400">
                            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                                Termos de Uso
                            </Link>
                            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                                Política de Privacidade
                            </Link>
                            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                                Cookies
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

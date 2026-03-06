"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Home, FileText } from 'lucide-react';

export function CandidateSidebar() {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', href: '/area-candidato', icon: Home },
        { name: 'Meu Perfil', href: '/area-candidato/perfil', icon: User },
        // Já deixei esse aqui pronto para quando formos fazer o upload do currículo!
        { name: 'Currículo', href: '/area-candidato/curriculo', icon: FileText }, 
    ];

    return (
        <aside className="w-64 bg-card border-r border-border min-h-[calc(100vh-4rem)] p-4 flex flex-col">
            <div className="mb-8 px-4">
                <h2 className="text-xl font-bold text-primary">Área do Candidato</h2>
            </div>
            
            <nav className="space-y-2 flex-1">
                {menuItems.map((item) => {
                    // Verifica se a rota atual é exatamente a do link para pintar de azul
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
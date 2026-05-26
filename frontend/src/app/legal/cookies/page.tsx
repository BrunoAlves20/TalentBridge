import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Política de Cookies — TalentBridge" };

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-400 mb-8"
        >
          <ArrowLeft size={16} /> Voltar para a home
        </Link>

        <h1 className="text-4xl font-bold mb-4">Política de Cookies</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>

        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">O que são cookies?</h2>
            <p>
              Cookies são pequenos arquivos armazenados no seu navegador para guardar
              preferências (como tema escuro/claro) e manter você autenticado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Cookies que usamos</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Essenciais:</strong> token JWT no localStorage para manter sua sessão ativa.</li>
              <li><strong className="text-foreground">Preferências:</strong> tema (claro/escuro), idioma.</li>
              <li><strong className="text-foreground">Funcionais:</strong> dados temporários do onboarding para evitar perda de progresso.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Como gerenciar</h2>
            <p>
              Você pode limpar os cookies a qualquer momento nas configurações do seu navegador.
              Note que limpar cookies essenciais fará logout e exigirá novo login.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

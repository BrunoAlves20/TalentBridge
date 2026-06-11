import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Política de Privacidade — TalentBridge" };

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-400 mb-8"
        >
          <ArrowLeft size={16} /> Voltar para a home
        </Link>

        <h1 className="text-4xl font-bold mb-4">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>

        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Dados que coletamos</h2>
            <p>
              Coletamos os dados que você fornece no cadastro (nome, e-mail, currículo,
              experiências, formações), além de informações de uso da plataforma para
              fins de matching e melhoria do serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Como usamos</h2>
            <p>
              Seus dados são usados para conectar candidatos a vagas compatíveis, gerar
              análises de compatibilidade via IA e personalizar sua experiência.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Compartilhamento</h2>
            <p>
              Recrutadores só visualizam dados de candidatos que se aplicaram ativamente às
              suas vagas. Não vendemos dados pessoais para terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Seus direitos (LGPD)</h2>
            <p>
              Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento
              pelo e-mail{" "}
              <a href="mailto:suporte.talentbridge@gmail.com" className="text-indigo-500">
                suporte.talentbridge@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Segurança</h2>
            <p>
              Senhas são armazenadas com hash bcrypt. A autenticação é feita via JWT com
              expiração configurável. Tokens de acesso ficam no seu navegador (localStorage).
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

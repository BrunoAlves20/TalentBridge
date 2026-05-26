import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Termos de Uso — TalentBridge" };

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-400 mb-8"
        >
          <ArrowLeft size={16} /> Voltar para a home
        </Link>

        <h1 className="text-4xl font-bold mb-4">Termos de Uso</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Aceitação</h2>
            <p>
              Ao criar uma conta na TalentBridge, você concorda com estes Termos de Uso e
              com a nossa <Link href="/legal/privacidade" className="text-indigo-500">Política de Privacidade</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Cadastro</h2>
            <p>
              Você é responsável pelas informações fornecidas e por manter suas credenciais seguras.
              Cadastros falsos ou em nome de terceiros podem ser removidos sem aviso prévio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Uso da Plataforma</h2>
            <p>
              A TalentBridge oferece ferramentas de recrutamento, ranking de candidatos e
              simulação de entrevistas com IA. Não é permitido utilizar a plataforma para
              fins fraudulentos, discriminatórios ou contrários à legislação vigente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Inteligência Artificial</h2>
            <p>
              As respostas geradas pelo Coach de IA têm finalidade educacional e de treinamento.
              Não constituem garantia de aprovação em processos seletivos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Rescisão</h2>
            <p>
              Você pode encerrar sua conta a qualquer momento. A TalentBridge se reserva o
              direito de suspender contas em caso de violação destes termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Contato</h2>
            <p>
              Dúvidas? Fale com a gente em{" "}
              <a href="mailto:suporte.talentbridge@gmail.com" className="text-indigo-500">
                suporte.talentbridge@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

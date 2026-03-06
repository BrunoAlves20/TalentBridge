import { CurriculoFormView } from "@/components/candidate/CurriculoFormView";

export default function AreaCandidatoHome() {
    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-foreground mb-4">
                Bem-vindo ao TalentBridge! 👋
            </h1>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-8">
                <h2 className="text-xl font-semibold mb-2">Seus próximos passos:</h2>
                <p className="text-muted-foreground mb-4">
                    Para que os recrutadores possam te encontrar e nossa Inteligência Artificial possa avaliar suas habilidades, precisamos conhecer você melhor.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Use o menu lateral para acessar <strong>Meu Perfil</strong> e preencher seus dados básicos de contato.</li>
                    <li>Em breve, você poderá fazer o upload do seu Currículo para preenchimento automático!</li>
                </ul>
            </div>
            
            <CurriculoFormView />
        </div>
    );
}


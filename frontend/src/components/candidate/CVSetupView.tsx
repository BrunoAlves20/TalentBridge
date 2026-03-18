export function CVSetupView() {
    return (
        <div className="container max-w-2xl p-6 space-y-6 mx-auto mt-10">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Configure seu Currículo</h1>
                <p className="text-muted-foreground mt-2">Faça upload de um PDF ou construa seu perfil passo a passo.</p>
            </div>
            <div className="grid gap-6 pt-8 md:grid-cols-2">
                {/* Opções de Inserção de Dados */}
                <div className="border rounded-lg p-6 text-center hover:bg-muted/50 cursor-pointer transition-colors">
                    <h3 className="font-semibold text-lg mb-2">Upload de PDF</h3>
                    <p className="text-sm text-muted-foreground">Deixe a IA extrair seus dados automaticamente.</p>
                </div>
                <div className="border rounded-lg p-6 text-center hover:bg-muted/50 cursor-pointer transition-colors">
                    <h3 className="font-semibold text-lg mb-2">Preenchimento Manual</h3>
                    <p className="text-sm text-muted-foreground">Preencha seus dados etapa por etapa.</p>
                </div>
            </div>
        </div>
    );
}

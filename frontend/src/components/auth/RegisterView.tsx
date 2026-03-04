export function RegisterView() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-sm">
                <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight">Crie sua conta</h2>
                    <p className="text-sm text-muted-foreground">Escolha o seu perfil para começar</p>
                </div>
                {/* Formulário/Seleção de Perfil será adicionado aqui */}
                <div className="mt-8 flex justify-center text-sm">
                    <span className="text-muted-foreground mr-1">Já tem uma conta?</span>
                    <a href="/login" className="font-semibold text-primary hover:underline">Entrar</a>
                </div>
            </div>
        </div>
    );
}

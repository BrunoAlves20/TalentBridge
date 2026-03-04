export function LoginView() {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-sm">
                <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight">Bem-vindo de volta</h2>
                    <p className="text-sm text-muted-foreground">Entre na sua conta para continuar</p>
                </div>
                {/* Formulário será adicionado aqui */}
                <div className="mt-8 flex justify-center text-sm">
                    <span className="text-muted-foreground mr-1">Não tem uma conta?</span>
                    <a href="/register" className="font-semibold text-primary hover:underline">Cadastre-se</a>
                </div>
            </div>
        </div>
    );
}

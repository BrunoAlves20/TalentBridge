export default function RecruiterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    {/* Recruiter Header Navigation Placeholder */}
                    <span className="font-bold">Talent Bridge | Recruiter</span>
                </div>
            </header>
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}

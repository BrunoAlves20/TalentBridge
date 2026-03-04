export default function CandidateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    {/* Candidate Header Navigation Placeholder */}
                    <span className="font-bold">Talent Bridge | Candidate</span>
                </div>
            </header>
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}

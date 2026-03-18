export default function RecruiterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}

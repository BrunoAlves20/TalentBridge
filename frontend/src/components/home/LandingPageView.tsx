import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { AICoachTeaser } from "@/components/home/AICoachTeaser";
import { RecruiterDashboard } from "@/components/home/RecruiterDashboard";

export function LandingPageView() {
    return (
        <main className="flex min-h-screen flex-col bg-background text-foreground selection:bg-indigo-500/30">
            <Navbar />

            <Hero />

            <AICoachTeaser />

            <RecruiterDashboard />

            <Footer />
        </main>
    );
}

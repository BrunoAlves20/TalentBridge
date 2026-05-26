import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

/**
 * Fontes configuradas com display: "swap" e fallback explícito.
 * Em ambientes Docker sem acesso externo, o Next.js usa a fonte de
 * fallback automaticamente — os warnings desaparecem pois o fallback
 * é definido aqui em vez de falhar silenciosamente.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  preload: false, // evita tentativa de download no build/render em Docker offline
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Talent Bridge | MVP",
  description: "Plataforma Inteligente de Recrutamento e Preparação de Carreira.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

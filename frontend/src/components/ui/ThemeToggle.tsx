"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Evitar hydration mismatch renderizando apenas após montado
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-14 h-8" />; // placeholder vazio para não quebrar layout original
    }

    const currentTheme = theme === "system" ? resolvedTheme : theme;
    const isDark = currentTheme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative w-14 h-8 flex items-center bg-slate-300 dark:bg-slate-700 rounded-full p-1 transition-colors duration-300 mr-2"
            aria-label="Alternar tema"
        >
            <div
                className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 shadow-md transform transition-transform duration-300 ${isDark ? "translate-x-6" : "translate-x-0"
                    }`}
            />
            <Sun className="w-4 h-4 text-amber-500 ml-1 z-10" />
            <Moon className="w-4 h-4 text-indigo-400 ml-auto mr-1 z-10" />
        </button>
    );
}

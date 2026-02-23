"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Apenas renderiza nakon a hidratação para evitar erros de hidratação (SSR)
    React.useEffect(() => setMounted(true), [])

    if (!mounted) {
        return (
            <div className="flex bg-muted/30 p-1 rounded-xl w-full sm:w-auto h-12 w-[180px] animate-pulse"></div>
        )
    }

    return (
        <div className="flex bg-muted/50 p-1 rounded-xl w-full sm:w-auto inline-flex ring-1 ring-border/50">
            <button
                onClick={() => setTheme("light")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${theme === "light"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    }`}
            >
                <Sun className="h-4 w-4" />
                <span>Claro</span>
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${theme === "dark"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    }`}
            >
                <Moon className="h-4 w-4" />
                <span>Escuro</span>
            </button>
        </div>
    )
}

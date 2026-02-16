'use client'

import * as React from "react"
import { Search, Loader2, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import { searchQuotes } from "@/app/actions/search"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface SearchResult {
    id: string
    client_name: string
    total: number
    status: string
    created_at: string
}

export function GlobalSearch() {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [data, setData] = React.useState<SearchResult[]>([])
    const [loading, setLoading] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    React.useEffect(() => {
        if (query.length < 1) {
            setData([])
            return
        }

        const timer = setTimeout(async () => {
            setLoading(true)
            const results = await searchQuotes(query)
            setData(results)
            setLoading(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const handleSelect = (id: string) => {
        setOpen(false)
        router.push(`/quotes/${id}`)
    }

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/10 hover:text-primary relative"
                onClick={() => setOpen(true)}
            >
                <Search className="h-5 w-5" />
                <span className="sr-only">Buscar</span>
            </Button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Buscar orçamentos por cliente..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    <CommandEmpty>
                        {loading ? <div className="flex items-center justify-center p-4"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Buscando...</div> : "Nenhum resultado encontrado."}
                    </CommandEmpty>

                    {data.length > 0 && (
                        <CommandGroup heading="Orçamentos">
                            {data.map((quote) => (
                                <CommandItem
                                    key={quote.id}
                                    value={`${quote.client_name} ${quote.id}`}
                                    onSelect={() => handleSelect(quote.id)}
                                    className="cursor-pointer"
                                >
                                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{quote.client_name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(quote.created_at), "d MMM", { locale: ptBR })} • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.total)}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    <CommandSeparator />

                </CommandList>
            </CommandDialog>
        </>
    )
}

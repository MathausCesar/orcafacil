'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { QuoteStatusBadge } from '@/components/quotes/quote-status-badge'
import { EditClientDialog } from '@/components/clients/edit-client-dialog'
import { DeleteClientButton } from '@/components/clients/delete-client-button'
import { Phone, ChevronDown, FileText, Loader2, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

interface Client {
    id: string
    name: string
    phone?: string | null
    email?: string | null
    company_name?: string | null
}

interface Quote {
    id: string
    client_name: string
    total: number
    status: string
    created_at: string
}

export function ClientCardExpandable({ client }: { client: Client }) {
    const [expanded, setExpanded] = useState(false)
    const [quotes, setQuotes] = useState<Quote[]>([])
    const [loading, setLoading] = useState(false)
    const [fetched, setFetched] = useState(false)

    const handleToggle = async () => {
        if (!expanded && !fetched) {
            setLoading(true)
            try {
                const supabase = createClient()
                const { data } = await supabase
                    .from('quotes')
                    .select('id, client_name, total, status, created_at')
                    .eq('client_name', client.name)
                    .order('created_at', { ascending: false })

                setQuotes(data || [])
                setFetched(true)
            } catch {
                // silently fail
            } finally {
                setLoading(false)
            }
        }
        setExpanded(!expanded)
    }

    const formatBRL = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

    return (
        <Card className="hover:border-primary/25 hover:shadow-md transition-all border-primary/10">
            {/* Main Row */}
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleToggle}
                        className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                    >
                        <Avatar className="h-10 w-10 bg-primary/10 text-primary">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {client.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground">{client.name}</h3>
                            {client.phone && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> {client.phone}
                                </p>
                            )}
                        </div>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                    </button>

                    <div className="flex gap-1 ml-2 shrink-0">
                        <EditClientDialog client={client} trigger={
                            <Button size="sm" variant="ghost" className="h-8 text-xs hover:bg-muted">
                                Editar
                            </Button>
                        } />
                        <DeleteClientButton clientId={client.id} clientName={client.name} />
                        <Link href={`/new?clientId=${client.id}&clientName=${encodeURIComponent(client.name)}`}>
                            <Button size="sm" variant="ghost" className="h-8 text-xs text-primary hover:bg-primary/10 hover:text-primary">
                                Orçar
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Expanded Section */}
                {expanded && (
                    <div className="mt-4 pt-4 border-t border-border space-y-2">
                        {loading ? (
                            <div className="flex items-center justify-center py-6 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span className="text-sm">Carregando orçamentos...</span>
                            </div>
                        ) : quotes.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Nenhum orçamento encontrado para este cliente.</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">
                                    {quotes.length} orçamento{quotes.length !== 1 ? 's' : ''}
                                </p>
                                {quotes.map((quote) => (
                                    <Link
                                        key={quote.id}
                                        href={`/quotes/${quote.id}`}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/60 border border-border/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {formatBRL(quote.total)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(quote.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <QuoteStatusBadge status={quote.status} />
                                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </Link>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

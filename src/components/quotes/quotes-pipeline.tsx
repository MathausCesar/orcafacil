import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MoreVertical } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { QuoteStatusBadge } from '@/components/quotes/quote-status-badge'

interface Quote {
    id: string
    client_name: string
    total: number
    status: string
    created_at: string
}

interface QuotesPipelineProps {
    quotes: Quote[]
}

const COLUMNS = [
    { id: 'draft', label: 'Rascunho', bg: 'bg-zinc-100/50' },
    { id: 'sent', label: 'Enviados', bg: 'bg-blue-100/50' },
    { id: 'approved', label: 'Aprovados', bg: 'bg-emerald-100/50' },
    { id: 'in_progress', label: 'Em Execução', bg: 'bg-violet-100/50' },
    { id: 'completed', label: 'Concluídos', bg: 'bg-teal-100/50' },
    { id: 'rejected', label: 'Recusados', bg: 'bg-red-100/50' }
]

export function QuotesPipeline({ quotes }: QuotesPipelineProps) {
    // Treat legacy 'pending' as 'draft' for the pipeline, or put it in 'sent' based on logic
    // Actually, let's map 'pending' to 'draft' column if they just created it.
    const getColumnQuotes = (statusId: string) => {
        return quotes.filter(q => {
            if (statusId === 'draft' && q.status === 'pending') return true;
            return q.status === statusId;
        })
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {COLUMNS.map(column => {
                const columnQuotes = getColumnQuotes(column.id)

                return (
                    <div key={column.id} className={`flex-shrink-0 w-80 rounded-xl border border-border p-3 ${column.bg} flex flex-col max-h-[70vh] snap-center`}>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                {column.label}
                                <span className="text-xs py-0.5 px-2 bg-background rounded-full text-muted-foreground shadow-sm">
                                    {columnQuotes.length}
                                </span>
                            </h3>
                        </div>

                        <div className="flex flex-col gap-3 overflow-y-auto pr-1 pb-2 scrollbar-thin">
                            {columnQuotes.map(quote => (
                                <Link key={quote.id} href={`/quotes/${quote.id}`}>
                                    <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group bg-background relative">
                                        <CardContent className="p-4 flex flex-col gap-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-semibold text-sm leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                                    {quote.client_name}
                                                </h4>
                                                <button className="text-muted-foreground hover:text-foreground p-1 -mr-2 -mt-2 rounded-full hover:bg-muted relative z-10 hidden group-hover:block transition-all" onClick={(e) => { e.preventDefault(); /* ToDo: Dropdown actions */ }}>
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between mt-1">
                                                <span className="font-bold text-primary text-sm">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.total)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(quote.created_at), "dd MMM, yyyy", { locale: ptBR })}
                                                </span>
                                                <QuoteStatusBadge status={quote.status} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}

                            {columnQuotes.length === 0 && (
                                <div className="text-center p-6 border-2 border-dashed border-border/50 rounded-lg text-muted-foreground/50">
                                    <p className="text-xs font-medium">Nenhum orçamento</p>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

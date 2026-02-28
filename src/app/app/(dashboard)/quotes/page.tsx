import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { QuoteStatusBadge } from '@/components/quotes/quote-status-badge'
import { QuoteFilters } from '@/components/quotes/quote-filters'

interface SearchParams {
    q?: string
    status?: string
    from?: string
    to?: string
    sort?: string
}

export default async function QuotesListPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const params = await searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Build query with filters
    let query = supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id)

    // Text search
    if (params.q) {
        query = query.ilike('client_name', `%${params.q}%`)
    }

    // Status filter
    if (params.status) {
        query = query.eq('status', params.status)
    }

    // Date range
    if (params.from) {
        query = query.gte('created_at', `${params.from}T00:00:00`)
    }
    if (params.to) {
        query = query.lte('created_at', `${params.to}T23:59:59`)
    }

    // Sort
    const sort = params.sort || 'recent'
    switch (sort) {
        case 'oldest':
            query = query.order('created_at', { ascending: true })
            break
        case 'highest':
            query = query.order('total', { ascending: false })
            break
        case 'lowest':
            query = query.order('total', { ascending: true })
            break
        case 'name_asc':
            query = query.order('client_name', { ascending: true })
            break
        case 'name_desc':
            query = query.order('client_name', { ascending: false })
            break
        default: // 'recent'
            query = query.order('created_at', { ascending: false })
    }

    const { data: quotes } = await query

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-foreground">Meus Orçamentos</h1>
                {quotes && quotes.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                        {quotes.length} {quotes.length === 1 ? 'orçamento' : 'orçamentos'}
                    </span>
                )}
            </div>

            {/* Filters */}
            <QuoteFilters />

            <div className="space-y-3">
                {quotes?.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-primary/5 rounded-xl border border-dashed border-primary/20">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-primary/25" />
                        <p>Nenhum orçamento encontrado.</p>
                        {(params.q || params.status || params.from || params.to) && (
                            <p className="text-sm mt-1">Tente ajustar os filtros.</p>
                        )}
                    </div>
                ) : (
                    quotes?.map((quote) => (
                        <Link key={quote.id} href={`/quotes/${quote.id}`}>
                            <Card className="hover:border-primary/25 hover:shadow-md transition-all border-l-4 border-l-primary cursor-pointer group border-primary/10">
                                <CardContent className="p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <FileText className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">{quote.client_name}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(quote.created_at), "d 'de' MMM, yy", { locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-auto flex justify-between items-center md:block md:text-right">
                                        <p className="font-bold text-primary">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.total)}
                                        </p>
                                        <div className="md:mt-1">
                                            <QuoteStatusBadge status={quote.status} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div >
    )
}

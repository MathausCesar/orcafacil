import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Search, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QuoteStatusBadge } from '@/components/quotes/quote-status-badge'

export default async function QuotesListPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    let query = supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (q) {
        query = query.ilike('client_name', `%${q}%`)
    }

    const { data: quotes } = await query

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-foreground">Meus Orçamentos</h1>
                <Link href="/new">
                    <Button size="icon" className="rounded-full shadow-lg shadow-primary/25 bg-gradient-to-br from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90">
                        <Plus className="h-6 w-6" />
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <form className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    name="q"
                    placeholder="Buscar por cliente..."
                    className="pl-10 h-10 bg-card border-primary/10 focus-visible:ring-primary"
                    defaultValue={q}
                />
            </form>

            <div className="space-y-3">
                {quotes?.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-primary/5 rounded-xl border border-dashed border-primary/20">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-primary/25" />
                        <p>Nenhum orçamento encontrado.</p>
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

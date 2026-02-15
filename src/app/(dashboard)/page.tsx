import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { QuoteStatusBadge } from '@/components/quotes/quote-status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, FileText, TrendingUp, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function Dashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.business_name) {
    redirect('/onboarding')
  }

  // Fetch Stats (Real Data)
  const { count: quotesCount } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data: recentQuotes } = await supabase
    .from('quotes')
    .select('*, quote_items(description)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: allQuotes } = await supabase
    .from('quotes')
    .select('total')
    .eq('user_id', user.id)
    .eq('status', 'approved')

  const totalRevenue = allQuotes?.reduce((acc, q) => acc + (q.total || 0), 0) || 0

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={profile.business_name}
        profileImage={profile.logo_url}
      />

      {/* Quick Actions / Status */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-primary to-emerald-600 text-white border-none shadow-lg shadow-primary/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
          <CardContent className="p-4 flex flex-col justify-between h-32 relative z-10">
            <div className="p-2 bg-white/20 w-fit rounded-lg backdrop-blur-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Receita Total</p>
              <h3 className="text-xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Link href="/quotes">
          <Card className="bg-card shadow-sm border-primary/10 h-full hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-4 flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-primary/10 w-fit rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Orçamentos</p>
                <h3 className="text-2xl font-bold text-foreground">{quotesCount || 0}</h3>
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* Main Action */}
      <section>
        <Link href="/new">
          <Button size="lg" className="w-full h-14 text-lg shadow-xl shadow-primary/25 rounded-xl bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 transition-all">
            <Plus className="mr-2 h-6 w-6" /> Novo Orçamento
          </Button>
        </Link>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recentes</h2>
          <Link href="/quotes">
            <Button variant="link" size="sm" className="text-primary hover:text-primary/80">Ver todos</Button>
          </Link>
        </div>

        <div className="space-y-2">
          {recentQuotes?.length === 0 ? (
            <Card className="border-dashed border-primary/20 shadow-none bg-primary/5">
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 text-primary/30" />
                <p className="text-sm">Nenhum orçamento criado ainda.</p>
                <p className="text-xs mt-1 text-primary/60">Comece criando seu primeiro orçamento!</p>
              </CardContent>
            </Card>
          ) : (
            recentQuotes?.map((quote) => (
              <Link key={quote.id} href={`/quotes/${quote.id}`}>
                <div className="bg-card p-3.5 rounded-xl shadow-sm border border-primary/10 flex justify-between items-start hover:border-primary/25 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{quote.client_name}</p>
                      {quote.quote_items && quote.quote_items.length > 0 && (
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                          {quote.quote_items[0].description}
                          {quote.quote_items.length > 1 && <span className="opacity-70 text-[10px]">(+{quote.quote_items.length - 1})</span>}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {format(new Date(quote.created_at), "d MMM", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-primary block text-right">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.total)}
                  </span>
                  <div className="flex justify-end mt-1">
                    <QuoteStatusBadge status={quote.status} />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

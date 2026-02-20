import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { QuoteStatusBadge } from '@/components/quotes/quote-status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, FileText, ArrowUpRight, Wallet } from 'lucide-react'
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

  if (!profile?.onboarded_at) {
    redirect('/onboarding')
  }

  // Fetch Stats (Real Data)
  const { count: quotesCount } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'approved')

  const { count: pendingCount } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('status', ['pending', 'draft'])

  const { data: recentQuotes } = await supabase
    .from('quotes')
    .select('*, quote_items(description)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: allQuotes } = await supabase
    .from('quotes')
    .select('total')
    .eq('user_id', user.id)
    .eq('status', 'approved')

  const totalRevenue = allQuotes?.reduce((acc, q) => acc + (q.total || 0), 0) || 0

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      <DashboardHeader
        title={profile.business_name || 'Seu Negócio'}
        profileImage={profile.logo_url}
        className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-zinc-100 shadow-sm"
      />

      {/* Main Action - Elegant Gradient */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-xl shadow-emerald-900/10 transition-all hover:shadow-emerald-900/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-10 gap-6">
          <div className="text-white space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Criar Novo Orçamento</h2>
            <p className="text-emerald-100 font-medium">Gere propostas profissionais em segundos.</p>
          </div>
          <Link href="/new">
            <Button size="lg" className="h-14 px-8 text-lg rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg border-2 border-transparent transition-all hover:scale-105 active:scale-95 font-semibold">
              <Plus className="mr-2 h-6 w-6" /> Começar Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Grid - Soft & Airy */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card - Clean White */}
        <Card className="col-span-1 md:col-span-2 border-none shadow-md bg-white rounded-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet className="h-32 w-32 -rotate-12" />
          </div>
          <CardContent className="p-8 flex flex-col justify-between h-48">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Wallet className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Receita Aprovada</p>
            </div>
            <div>
              <h3 className="text-5xl font-bold tracking-tighter text-zinc-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 font-medium">Total acumulado em caixa</p>
            </div>
          </CardContent>
        </Card>

        {/* Quotes Count - Minimalist */}
        <Card className="border-none shadow-md bg-white rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg">
          <CardContent className="p-8 flex flex-col justify-between h-48">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Aprovados</p>
                <h3 className="text-4xl font-bold text-zinc-900">{quotesCount || 0}</h3>
              </div>
            </div>
            <div className="mt-auto pt-6 border-t border-zinc-50 flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Em análise</span>
              <span className="font-bold text-xl text-zinc-700 bg-zinc-100 px-3 py-1 rounded-lg">{pendingCount || 0}</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recent Activity List - Clean Table Style */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold tracking-tight text-zinc-800">Últimos Orçamentos</h2>
          <Link href="/quotes">
            <Button variant="ghost" className="text-emerald-600 font-medium hover:text-emerald-700 hover:bg-emerald-50">
              Ver todos <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {recentQuotes?.length === 0 ? (
            <Card className="border-dashed border-2 border-zinc-200 bg-zinc-50/50 rounded-2xl shadow-none">
              <CardContent className="p-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Nada por aqui ainda.</p>
                <p className="text-sm">Seus orçamentos recentes aparecerão nesta lista.</p>
              </CardContent>
            </Card>
          ) : (
            recentQuotes?.map((quote) => (
              <Link key={quote.id} href={`/quotes/${quote.id}`} className="block group">
                <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md hover:border-emerald-100/50 hover:bg-emerald-50/10">

                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center font-bold text-lg text-zinc-600 shadow-inner">
                      {quote.client_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-zinc-900 group-hover:text-emerald-700 transition-colors">{quote.client_name}</h4>
                      <p className="text-xs font-medium text-muted-foreground">
                        {format(new Date(quote.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto">
                    {quote.quote_items && quote.quote_items.length > 0 && (
                      <div className="hidden md:block text-right">
                        <p className="font-medium text-sm text-zinc-700">{quote.quote_items[0].description}</p>
                        {quote.quote_items.length > 1 && (
                          <p className="text-xs text-muted-foreground">+{quote.quote_items.length - 1} item(s)</p>
                        )}
                      </div>
                    )}

                    <div className="text-right min-w-[120px]">
                      <span className="block font-bold text-lg text-zinc-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.total)}
                      </span>
                    </div>

                    <div className="min-w-[100px] flex justify-end">
                      <QuoteStatusBadge status={quote.status} />
                    </div>
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

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { QuoteStatusBadge } from '@/components/quotes/quote-status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, FileText, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cookies } from 'next/headers'

export default async function Dashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Read orgId from cookie (zero latency)
  const cookieStore = await cookies()
  const orgId = cookieStore.get("activeOrganizationId")?.value || null

  // Parallel fetch: profile + recent quotes
  const [profileResult, quotesResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('business_name, logo_url, onboarded_at')
      .eq('id', user.id)
      .single(),
    supabase
      .from('quotes')
      .select('*, quote_items(description)')
      .eq('organization_id', orgId || '')
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  const profile = profileResult.data

  if (!profile?.onboarded_at) {
    redirect('/onboarding')
  }

  const recentQuotes = quotesResult.data

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      <DashboardHeader
        title={profile.business_name || 'Seu Negócio'}
        profileImage={profile.logo_url}
        className="bg-background/50 backdrop-blur-sm p-4 rounded-2xl border border-border shadow-sm"
      />

      {/* Main Action - Elegant Gradient */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-teal-500 shadow-xl shadow-primary/20 transition-all hover:shadow-primary/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-foreground/5 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-10 gap-6">
          <div className="text-white space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Criar Novo Orçamento</h2>
            <p className="text-teal-100 font-medium">Gere propostas profissionais em segundos.</p>
          </div>
          <Link href="/new">
            <Button size="lg" className="h-14 px-8 text-lg rounded-xl bg-background text-primary hover:bg-muted shadow-lg border-2 border-transparent transition-all hover:scale-105 active:scale-95 font-semibold">
              <Plus className="mr-2 h-6 w-6" /> Começar Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Grid with Period Filter */}
      <DashboardStats />

      {/* Recent Activity List - Clean Table Style */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Últimos Orçamentos</h2>
          <Link href="/quotes">
            <Button variant="ghost" className="text-primary font-medium hover:text-primary/80 hover:bg-primary/10">
              Ver todos <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {recentQuotes?.length === 0 ? (
            <Card className="border-dashed border-2 border-border bg-muted/30 rounded-2xl shadow-none">
              <CardContent className="p-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Nada por aqui ainda.</p>
                <p className="text-sm">Seus orçamentos recentes aparecerão nesta lista.</p>
              </CardContent>
            </Card>
          ) : (
            recentQuotes?.map((quote) => (
              <Link key={quote.id} href={`/quotes/${quote.id}`} className="block group">
                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md hover:border-primary/50 hover:bg-primary/5">

                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold text-lg text-muted-foreground shadow-inner">
                      {quote.client_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{quote.client_name}</h4>
                      <p className="text-xs font-medium text-muted-foreground">
                        {format(new Date(quote.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto">
                    {quote.quote_items && quote.quote_items.length > 0 && (
                      <div className="hidden md:block text-right">
                        <p className="font-medium text-sm text-foreground">{quote.quote_items[0].description}</p>
                        {quote.quote_items.length > 1 && (
                          <p className="text-xs text-muted-foreground">+{quote.quote_items.length - 1} item(s)</p>
                        )}
                      </div>
                    )}

                    <div className="text-right min-w-[120px]">
                      <span className="block font-bold text-lg text-foreground">
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

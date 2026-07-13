import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { FirstRunGuide } from '@/components/dashboard/first-run-guide'
import { QuoteStatusBadge } from '@/components/quotes/quote-status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, FileText, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getActiveOrganizationId } from '@/lib/get-active-organization'
import { OpportunityPanel } from '@/components/dashboard/opportunity-panel'
import { CommercialScoreboard } from '@/components/dashboard/commercial-scoreboard'
import { ClientReturnQueue, type ClientReturnQueueItem } from '@/components/dashboard/client-return-queue'
import { getQuoteReminder } from '@/lib/quote-reminders'

export default async function Dashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const orgId = await getActiveOrganizationId(supabase)

  const emptyCountResult = { count: 0, data: null, error: null }

  // Parallel fetch: profile, recent quotes and guided first-run progress
  const today = new Date().toISOString().slice(0, 10)
  const [profileResult, quotesResult, quotesCountResult, sentCountResult, openedCountResult, opportunitiesResult, commercialQuotesResult, dueReturnsResult] = await Promise.all([
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
      .limit(5),
    orgId
      ? supabase
        .from('quotes')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
      : Promise.resolve(emptyCountResult),
    orgId
      ? supabase
        .from('quotes')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .in('status', ['sent', 'approved', 'changes_requested', 'in_progress', 'completed'])
      : Promise.resolve(emptyCountResult),
    orgId
      ? supabase
        .from('quotes')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .not('first_public_opened_at', 'is', null)
      : Promise.resolve(emptyCountResult),
    orgId
      ? supabase
        .from('quotes')
        .select('id, client_name, total, status, created_at, updated_at, expiration_date, payment_status, amount_paid, sent_confirmed_at, first_public_opened_at, client_responded_at, follow_up_sent_at, follow_up_count')
        .eq('organization_id', orgId)
        .in('status', ['pending', 'sent'])
        .order('total', { ascending: false })
        .limit(40)
      : Promise.resolve({ data: [] }),
    orgId
      ? supabase
        .from('quotes')
        .select('status, total, amount_paid, payment_status, first_public_opened_at, sent_confirmed_at')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(1000)
      : Promise.resolve({ data: [] }),
    orgId
      // The relation is introduced by the commercial loop migration.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (supabase.from('client_return_reminders') as any)
        .select('id, quote_id, due_date, note, quotes!inner(client_name)')
        .eq('organization_id', orgId)
        .eq('status', 'scheduled')
        .lte('due_date', today)
        .order('due_date', { ascending: true })
        .limit(12)
      : Promise.resolve({ data: [] }),
  ])

  const profile = profileResult.data

  if (!profile?.onboarded_at) {
    redirect('/onboarding')
  }

  const recentQuotes = quotesResult.data
  const reminderPriority: Record<string, number> = {
    expired: 0,
    expires_today: 1,
    opened_no_response: 2,
    follow_up: 3,
  }
  const opportunities = (opportunitiesResult.data || [])
    .map((quote) => ({ quote, reminder: getQuoteReminder(quote) }))
    .filter((entry): entry is { quote: typeof entry.quote; reminder: NonNullable<typeof entry.reminder> } => Boolean(entry.reminder && ['expired', 'expires_today', 'opened_no_response', 'follow_up'].includes(entry.reminder.kind)))
    .sort((left, right) => {
      const priorityDiff = (reminderPriority[left.reminder.kind] ?? 9) - (reminderPriority[right.reminder.kind] ?? 9)
      if (priorityDiff !== 0) return priorityDiff
      return Number(right.quote.total || 0) - Number(left.quote.total || 0)
    })
    .map(({ quote, reminder }) => ({
      id: quote.id,
      clientName: quote.client_name,
      total: Number(quote.total || 0),
      reminder,
      wasOpened: Boolean(quote.first_public_opened_at),
    }))

  const commercialQuotes = commercialQuotesResult.data || []
  const valueForStatuses = (statuses: string[]) => commercialQuotes
    .filter((quote) => statuses.includes(quote.status || ''))
    .reduce((sum, quote) => sum + Number(quote.total || 0), 0)
  const sentValue = valueForStatuses(['sent', 'changes_requested'])
  const openedValue = commercialQuotes
    .filter((quote) => Boolean(quote.first_public_opened_at) && ['sent', 'changes_requested'].includes(quote.status || ''))
    .reduce((sum, quote) => sum + Number(quote.total || 0), 0)
  const approvedValue = valueForStatuses(['approved', 'in_progress', 'completed'])
  const receivedValue = commercialQuotes.reduce((sum, quote) => sum + Number(quote.amount_paid || 0), 0)
  const outstandingValue = commercialQuotes
    .filter((quote) => ['approved', 'in_progress', 'completed'].includes(quote.status || ''))
    .reduce((sum, quote) => sum + Math.max(0, Number(quote.total || 0) - Number(quote.amount_paid || 0)), 0)
  const lostValue = valueForStatuses(['rejected'])
  const dueReturns: ClientReturnQueueItem[] = ((dueReturnsResult.data || []) as Array<{
    id: string
    quote_id: string
    due_date: string
    note?: string | null
    quotes?: { client_name?: string | null } | Array<{ client_name?: string | null }> | null
  }>).map((reminder) => {
    const quote = Array.isArray(reminder.quotes) ? reminder.quotes[0] : reminder.quotes
    return {
      id: reminder.id,
      quoteId: reminder.quote_id,
      clientName: quote?.client_name || 'Cliente',
      dueDate: reminder.due_date,
      note: reminder.note || null,
    }
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
      <DashboardHeader
        title={profile.business_name || 'Seu Negócio'}
        profileImage={profile.logo_url}
        className="bg-background/50 backdrop-blur-sm p-4 rounded-2xl border border-border shadow-sm"
      />

      <FirstRunGuide
        quoteCount={quotesCountResult.count || 0}
        sentCount={sentCountResult.count || 0}
        openedCount={openedCountResult.count || 0}
        latestQuoteId={recentQuotes?.[0]?.id}
        hasLogo={Boolean(profile.logo_url)}
      />

      {/* Main activation action */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-teal-500 shadow-xl shadow-primary/20 transition-all hover:shadow-primary/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-foreground/5 blur-3xl"></div>
        <div className="relative z-10 flex flex-col items-center justify-between gap-6 p-8 md:flex-row md:p-10">
          <div className="space-y-2 text-center text-white md:text-left">
            <h2 className="text-3xl font-bold tracking-tight">
              {(quotesCountResult.count || 0) === 0 ? 'Crie sua proposta teste' : 'Criar nova proposta'}
            </h2>
            <p className="font-medium text-teal-100">
              {(quotesCountResult.count || 0) === 0
                ? 'Itens sugeridos para seu oficio. Ajuste e envie pelo WhatsApp.'
                : 'Transforme preço solto no WhatsApp em uma aprovação clara e registrada.'}
            </p>
          </div>
          <Link href="/new?quick=1&starter=1&source=dashboard_hero" prefetch={true}>
            <Button size="lg" className="h-14 rounded-xl border-2 border-transparent bg-background px-8 text-lg font-semibold text-primary shadow-lg transition-all hover:scale-105 hover:bg-muted active:scale-95">
              <Plus className="mr-2 h-6 w-6" /> {(quotesCountResult.count || 0) === 0 ? 'Criar proposta teste' : 'Nova proposta'}
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Grid with Period Filter */}
      <DashboardStats />

      <CommercialScoreboard
        sentValue={sentValue}
        openedValue={openedValue}
        approvedValue={approvedValue}
        receivedValue={receivedValue}
        outstandingValue={outstandingValue}
        lostValue={lostValue}
        quoteCount={quotesCountResult.count || 0}
      />

      <OpportunityPanel opportunities={opportunities} />

      <ClientReturnQueue returns={dueReturns} />

      {/* Recent Activity List - Clean Table Style */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Últimos Orçamentos</h2>
          <Link href="/quotes" prefetch={true}>
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

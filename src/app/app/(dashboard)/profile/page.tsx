import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CreditCard, Palette, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProfileForm } from '@/components/profile/profile-form'
import { LogoutButton } from '@/components/auth/logout-button'
import { ThemeToggle } from '@/components/theme-toggle'
import { TeamManager } from '@/components/profile/team-manager'
import { getActiveOrganizationId } from '@/lib/get-active-organization'
import { CancelSubscriptionButton } from '@/components/profile/cancel-subscription-button'
import { ProfileSettingsTabs } from '@/components/profile/profile-settings-tabs'
import { CheckoutReturnTracker } from '@/components/profile/checkout-return-tracker'
import { getEntitledPlan, isFreePlan } from '@/lib/proposal-style'

interface TeamMember {
    user_id: string
    role: string
    profiles: {
        email: string
        business_name: string | null
        logo_url: string | null
    }
}

function formatBillingDate(value?: string | null) {
    if (!value) return null

    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(value))
}

function getPlanLabel(plan?: string | null) {
    if (plan === 'pro_trial') return 'Teste Pro'
    if (plan === 'pro_yearly') return 'Pro anual'
    if (plan === 'pro_monthly') return 'Pro mensal'
    if (plan && plan !== 'free') return 'Pro'
    return 'Gratuito'
}

function getStatusLabel(status?: string | null, cancelAtPeriodEnd?: boolean | null) {
    if (cancelAtPeriodEnd) return 'Renovacao cancelada'

    switch (status) {
        case 'active':
        case 'trialing':
            return 'Ativo'
        case 'past_due':
            return 'Pagamento pendente'
        case 'canceled':
            return 'Cancelado'
        default:
            return 'Inativo'
    }
}

export default async function ProfilePage() {
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

    const orgId = await getActiveOrganizationId()

    const { data: members } = await supabase
        .from('organization_members')
        .select(`
            user_id,
            role,
            profiles (
                email,
                business_name,
                logo_url
            )
        `)
        .eq('organization_id', orgId || '')

    const accessPlan = getEntitledPlan(profile?.plan, profile?.subscription_status, profile?.pro_trial_ends_at)
    const isPaidPlan = !isFreePlan(accessPlan)
    const isLocalTrial = accessPlan === 'pro_trial'
    const hasStripeSubscription = ['active', 'trialing'].includes(profile?.subscription_status || '')
        && ['pro_monthly', 'pro_yearly'].includes(profile?.plan || '')
    const planLabel = getPlanLabel(accessPlan)
    const billingDate = formatBillingDate(profile?.current_period_end)
    const trialEndDate = formatBillingDate(profile?.pro_trial_ends_at)
    const cancelAtPeriodEnd = Boolean(profile?.cancel_at_period_end)
    const statusLabel = isLocalTrial ? 'Teste ativo' : getStatusLabel(profile?.subscription_status, cancelAtPeriodEnd)
    // A free account that never had a Stripe subscription has no meaningful
    // status to show; "Inativo" next to "Gratuito" reads like the account
    // itself is disabled instead of just being on the free tier.
    const showStatusBadge = isPaidPlan
        || isLocalTrial
        || cancelAtPeriodEnd
        || ['past_due', 'canceled'].includes(profile?.subscription_status || '')

    const teamContent = orgId ? (
        <TeamManager initialMembers={(members || []) as unknown as TeamMember[]} />
    ) : (
        <Card className="border-0 shadow-sm ring-1 ring-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-primary" />
                    Equipe
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Conclua o cadastro da empresa para convidar pessoas da sua equipe.
                </p>
            </CardContent>
        </Card>
    )

    const accountContent = (
        <div className="space-y-6">
            <Card className="border-primary/10">
                <CardHeader className="border-b border-primary/10 bg-primary/5">
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <Palette className="h-5 w-5" />
                        Aparencia do Sistema
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Defina como voce prefere visualizar o painel administrativo.
                    </p>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-foreground">Modo do Sistema</h3>
                            <p className="text-sm text-muted-foreground">Escolha entre modo claro, escuro ou automatico.</p>
                        </div>
                        <ThemeToggle />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm ring-1 ring-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Conta e Plano
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Gerencie acesso, sessao e assinatura da Zacly.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Plano atual</p>
                                <p className="mt-1 text-base font-semibold text-foreground">{planLabel}</p>
                                {isLocalTrial && trialEndDate ? (
                                    <p className="mt-1 text-sm text-muted-foreground">Teste Pro ate {trialEndDate}. Assine para manter o acesso depois.</p>
                                ) : isPaidPlan && billingDate ? (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {cancelAtPeriodEnd ? 'Acesso Pro ate' : 'Proxima renovacao em'} {billingDate}
                                    </p>
                                ) : null}
                            </div>
                            {showStatusBadge && (
                                <Badge
                                    variant={cancelAtPeriodEnd ? 'secondary' : isPaidPlan ? 'default' : 'outline'}
                                    className={isPaidPlan && !cancelAtPeriodEnd ? 'bg-emerald-500 text-white' : ''}
                                >
                                    {statusLabel}
                                </Badge>
                            )}
                        </div>
                        {cancelAtPeriodEnd ? (
                            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-foreground">
                                A renovacao foi cancelada. O acesso Pro continua ate {billingDate ?? 'o fim do periodo pago'} e depois volta para o plano gratuito.
                            </div>
                        ) : null}
                    </div>
                    <LogoutButton />
                    <CancelSubscriptionButton isFree={!hasStripeSubscription || cancelAtPeriodEnd} />
                </CardContent>
            </Card>
        </div>
    )

    return (
        <div className="space-y-6 pb-20">
            <CheckoutReturnTracker
                plan={profile?.plan}
                subscriptionStatus={profile?.subscription_status}
            />
            <div className="flex items-center gap-2">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-foreground">Configuracoes</h1>
                    <p className="text-sm text-muted-foreground">
                        Ajuste empresa, proposta, equipe e plano em areas separadas.
                    </p>
                </div>
            </div>

            <ProfileSettingsTabs
                company={<ProfileForm initialProfile={profile} userId={user.id} section="company" />}
                proposal={<ProfileForm initialProfile={profile} userId={user.id} section="proposal" />}
                team={teamContent}
                account={accountContent}
            />
        </div>
    )
}

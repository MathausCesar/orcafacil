import { redirect } from 'next/navigation'
import { checkOnboardingStatus } from '@/app/actions/profile'
import { BottomNav } from '@/components/layout/bottom-nav'
import { DesktopSidebar } from '@/components/layout/desktop-sidebar'
import { SupportWidget } from '@/components/support/support-widget'
import { createClient } from '@/lib/supabase/server'
import { UpgradeBanner } from '@/components/upgrade-banner'
import { PwaInstallPrompt } from '@/components/pwa-install-prompt'
import { getActiveOrganizationId } from '@/lib/get-active-organization'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const isOnboarded = await checkOnboardingStatus()

    if (!isOnboarded) {
        redirect('/onboarding')
    }

    // Buscando perfil para checar o plano
    const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()

    const isFree = !profile?.plan || profile.plan === 'free'

    const orgId = await getActiveOrganizationId()

    // Contagem de orçamentos para o gatilho de escassez no Banner
    let quotesUsed = 0
    if (isFree && orgId) {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const { count } = await supabase
            .from('quotes')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .gte('created_at', firstDayOfMonth.toISOString())
        quotesUsed = count || 0
    }



    return (
        <div className="flex min-h-screen bg-background">
            {/* Desktop Sidebar - Hidden on Mobile */}
            <div className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50">
                <div className="flex-1 flex flex-col min-h-0 bg-sidebar border-r border-sidebar-border">
                    <DesktopSidebar />
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 transition-all duration-300 lg:pl-64">
                <div className="container mx-auto p-4 md:p-8 max-w-2xl lg:max-w-7xl pb-24 lg:pb-8">
                    {isFree && <UpgradeBanner quotesUsed={quotesUsed} quotesLimit={5} />}
                    {children}
                </div>
            </main>

            {/* Mobile Navigation - Hidden on Desktop */}
            <div className="lg:hidden">
                <BottomNav />
            </div>

            {/* Floating Support Widget */}
            <SupportWidget />

            {/* PWA Install Prompt — aparece no celular, fora do app instalado */}
            <PwaInstallPrompt />
        </div>
    )
}

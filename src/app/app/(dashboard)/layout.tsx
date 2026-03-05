import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/layout/bottom-nav'
import { DesktopSidebar } from '@/components/layout/desktop-sidebar'
import { SupportWidget } from '@/components/support/support-widget'
import { createClient } from '@/lib/supabase/server'
import { UpgradeBanner } from '@/components/upgrade-banner'
import { PwaInstallPrompt } from '@/components/pwa-install-prompt'
import { cookies } from 'next/headers'

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

    // Read orgId from cookie (zero latency) instead of calling getActiveOrganizationId()
    const cookieStore = await cookies()
    const orgId = cookieStore.get("active_organization_id")?.value || null

    // Single parallel fetch: profile + quotes count (instead of 3 sequential calls)
    const [profileResult, quotesCountResult] = await Promise.all([
        supabase
            .from('profiles')
            .select('plan, onboarded_at')
            .eq('id', user.id)
            .single(),
        orgId
            ? supabase
                .from('quotes')
                .select('id', { count: 'exact', head: true })
                .eq('organization_id', orgId)
                .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
            : Promise.resolve({ count: 0 })
    ])

    const profile = profileResult.data

    // Onboarding check (no separate function call needed)
    if (!profile?.onboarded_at) {
        redirect('/onboarding')
    }

    const isFree = !profile?.plan || profile.plan === 'free'
    const quotesUsed = (isFree && orgId) ? (quotesCountResult.count || 0) : 0

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

import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { BottomNav } from '@/components/layout/bottom-nav'
import { DesktopSidebar } from '@/components/layout/desktop-sidebar'
import { MobileWorkspaceHeader } from '@/components/layout/mobile-workspace-header'
import { SupportWidget } from '@/components/support/support-widget'
import { createClient } from '@/lib/supabase/server'
import { UpgradeBanner } from '@/components/upgrade-banner'
import { PwaInstallPrompt } from '@/components/pwa-install-prompt'
import { getActiveOrganizationId } from '@/lib/get-active-organization'
import { OrganizationProvider } from '@/contexts/organization-context'
import { getEntitledPlan, isFreePlan } from '@/lib/proposal-style'
import { getFreeQuoteAllowance } from '@/lib/pricing-copy'
import { resolveWorkspaceBranding } from '@/lib/workspace-branding'
import type { CSSProperties } from 'react'

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
}

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

    const orgId = await getActiveOrganizationId(supabase)

    const { data: profile } = await supabase
        .from('profiles')
        .select('business_name, logo_url, primary_color, theme_color, quote_settings, plan, subscription_status, pro_trial_ends_at, onboarded_at')
        .eq('id', user.id)
        .single()

    // Onboarding check (no separate function call needed)
    if (!profile?.onboarded_at) {
        redirect('/onboarding')
    }

    const isFree = isFreePlan(getEntitledPlan(profile?.plan, profile?.subscription_status, profile?.pro_trial_ends_at))
    const workspaceBranding = resolveWorkspaceBranding({
        businessName: profile?.business_name,
        logoUrl: profile?.logo_url,
        primaryColor: profile?.primary_color,
        quoteSettings: profile?.quote_settings,
        themeColor: profile?.theme_color,
    }, isFree)
    const workspaceBrandingStyle = workspaceBranding.enabled
        ? {
            '--workspace-brand-light': workspaceBranding.accentColor,
            '--workspace-brand-light-foreground': workspaceBranding.foregroundColor,
            '--workspace-brand-dark': workspaceBranding.accentColorDark,
            '--workspace-brand-dark-foreground': workspaceBranding.foregroundColorDark,
        } as CSSProperties
        : undefined
    const freeAllowance = getFreeQuoteAllowance(profile?.onboarded_at)
    const quotesCountResult = isFree && orgId
        ? await supabase
            .from('quotes')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .eq('experience_mode', 'free_simple')
            .gte('created_at', freeAllowance.periodStart.toISOString())
        : { count: 0 }
    const quotesUsed = (isFree && orgId) ? (quotesCountResult.count || 0) : 0

    return (
        <OrganizationProvider>
            <div
                className={`flex min-h-screen bg-background${workspaceBranding.enabled ? ' workspace-branding' : ''}`}
                style={workspaceBrandingStyle}
            >
                {/* Desktop Sidebar - Hidden on Mobile */}
                <div className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50">
                    <div className="flex-1 flex flex-col min-h-0 bg-sidebar border-r border-sidebar-border">
                        <DesktopSidebar workspaceBranding={workspaceBranding} />
                    </div>
                </div>

                {/* Main Content Area */}
                <main className="min-w-0 flex-1 transition-all duration-300 lg:pl-64">
                    <MobileWorkspaceHeader workspaceBranding={workspaceBranding} />
                    <div className="container mx-auto w-full min-w-0 max-w-2xl p-3 pb-24 sm:p-4 md:p-8 lg:max-w-7xl lg:pb-8">
                        {isFree && (
                            <UpgradeBanner
                                quotesUsed={quotesUsed}
                                quotesLimit={freeAllowance.limit}
                                period={freeAllowance.period}
                                remainingDays={freeAllowance.remainingDays}
                            />
                        )}
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
        </OrganizationProvider>
    )
}

import { redirect } from 'next/navigation'
import { checkOnboardingStatus } from '@/app/actions/profile'
import { BottomNav } from '@/components/layout/bottom-nav'
import { DesktopSidebar } from '@/components/layout/desktop-sidebar'
import { SupportWidget } from '@/components/support/support-widget'
import { createClient } from '@/lib/supabase/server'

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

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            {/* Desktop Sidebar - Hidden on Mobile */}
            <div className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50">
                <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-slate-200">
                    <DesktopSidebar />
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 transition-all duration-300 lg:pl-64">
                <div className="container mx-auto p-4 md:p-8 max-w-2xl lg:max-w-7xl pb-24 lg:pb-8">
                    {children}
                </div>
            </main>

            {/* Mobile Navigation - Hidden on Desktop */}
            <div className="lg:hidden">
                <BottomNav />
            </div>

            {/* Floating Support Widget - Rendered globally for logged in providers */}
            <SupportWidget />
        </div>
    )
}

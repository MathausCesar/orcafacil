import { redirect } from 'next/navigation'
import { checkOnboardingStatus } from '@/app/actions/profile'
import { BottomNav } from '@/components/layout/bottom-nav'
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
        <div className="flex min-h-screen flex-col bg-background">
            <main className="flex-1 pb-20 pt-4 px-4 container mx-auto max-w-2xl">
                {children}
            </main>
            <BottomNav />
        </div>
    )
}

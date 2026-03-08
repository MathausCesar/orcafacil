import { redirect } from 'next/navigation'
import { AdminBottomNav } from '@/components/layout/admin-bottom-nav'
import { AdminDesktopSidebar } from '@/components/layout/admin-desktop-sidebar'
import { createClient } from '@/lib/supabase/server'
import { SupportWidget } from '@/components/support/support-widget'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Double check just in case middleware failed
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_superadmin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_superadmin) {
        redirect('/')
    }

    return (
        <div className="flex min-h-screen bg-background">
            {/* Desktop Sidebar - Hidden on Mobile */}
            <div className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50">
                <AdminDesktopSidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 transition-all duration-300 lg:pl-64">
                <div className="container mx-auto p-4 md:p-8 max-w-2xl lg:max-w-7xl pb-24 lg:pb-8">
                    {children}
                </div>
            </main>

            {/* Mobile Navigation - Hidden on Desktop */}
            <div className="lg:hidden">
                <AdminBottomNav />
            </div>

            {/* Floating Support Widget using the standard pattern */}
            <SupportWidget />
        </div>
    )
}

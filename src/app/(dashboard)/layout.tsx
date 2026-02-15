import { BottomNav } from '@/components/layout/bottom-nav'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <main className="flex-1 pb-20 pt-4 px-4 container mx-auto max-w-2xl">
                {children}
            </main>
            <BottomNav />
        </div>
    )
}

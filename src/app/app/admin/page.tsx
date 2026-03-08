import { getAdminDashboardStats } from "@/app/actions/admin"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, CreditCard, FileText, MessageSquare } from "lucide-react"

export default async function AdminDashboardPage() {
    const stats = await getAdminDashboardStats()

    const cards = [
        {
            title: "Total de Usuários",
            value: stats.totalUsers,
            description: "Cadastrados na plataforma",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-600/10"
        },
        {
            title: "Assinantes Ativos",
            value: stats.activeSubscribers,
            description: "Planos PRO ativos ou trial",
            icon: CreditCard,
            color: "text-emerald-600",
            bg: "bg-emerald-600/10"
        },
        {
            title: "Orçamentos Gerados",
            value: stats.totalQuotes,
            description: "No total histórico",
            icon: FileText,
            color: "text-amber-600",
            bg: "bg-amber-600/10"
        },
        {
            title: "Tickets Abertos",
            value: stats.openTickets,
            description: "Aguardando resposta",
            icon: MessageSquare,
            color: "text-rose-600",
            bg: "bg-rose-600/10"
        }
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Visão Geral - SaaS</h1>
                <p className="text-muted-foreground mt-2">
                    Acompanhe as métricas principais e o desempenho da plataforma.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((card, idx) => {
                    const Icon = card.icon
                    return (
                        <Card key={idx}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {card.title}
                                </CardTitle>
                                <div className={`p-2 rounded-full ${card.bg}`}>
                                    <Icon className={`h-4 w-4 ${card.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {card.description}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Engajamento e Eventos</CardTitle>
                        <CardDescription>
                            Para visualizar métricas profundas de uso (tempo gasto, telas mais acessadas, gravação de sessões), acesse o painel do PostHog.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <a
                            href="https://app.posthog.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            Abrir Painel do PostHog
                        </a>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

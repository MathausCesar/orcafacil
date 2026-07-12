import Link from 'next/link'
import { ArrowRight, CheckCircle2, Circle, Eye, FileText, Palette, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FirstRunGuideProps {
    quoteCount: number
    sentCount: number
    openedCount: number
    latestQuoteId?: string
    hasLogo: boolean
}

export function FirstRunGuide({ quoteCount, sentCount, openedCount, latestQuoteId, hasLogo }: FirstRunGuideProps) {
    const hasQuote = quoteCount > 0
    const hasSentQuote = sentCount > 0
    const hasOpenedQuote = openedCount > 0
    const quoteHref = latestQuoteId ? `/quotes/${latestQuoteId}` : '/quotes'

    const steps = [
        {
            title: 'Crie uma proposta teste',
            description: 'Abra uma proposta quase pronta, com itens sugeridos para seu oficio, e ajuste em poucos minutos.',
            href: '/new?quick=1&starter=1&source=first_run',
            icon: FileText,
            done: hasQuote,
            active: !hasQuote,
            action: hasQuote ? 'Proposta criada' : 'Criar proposta teste',
            disabled: false,
        },
        {
            title: 'Envie pelo WhatsApp',
            description: 'Abra a mensagem pronta, envie o link e confirme somente depois que ela saiu para o cliente.',
            href: quoteHref,
            icon: Send,
            done: hasSentQuote,
            active: hasQuote && !hasSentQuote,
            action: hasSentQuote ? 'Proposta enviada' : 'Enviar proposta',
            disabled: !hasQuote,
        },
        {
            title: 'Acompanhe a abertura',
            description: 'Veja quando o cliente abre a proposta e acompanhe a aprovacao sem cobrar no escuro.',
            href: '/quotes?view=pipeline',
            icon: Eye,
            done: hasOpenedQuote,
            active: hasSentQuote && !hasOpenedQuote,
            action: hasOpenedQuote ? 'Proposta aberta' : 'Acompanhar proposta',
            disabled: !hasSentQuote,
        },
    ]

    if (hasQuote && hasSentQuote && hasOpenedQuote) {
        return null
    }

    const progress = steps.filter((step) => step.done).length

    return (
        <section className="rounded-2xl border border-primary/15 bg-card p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">Primeiros passos</p>
                    <h2 className="text-xl font-bold text-foreground">Trilha curta para enviar sua primeira proposta</h2>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        Proposta teste, envio confirmado e abertura do cliente. O primeiro valor aparece antes da configuracao completa.
                    </p>
                </div>
                <div className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-bold text-muted-foreground">
                    {progress}/3 concluido
                </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-3">
                {steps.map((step) => {
                    const Icon = step.icon
                    const StatusIcon = step.done ? CheckCircle2 : Circle

                    return (
                        <div
                            key={step.title}
                            className={`rounded-xl border p-4 transition-colors ${step.active
                                ? 'border-primary/35 bg-primary/5'
                                : step.done
                                    ? 'border-emerald-200 bg-emerald-50/60'
                                    : 'border-border bg-background/60'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`rounded-lg p-2 ${step.done ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary'}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <StatusIcon className={`h-4 w-4 shrink-0 ${step.done ? 'text-emerald-600' : 'text-muted-foreground/50'}`} />
                                        <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                                    </div>
                                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{step.description}</p>
                                </div>
                            </div>

                            {step.disabled ? (
                                <Button type="button" variant="outline" size="sm" className="mt-4 w-full" disabled>
                                    {step.action}
                                </Button>
                            ) : (
                                <Button asChild variant={step.active ? 'default' : 'outline'} size="sm" className="mt-4 w-full">
                                    <Link href={step.href}>
                                        {step.action}
                                        {!step.done && <ArrowRight className="h-3.5 w-3.5" />}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="mt-4 rounded-xl bg-muted/40 px-4 py-3 text-xs leading-5 text-muted-foreground">
                Dica: a primeira proposta pode ser um teste. Troque cliente, quantidades e valores antes de enviar para alguem real.
            </div>

            {hasQuote && !hasLogo && (
                <div className="mt-3 flex flex-col gap-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-2">
                        <Palette className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>
                            Agora veja sua proxima proposta com a identidade da oficina. Envie sua logo e o Zacly sugere cor e visual para ela.
                        </span>
                    </div>
                    <Button asChild variant="outline" size="sm" className="shrink-0">
                        <Link href="/profile?source=first_quote_logo">Enviar minha logo</Link>
                    </Button>
                </div>
            )}
        </section>
    )
}

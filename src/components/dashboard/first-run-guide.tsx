import Link from 'next/link'
import { ArrowRight, CheckCircle2, Circle, FileText, KanbanSquare, Palette, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FirstRunGuideProps {
    clientCount: number
    quoteCount: number
    activePipelineCount: number
}

export function FirstRunGuide({ clientCount, quoteCount, activePipelineCount }: FirstRunGuideProps) {
    const hasClient = clientCount > 0
    const hasQuote = quoteCount > 0
    const hasActivePipeline = activePipelineCount > 0

    const steps = [
        {
            title: 'Cadastre seu primeiro cliente',
            description: 'Salve nome, telefone e dados basicos para nao refazer tudo a cada proposta.',
            href: '/clients?first=1',
            icon: UserPlus,
            done: hasClient,
            active: !hasClient,
            action: hasClient ? 'Cliente cadastrado' : 'Cadastrar cliente',
        },
        {
            title: 'Crie uma proposta para esse cliente',
            description: 'Use seu catalogo inicial para montar uma proposta simples e profissional.',
            href: '/new?quick=1',
            icon: FileText,
            done: hasQuote,
            active: hasClient && !hasQuote,
            action: hasQuote ? 'Proposta criada' : 'Criar proposta',
        },
        {
            title: 'Acompanhe no pipeline',
            description: 'Veja propostas criadas, enviadas, aprovadas e em execucao sem perder o controle.',
            href: '/quotes?view=pipeline',
            icon: KanbanSquare,
            done: hasActivePipeline,
            active: hasQuote,
            action: hasActivePipeline ? 'Pipeline ativo' : 'Abrir pipeline',
        },
    ]

    if (hasClient && hasQuote && hasActivePipeline) {
        return null
    }

    const progress = steps.filter((step) => step.done).length

    return (
        <section className="rounded-2xl border border-primary/15 bg-card p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">Primeiros passos</p>
                    <h2 className="text-xl font-bold text-foreground">Trilha guiada para comecar vendendo</h2>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        Siga um caminho curto: cliente, proposta e acompanhamento. Isso evita que o primeiro acesso vire tentativa e erro.
                    </p>
                </div>
                <div className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-bold text-muted-foreground">
                    {progress}/3 concluido
                </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-3">
                {steps.map((step, index) => {
                    const Icon = step.icon
                    const StatusIcon = step.done ? CheckCircle2 : Circle
                    const disabled = index > 0 && !steps[index - 1].done

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

                            {disabled ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-4 w-full"
                                    disabled
                                >
                                    {step.action}
                                </Button>
                            ) : (
                                <Button
                                    asChild
                                    variant={step.active ? 'default' : 'outline'}
                                    size="sm"
                                    className="mt-4 w-full"
                                >
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
                Dica: depois de aprovada pelo cliente, a proposta pode seguir para execucao e concluido pelo pipeline.
            </div>

            <div className="mt-3 flex flex-col gap-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2">
                    <Palette className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                        Envie sua logo em Configuracoes: o Zacly detecta a cor da marca e deixa suas propostas mais personalizadas.
                    </span>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0">
                    <Link href="/profile">
                        Ajustar logo
                    </Link>
                </Button>
            </div>
        </section>
    )
}

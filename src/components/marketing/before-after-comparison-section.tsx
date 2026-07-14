import { ArrowRight, CheckCircle2, FileText, MessageCircle, ShieldCheck, XCircle } from "lucide-react"

import { CampaignRegisterLink } from "@/components/marketing/campaign-register-link"

type BeforeAfterComparisonSectionProps = {
    campaign?: string
    content?: string
    industryLabel?: string
}

export function BeforeAfterComparisonSection({
    campaign = "organic_home",
    content = "before_after_comparison",
    industryLabel = "seu servico",
}: BeforeAfterComparisonSectionProps) {
    return (
        <section className="border-t border-white/5 bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-7xl">
                <div className="max-w-3xl">
                    <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-300">
                        Antes e depois
                    </p>
                    <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
                        Troque o preço solto no WhatsApp por um orçamento que ajuda o cliente a dizer sim.
                    </h2>
                    <p className="mt-5 text-base leading-7 text-zinc-400 sm:text-lg">
                        Cliente não escolhe só pelo preço. Ele escolhe quem passa mais confiança.
                    </p>
                </div>

                <div className="mt-10 grid gap-5 lg:grid-cols-2">
                    <article className="rounded-lg border border-red-400/15 bg-red-950/15 p-5 sm:p-6">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-400/10 text-red-200">
                                    <MessageCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-red-200">Antes</p>
                                    <h3 className="text-xl font-black text-white">Preco solto no WhatsApp</h3>
                                </div>
                            </div>
                            <XCircle className="h-6 w-6 text-red-300" />
                        </div>

                        <div className="space-y-3 rounded-lg border border-white/10 bg-zinc-950 p-4">
                            <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-white/10 px-4 py-3 text-sm text-zinc-200">
                                Quanto fica para fazer esse servico?
                            </div>
                            <div className="ml-auto max-w-[78%] rounded-2xl rounded-br-sm bg-emerald-500/20 px-4 py-3 text-sm font-semibold text-emerald-50">
                                Fica R$ 850,00.
                            </div>
                            <div className="max-w-[86%] rounded-2xl rounded-bl-sm bg-white/10 px-4 py-3 text-sm text-zinc-200">
                                Mas isso inclui material? Tem garantia? Da para fazer menos?
                            </div>
                        </div>

                        <ul className="mt-5 space-y-3 text-sm leading-6 text-zinc-400">
                            <li className="flex gap-3">
                                <XCircle className="mt-1 h-4 w-4 shrink-0 text-red-300" />
                                Cliente ve apenas preco, nao escopo.
                            </li>
                            <li className="flex gap-3">
                                <XCircle className="mt-1 h-4 w-4 shrink-0 text-red-300" />
                                Aprovacao fica perdida na conversa.
                            </li>
                            <li className="flex gap-3">
                                <XCircle className="mt-1 h-4 w-4 shrink-0 text-red-300" />
                                Fica dificil provar o que foi combinado.
                            </li>
                        </ul>
                    </article>

                    <article className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.07] p-5 sm:p-6">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-200">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">Depois</p>
                                    <h3 className="text-xl font-black text-white">Proposta com sua logo</h3>
                                </div>
                            </div>
                            <CheckCircle2 className="h-6 w-6 text-emerald-300" />
                        </div>

                        <div className="rounded-lg border border-white/10 bg-white p-4 text-slate-950 shadow-2xl shadow-emerald-950/20">
                            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white">
                                        Z
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                                            {industryLabel}
                                        </p>
                                        <p className="text-sm font-black">Proposta profissional</p>
                                    </div>
                                </div>
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
                                    Link seguro
                                </span>
                            </div>

                            <div className="mt-4 space-y-3 text-sm">
                                {[
                                    ["Escopo", "Itens, materiais e servicos separados"],
                                    ["Prazo", "Validade e entrega visiveis"],
                                    ["Total", "R$ 850,00"],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-3 py-3">
                                        <span className="font-bold text-slate-500">{label}</span>
                                        <span className="text-right font-black text-slate-950">{value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-black text-white">
                                <ShieldCheck className="h-4 w-4" />
                                Cliente aprova pelo link
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <CampaignRegisterLink
                                campaign={campaign}
                                content={content}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 text-sm font-black text-zinc-950 transition hover:bg-emerald-300"
                            >
                                Criar proposta gratis
                                <ArrowRight className="h-4 w-4" />
                            </CampaignRegisterLink>
                            <p className="text-xs leading-5 text-zinc-500">
                                Sem cartao no cadastro. O plano Pro entra quando a personalizacao fizer sentido.
                            </p>
                        </div>
                    </article>
                </div>

                <div className="mt-14 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
                        <p className="text-4xl font-black text-emerald-300">+23%</p>
                        <p className="mt-2 text-sm leading-6 text-zinc-300">
                            de chance de fechar quando a proposta tem visual profissional, e não só texto solto.
                        </p>
                        <a
                            href="https://www.proposify.com/blog/why-proposal-design-images-matter"
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-block text-xs text-zinc-500 underline hover:text-zinc-300"
                        >
                            Fonte: Proposify, análise de 2,6 milhões de propostas
                        </a>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
                        <p className="text-4xl font-black text-emerald-300">até 25%</p>
                        <p className="mt-2 text-sm leading-6 text-zinc-300">
                            mais chance de aprovação quando o orçamento é enviado no mesmo dia, sem enrolar.
                        </p>
                        <a
                            href="https://betterproposals.io/blog/how-to-increase-your-proposal-conversion-rate-by-25/"
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-block text-xs text-zinc-500 underline hover:text-zinc-300"
                        >
                            Fonte: Better Proposals
                        </a>
                    </div>
                </div>
                <p className="mt-4 text-xs leading-5 text-zinc-600">
                    Dados de pesquisas do setor sobre propostas comerciais em geral — ainda não são números do Zacly, que é uma plataforma nova.
                </p>
            </div>
        </section>
    )
}

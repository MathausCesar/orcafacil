import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, MessageCircle, ShieldCheck } from 'lucide-react'
import { SeoPageLayout, SectionBlock } from '@/components/marketing/seo-page-layout'
import { SEO_BASE_URL } from '@/lib/seo-site-content'

export const metadata: Metadata = {
    title: 'Contato Zacly | Suporte e atendimento',
    description: 'Fale com a Zacly para tirar duvidas sobre orcamentos profissionais, planos, assinatura e suporte da plataforma.',
    alternates: { canonical: `${SEO_BASE_URL}/contato` },
}

const channels = [
    {
        icon: Mail,
        title: 'Suporte por email',
        body: 'Para duvidas de conta, assinatura, acesso e uso da plataforma.',
        href: 'mailto:suporte@zacly.com.br',
        label: 'suporte@zacly.com.br',
    },
    {
        icon: MessageCircle,
        title: 'Duvidas antes de testar',
        body: 'A melhor forma de entender o Zacly e criar uma conta gratis e montar a primeira proposta.',
        href: 'https://app.zacly.com.br/register',
        label: 'Criar conta gratis',
    },
    {
        icon: ShieldCheck,
        title: 'Conta e seguranca',
        body: 'Use a recuperacao de senha no app se perdeu o acesso ou precisa redefinir a conta.',
        href: 'https://app.zacly.com.br/forgot-password',
        label: 'Recuperar acesso',
    },
]

export default function ContatoPage() {
    return (
        <SeoPageLayout
            eyebrow="Contato"
            title="Fale com a Zacly."
            description="Atendimento para autonomos e prestadores que precisam de ajuda com conta, planos, propostas e uso da plataforma."
        >
            <SectionBlock title="Canais de atendimento" eyebrow="Suporte">
                <div className="grid gap-4 md:grid-cols-3">
                    {channels.map((channel) => {
                        const Icon = channel.icon

                        return (
                            <div key={channel.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                                <Icon className="h-7 w-7 text-emerald-400" />
                                <h2 className="mt-5 text-xl font-black text-white">{channel.title}</h2>
                                <p className="mt-3 text-sm leading-6 text-zinc-400">{channel.body}</p>
                                <Link href={channel.href} className="mt-5 inline-flex text-sm font-black text-emerald-300 hover:text-emerald-200">
                                    {channel.label}
                                </Link>
                            </div>
                        )
                    })}
                </div>
            </SectionBlock>
        </SeoPageLayout>
    )
}

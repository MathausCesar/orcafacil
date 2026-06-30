'use client'

import Image from 'next/image'
import type { ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'

type AuthShellProps = {
    title: string
    description: string
    children: ReactNode
}

const FEATURES = [
    'Orçamentos profissionais',
    'Clientes organizados',
    'Aprovação segura',
    'Gestão simples',
]

export function AuthShell({ title, description, children }: AuthShellProps) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-zinc-950 lg:flex-row">
            <div className="relative hidden w-full overflow-hidden border-r border-white/5 bg-gradient-to-br from-teal-950 via-[#0a1614] to-black px-16 py-20 text-white lg:flex lg:w-[60%] lg:flex-col lg:justify-between">
                <div className="relative z-10 flex max-w-2xl flex-col space-y-12">
                    <div className="relative h-28 w-[320px]">
                        <Image
                            src="/logo/logo.png"
                            alt="Zacly Logo"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-5xl font-extrabold leading-[1.15] tracking-tight text-white/95">
                            A simplicidade que{' '}
                            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                                seu negócio merece.
                            </span>
                        </h1>
                        <p className="max-w-xl text-lg font-light leading-relaxed text-zinc-400">
                            Orçamentos, clientes e cobranças em um fluxo direto, criado para quem precisa trabalhar sem complicação.
                        </p>
                    </div>

                    <div className="h-1 w-16 rounded-full bg-gradient-to-r from-emerald-500/80 to-transparent" />

                    <div className="grid grid-cols-2 gap-x-12 gap-y-6 pt-4 text-sm text-zinc-300">
                        {FEATURES.map((feature) => (
                            <div key={feature} className="flex items-center gap-3">
                                <span className="rounded-full bg-emerald-500/10 p-1 text-emerald-400">
                                    <CheckCircle2 className="h-4 w-4" />
                                </span>
                                <span className="font-medium tracking-wide">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-xs font-medium uppercase tracking-widest text-zinc-600">
                    © {new Date().getFullYear()} Zacly Plataforma
                </div>
            </div>

            <div className="flex w-full flex-1 flex-col justify-center bg-zinc-950 p-8 lg:w-[40%] lg:px-16 xl:px-24">
                <div className="mx-auto w-full max-w-md space-y-10">
                    <div className="text-center lg:hidden">
                        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-zinc-800 bg-white p-2 shadow-sm">
                            <Image
                                src="/logo/zacly_icone.png"
                                alt="Zacly Ícone"
                                fill
                                className="object-contain p-2"
                                priority
                            />
                        </div>
                    </div>

                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
                        <p className="text-base text-zinc-400">{description}</p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    )
}

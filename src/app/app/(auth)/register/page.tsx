import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import { Suspense } from 'react'

export const metadata: Metadata = {
    title: 'Criar Conta',
    description: 'Crie sua conta no Zacly e comece a gerenciar seus orçamentos imediatamente.',
    alternates: {
        canonical: '/register',
    },
}

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen w-full bg-background overflow-hidden relative">
            <Suspense fallback={<div className="flex h-full w-full items-center justify-center absolute inset-0 text-primary">Carregando...</div>}>
                <LoginForm defaultMode="register" />
            </Suspense>
        </div>
    )
}

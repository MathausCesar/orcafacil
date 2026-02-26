import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import { Suspense } from 'react'

export const metadata: Metadata = {
    title: 'Login',
    description: 'Acesse sua conta no Zacly e gerencie seus orçamentos.',
    alternates: {
        canonical: '/login',
    },
}

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full bg-background overflow-hidden relative">
            <Suspense fallback={<div className="flex h-full w-full items-center justify-center absolute inset-0 text-primary">Carregando...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    )
}

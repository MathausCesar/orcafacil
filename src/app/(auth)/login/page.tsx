import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import { Suspense } from 'react'

export const metadata: Metadata = {
    title: 'Login',
    description: 'Acesse sua conta no OrçaFácil e gerencie seus orçamentos.',
    alternates: {
        canonical: '/login',
    },
}

export default function LoginPage() {
    return (
        <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0 bg-gradient-to-b from-primary/5 via-background to-background">
            <div className="lg:p-8">
                <Suspense fallback={<div className="flex h-full items-center justify-center">Carregando...</div>}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    )
}

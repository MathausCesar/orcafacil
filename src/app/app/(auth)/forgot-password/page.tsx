import { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { Suspense } from 'react'

export const metadata: Metadata = {
    title: 'Recuperar Senha',
    description: 'Recupere o acesso à sua conta no Zacly.',
}

export default function ForgotPasswordPage() {
    return (
        <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0 bg-gradient-to-b from-primary/5 via-background to-background">
            <div className="lg:p-8">
                <Suspense fallback={<div className="flex h-full items-center justify-center">Carregando...</div>}>
                    <ForgotPasswordForm />
                </Suspense>
            </div>
        </div>
    )
}

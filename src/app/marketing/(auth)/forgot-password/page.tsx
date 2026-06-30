import { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { Suspense } from 'react'

export const metadata: Metadata = {
    title: 'Recuperar Senha',
    description: 'Recupere o acesso à sua conta no Zacly.',
}

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen w-full bg-background overflow-hidden relative">
            <Suspense fallback={<div className="flex h-full w-full items-center justify-center absolute inset-0 text-primary">Carregando...</div>}>
                <ForgotPasswordForm />
            </Suspense>
        </div>
    )
}

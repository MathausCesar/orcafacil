import { Metadata } from 'next'
import { UpdatePasswordForm } from '@/components/auth/update-password-form'
import { Suspense } from 'react'

export const metadata: Metadata = {
    title: 'Redefinir Senha',
    description: 'Crie uma nova senha para sua conta no Zacly.',
}

export default async function UpdatePasswordPage() {
    return (
        <div className="flex min-h-screen w-full bg-background overflow-hidden relative">
            <Suspense fallback={<div className="flex h-full w-full items-center justify-center absolute inset-0 text-primary">Carregando...</div>}>
                <UpdatePasswordForm />
            </Suspense>
        </div>
    )
}

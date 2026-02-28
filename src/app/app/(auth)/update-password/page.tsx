import { Metadata } from 'next'
import { UpdatePasswordForm } from '@/components/auth/update-password-form'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
    title: 'Redefinir Senha',
    description: 'Crie uma nova senha para sua conta no Zacly.',
}

export default async function UpdatePasswordPage() {
    return (
        <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0 bg-gradient-to-b from-primary/5 via-background to-background">
            <div className="lg:p-8">
                <Suspense fallback={<div className="flex h-full items-center justify-center">Carregando...</div>}>
                    <UpdatePasswordForm />
                </Suspense>
            </div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updatePassword } from '@/app/actions/auth'
import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

type AuthActionResult = {
    error?: string
    success?: boolean
}

export function UpdatePasswordForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (password !== confirmPassword) {
            toast.error('As senhas não coincidem.')
            return
        }

        setLoading(true)
        try {
            const result = await updatePassword(formData) as AuthActionResult

            if (result?.error) {
                toast.error(result.error)
            } else if (result?.success) {
                toast.success('Senha atualizada com sucesso!')
                router.push('/login')
            }
        } catch {
            toast.error('Ocorreu um erro inesperado.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthShell
            title="Nova senha"
            description="Crie uma senha forte para proteger sua conta e voltar ao painel."
        >
            <div className="mb-2 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-50">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <p className="leading-relaxed text-emerald-50/80">
                    Use pelo menos 6 caracteres. Para mais segurança, combine letras, números e símbolos.
                </p>
            </div>

            <form action={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Nova senha
                    </Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="No mínimo 6 caracteres"
                        minLength={6}
                        required
                        className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 px-4 text-white placeholder:text-zinc-600 transition-all focus:border-emerald-500/50 focus:bg-zinc-900 focus:ring-4 focus:ring-emerald-500/10"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Confirmar nova senha
                    </Label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Repita a nova senha"
                        minLength={6}
                        required
                        className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 px-4 text-white placeholder:text-zinc-600 transition-all focus:border-emerald-500/50 focus:bg-zinc-900 focus:ring-4 focus:ring-emerald-500/10"
                    />
                </div>

                <Button
                    className="group h-12 w-full rounded-xl border border-white/10 bg-gradient-to-r from-emerald-500 to-teal-600 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] hover:shadow-emerald-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    type="submit"
                    disabled={loading}
                >
                    <span className="mr-2">{loading ? 'Salvando...' : 'Salvar nova senha'}</span>
                    {!loading && <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />}
                </Button>

                <Link href="/login" className="flex items-center justify-center py-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-200">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancelar e voltar
                </Link>
            </form>
        </AuthShell>
    )
}

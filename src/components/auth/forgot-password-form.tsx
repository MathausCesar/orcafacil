'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { requestPasswordReset } from '@/app/actions/auth'
import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

type AuthActionResult = {
    error?: string
    success?: boolean
}

export function ForgotPasswordForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [emailSent, setEmailSent] = useState('')

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try {
            const result = await requestPasswordReset(formData) as AuthActionResult

            if (result?.error) {
                toast.error(result.error)
            } else if (result?.success) {
                setEmailSent(formData.get('email') as string)
                setShowSuccessDialog(true)
            }
        } catch {
            toast.error('Ocorreu um erro inesperado.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthShell
            title="Recuperar senha"
            description="Informe seu e-mail e enviaremos um link seguro para criar uma nova senha."
        >
            <form action={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Email
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                        className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 px-4 text-white placeholder:text-zinc-600 transition-all focus:border-emerald-500/50 focus:bg-zinc-900 focus:ring-4 focus:ring-emerald-500/10"
                    />
                </div>

                <Button
                    className="group h-12 w-full rounded-xl border border-white/10 bg-gradient-to-r from-emerald-500 to-teal-600 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] hover:shadow-emerald-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    type="submit"
                    disabled={loading}
                >
                    <span className="mr-2">{loading ? 'Enviando...' : 'Enviar link de recuperação'}</span>
                    {!loading && <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />}
                </Button>

                <Link href="/login" className="flex items-center justify-center py-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-200">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para o login
                </Link>
            </form>

            <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <AlertDialogContent className="max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-0 pt-6 text-white shadow-2xl">
                    <div className="p-8 text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-4 ring-emerald-500/5">
                            <Mail className="h-8 w-8 text-emerald-400" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-bold">Verifique seu email</AlertDialogTitle>
                        <AlertDialogDescription className="pt-3 text-center text-base text-zinc-400">
                            Enviamos um link de redefinição para <br />
                            <span className="font-semibold text-white">{emailSent}</span>.
                        </AlertDialogDescription>
                    </div>
                    <AlertDialogFooter className="border-t border-zinc-800 bg-zinc-900/50 p-6 sm:justify-center">
                        <AlertDialogAction
                            onClick={() => {
                                setShowSuccessDialog(false)
                                router.push('/login')
                            }}
                            className="h-11 w-full rounded-xl bg-white px-10 font-semibold text-black hover:bg-zinc-200 sm:w-auto"
                        >
                            Entendi
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthShell>
    )
}

'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { requestPasswordReset } from '@/app/actions/auth'
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

export function ForgotPasswordForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [emailSent, setEmailSent] = useState('')

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try {
            const result = await requestPasswordReset(formData) as any

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
        <div className="flex min-h-[85vh] w-full max-w-[1100px] overflow-hidden rounded-3xl bg-card text-card-foreground shadow-2xl ring-1 ring-border/50 mx-auto">
            {/* Left Column: Abstract Visual */}
            <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-900 via-zinc-900 to-black p-12 text-white lg:flex">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-700/20 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 h-96 w-96 -mb-20 -ml-20 rounded-full bg-primary/20 blur-3xl"></div>

                <div className="relative z-10 flex items-center justify-start">
                    <div className="relative h-20 w-48 overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 p-3 flex items-center justify-center">
                        <div className="relative h-full w-full">
                            <Image
                                src="/logo/logo.png"
                                alt="Zacly Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                </div>

                <div className="relative z-10 space-y-6">
                    <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
                        Recupere o acesso à <br />
                        <span className="text-accent">sua conta.</span>
                    </h1>
                    <p className="max-w-md text-lg text-zinc-400 font-light">
                        Esqueceu a senha? Não tem problema, nós enviamos um link seguro para você criá-la novamente.
                    </p>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="flex w-full flex-col justify-center bg-card p-8 lg:w-1/2 lg:p-16">
                <div className="mx-auto w-full max-w-[380px] space-y-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="relative mx-auto h-20 w-48 rounded-xl bg-muted/50 p-3 ring-1 ring-border/50 flex items-center justify-center">
                            <div className="relative h-full w-full">
                                <Image
                                    src="/logo/logozacly.png"
                                    alt="Zacly Logo"
                                    fill
                                    className="object-contain dark:hidden"
                                />
                                <Image
                                    src="/logo/logo.png"
                                    alt="Zacly Logo"
                                    fill
                                    className="object-contain hidden dark:block"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-1.5 text-center lg:text-left">
                            <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                                Redefinir Senha
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Informe seu e-mail cadastrado e enviaremos um link de recuperação.
                            </p>
                        </div>

                        <form action={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-medium text-foreground/80">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    required
                                    className="h-11 rounded-lg border-input bg-muted/30 px-4 transition-all focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10"
                                />
                            </div>

                            <div className="space-y-4">
                                <Button
                                    className="group h-11 w-full rounded-lg bg-gradient-to-r from-primary to-teal-600 text-white shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98]"
                                    type="submit"
                                    disabled={loading}
                                >
                                    <span className="mr-2 font-medium">{loading ? 'Enviando...' : 'Enviar Link de Recuperação'}</span>
                                    {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                                </Button>

                                <Link href="/login" className="flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Voltar para o login
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <AlertDialogContent className="max-w-md rounded-2xl border-none p-0 shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-br from-primary/10 to-background p-8 text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 ring-4 ring-background">
                            <Mail className="h-8 w-8 text-primary" />
                        </div>
                        <AlertDialogTitle className="text-xl font-semibold text-foreground">Verifique seu email</AlertDialogTitle>
                        <AlertDialogDescription className="text-center pt-2 text-muted-foreground">
                            Enviamos um link de redefinição para <span className="font-medium text-foreground">{emailSent}</span>.
                        </AlertDialogDescription>
                    </div>
                    <AlertDialogFooter className="bg-muted/30 p-6 sm:justify-center border-t border-border">
                        <AlertDialogAction
                            onClick={() => {
                                setShowSuccessDialog(false)
                                router.push('/login')
                            }}
                            className="w-full rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 sm:w-auto px-8"
                        >
                            Entendi
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

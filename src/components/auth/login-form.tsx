'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { login, signup } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [emailSent, setEmailSent] = useState('')

    useEffect(() => {
        const message = searchParams.get('message')
        if (message === 'auth_code_error') {
            toast.error('Link inválido ou já utilizado.', {
                description: 'Tente fazer login com sua senha. Se não conseguir, refaça o cadastro.'
            })
            router.replace('/login')
        }
    }, [searchParams, router])

    const handleSubmit = async (formData: FormData, action: typeof login | typeof signup) => {
        setLoading(true)
        try {
            const result = await action(formData) as any

            if (action === signup) {
                if (result?.success) {
                    setEmailSent(formData.get('email') as string)
                    setShowSuccessDialog(true)
                } else if (result?.error) {
                    toast.error(result.error)
                }
            } else {
                // Login action
                if (result?.error) {
                    toast.error(result.error)
                } else if (result?.success && result?.redirect) {
                    // Successful login - redirect to dashboard
                    toast.success('Login realizado com sucesso!')
                    router.push(result.redirect)
                }
            }
        } catch {
            toast.error('Ocorreu um erro inesperado.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-[85vh] w-full max-w-[1100px] overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
            {/* Left Column: Abstract Visual */}
            <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-900 via-zinc-900 to-black p-12 text-white lg:flex">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-700/20 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 h-96 w-96 -mb-20 -ml-20 rounded-full bg-emerald-600/10 blur-3xl"></div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 p-1.5">
                        <Image
                            src="/logo/logo1.png"
                            alt="OrçaFácil Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className="text-xl font-semibold tracking-wide text-white/90">OrçaFácil</span>
                </div>

                <div className="relative z-10 space-y-6">
                    <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
                        A simplicidade que <br />
                        <span className="text-emerald-400">seu negócio merece.</span>
                    </h1>
                    <p className="max-w-md text-lg text-zinc-400 font-light">
                        Orçamentos profissionais, gestão de clientes e controle financeiro. Tudo em um só lugar.
                    </p>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-4 text-sm text-zinc-400/80">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Gestão Simplificada</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Orçamentos PDF</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Relatórios Financeiros</span>
                    </div>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="flex w-full flex-col justify-center bg-white p-8 lg:w-1/2 lg:p-16">
                <div className="mx-auto w-full max-w-[380px] space-y-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="relative mx-auto mb-4 h-14 w-14 rounded-xl bg-zinc-50 p-2 ring-1 ring-zinc-100">
                            <Image
                                src="/logo/logo1.png"
                                alt="OrçaFácil Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">OrçaFácil</h2>
                    </div>

                    <div className="flex rounded-xl bg-zinc-100/80 p-1">
                        <button
                            onClick={() => setMode('login')}
                            className={cn(
                                "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                                mode === 'login' ? "bg-white text-foreground shadow-sm ring-1 ring-black/5" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={cn(
                                "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                                mode === 'register' ? "bg-white text-foreground shadow-sm ring-1 ring-black/5" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Criar Conta
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-1.5 text-center lg:text-left">
                            <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                                {mode === 'login' ? 'Bem-vindo de volta' : 'Comece agora'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {mode === 'login'
                                    ? 'Acesse sua conta para gerenciar orçamentos.'
                                    : 'Crie sua conta gratuita em segundos.'}
                            </p>
                        </div>

                        <form action={(formData) => handleSubmit(formData, mode === 'login' ? login : signup)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-medium text-foreground/80">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    required
                                    className="h-11 rounded-lg border-zinc-200 bg-zinc-50/50 px-4 transition-all focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-xs font-medium text-foreground/80">Senha</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    minLength={6}
                                    required
                                    className="h-11 rounded-lg border-zinc-200 bg-zinc-50/50 px-4 transition-all focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10"
                                />
                            </div>
                            <Button
                                className="group h-11 w-full rounded-lg bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.98]"
                                type="submit"
                                disabled={loading}
                            >
                                <span className="mr-2 font-medium">{loading ? 'Processando...' : (mode === 'login' ? 'Acessar Painel' : 'Criar Conta Grátis')}</span>
                                {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <AlertDialogContent className="max-w-md rounded-2xl border-none p-0 shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-br from-emerald-50 to-white p-8 text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 ring-4 ring-white">
                            <Mail className="h-8 w-8 text-emerald-600" />
                        </div>
                        <AlertDialogTitle className="text-xl font-semibold text-zinc-900">Verifique seu email</AlertDialogTitle>
                        <AlertDialogDescription className="text-center pt-2 text-zinc-500">
                            Enviamos um link de confirmação para <span className="font-medium text-zinc-900">{emailSent}</span>.
                        </AlertDialogDescription>
                    </div>
                    <AlertDialogFooter className="bg-zinc-50 p-6 sm:justify-center border-t border-zinc-100">
                        <AlertDialogAction
                            onClick={() => {
                                setShowSuccessDialog(false)
                                window.location.reload()
                            }}
                            className="w-full rounded-xl bg-zinc-900 font-medium hover:bg-zinc-800 sm:w-auto px-8"
                        >
                            Verificar agora
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

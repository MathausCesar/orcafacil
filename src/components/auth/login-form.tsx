'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
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
        <div className="flex min-h-[90vh] w-full max-w-[1100px] overflow-hidden rounded-3xl bg-card text-card-foreground shadow-2xl ring-1 ring-border/50">
            {/* Left Column: Brand Visual */}
            <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-900 via-zinc-900 to-black px-14 py-14 text-white lg:flex">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-700/20 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 h-80 w-80 -mb-16 -ml-16 rounded-full bg-emerald-500/15 blur-3xl"></div>
                <div className="absolute top-0 right-0 h-48 w-48 -mt-8 -mr-8 rounded-full bg-teal-500/10 blur-3xl"></div>

                <div className="relative z-10 flex flex-col space-y-8">
                    {/* Logo — grande, preenchendo a largura */}
                    <div className="relative h-24 w-full">
                        <Image
                            src="/logo/logo.png"
                            alt="Zacly Logo"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>

                    {/* Tagline */}
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
                            A simplicidade que{' '}
                            <span className="text-emerald-400">seu negócio merece.</span>
                        </h1>
                        <p className="text-base text-zinc-300 font-light leading-relaxed max-w-sm">
                            Orçamentos profissionais, gestão de clientes e controle financeiro. Tudo em um só lugar.
                        </p>
                    </div>

                    {/* Separator */}
                    <div className="w-12 h-0.5 bg-emerald-500/40 rounded-full"></div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-zinc-300">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                            <span>Gestão Simplificada</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                            <span>Orçamentos PDF</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                            <span>Relatórios Financeiros</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                            <span>Aprovação Online</span>
                        </div>
                    </div>
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

                    <div className="flex rounded-xl bg-muted/50 p-1">
                        <button
                            onClick={() => setMode('login')}
                            className={cn(
                                "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                                mode === 'login' ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={cn(
                                "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                                mode === 'register' ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground"
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
                                    className="h-11 rounded-lg border-input bg-muted/30 px-4 transition-all focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-medium text-foreground/80">Senha</Label>
                                    {mode === 'login' && (
                                        <Link href="/forgot-password" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                                            Esqueci a senha
                                        </Link>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    minLength={6}
                                    required
                                    className="h-11 rounded-lg border-input bg-muted/30 px-4 transition-all focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10"
                                />
                            </div>
                            <Button
                                className="group h-11 w-full rounded-lg bg-gradient-to-r from-primary to-teal-600 text-white shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98]"
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
                    <div className="bg-gradient-to-br from-primary/10 to-background p-8 text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 ring-4 ring-background">
                            <Mail className="h-8 w-8 text-primary" />
                        </div>
                        <AlertDialogTitle className="text-xl font-semibold text-foreground">Verifique seu email</AlertDialogTitle>
                        <AlertDialogDescription className="text-center pt-2 text-muted-foreground">
                            Enviamos um link de confirmação para <span className="font-medium text-foreground">{emailSent}</span>.
                        </AlertDialogDescription>
                    </div>
                    <AlertDialogFooter className="bg-muted/30 p-6 sm:justify-center border-t border-border">
                        <AlertDialogAction
                            onClick={() => {
                                setShowSuccessDialog(false)
                                window.location.reload()
                            }}
                            className="w-full rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 sm:w-auto px-8"
                        >
                            Verificar agora
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

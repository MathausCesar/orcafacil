'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login, signup, signInWithGoogle } from '@/app/actions/auth'
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

export function LoginForm({ defaultMode = 'login' }: { defaultMode?: 'login' | 'register' }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<'login' | 'register'>(defaultMode)
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [emailSent, setEmailSent] = useState('')
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [countdown, setCountdown] = useState(0)

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

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
                // Inicia cooldown preventivo de 30s
                setCountdown(30)

                if (result?.success) {
                    setEmailSent(formData.get('email') as string)
                    setShowSuccessDialog(true)
                } else if (result?.error) {
                    toast.error(result?.error?.includes('rate limit') || result?.error?.includes('many requests')
                        ? 'Muitas tentativas. Aguarde um minuto antes de tentar novamente.'
                        : result.error)
                }
            } else {
                // Login action
                if (result?.error) {
                    toast.error(result.error)
                } else if (result?.success && result?.redirect) {
                    // Successful login - hard navigation to force full session refresh
                    toast.success('Login realizado com sucesso!')
                    window.location.href = result.redirect
                }
            }
        } catch {
            toast.error('Ocorreu um erro inesperado.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-zinc-950">
            {/* Left Column: Brand Visual (60%) */}
            <div className="relative hidden w-full lg:w-[60%] flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-950 via-[#0a1614] to-black px-16 py-20 text-white lg:flex border-r border-white-[0.02]">
                {/* Background Depth Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-800/20 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 h-[500px] w-[500px] -mb-32 -ml-32 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
                <div className="absolute top-0 right-0 h-[300px] w-[300px] -mt-16 -mr-16 rounded-full bg-teal-500/10 blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 flex flex-col space-y-12 max-w-2xl">
                    {/* Logo Massiva */}
                    <div className="relative h-28 w-[320px]">
                        <Image
                            src="/logo/logo.png"
                            alt="Zacly Logo"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>

                    {/* Tagline com hierarquia forte */}
                    <div className="space-y-6">
                        <h1 className="text-5xl font-extrabold leading-[1.15] tracking-tight text-white/95">
                            A simplicidade que{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                                seu negócio merece.
                            </span>
                        </h1>
                        <p className="text-lg text-zinc-400 font-light leading-relaxed max-w-xl">
                            Orçamentos profissionais, gestão de clientes e controle financeiro.
                            Uma plataforma criada para acelerar em vez de atrapalhar.
                        </p>
                    </div>

                    {/* Separador Angular */}
                    <div className="w-16 h-1 bg-gradient-to-r from-emerald-500/80 to-transparent rounded-full"></div>

                    {/* Features Grid Aprimorada */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6 pt-4 text-sm text-zinc-300">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/10 p-1 rounded-full text-emerald-400">
                                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            </div>
                            <span className="font-medium tracking-wide">Gestão Simplificada</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/10 p-1 rounded-full text-emerald-400">
                                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            </div>
                            <span className="font-medium tracking-wide">Orçamentos Profissionais</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/10 p-1 rounded-full text-emerald-400">
                                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            </div>
                            <span className="font-medium tracking-wide">Dashboards Financeiros</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/10 p-1 rounded-full text-emerald-400">
                                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            </div>
                            <span className="font-medium tracking-wide">Aprovação de Clientes</span>
                        </div>
                    </div>
                </div>

                {/* Minimalist Footer Detail */}
                <div className="relative z-10 text-xs text-zinc-600 font-medium tracking-widest uppercase">
                    © {new Date().getFullYear()} Zacly Plataforma
                </div>
            </div>

            {/* Right Column: Functional Area (40%) */}
            <div className="flex w-full flex-col justify-center bg-zinc-950 p-8 lg:w-[40%] lg:px-16 xl:px-24">
                <div className="mx-auto w-full max-w-md space-y-10">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="relative mx-auto h-20 w-20 flex items-center justify-center bg-white rounded-2xl shadow-sm p-2 border border-border">
                            <div className="relative h-full w-full">
                                <Image
                                    src="/logo/zacly_icone.png"
                                    alt="Zacly Ícone"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    {/* Toggle Auth Mode */}
                    <div className="flex rounded-xl bg-zinc-900/50 p-1 ring-1 ring-white/5 backdrop-blur-sm">
                        <button
                            onClick={() => setMode('login')}
                            className={cn(
                                "flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300",
                                mode === 'login'
                                    ? "bg-zinc-800 text-white shadow-md ring-1 ring-white/10"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
                            )}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={cn(
                                "flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300",
                                mode === 'register'
                                    ? "bg-zinc-800 text-white shadow-md ring-1 ring-white/10"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
                            )}
                        >
                            Criar Conta
                        </button>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-2 text-center lg:text-left">
                            <h3 className="text-3xl font-bold tracking-tight text-white">
                                {mode === 'login' ? 'Bem-vindo de volta' : 'Comece agora'}
                            </h3>
                            <p className="text-base text-zinc-400">
                                {mode === 'login'
                                    ? 'Acesse sua conta para gerenciar orçamentos.'
                                    : 'Crie sua conta gratuita em segundos.'}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <form action={async () => {
                                setLoading(true);
                                const result = await signInWithGoogle();
                                if (result?.error) {
                                    toast.error(result.error);
                                    setLoading(false);
                                }
                            }}>
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full h-12 bg-white text-black hover:bg-zinc-200 border-0 font-medium transition-all"
                                    disabled={loading}
                                >
                                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    {mode === 'login' ? 'Continuar com Google' : 'Cadastrar com Google'}
                                </Button>
                            </form>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-zinc-800"></div>
                                <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs uppercase tracking-wider">Ou</span>
                                <div className="flex-grow border-t border-zinc-800"></div>
                            </div>
                        </div>

                        <form action={(formData) => handleSubmit(formData, mode === 'login' ? login : signup)} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    required
                                    className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 px-4 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:bg-zinc-900 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Senha</Label>
                                    {mode === 'login' && (
                                        <Link href="/forgot-password" className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
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
                                    className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 px-4 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:bg-zinc-900 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                />
                            </div>
                            {/* Aceite de Termos — somente no registro */}
                            {mode === 'register' && (
                                <div className="flex items-start gap-3 py-1">
                                    <button
                                        type="button"
                                        role="checkbox"
                                        aria-checked={acceptedTerms}
                                        onClick={() => setAcceptedTerms((v) => !v)}
                                        className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 transition-all ${acceptedTerms
                                            ? 'bg-emerald-500 border-emerald-500'
                                            : 'border-zinc-600 bg-transparent hover:border-zinc-400'
                                            } flex items-center justify-center`}
                                    >
                                        {acceptedTerms && (
                                            <svg className="h-3 w-3 text-white" viewBox="0 0 12 10" fill="none">
                                                <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </button>
                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                        Li e concordo com os{' '}
                                        <a
                                            href="https://zacly.com.br/termos-de-uso"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-emerald-400 hover:underline font-medium"
                                        >
                                            Termos de Uso
                                        </a>{' '}e com a{' '}
                                        <a
                                            href="https://zacly.com.br/politica-de-privacidade"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-emerald-400 hover:underline font-medium"
                                        >
                                            Política de Privacidade
                                        </a>
                                        , incluindo o tratamento dos meus dados pessoais conforme a LGPD.
                                    </p>
                                </div>
                            )}

                            <Button
                                className="group h-12 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-base shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                type="submit"
                                disabled={loading || (mode === 'register' && !acceptedTerms) || countdown > 0}
                            >
                                <span className="mr-2">
                                    {loading
                                        ? 'Processando...'
                                        : countdown > 0
                                            ? `Aguarde ${countdown}s`
                                            : (mode === 'login' ? 'Acessar Painel' : 'Criar Conta Grátis')
                                    }
                                </span>
                                {!loading && countdown === 0 && <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Email Verification Dialog */}
            <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <AlertDialogContent className="max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-0 shadow-2xl overflow-hidden text-white pt-6">
                    <div className="p-8 text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-4 ring-emerald-500/5">
                            <Mail className="h-8 w-8 text-emerald-400" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-bold">Verifique seu email</AlertDialogTitle>
                        <AlertDialogDescription className="text-center pt-3 text-zinc-400 text-base">
                            Enviamos um link de confirmação para <br /><span className="font-semibold text-white">{emailSent}</span>.
                        </AlertDialogDescription>
                    </div>
                    <AlertDialogFooter className="bg-zinc-900/50 p-6 sm:justify-center border-t border-zinc-800">
                        <AlertDialogAction
                            onClick={() => {
                                setShowSuccessDialog(false)
                                window.location.reload()
                            }}
                            className="w-full rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 sm:w-auto px-10 h-11"
                        >
                            Verificar agora
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

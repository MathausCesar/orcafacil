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

export function LoginForm({ defaultMode = 'login' }: { defaultMode?: 'login' | 'register' }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<'login' | 'register'>(defaultMode)
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
                        <div className="relative mx-auto h-20 w-48 flex items-center justify-center">
                            <div className="relative h-full w-full">
                                <Image
                                    src="/logo/logo.png"
                                    alt="Zacly Logo"
                                    fill
                                    className="object-contain"
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
                            <Button
                                className="group h-12 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-base shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] border border-white/10"
                                type="submit"
                                disabled={loading}
                            >
                                <span className="mr-2">{loading ? 'Processando...' : (mode === 'login' ? 'Acessar Painel' : 'Criar Conta Grátis')}</span>
                                {!loading && <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />}
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

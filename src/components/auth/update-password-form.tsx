'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updatePassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

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
            const result = await updatePassword(formData) as any

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
                        Digite sua <br />
                        <span className="text-accent">nova senha.</span>
                    </h1>
                    <p className="max-w-md text-lg text-zinc-400 font-light">
                        Crie uma senha forte e segura para proteger sua conta.
                    </p>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="flex w-full flex-col justify-center bg-card p-8 lg:w-1/2 lg:p-16">
                <div className="mx-auto w-full max-w-[380px] space-y-8">
                    {/* Mobile Logo */}
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
                                Nova Senha
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Insira abaixo sua credencial de acesso futuro.
                            </p>
                        </div>

                        <form action={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-xs font-medium text-foreground/80">Nova Senha</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="No mínimo 6 caracteres"
                                    minLength={6}
                                    required
                                    className="h-11 rounded-lg border-input bg-muted/30 px-4 transition-all focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground/80">Confirmar Nova Senha</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Repita a nova senha"
                                    minLength={6}
                                    required
                                    className="h-11 rounded-lg border-input bg-muted/30 px-4 transition-all focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10"
                                />
                            </div>

                            <div className="space-y-4 pt-2">
                                <Button
                                    className="group h-11 w-full rounded-lg bg-gradient-to-r from-primary to-teal-600 text-white shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98]"
                                    type="submit"
                                    disabled={loading}
                                >
                                    <span className="mr-2 font-medium">{loading ? 'Salvando...' : 'Salvar Nova Senha'}</span>
                                    {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                                </Button>

                                <Link href="/login" className="flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Cancelar e voltar
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

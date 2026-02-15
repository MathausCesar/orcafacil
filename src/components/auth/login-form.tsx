'use client'

import Image from 'next/image'
import { useState } from 'react'
import { login, signup } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Mail } from 'lucide-react'
import { toast } from 'sonner'

export function LoginForm() {
    const [loading, setLoading] = useState(false)
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [emailSent, setEmailSent] = useState('')

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
                // Login action handles redirect internally
                if (result?.error) {
                    toast.error('Credenciais inválidas.')
                }
            }
        } catch (error) {
            toast.error('Ocorreu um erro inesperado.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
            <div className="flex flex-col space-y-2 text-center">
                <div className="mx-auto mb-4 relative h-24 w-24">
                    <Image
                        src="/logo/logo1.png"
                        alt="OrçaFácil Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    OrçaFácil
                </h1>
                <p className="text-sm text-muted-foreground">
                    Entre ou crie sua conta para começar
                </p>
            </div>

            <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-primary/10">
                    <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white">Entrar</TabsTrigger>
                    <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-white">Criar Conta</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                    <Card className="border-primary/10 shadow-lg">
                        <CardHeader>
                            <CardTitle>Login</CardTitle>
                            <CardDescription>
                                Acesse seus orçamentos salvos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form action={(formData) => handleSubmit(formData, login)}>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" placeholder="seu@email.com" required className="focus-visible:ring-primary" />
                                </div>
                                <div className="space-y-2 mt-4">
                                    <Label htmlFor="password">Senha</Label>
                                    <Input id="password" name="password" type="password" required className="focus-visible:ring-primary" />
                                </div>
                                <Button className="w-full mt-6 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg shadow-primary/20" type="submit" disabled={loading}>
                                    {loading ? 'Entrando...' : 'Entrar'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="register">
                    <Card className="border-primary/10 shadow-lg">
                        <CardHeader>
                            <CardTitle>Cadastro</CardTitle>
                            <CardDescription>
                                Crie sua conta profissional grátis.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form action={(formData) => handleSubmit(formData, signup)}>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" placeholder="seu@email.com" required className="focus-visible:ring-primary" />
                                </div>
                                <div className="space-y-2 mt-4">
                                    <Label htmlFor="password">Senha</Label>
                                    <Input id="password" name="password" type="password" minLength={6} required className="focus-visible:ring-primary" />
                                </div>
                                <Button className="w-full mt-6 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg shadow-primary/20" type="submit" disabled={loading}>
                                    {loading ? 'Criando conta...' : 'Criar Conta'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader className="items-center text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Mail className="h-8 w-8 text-primary" />
                        </div>
                        <AlertDialogTitle className="text-xl">Verifique seu email</AlertDialogTitle>
                        <AlertDialogDescription className="text-center pt-2">
                            Enviamos um link de confirmação para <span className="font-semibold text-foreground">{emailSent}</span>.
                            <br /><br />
                            Por favor, verifique sua caixa de entrada (e spam) para ativar sua conta.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center">
                        <AlertDialogAction onClick={() => {
                            setShowSuccessDialog(false)
                            // Optional: switch to login tab programmatically if needed, 
                            // but usually user stays on page. 
                            // Could use Tabs value state to switch.
                            window.location.reload() // Refresh to clear form/state is safest for now
                        }} className="w-full sm:w-auto">
                            Entendi, vou verificar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

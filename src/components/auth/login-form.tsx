'use client'

import Image from 'next/image'
import { useState } from 'react'
import { login, signup } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function LoginForm() {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData: FormData, action: typeof login | typeof signup) => {
        setLoading(true)
        try {
            await action(formData)
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
        </div>
    )
}

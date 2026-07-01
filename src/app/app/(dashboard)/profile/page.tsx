import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Building2, CreditCard, FileText, Palette, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProfileForm } from '@/components/profile/profile-form'
import { LogoutButton } from '@/components/auth/logout-button'
import { ThemeToggle } from '@/components/theme-toggle'
import { TeamManager } from '@/components/profile/team-manager'
import { getActiveOrganizationId } from '@/lib/get-active-organization'
import { CancelSubscriptionButton } from '@/components/profile/cancel-subscription-button'

interface TeamMember {
    user_id: string
    role: string
    profiles: {
        email: string
        business_name: string | null
        logo_url: string | null
    }
}

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const orgId = await getActiveOrganizationId()

    const { data: members } = await supabase
        .from('organization_members')
        .select(`
            user_id,
            role,
            profiles (
                email,
                business_name,
                logo_url
            )
        `)
        .eq('organization_id', orgId || '')

    const planLabel = profile?.plan && profile.plan !== 'free' ? profile.plan : 'Gratuito'

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-2">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-foreground">Configurações</h1>
                    <p className="text-sm text-muted-foreground">
                        Ajuste empresa, proposta, equipe e plano em áreas separadas.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="company" className="space-y-6">
                <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-xl bg-muted/70 p-1 sm:grid-cols-4">
                    <TabsTrigger value="company" className="h-11 gap-2 rounded-lg">
                        <Building2 className="h-4 w-4" />
                        Empresa
                    </TabsTrigger>
                    <TabsTrigger value="proposal" className="h-11 gap-2 rounded-lg">
                        <FileText className="h-4 w-4" />
                        Proposta
                    </TabsTrigger>
                    <TabsTrigger value="team" className="h-11 gap-2 rounded-lg">
                        <Users className="h-4 w-4" />
                        Equipe
                    </TabsTrigger>
                    <TabsTrigger value="account" className="h-11 gap-2 rounded-lg">
                        <CreditCard className="h-4 w-4" />
                        Conta
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="company" className="mt-0">
                    <ProfileForm initialProfile={profile} userId={user.id} section="company" />
                </TabsContent>

                <TabsContent value="proposal" className="mt-0">
                    <ProfileForm initialProfile={profile} userId={user.id} section="proposal" />
                </TabsContent>

                <TabsContent value="team" className="mt-0">
                    {orgId ? (
                        <TeamManager initialMembers={(members || []) as unknown as TeamMember[]} />
                    ) : (
                        <Card className="border-0 shadow-sm ring-1 ring-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Users className="h-5 w-5 text-primary" />
                                    Equipe
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Conclua o cadastro da empresa para convidar pessoas da sua equipe.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="account" className="mt-0 space-y-6">
                    <Card className="border-primary/10">
                        <CardHeader className="border-b border-primary/10 bg-primary/5">
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <Palette className="h-5 w-5" />
                                Aparência do Sistema
                            </CardTitle>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Defina como você prefere visualizar o painel administrativo.
                            </p>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-foreground">Modo do Sistema</h3>
                                    <p className="text-sm text-muted-foreground">Escolha entre modo claro, escuro ou automático.</p>
                                </div>
                                <ThemeToggle />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm ring-1 ring-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CreditCard className="h-5 w-5 text-primary" />
                                Conta e Plano
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Gerencie acesso, sessão e assinatura da Zacly.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border border-border bg-muted/30 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Plano atual</p>
                                <p className="mt-1 text-base font-semibold text-foreground">{planLabel}</p>
                            </div>
                            <LogoutButton />
                            <CancelSubscriptionButton isFree={!profile?.plan || profile.plan === 'free'} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Wrench, Palette } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ServicesCatalog } from '@/components/profile/services-catalog'
import { ProfileForm } from '@/components/profile/profile-form'
import { LogoutButton } from '@/components/auth/logout-button'
import { ThemeToggle } from '@/components/theme-toggle'
import { TeamManager } from '@/components/profile/team-manager'
import { getActiveOrganizationId } from '@/lib/get-active-organization'

// Type that matches the prop needed by TeamManager
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

    const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('organization_id', orgId || '')
        .order('created_at', { ascending: false })

    const { data: folders } = await supabase
        .from('item_folders')
        .select('*')
        .eq('organization_id', orgId || '')
        .order('name', { ascending: true })

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

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-2 mb-4">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary"><ArrowLeft className="h-5 w-5" /></Button>
                </Link>
                <h1 className="text-xl font-bold text-foreground">Configurações</h1>
            </div>

            {/* Profile Form with Client-Side Logic (Colors, Layouts) */}
            <ProfileForm initialProfile={profile} userId={user.id} />

            {/* Team Manager */}
            {orgId && (
                <TeamManager initialMembers={members as unknown as TeamMember[]} />
            )}

            {/* Services Catalog */}
            <Card className="border-primary/10">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <CardTitle className="text-primary flex items-center gap-2">
                        <Wrench className="h-5 w-5" /> Meus Serviços / Produtos
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                        Cadastre serviços e produtos para reutilizar nos orçamentos.
                    </p>
                </CardHeader>
                <CardContent className="pt-6">
                    <ServicesCatalog initialServices={services || []} initialFolders={folders || []} userId={user.id} />
                </CardContent>
            </Card>

            {/* Appearance Section */}
            <Card className="border-primary/10">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <CardTitle className="text-primary flex items-center gap-2">
                        <Palette className="h-5 w-5" /> Aparência e Tema
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                        Personalize a aparência do sistema de acordo com sua preferência.
                    </p>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-medium text-foreground">Modo do Sistema</h3>
                            <p className="text-sm text-muted-foreground">Escolha entre modo claro, escuro ou automático.</p>
                        </div>
                        <ThemeToggle />
                    </div>
                </CardContent>
            </Card>

            <div className="mt-8">
                <LogoutButton />
            </div>
        </div >
    )
}

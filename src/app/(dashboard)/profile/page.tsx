import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Wrench } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ServicesCatalog } from '@/components/profile/services-catalog'
import { ProfileForm } from '@/components/profile/profile-form'

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

    const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-2 mb-4">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary"><ArrowLeft className="h-5 w-5" /></Button>
                </Link>
                <h1 className="text-xl font-bold text-foreground">Meu Perfil</h1>
            </div>

            {/* Profile Form with Client-Side Logic (Colors, Layouts) */}
            <ProfileForm initialProfile={profile} userId={user.id} />

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
                    <ServicesCatalog initialServices={services || []} userId={user.id} />
                </CardContent>
            </Card>
        </div>
    )
}

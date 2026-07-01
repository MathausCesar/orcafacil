import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, Boxes } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ServicesCatalog } from '@/components/profile/services-catalog'
import { getActiveOrganizationId } from '@/lib/get-active-organization'

export default async function CatalogPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

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

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-2 mb-4">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary"><ArrowLeft className="h-5 w-5" /></Button>
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-foreground">Catálogo</h1>
                    <p className="text-sm text-muted-foreground">Serviços, produtos e estoque.</p>
                </div>
            </div>

            <div className="border-b border-border pb-4">
                <div className="flex items-center gap-2 text-primary">
                    <Boxes className="h-5 w-5" />
                    <h2 className="text-base font-semibold">Itens do catálogo</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                    Cadastre serviços, produtos e materiais para reutilizar nos orçamentos.
                </p>
            </div>

            <ServicesCatalog initialServices={services || []} initialFolders={folders || []} userId={user.id} />
        </div>
    )
}

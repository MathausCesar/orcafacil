import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CreateClientDialog } from '@/components/clients/create-client-dialog'
import { ClientCardExpandable } from '@/components/clients/client-card-expandable'

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    let query = supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

    if (q) {
        query = query.ilike('name', `%${q}%`)
    }

    const { data: clients } = await query

    return (
        <div className="space-y-6 pb-24">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-foreground">Meus Clientes</h1>
                <CreateClientDialog />
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <form>
                    <Input
                        name="q"
                        placeholder="Buscar cliente..."
                        className="pl-10 h-10 bg-card border-primary/10 focus-visible:ring-primary"
                        defaultValue={q}
                    />
                </form>
            </div>

            <div className="space-y-3">
                {clients?.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-primary/5 rounded-xl border border-dashed border-primary/20">
                        <Users className="h-12 w-12 mx-auto mb-3 text-primary/25" />
                        <p>Nenhum cliente encontrado.</p>
                        <div className="mt-4">
                            <CreateClientDialog trigger={<Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">Cadastrar Primeiro Cliente</Button>} />
                        </div>
                    </div>
                ) : (
                    clients?.map((client) => (
                        <ClientCardExpandable key={client.id} client={client} />
                    ))
                )}
            </div>
        </div>
    )
}

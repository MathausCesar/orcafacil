import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Search, Phone, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CreateClientDialog } from '@/components/clients/create-client-dialog'
import { EditClientDialog } from '@/components/clients/edit-client-dialog'
import { DeleteClientButton } from '@/components/clients/delete-client-button'

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
                        <Card key={client.id} className="hover:border-primary/25 hover:shadow-md transition-all border-primary/10 cursor-pointer">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 bg-primary/10 text-primary">
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-foreground">{client.name}</h3>
                                        {client.phone && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {client.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <EditClientDialog client={client} trigger={
                                        <Button size="sm" variant="ghost" className="h-8 text-xs hover:bg-zinc-100">
                                            Editar
                                        </Button>
                                    } />
                                    <DeleteClientButton clientId={client.id} clientName={client.name} />
                                    <Link href={`/new?clientId=${client.id}&clientName=${encodeURIComponent(client.name)}`}>
                                        <Button size="sm" variant="ghost" className="h-8 text-xs text-primary hover:bg-primary/10 hover:text-primary">
                                            Orçar
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}

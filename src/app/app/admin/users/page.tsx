import { getAdminUsers } from "@/app/actions/admin"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function AdminUsersPage() {
    const { users } = await getAdminUsers()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Usuários e Planos</h1>
                <p className="text-muted-foreground mt-2">
                    Gestão dos cadastros, perfil e status de assinatura.
                </p>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Negócio / Usuário</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Data de Entrada</TableHead>
                            <TableHead>Plano</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users && users.length > 0 ? (
                            users.map((user: any) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.business_name || 'Não informado'}
                                        <div className="text-xs text-muted-foreground font-normal">
                                            {user.cnpj ? `Docs: ${user.cnpj}` : 'S/ Doc'}
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        {user.created_at
                                            ? format(new Date(user.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })
                                            : '--'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {user.plan || 'Free'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={user.subscription_status === 'active' ? 'default' : 'secondary'}
                                            className={user.subscription_status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                                        >
                                            {user.subscription_status || 'Inativo'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Nenhum usuário encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

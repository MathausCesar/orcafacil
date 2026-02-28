'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Users, UserPlus, Settings2, Trash2, Mail } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { inviteTeamMember, removeTeamMember, updateTeamMemberRole } from '@/app/actions/team'

interface TeamMember {
    user_id: string
    role: string
    profiles: {
        email: string
        business_name: string | null
        logo_url: string | null
    }
}

export function TeamManager({ initialMembers }: { initialMembers: TeamMember[] }) {
    const [members, setMembers] = useState(initialMembers)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState('member')
    const [isInviting, setIsInviting] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)

    const handleInvite = async () => {
        if (!inviteEmail) return
        setIsInviting(true)
        try {
            const result = await inviteTeamMember(inviteEmail, inviteRole)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(result.message || 'Membro adicionado')
                setOpenDialog(false)
                setInviteEmail('')
                setInviteRole('member')
                // Wait for router refresh to pick up new member since we use server actions
            }
        } finally {
            setIsInviting(false)
        }
    }

    const handleRoleChange = async (userId: string, newRole: string) => {
        const result = await updateTeamMemberRole(userId, newRole)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(`O papel do usuário foi atualizado para ${newRole}.`)
            setMembers(prev => prev.map(m => m.user_id === userId ? { ...m, role: newRole } : m))
        }
    }

    const handleRemove = async (userId: string) => {
        const result = await removeTeamMember(userId)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('O membro foi removido do seu espaço de trabalho.')
            setMembers(prev => prev.filter(m => m.user_id !== userId))
        }
    }

    return (
        <Card className="border-primary/10">
            <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-primary flex items-center gap-2">
                        <Users className="h-5 w-5" /> Minha Equipe
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1">
                        Gerencie quem tem acesso ao espaço de trabalho da sua empresa.
                    </CardDescription>
                </div>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="hidden sm:flex h-9 rounded-lg gap-2">
                            <UserPlus className="h-4 w-4" /> <span>Adicionar Membro</span>
                        </Button>
                    </DialogTrigger>
                    {/* Mobile toggle is inside header but flex wraps sometimes so just icon */}
                    <DialogTrigger asChild>
                        <Button size="icon" className="sm:hidden h-9 w-9 rounded-lg">
                            <UserPlus className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Convidar Membro</DialogTitle>
                            <DialogDescription>
                                Digite o email do usuário que deseja convidar para a organização.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    placeholder="email@exemplo.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    type="email"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Papel</Label>
                                <Select value={inviteRole} onValueChange={setInviteRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um papel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Administrador (Acesso total)</SelectItem>
                                        <SelectItem value="member">Membro (Somente criar/editar itens)</SelectItem>
                                        <SelectItem value="viewer">Visualizador (Somente leitura)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenDialog(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleInvite} disabled={!inviteEmail || isInviting}>
                                {isInviting ? 'Convidando...' : 'Enviar Convite'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                    {members.map((member) => {
                        // Supabase might return an array or an object depending on FK inference
                        const profileData = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
                        const email = profileData?.email || 'Email pendente';
                        const name = profileData?.business_name || email;
                        const logoUrl = profileData?.logo_url || '';

                        return (
                            <div key={member.user_id} className="flex items-center justify-between p-4 sm:p-6 transition-colors hover:bg-muted/30">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10 border border-border">
                                        <AvatarImage src={logoUrl} />
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-sm text-foreground">
                                            {name}
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 max-w-[150px] sm:max-w-none truncate">
                                            <Mail className="h-3 w-3" /> {email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 sm:gap-4">
                                    <Select
                                        value={member.role}
                                        onValueChange={(val) => handleRoleChange(member.user_id, val)}
                                    >
                                        <SelectTrigger className="w-[110px] sm:w-[130px] h-8 text-xs border-primary/20 bg-background">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <Settings2 className="h-3 w-3 sm:hidden" />
                                                <SelectValue />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="member">Membro</SelectItem>
                                            <SelectItem value="viewer">Ver</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => handleRemove(member.user_id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                    {members.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            Nenhum membro na equipe ainda.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

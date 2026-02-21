'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FolderPlus, Trash2, Folder } from 'lucide-react'
import { createFolder, deleteFolder } from '@/app/actions/folders'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ItemFolder } from './services-catalog'

interface FoldersDialogProps {
    folders: ItemFolder[]
}

export function FoldersDialog({ folders }: FoldersDialogProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    const handleAdd = async () => {
        if (!name.trim()) {
            toast.error('Informe o nome da pasta.')
            return
        }

        setSaving(true)
        try {
            const formData = new FormData()
            formData.append('name', name)

            const result = await createFolder(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Pasta criada!')
                setName('')
                router.refresh()
            }
        } catch (error) {
            console.error('Error creating folder:', error)
            toast.error('Erro ao criar pasta.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string, folderName: string) => {
        if (!confirm(`Tem certeza que deseja apagar a pasta "${folderName}"? Os itens dentro dela ficarão sem pasta.`)) {
            return
        }
        try {
            const result = await deleteFolder(id)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Pasta removida.')
                router.refresh()
            }
        } catch (error) {
            toast.error('Erro ao remover.')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                    <FolderPlus className="h-4 w-4 text-primary" />
                    <span className="hidden sm:inline">Gerenciar Pastas</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Gerenciar Pastas</DialogTitle>
                    <DialogDescription>
                        Crie pastas para organizar seus serviços e produtos.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4 border-b border-slate-100 pb-6">
                    <div className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                            <Label className="text-xs text-muted-foreground">Nova Pasta</Label>
                            <Input
                                placeholder="Ex: Serviços Elétricos"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            />
                        </div>
                        <Button onClick={handleAdd} disabled={saving || !name.trim()}>
                            Criar
                        </Button>
                    </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {folders.length === 0 ? (
                        <p className="text-sm text-center text-muted-foreground py-4">Nenhuma pasta criada.</p>
                    ) : (
                        folders.map((folder) => (
                            <div key={folder.id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-100 group">
                                <div className="flex items-center gap-2">
                                    <Folder className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm font-medium">{folder.name}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-400 opacity-50 group-hover:opacity-100"
                                    onClick={() => handleDelete(folder.id, folder.name)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

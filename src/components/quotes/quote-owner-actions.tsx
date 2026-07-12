'use client'

import { useState } from 'react'
import { deleteQuote, duplicateQuote } from '@/app/actions/quotes'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2, Edit, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface QuoteOwnerActionsProps {
    quoteId: string
    status: string
}

export function QuoteOwnerActions({ quoteId, status }: QuoteOwnerActionsProps) {
    const canEdit = !['in_progress', 'completed'].includes(status)
    const [loading, setLoading] = useState(false)
    const [duplicating, setDuplicating] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setLoading(true)
        try {
            await deleteQuote(quoteId)
            toast.success('Orçamento excluído.')
            router.push('/')
        } catch {
            toast.error('Erro ao excluir.')
            setLoading(false)
        }
    }

    const handleDuplicate = async () => {
        setDuplicating(true)
        try {
            const result = await duplicateQuote(quoteId)
            if (result.error) {
                if (result.error === 'UPGRADE_REQUIRED') {
                    toast.message(result.message || 'Esse recurso faz parte do Pro.')
                    router.push('/pricing?source=quote_reuse')
                    return
                }
                toast.error(result.error)
                return
            }
            toast.success('Nova proposta criada como rascunho.')
            router.push(result.redirect || '/quotes')
        } catch {
            toast.error('Nao foi possivel criar a nova proposta.')
        } finally {
            setDuplicating(false)
        }
    }

    return (
        <div className="flex gap-2 print:hidden">
            {/* Edit Button — hidden for in_progress/completed */}
            {canEdit && (
                <Link href={`/quotes/${quoteId}/edit`}>
                    <Button variant="outline" size="icon" className="sm:hidden">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        <Edit className="h-4 w-4 mr-2" /> Editar
                    </Button>
                </Link>
            )}

            <Button variant="outline" size="icon" className="sm:hidden" onClick={handleDuplicate} disabled={duplicating} title="Usar como base">
                {duplicating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex" onClick={handleDuplicate} disabled={duplicating}>
                {duplicating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />} Usar como base
            </Button>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Orçamento?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

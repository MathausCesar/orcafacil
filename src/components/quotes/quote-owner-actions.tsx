'use client'

import { useState } from 'react'
import { deleteQuote } from '@/app/actions/quotes'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2, Edit } from 'lucide-react'
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
}

export function QuoteOwnerActions({ quoteId }: QuoteOwnerActionsProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setLoading(true)
        try {
            await deleteQuote(quoteId)
            toast.success('Orçamento excluído.')
            router.push('/')
        } catch (error) {
            toast.error('Erro ao excluir.')
            setLoading(false)
        }
    }

    return (
        <div className="flex gap-2 print:hidden">
            {/* Edit Button */}
            <Link href={`/quotes/${quoteId}/edit`}>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Edit className="h-4 w-4 mr-2" /> Editar
                </Button>
            </Link>

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

import { Badge } from '@/components/ui/badge'

const statusMap = {
    draft: { label: 'Rascunho', color: 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100' },
    sent: { label: 'Enviado', color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100' },
    approved: { label: 'Aprovado', color: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100' },
    rejected: { label: 'Recusado', color: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100' },
}

export function QuoteStatusBadge({ status }: { status: string }) {
    const config = statusMap[status as keyof typeof statusMap] || statusMap.draft
    return (
        <Badge variant="outline" className={`${config.color} font-medium`}>
            {config.label}
        </Badge>
    )
}

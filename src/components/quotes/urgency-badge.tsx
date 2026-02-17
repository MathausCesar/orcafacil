import { Clock, AlertCircle } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface UrgencyBadgeProps {
    themeColor?: string
    createdAt: string
    /** Dias de validade do orçamento (padrão: 7) */
    validityDays?: number
}

export function UrgencyBadge({
    themeColor = '#0D9B5C',
    createdAt,
    validityDays = 7
}: UrgencyBadgeProps) {
    const createdDate = new Date(createdAt)
    const expiryDate = addDays(createdDate, validityDays)
    const today = new Date()
    const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Determinar urgência
    const isUrgent = daysRemaining <= 2
    const isExpiringSoon = daysRemaining <= 5 && daysRemaining > 2

    if (daysRemaining < 0) {
        return null // Orçamento expirado, não mostrar badge
    }

    return (
        <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 print:hidden ${isUrgent ? 'animate-pulse' : ''
                }`}
            style={{
                borderColor: isUrgent ? '#EF4444' : isExpiringSoon ? '#F59E0B' : `${themeColor}50`,
                backgroundColor: isUrgent ? '#FEE2E2' : isExpiringSoon ? '#FEF3C7' : `${themeColor}08`,
            }}
        >
            {isUrgent ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
                <Clock className="h-4 w-4" style={{ color: isExpiringSoon ? '#F59E0B' : themeColor }} />
            )}

            <div className="text-sm">
                <span className="font-semibold" style={{
                    color: isUrgent ? '#DC2626' : isExpiringSoon ? '#D97706' : themeColor
                }}>
                    {isUrgent ? '⚠️ Oferta expira em breve!' : 'Validade do Orçamento'}
                </span>
                <span className="ml-2 text-muted-foreground">
                    {daysRemaining === 1
                        ? 'Expira amanhã'
                        : `${daysRemaining} dias restantes`
                    }
                </span>
            </div>
        </div>
    )
}

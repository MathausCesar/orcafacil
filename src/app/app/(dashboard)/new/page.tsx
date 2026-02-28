'use client'

import { Suspense } from 'react'
import { QuoteForm } from '@/components/quotes/quote-form'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function NewQuoteContent() {
    const searchParams = useSearchParams()
    const defaultClientName = searchParams.get('clientName') || ''

    return (
        <QuoteForm
            initialData={{
                clientName: defaultClientName,
                items: []
            }}
        />
    )
}

export default function NewQuotePage() {
    return (
        <Suspense fallback={<div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-primary" /> Carregando...</div>}>
            <NewQuoteContent />
        </Suspense>
    )
}

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { QuoteForm } from '@/components/quotes/quote-form'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditQuotePage(props: PageProps) {
    const params = await props.params;
    const { id } = params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: quote, error } = await supabase
        .from('quotes')
        .select(`
            *,
            quote_items (*)
        `)
        .eq('id', id)
        .single()

    if (error || !quote) {
        notFound()
    }

    if (quote.user_id !== user.id) {
        redirect('/') // Unauthorized
    }

    // Transform data for QuoteForm
    const initialData = {
        id: quote.id,
        clientName: quote.client_name,
        clientPhone: quote.client_phone,
        expirationDate: quote.expiration_date,
        paymentTerms: quote.payment_terms,
        notes: quote.notes,
        showDetailedItems: quote.show_detailed_items || false,
        items: quote.quote_items.map((item: any) => ({
            id: item.id, // Or generate random if needed, but ID is fine
            description: item.description,
            details: item.details,
            quantity: item.quantity,
            unitPrice: item.unit_price
        }))
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            <QuoteForm initialData={initialData} />
        </div>
    )
}

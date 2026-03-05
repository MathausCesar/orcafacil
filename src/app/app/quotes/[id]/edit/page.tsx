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

    // Block editing for in_progress and completed quotes
    if (['in_progress', 'completed'].includes(quote.status)) {
        redirect(`/quotes/${id}`)
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
        showTimeline: quote.show_timeline || false,
        showPaymentOptions: quote.show_payment_options || false,
        estimatedDays: quote.estimated_days || '',
        cashDiscountPercent: quote.cash_discount_percent || 0,
        cashDiscountFixed: quote.cash_discount_fixed || 0,
        cashDiscountType: quote.cash_discount_type || 'percent',
        paymentMethods: quote.payment_methods || [],
        installmentCount: quote.installment_count || '',
        layoutStyle: quote.layout_style || 'modern',
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

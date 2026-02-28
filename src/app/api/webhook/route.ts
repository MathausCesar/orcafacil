import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    // Usamos o Service Role Key para ignorar o RLS ao atualizar o BD pelo Webhook
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature") as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    try {
        switch (event.type) {
            case "checkout.session.completed":
                // Primeira assinatura concluída!
                const customerId = session.customer as string;
                const userId = session.client_reference_id || session.metadata?.userId;

                // Precisamos saber se ele comprou mensal ou anual baseando-se no price_id
                // Para simplificar no checkout.session.completed, podemos olhar a subscription ligada
                if (userId) {
                    await supabaseAdmin
                        .from("profiles")
                        .update({
                            stripe_customer_id: customerId,
                            subscription_status: "active",
                            // Na vida real você cruza o ID do Stripe para saber se é pro_monthly ou pro_yearly. Vamos definir pro_monthly como fallback.
                            plan: "pro_monthly",
                        })
                        .eq("id", userId);
                }
                break;

            case "invoice.payment_succeeded":
                // Pagamento recorrente passou
                const invoiceCustomerId = session.customer as string;
                await supabaseAdmin
                    .from("profiles")
                    .update({ subscription_status: "active" })
                    .eq("stripe_customer_id", invoiceCustomerId);
                break;

            case "invoice.payment_failed":
                // Pagamento recorrente falhou
                const failedCustomerId = session.customer as string;
                await supabaseAdmin
                    .from("profiles")
                    .update({ subscription_status: "past_due" })
                    .eq("stripe_customer_id", failedCustomerId);
                break;

            case "customer.subscription.deleted":
                // Assinatura cancelada
                const canceledCustomerId = session.customer as string;
                await supabaseAdmin
                    .from("profiles")
                    .update({
                        subscription_status: "canceled",
                        plan: "free" // Volta pra free
                    })
                    .eq("stripe_customer_id", canceledCustomerId);
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error: any) {
        console.error("Erro ao atualizar banco de dados no Webhook:", error);
        return new NextResponse(`Database Error: ${error.message}`, { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}

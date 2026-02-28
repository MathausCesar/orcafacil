import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

// Mapeia os Price IDs do Stripe para o nome de plano interno
function getPlanFromPriceId(priceId: string): "pro_monthly" | "pro_yearly" {
    if (priceId === process.env.STRIPE_PRICE_YEARLY) return "pro_yearly";
    return "pro_monthly"; // fallback
}

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
        console.error("Webhook signature error:", error.message);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    try {
        switch (event.type) {

            case "checkout.session.completed": {
                const customerId = session.customer as string;
                const userId = session.client_reference_id || session.metadata?.userId;

                // Buscar a subscription para saber qual priceId foi assinado
                let plan: "pro_monthly" | "pro_yearly" = "pro_monthly";
                if (session.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(session.subscription);
                    const priceId = subscription.items.data[0]?.price?.id || "";
                    plan = getPlanFromPriceId(priceId);
                }

                if (userId) {
                    await supabaseAdmin
                        .from("profiles")
                        .update({
                            stripe_customer_id: customerId,
                            subscription_status: "active",
                            plan,
                        })
                        .eq("id", userId);
                }
                break;
            }

            case "invoice.payment_succeeded": {
                const invoiceCustomerId = session.customer as string;
                await supabaseAdmin
                    .from("profiles")
                    .update({ subscription_status: "active" })
                    .eq("stripe_customer_id", invoiceCustomerId);
                break;
            }

            case "invoice.payment_failed": {
                const failedCustomerId = session.customer as string;
                await supabaseAdmin
                    .from("profiles")
                    .update({ subscription_status: "past_due" })
                    .eq("stripe_customer_id", failedCustomerId);
                break;
            }

            case "customer.subscription.deleted": {
                const canceledCustomerId = session.customer as string;
                await supabaseAdmin
                    .from("profiles")
                    .update({
                        subscription_status: "canceled",
                        plan: "free",
                    })
                    .eq("stripe_customer_id", canceledCustomerId);
                break;
            }

            default:
                // Eventos não tratados: apenas logar
                console.log(`Unhandled Stripe event: ${event.type}`);
        }
    } catch (error: any) {
        console.error("Erro ao atualizar banco de dados no Webhook:", error);
        return new NextResponse(`Database Error: ${error.message}`, { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}

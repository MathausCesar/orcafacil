import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type Stripe from "stripe";

export const dynamic = 'force-dynamic';

type Plan = "pro_monthly" | "pro_yearly";
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// Mapeia os Price IDs do Stripe para o nome de plano interno
function getPlanFromPriceId(priceId: string): Plan {
    if (priceId === process.env.STRIPE_PRICE_YEARLY) return "pro_yearly";
    return "pro_monthly"; // fallback
}

function getStringId(value: string | { id: string } | null | undefined) {
    if (!value) return null;
    return typeof value === "string" ? value : value.id;
}

function getPeriodEnd(subscription: Stripe.Subscription) {
    return "current_period_end" in subscription && typeof subscription.current_period_end === "number"
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null;
}

function getErrorCode(error: unknown) {
    return typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: unknown }).code)
        : null;
}

function getLegacyProfileUpdate(values: ProfileUpdate): ProfileUpdate {
    return {
        plan: values.plan,
        stripe_customer_id: values.stripe_customer_id,
        subscription_status: values.subscription_status,
        updated_at: values.updated_at,
    };
}

async function updateProfileOrThrow(
    supabaseAdmin: SupabaseClient<Database>,
    match: { id?: string; stripe_customer_id?: string },
    values: ProfileUpdate
) {
    const valuesWithTimestamp = {
        ...values,
        updated_at: new Date().toISOString(),
    };

    const query = supabaseAdmin.from("profiles").update(valuesWithTimestamp);
    const response = match.id
        ? await query.eq("id", match.id)
        : await query.eq("stripe_customer_id", match.stripe_customer_id ?? "");

    if (response.error && getErrorCode(response.error) === "42703") {
        const legacyQuery = supabaseAdmin.from("profiles").update(getLegacyProfileUpdate(valuesWithTimestamp));
        const legacyResponse = match.id
            ? await legacyQuery.eq("id", match.id)
            : await legacyQuery.eq("stripe_customer_id", match.stripe_customer_id ?? "");

        if (legacyResponse.error) {
            throw legacyResponse.error;
        }

        console.warn("Billing webhook used legacy profile schema fallback. Apply the billing subscription migration.");
        return;
    }

    if (response.error) {
        throw response.error;
    }
}

export async function POST(req: Request) {
    // Usamos o Service Role Key para ignorar o RLS ao atualizar o BD pelo Webhook
    const supabaseAdmin = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature") as string;
    const stripe = getStripe();

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Assinatura invalida";
        console.error("Webhook signature error:", message);
        return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
    }

    try {
        switch (event.type) {

            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const customerId = session.customer as string;
                const userId = session.client_reference_id || session.metadata?.userId;
                // Lê o plan_type que definimos no metadata durante o checkout
                const planType = session.metadata?.plan_type as Plan | undefined;
                const subscriptionId = getStringId(session.subscription);

                let plan: Plan = planType || "pro_monthly";
                let priceId: string | null = null;
                let currentPeriodEnd: string | null = null;
                let cancelAtPeriodEnd = false;

                // Para assinaturas (anual), confirmar pelo price_id como fallback
                if (subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    priceId = subscription.items.data[0]?.price?.id || null;
                    if (!planType && priceId) {
                        plan = getPlanFromPriceId(priceId);
                    }
                    currentPeriodEnd = getPeriodEnd(subscription);
                    cancelAtPeriodEnd = subscription.cancel_at_period_end;
                }

                if (userId) {
                    await updateProfileOrThrow(supabaseAdmin, { id: userId }, {
                        stripe_customer_id: customerId,
                        stripe_subscription_id: subscriptionId,
                        stripe_price_id: priceId,
                        subscription_status: "active",
                        plan,
                        current_period_end: currentPeriodEnd,
                        cancel_at_period_end: cancelAtPeriodEnd,
                    });
                }
                break;
            }

            case "invoice.payment_succeeded": {
                const invoice = event.data.object as Stripe.Invoice;
                const invoiceCustomerId = getStringId(invoice.customer);
                if (invoiceCustomerId) {
                    await updateProfileOrThrow(supabaseAdmin, { stripe_customer_id: invoiceCustomerId }, {
                        subscription_status: "active",
                    });
                }
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                const failedCustomerId = getStringId(invoice.customer);
                if (failedCustomerId) {
                    await updateProfileOrThrow(supabaseAdmin, { stripe_customer_id: failedCustomerId }, {
                        subscription_status: "past_due",
                    });
                }
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = getStringId(subscription.customer);
                const priceId = subscription.items.data[0]?.price?.id || null;

                if (customerId) {
                    await updateProfileOrThrow(supabaseAdmin, { stripe_customer_id: customerId }, {
                        stripe_subscription_id: subscription.id,
                        stripe_price_id: priceId,
                        subscription_status: subscription.status,
                        plan: priceId ? getPlanFromPriceId(priceId) : "pro_monthly",
                        current_period_end: getPeriodEnd(subscription),
                        cancel_at_period_end: subscription.cancel_at_period_end,
                    });
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const canceledCustomerId = getStringId(subscription.customer);
                if (canceledCustomerId) {
                    await updateProfileOrThrow(supabaseAdmin, { stripe_customer_id: canceledCustomerId }, {
                        subscription_status: "canceled",
                        plan: "free",
                        current_period_end: getPeriodEnd(subscription),
                        cancel_at_period_end: false,
                    });
                }
                break;
            }

            default:
                // Eventos não tratados: apenas logar
                console.log(`Unhandled Stripe event: ${event.type}`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        console.error("Erro ao atualizar banco de dados no Webhook:", error);
        return new NextResponse(`Database Error: ${message}`, { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}

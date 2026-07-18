import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { captureServerActivationStage, captureServerEvent } from "@/lib/server-analytics";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type Stripe from "stripe";

export const dynamic = 'force-dynamic';

type Plan = "pro_monthly" | "pro_yearly";
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type InvoiceWithParentSubscription = Stripe.Invoice & {
    parent?: {
        subscription_details?: {
            subscription?: string | Stripe.Subscription;
        } | null;
    } | null;
};

// Mapeia os Price IDs do Stripe para o nome de plano interno
function getPlanFromPriceId(priceId: string | null | undefined): Plan | null {
    if (priceId === process.env.STRIPE_PRICE_MONTHLY) return "pro_monthly";
    if (priceId === process.env.STRIPE_PRICE_YEARLY) return "pro_yearly";
    return null;
}

function getStringId(value: string | { id: string } | null | undefined) {
    if (!value) return null;
    return typeof value === "string" ? value : value.id;
}

function getMoneyValue(amountInCents: number | null | undefined) {
    return typeof amountInCents === "number" ? amountInCents / 100 : undefined;
}

function getPlanInterval(plan: Plan | null | undefined) {
    return plan === "pro_yearly" ? "year" : "month";
}

function getSubscriptionValue(subscription: Stripe.Subscription | null) {
    const amount = subscription?.items.data[0]?.price?.unit_amount;
    return getMoneyValue(amount);
}

function getPeriodEnd(subscription: Stripe.Subscription) {
    const subscriptionPeriodEnd = "current_period_end" in subscription && typeof subscription.current_period_end === "number"
        ? subscription.current_period_end
        : null;
    const itemPeriodEnd = subscription.items.data[0]?.current_period_end ?? null;
    const periodEnd = subscriptionPeriodEnd ?? itemPeriodEnd;

    return typeof periodEnd === "number"
        ? new Date(periodEnd * 1000).toISOString()
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

function getSubscriptionUpdate(subscription: Stripe.Subscription): ProfileUpdate {
    const priceId = subscription.items.data[0]?.price?.id || null;
    const plan = getPlanFromPriceId(priceId);
    const isCanceled = ["canceled", "incomplete_expired"].includes(subscription.status);

    return {
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        subscription_status: subscription.status,
        ...(plan ? { plan } : {}),
        ...(isCanceled ? { plan: "free" } : {}),
        current_period_end: getPeriodEnd(subscription),
        cancel_at_period_end: subscription.cancel_at_period_end,
    };
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
    const parentSubscription = getStringId(
        (invoice as InvoiceWithParentSubscription).parent?.subscription_details?.subscription
    );

    if (parentSubscription) return parentSubscription;

    const lineSubscription = invoice.lines.data
        .map((line) => getStringId(line.subscription))
        .find(Boolean);

    return lineSubscription ?? null;
}

async function getSubscriptionFromInvoice(stripe: Stripe, invoice: Stripe.Invoice) {
    const subscriptionId = getInvoiceSubscriptionId(invoice);

    if (!subscriptionId) return null;

    return stripe.subscriptions.retrieve(subscriptionId);
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
        ? await query.eq("id", match.id).select("id")
        : await query.eq("stripe_customer_id", match.stripe_customer_id ?? "").select("id");

    if (response.error && getErrorCode(response.error) === "42703") {
        const legacyQuery = supabaseAdmin.from("profiles").update(getLegacyProfileUpdate(valuesWithTimestamp));
        const legacyResponse = match.id
            ? await legacyQuery.eq("id", match.id).select("id")
            : await legacyQuery.eq("stripe_customer_id", match.stripe_customer_id ?? "").select("id");

        if (legacyResponse.error) {
            throw legacyResponse.error;
        }

        if (!legacyResponse.data?.length) {
            console.warn("Billing webhook did not find a matching legacy profile.", match);
        }

        console.warn("Billing webhook used legacy profile schema fallback. Apply the billing subscription migration.");
        return;
    }

    if (response.error) {
        throw response.error;
    }

    if (!response.data?.length) {
        console.warn("Billing webhook did not find a matching profile.", match);
    }
}

export async function POST(req: Request) {
    // Usamos o Service Role Key para ignorar o RLS ao atualizar o BD pelo Webhook
    const supabaseAdmin = getSupabaseAdmin();

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature");
    const stripe = getStripe();

    let event: Stripe.Event;

    if (!signature) {
        return new NextResponse("Webhook Error: missing Stripe signature", { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        return new NextResponse("Webhook Error: webhook secret not configured", { status: 500 });
    }

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
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
                const customerId = getStringId(session.customer);
                const userId = session.client_reference_id || session.metadata?.userId;
                // Lê o plan_type que definimos no metadata durante o checkout
                const planType = session.metadata?.plan_type as Plan | undefined;
                const subscriptionId = getStringId(session.subscription);
                let subscriptionForAnalytics: Stripe.Subscription | null = null;

                let updatePayload: ProfileUpdate = {
                    stripe_customer_id: customerId,
                    // A completed Checkout session can still have an incomplete
                    // subscription while Stripe confirms payment. Entitlement is
                    // granted only from the subscription state retrieved below.
                    subscription_status: "incomplete",
                    plan: planType ?? "pro_monthly",
                    cancel_at_period_end: false,
                };

                // Para assinaturas (anual), confirmar pelo price_id como fallback
                if (subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    subscriptionForAnalytics = subscription;
                    const subscriptionUpdate = getSubscriptionUpdate(subscription);
                    const pricePlan = getPlanFromPriceId(subscriptionUpdate.stripe_price_id);

                    updatePayload = {
                        ...updatePayload,
                        ...subscriptionUpdate,
                        plan: planType ?? pricePlan ?? updatePayload.plan,
                    };
                }

                if (userId) {
                    await updateProfileOrThrow(supabaseAdmin, { id: userId }, updatePayload);

                    const isActiveSubscription = ["active", "trialing"].includes(
                        updatePayload.subscription_status || ""
                    );

                    if (!isActiveSubscription) {
                        break;
                    }

                    const subscriptionPayload = {
                        plan: updatePayload.plan,
                        billing_interval: getPlanInterval(updatePayload.plan as Plan | null | undefined),
                        subscription_status: updatePayload.subscription_status,
                        source: "stripe_webhook",
                        stripe_event_id: event.id,
                        stripe_checkout_id: session.id,
                        stripe_subscription_id: subscriptionId,
                        value: getMoneyValue(session.amount_total) ?? getSubscriptionValue(subscriptionForAnalytics),
                        currency: session.currency?.toUpperCase() || "BRL",
                        transaction_id: session.id,
                    };

                    await captureServerEvent("subscription_started", userId, subscriptionPayload);
                    await captureServerActivationStage(userId, "subscribed", subscriptionPayload);
                }
                break;
            }

            case "checkout.session.expired": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.client_reference_id || session.metadata?.userId;

                if (userId) {
                    const checkoutPayload = {
                        plan: session.metadata?.plan_type || "unknown",
                        billing_interval: session.metadata?.billing_interval || "unknown",
                        source: "stripe_webhook",
                        stripe_event_id: event.id,
                        stripe_checkout_id: session.id,
                        value: getMoneyValue(session.amount_total),
                        currency: session.currency?.toUpperCase() || "BRL",
                    };

                    await captureServerEvent("checkout_expired", userId, checkoutPayload);
                    await captureServerActivationStage(userId, "checkout_abandoned", checkoutPayload);
                }
                break;
            }

            case "invoice.payment_succeeded": {
                const invoice = event.data.object as Stripe.Invoice;
                const invoiceCustomerId = getStringId(invoice.customer);
                const subscription = await getSubscriptionFromInvoice(stripe, invoice);
                const customerId = invoiceCustomerId ?? getStringId(subscription?.customer);

                if (customerId && subscription) {
                    await updateProfileOrThrow(supabaseAdmin, { stripe_customer_id: customerId }, {
                        ...getSubscriptionUpdate(subscription),
                        subscription_status: "active",
                    });
                    break;
                }

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
                const subscription = await getSubscriptionFromInvoice(stripe, invoice);
                const customerId = failedCustomerId ?? getStringId(subscription?.customer);

                if (customerId && subscription) {
                    await updateProfileOrThrow(supabaseAdmin, { stripe_customer_id: customerId }, {
                        ...getSubscriptionUpdate(subscription),
                        subscription_status: "past_due",
                    });
                    break;
                }

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

                if (customerId) {
                    await updateProfileOrThrow(supabaseAdmin, { stripe_customer_id: customerId }, getSubscriptionUpdate(subscription));
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const canceledCustomerId = getStringId(subscription.customer);
                if (canceledCustomerId) {
                    await updateProfileOrThrow(supabaseAdmin, { stripe_customer_id: canceledCustomerId }, {
                        ...getSubscriptionUpdate(subscription),
                        subscription_status: "canceled",
                        plan: "free",
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

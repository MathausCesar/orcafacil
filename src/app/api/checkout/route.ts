import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getAppBaseUrl } from "@/lib/app-url";
import type Stripe from "stripe";

type CheckoutPlan = "monthly" | "yearly";
type InternalPlan = "pro_monthly" | "pro_yearly";

const PLAN_CONFIG: Record<CheckoutPlan, {
    envKey: "STRIPE_PRICE_MONTHLY" | "STRIPE_PRICE_YEARLY";
    internalPlan: InternalPlan;
    interval: "month" | "year";
}> = {
    monthly: {
        envKey: "STRIPE_PRICE_MONTHLY",
        internalPlan: "pro_monthly",
        interval: "month",
    },
    yearly: {
        envKey: "STRIPE_PRICE_YEARLY",
        internalPlan: "pro_yearly",
        interval: "year",
    },
};

const BILLABLE_STATUSES = new Set(["active", "trialing", "past_due", "unpaid"]);

function getPlanConfig(plan: unknown) {
    if (plan === "monthly" || plan === "yearly") {
        return PLAN_CONFIG[plan];
    }

    return null;
}

async function getPlanFromRequest(req: NextRequest) {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        try {
            const body: unknown = await req.json();

            if (body && typeof body === "object" && "plan" in body) {
                const plan = (body as { plan?: unknown }).plan;
                return typeof plan === "string" ? plan : null;
            }
        } catch {
            return null;
        }

        return null;
    }

    try {
        const formData = await req.formData();
        return formData.get("plan");
    } catch {
        return null;
    }
}

function isBillableStatus(status: string | null | undefined) {
    return Boolean(status && BILLABLE_STATUSES.has(status));
}

function getSubscriptionPriceId(subscription: Stripe.Subscription) {
    return subscription.items.data[0]?.price?.id ?? null;
}

async function assertPriceMatchesPlan(stripe: Stripe, priceId: string, expectedInterval: "month" | "year") {
    const price = await stripe.prices.retrieve(priceId);

    if (!price.active || price.type !== "recurring" || price.recurring?.interval !== expectedInterval) {
        throw new Error("Plano de assinatura mal configurado no Stripe.");
    }
}

async function findBillableSubscription(stripe: Stripe, customerId: string) {
    const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 10,
    });

    return subscriptions.data.find((subscription) => isBillableStatus(subscription.status)) ?? null;
}

function getDuplicateSubscriptionMessage(currentPriceId: string | null, requestedPriceId: string, cancelAtPeriodEnd: boolean | null | undefined) {
    if (cancelAtPeriodEnd) {
        return "Sua assinatura ja esta ativa ate o fim do periodo pago. Para reativar ou trocar de plano sem risco de cobranca duplicada, fale com o suporte.";
    }

    if (currentPriceId === requestedPriceId) {
        return "Voce ja tem uma assinatura ativa neste plano.";
    }

    return "Voce ja tem uma assinatura ativa. Para trocar de plano sem cobranca duplicada, fale com o suporte.";
}

export async function POST(req: NextRequest) {
    try {
        const requestedPlan = await getPlanFromRequest(req);
        const planConfig = getPlanConfig(requestedPlan);

        if (!planConfig) {
            return NextResponse.json({ error: "Plano não selecionado" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Faça login para continuar para o checkout.", redirect: "/login" },
                { status: 401 }
            );
        }

        // Buscar dados do usuário
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("stripe_customer_id, stripe_subscription_id, stripe_price_id, subscription_status, cancel_at_period_end, email, business_name")
            .eq("id", user.id)
            .single();

        if (profileError) {
            console.error("Checkout profile lookup failed:", profileError);
            return NextResponse.json(
                { error: "Nao foi possivel validar sua assinatura agora. Tente novamente em instantes." },
                { status: 500 }
            );
        }

        const priceId = process.env[planConfig.envKey] || "";

        // Define o Price ID baseando-se nas Variáveis de Ambiente
        if (!priceId) {
            console.error(`Price ID not configured for ${planConfig.internalPlan}.`);
            return NextResponse.json(
                { error: "Checkout temporariamente indisponivel. Tente novamente em instantes." },
                { status: 500 }
            );
        }

        // Detecta a URL base pela origem da requisição para garantir domínio correto
        const stripe = getStripe();
        await assertPriceMatchesPlan(stripe, priceId, planConfig.interval);

        if (isBillableStatus(profile?.subscription_status)) {
            const message = getDuplicateSubscriptionMessage(
                profile?.stripe_price_id ?? null,
                priceId,
                profile?.cancel_at_period_end
            );

            return NextResponse.json({ error: message, redirect: "/profile" }, { status: 409 });
        }

        if (profile?.stripe_customer_id) {
            const existingSubscription = await findBillableSubscription(stripe, profile.stripe_customer_id);

            if (existingSubscription) {
                const message = getDuplicateSubscriptionMessage(
                    getSubscriptionPriceId(existingSubscription),
                    priceId,
                    existingSubscription.cancel_at_period_end
                );

                return NextResponse.json({ error: message, redirect: "/profile" }, { status: 409 });
            }
        }

        const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/')
        const baseUrl = origin?.includes('localhost') ? origin : getAppBaseUrl()

        // Mensal = assinatura recorrente mensal
        // Anual  = assinatura recorrente anual
        const checkoutMode = "subscription"

        // Criar a Sessão de Checkout
        const sessionPayload: Stripe.Checkout.SessionCreateParams = {
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: checkoutMode,
            success_url: `${baseUrl}/profile?billing=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/pricing?canceled=true&plan=${requestedPlan}`,
            client_reference_id: user.id,
            metadata: {
                userId: user.id,
                plan_type: planConfig.internalPlan,
                billing_interval: planConfig.interval,
            },
            subscription_data: {
                metadata: {
                    userId: user.id,
                    plan_type: planConfig.internalPlan,
                    billing_interval: planConfig.interval,
                },
            },
        };

        // Se o cliente já comprou ou tentou comprar antes, reaproveitamos o cadastro
        if (profile?.stripe_customer_id) {
            sessionPayload.customer = profile.stripe_customer_id;
        } else {
            // Se for novo, preenchemos o email para facilitar
            sessionPayload.customer_email = profile?.email || user.email;
        }

        const stripeSession = await stripe.checkout.sessions.create(sessionPayload);

        if (stripeSession.url) {
            // Retorna JSON com a URL — o cliente faz o redirecionamento
            // (fetch não consegue seguir redirects cross-origin para o Stripe)
            return NextResponse.json({ url: stripeSession.url });
        }

        return NextResponse.json({ error: "Não foi possível criar a sessão do checkout" }, { status: 500 });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        console.error("Stripe Checkout Error:", error);
        return new NextResponse("Erro Interno ao abrir checkout: " + message, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const plan = formData.get("plan") as string; // 'monthly' ou 'yearly'

        if (!plan) {
            return NextResponse.json({ error: "Plano não selecionado" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        // Buscar dados do usuário
        const { data: profile } = await supabase
            .from("profiles")
            .select("stripe_customer_id, email, business_name")
            .eq("id", user.id)
            .single();

        let priceId = "";

        // Define o Price ID baseando-se nas Variáveis de Ambiente
        if (plan === "monthly") {
            priceId = process.env.STRIPE_PRICE_MONTHLY || "";
        } else if (plan === "yearly") {
            priceId = process.env.STRIPE_PRICE_YEARLY || "";
        }

        if (!priceId) {
            console.error(`Price ID not configured for ${plan} plan.`);
            // Para testes sem chave configurada, apenas retornamos um aviso simulado:
            return new NextResponse(`Erro: O Preço do Stripe não está configurado nas Variáveis de Ambiente. (STRIPE_PRICE_MONTHLY ou STRIPE_PRICE_YEARLY)`, { status: 500 });
        }

        // Detecta a URL base pela origem da requisição para garantir domínio correto
        const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/')
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
            ? process.env.NEXT_PUBLIC_APP_URL
            : origin || 'https://app.zacly.com.br'

        // Mensal = assinatura recorrente mensal
        // Anual  = assinatura recorrente anual
        const isMonthly = plan === "monthly"
        const checkoutMode = "subscription"

        // Criar a Sessão de Checkout
        const sessionPayload: any = {
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: checkoutMode,
            success_url: `${baseUrl}/?success=true`,
            cancel_url: `${baseUrl}/pricing?canceled=true`,
            client_reference_id: user.id,
            metadata: {
                userId: user.id,
                plan_type: isMonthly ? "pro_monthly" : "pro_yearly",
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

    } catch (error: any) {
        console.error("Stripe Checkout Error:", error);
        return new NextResponse("Erro Interno ao abrir checkout: " + error.message, { status: 500 });
    }
}

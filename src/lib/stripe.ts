import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripe() {
    if (!stripeClient) {
        const secretKey = process.env.STRIPE_SECRET_KEY;

        if (!secretKey) {
            throw new Error('STRIPE_SECRET_KEY não configurada.');
        }

        stripeClient = new Stripe(secretKey, {
            apiVersion: '2026-02-25.clover' as Stripe.LatestApiVersion,
            appInfo: {
                name: 'Zacly App',
                version: '0.1.0',
            },
        });
    }

    return stripeClient;
}

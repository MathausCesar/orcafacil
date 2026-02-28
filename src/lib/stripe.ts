import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build', {
    apiVersion: '2026-02-25.clover' as any, // Use a versão mais recente
    appInfo: {
        name: 'Zacly App',
        version: '0.1.0',
    },
});

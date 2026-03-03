'use server';

import { resend } from '@/lib/resend';
import { BasicEmailTemplate } from '@/components/emails/BasicEmailTemplate';

interface SendEmailParams {
    to: string | string[];
    subject: string;
    firstName?: string;
    message?: string;
    text?: string;
}

export async function sendEmail({ to, subject, firstName, message, text }: SendEmailParams) {
    try {
        const data = await resend.emails.send({
            // Lembre-se de verificar seu domínio no Resend!
            // Substituir pelo e-mail verificado no painel (ex: contato@seu-dominio.com)
            from: process.env.EMAIL_FROM || 'Zacly <onboarding@resend.dev>',
            to,
            subject,
            text: text || message || '',
            // Opcional: Renderizar usando nosso Template React se as propriedades base existirem
            ...(firstName && message ? { react: BasicEmailTemplate({ firstName, message }) } : {})
        });

        if (data.error) {
            console.error('Erro Resend:', data.error);
            return { success: false, error: data.error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Falha no envio do email:', error);
        return { success: false, error: 'Erro interno ao realizar o disparo' };
    }
}

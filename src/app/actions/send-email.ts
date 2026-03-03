'use server';

import { resend } from '@/lib/resend';
import { BasicEmailTemplate } from '@/components/emails/BasicEmailTemplate';
import * as React from 'react';

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
            // Substituir pelo e-mail verificado no painel (ex: contato@zacly.com.br)
            from: process.env.EMAIL_FROM || 'Zacly <contato@zacly.com.br>',
            to,
            subject,
            text: text || message || '',
            html: '', // O Resend Types exige html se não for explicitado (quando usamos react, ele substitui na prática)
            // Opcional: Renderizar usando nosso Template React se as propriedades base existirem
            ...(firstName && message ? { react: BasicEmailTemplate({ firstName, message }) as React.ReactElement } : {})
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

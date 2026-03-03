import { Resend } from 'resend';

// Inicializa o cliente Resend com a chave da variável de ambiente
// O process.env.RESEND_API_KEY deve ser configurado no painel da Vercel ou .env.local
export const resend = new Resend(process.env.RESEND_API_KEY);

import { MARKETING_COPY } from "@/lib/pricing-copy";

export const marketingFaqs = [
    {
        question: "O que é o Zacly?",
        answer:
            "Zacly é um app para autônomos e pequenos prestadores criarem orçamentos profissionais em PDF, enviarem pelo WhatsApp e acompanharem a aprovação do cliente.",
    },
    {
        question: "Preciso ter CNPJ para usar?",
        answer:
            "Não. O Zacly funciona para autônomos, MEIs e pequenos negócios. Você pode começar com seus dados básicos e melhorar sua identidade visual depois.",
    },
    {
        question: "O Zacly é gratuito?",
        answer:
            `Sim. ${MARKETING_COPY.freePlan} Para orçamentos ilimitados e propostas sem marca Zacly, o ${MARKETING_COPY.proPlan}`,
    },
    {
        question: "Meu cliente precisa instalar aplicativo?",
        answer:
            "Não. O cliente abre um link, visualiza a proposta e pode aprovar direto pelo navegador do celular.",
    },
    {
        question: "Isso substitui meu orçamento no WhatsApp?",
        answer:
            "Ele melhora o que você já faz no WhatsApp. Em vez de mandar preço solto, você envia uma proposta com descrição, itens, prazo, condições e link de aprovação.",
    },
    {
        question: "Sou ruim com tecnologia. Vou conseguir usar?",
        answer:
            "Sim. O fluxo foi pensado para celular: cadastrar cliente, escolher serviços, gerar proposta e enviar pelo WhatsApp.",
    },
    {
        question: "Como funciona o pagamento dos planos?",
        answer:
            "Os pagamentos são processados pela Stripe. A Zacly não armazena dados do seu cartão. O plano grátis não exige cartão para começar.",
    },
] as const;

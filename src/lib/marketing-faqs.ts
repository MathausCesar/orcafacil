import { MARKETING_COPY } from "@/lib/pricing-copy";

export const marketingFaqs = [
    {
        question: "O que é o Zacly?",
        answer:
            "É um app que monta orçamento bonito pra você. Você escolhe os serviços e os preços, ele gera o orçamento com seu nome, e você manda pelo WhatsApp. O cliente aprova clicando num botão.",
    },
    {
        question: "Preciso ter CNPJ para usar?",
        answer:
            "Não. Funciona pra quem trabalha por conta própria, com ou sem CNPJ. Você começa só com seu nome e já sai fazendo orçamento.",
    },
    {
        question: "O Zacly é gratuito?",
        answer:
            `Sim. ${MARKETING_COPY.freePlan} Se quiser orçamentos sem limite e com a sua logo, o ${MARKETING_COPY.proPlan}`,
    },
    {
        question: "Meu cliente precisa instalar aplicativo?",
        answer:
            "Não. Ele recebe um link no WhatsApp, abre no navegador do celular e aprova o orçamento com um toque. Sem baixar nada, sem criar conta.",
    },
    {
        question: "Como a minha logo entra no orçamento?",
        answer:
            "Você envia a foto da sua logo e o Zacly monta o orçamento já com ela, combinando as cores. Não precisa entender de design — fica pronto sozinho.",
    },
    {
        question: "Isso substitui meu orçamento no WhatsApp?",
        answer:
            "Você continua usando o WhatsApp do mesmo jeito. A diferença é que, em vez de mandar o preço solto na conversa, você manda um orçamento organizado com um botão pro cliente aprovar.",
    },
    {
        question: "Sou ruim com tecnologia. Vou conseguir usar?",
        answer:
            "Vai. Se você sabe mandar mensagem no WhatsApp, sabe usar o Zacly. É escolher o serviço, colocar o preço e apertar enviar. Tudo pelo celular.",
    },
    {
        question: "Como funciona o pagamento dos planos?",
        answer:
            "O pagamento é no cartão, por um sistema seguro (Stripe, o mesmo usado por empresas grandes). O Zacly não guarda os dados do seu cartão. E pra usar o plano grátis não precisa de cartão nenhum.",
    },
    {
        question: "O que acontece quando meus orçamentos grátis acabarem?",
        answer:
            "Nada some. Seus orçamentos e clientes continuam salvos. Você ganha 1 orçamento grátis por mês, ou assina o Pro quando quiser fazer quantos precisar, com a sua logo.",
    },
    {
        question: "Como faço para cancelar minha assinatura?",
        answer:
            "Quando quiser, direto no app, sem precisar falar com ninguém. Você continua com o Pro até o fim do período que já pagou.",
    },
] as const;

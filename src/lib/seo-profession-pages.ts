export type SeoProfessionPage = {
    slug: string
    title: string
    description: string
    h1: string
    eyebrow: string
    intro: string
    profession: string
    keywords: string[]
    pains: string[]
    outcomes: string[]
    faq: Array<{
        question: string
        answer: string
    }>
}

export const SEO_PROFESSION_PAGES: SeoProfessionPage[] = [
    {
        slug: 'marceneiros',
        title: 'App de orcamento para marceneiros | Zacly',
        description: 'Crie orcamentos profissionais de marcenaria em PDF, envie pelo WhatsApp e acompanhe a aprovacao do cliente com a Zacly.',
        h1: 'Orcamento profissional para marceneiro fechar servico com mais confianca.',
        eyebrow: 'Zacly para marcenaria',
        intro: 'Para quem faz moveis planejados, reparos, montagem e projetos sob medida, o Zacly organiza itens, prazos, condicoes e aprovacao em uma proposta clara.',
        profession: 'marceneiros',
        keywords: ['orcamento para marceneiro', 'app para marcenaria', 'proposta de marcenaria', 'orcamento moveis planejados'],
        pains: [
            'Cliente pede preco pelo WhatsApp e compara apenas o valor final.',
            'Medidas, materiais e etapas ficam espalhados em mensagens e papel.',
            'Aprovacao informal gera retrabalho quando o cliente muda o combinado.',
        ],
        outcomes: [
            'Proposta com escopo, itens e prazo em um link profissional.',
            'PDF organizado para enviar ao cliente sem montar documento do zero.',
            'Aprovacao pelo cliente no link, com historico mais claro para comecar o servico.',
        ],
        faq: [
            {
                question: 'O Zacly serve para moveis planejados?',
                answer: 'Sim. Voce pode montar itens de projeto, fabricacao, montagem, materiais e condicoes de pagamento em uma proposta unica.',
            },
            {
                question: 'Consigo enviar o orcamento de marcenaria pelo WhatsApp?',
                answer: 'Sim. O Zacly gera o link da proposta e abre o WhatsApp com uma mensagem pronta para o cliente visualizar e aprovar.',
            },
        ],
    },
    {
        slug: 'eletricistas',
        title: 'App de orcamento para eletricistas | Zacly',
        description: 'Organize servicos eletricos, materiais, prazo e aprovacao do cliente em propostas profissionais pelo WhatsApp.',
        h1: 'Orcamentos eletricos mais claros para o cliente aprovar sem confusao.',
        eyebrow: 'Zacly para eletricistas',
        intro: 'Para instalacao, manutencao, troca de quadro, tomadas, iluminacao e visitas tecnicas, o Zacly ajuda a transformar combinados soltos em proposta profissional.',
        profession: 'eletricistas',
        keywords: ['orcamento eletricista', 'app para eletricista', 'proposta servico eletrico', 'orcamento eletrico online'],
        pains: [
            'Materiais e mao de obra ficam misturados em mensagem de texto.',
            'Cliente nao entende o que esta incluso no valor.',
            'Fica dificil provar qual escopo foi aprovado.',
        ],
        outcomes: [
            'Itens e servicos eletricos separados com valores e descricao.',
            'Condicoes e prazo visiveis para reduzir duvidas antes do inicio.',
            'Aprovacao digital para deixar o combinado mais seguro.',
        ],
        faq: [
            {
                question: 'Posso separar material e mao de obra?',
                answer: 'Sim. Voce pode cadastrar produtos e servicos e montar a proposta com a composicao mais adequada.',
            },
            {
                question: 'O cliente precisa criar conta para aprovar?',
                answer: 'Nao. O cliente acessa o link publico da proposta e pode aprovar, recusar ou pedir ajuste.',
            },
        ],
    },
    {
        slug: 'pintores',
        title: 'App de orcamento para pintores | Zacly',
        description: 'Monte propostas de pintura com ambiente, materiais, prazo e valor total em PDF profissional para enviar pelo WhatsApp.',
        h1: 'Propostas de pintura com aparencia profissional, sem depender de papel ou mensagem solta.',
        eyebrow: 'Zacly para pintores',
        intro: 'O Zacly ajuda pintores autonomos a apresentar servicos de pintura residencial, comercial, textura, massa corrida e retoques de forma organizada.',
        profession: 'pintores',
        keywords: ['orcamento pintura', 'app para pintor', 'proposta de pintura', 'orcamento pintura residencial'],
        pains: [
            'O cliente recebe um preco sem entender etapas e materiais.',
            'Detalhes de ambiente, metragem e prazo se perdem no WhatsApp.',
            'Falta uma proposta bonita para passar mais confianca.',
        ],
        outcomes: [
            'Descricao do servico e etapas de pintura em uma proposta clara.',
            'Prazo estimado e condicoes comerciais no mesmo documento.',
            'Link de aprovacao para o cliente confirmar antes de iniciar.',
        ],
        faq: [
            {
                question: 'Serve para pintura residencial e comercial?',
                answer: 'Sim. Voce pode adaptar os itens para comodos, fachadas, lojas, escritorios e outros tipos de pintura.',
            },
            {
                question: 'Dá para usar no celular?',
                answer: 'Sim. O Zacly foi pensado para o autonomo usar pelo navegador do celular e enviar pelo WhatsApp.',
            },
        ],
    },
    {
        slug: 'assistencia-tecnica',
        title: 'App de orcamento para assistencia tecnica | Zacly',
        description: 'Crie orcamentos para reparos, pecas e servicos tecnicos com aprovacao por link e envio pelo WhatsApp.',
        h1: 'Orcamentos de assistencia tecnica com pecas, servicos e aprovacao em um so lugar.',
        eyebrow: 'Zacly para assistencia tecnica',
        intro: 'Para reparos, diagnosticos, trocas de peca e manutencoes, o Zacly organiza o que sera feito e facilita a aprovacao do cliente.',
        profession: 'assistencias tecnicas',
        keywords: ['orcamento assistencia tecnica', 'app para assistencia tecnica', 'orcamento reparo', 'proposta manutencao'],
        pains: [
            'Diagnostico, peca e servico ficam sem separacao clara.',
            'Cliente aprova por mensagem e depois questiona o que estava incluso.',
            'Falta controle simples do andamento do orcamento.',
        ],
        outcomes: [
            'Itens de peca e servico organizados na mesma proposta.',
            'Historico de aprovacao mais seguro para iniciar o reparo.',
            'Pipeline para acompanhar orcamentos enviados e aprovados.',
        ],
        faq: [
            {
                question: 'Posso controlar produtos usados no reparo?',
                answer: 'Sim. O Zacly tem cadastro simples de produtos e servicos para facilitar a montagem do orcamento.',
            },
            {
                question: 'O Zacly emite nota fiscal?',
                answer: 'Nao. A proposta do Zacly e manter simples: orcamento, cliente, aprovacao e controle operacional basico.',
            },
        ],
    },
    {
        slug: 'prestadores-autonomos',
        title: 'App de orcamento para autonomos e prestadores | Zacly',
        description: 'Saia do papel e crie orcamentos profissionais em PDF pelo WhatsApp, com aprovacao do cliente e controle do pipeline.',
        h1: 'O app de orcamentos para autonomos que ainda fazem tudo no papel.',
        eyebrow: 'Zacly para prestadores autonomos',
        intro: 'A Zacly foi criada para mecanicos, marceneiros, eletricistas, pintores, tecnicos e autonomos que precisam vender melhor sem complicar a rotina.',
        profession: 'prestadores autonomos',
        keywords: ['app para autonomos', 'orcamento para prestador de servico', 'gerador de orcamento pdf', 'orcamento pelo whatsapp'],
        pains: [
            'Orcamentos ficam em caderno, bloco de notas, planilha ou mensagens antigas.',
            'Cliente demora para responder porque a proposta nao parece profissional.',
            'Falta visao simples de quais orcamentos foram enviados, aprovados ou recusados.',
        ],
        outcomes: [
            'Propostas em PDF e link de aprovacao sem precisar montar documento manualmente.',
            'Mensagem de envio pelo WhatsApp pronta para aumentar a chance de resposta.',
            'Pipeline simples para acompanhar cada oportunidade.',
        ],
        faq: [
            {
                question: 'O plano gratis precisa de cartao?',
                answer: 'Nao. O plano gratis permite comecar sem cartao, com 1 proposta simples por mes e 1 deguste Pro para comparar o visual profissional.',
            },
            {
                question: 'Preciso entender de sistema para usar?',
                answer: 'Nao. O fluxo foi pensado para quem hoje faz orcamento manualmente e quer apenas organizar melhor a venda.',
            },
        ],
    },
]

export function getSeoProfessionPage(slug: string) {
    return SEO_PROFESSION_PAGES.find((page) => page.slug === slug) || null
}

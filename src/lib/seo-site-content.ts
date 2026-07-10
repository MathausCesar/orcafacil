export const SEO_BASE_URL = 'https://www.zacly.com.br'

export type SeoStaticPage = {
    path: string
    title: string
    description: string
    priority: number
}

export type SeoGuideArticle = {
    slug: string
    title: string
    description: string
    h1: string
    intro: string
    readTime: string
    keywords: string[]
    sections: Array<{
        heading: string
        body: string
        bullets?: string[]
    }>
    faq: Array<{
        question: string
        answer: string
    }>
}

export type SeoCommercialPage = {
    slug: string
    title: string
    description: string
    h1: string
    eyebrow: string
    intro: string
    keywords: string[]
    benefits: string[]
    sections: Array<{
        heading: string
        body: string
    }>
    faq: Array<{
        question: string
        answer: string
    }>
}

export type SeoModelPage = {
    slug: string
    title: string
    description: string
    h1: string
    intro: string
    useFor: string
    fields: string[]
    tips: string[]
}

export const SEO_STATIC_PAGES: SeoStaticPage[] = [
    {
        path: '/recursos',
        title: 'Recursos do Zacly | Orcamentos, PDF, WhatsApp e aprovacao',
        description: 'Conheca os recursos do Zacly para criar orcamentos profissionais, enviar pelo WhatsApp, aprovar por link e acompanhar propostas.',
        priority: 0.9,
    },
    {
        path: '/como-funciona',
        title: 'Como funciona o Zacly | Do cliente ao orcamento aprovado',
        description: 'Veja como o Zacly ajuda autonomos a cadastrar cliente, montar proposta, enviar pelo WhatsApp e acompanhar a aprovacao.',
        priority: 0.9,
    },
    {
        path: '/precos',
        title: 'Precos do Zacly | Plano gratis e planos Pro',
        description: 'Veja os planos da Zacly para criar orcamentos profissionais. Comece gratis, sem cartao, e evolua para propostas sem marca Zacly.',
        priority: 0.85,
    },
    {
        path: '/blog',
        title: 'Blog Zacly | Guias de orcamento para autonomos',
        description: 'Aprenda a criar orcamentos profissionais, enviar propostas pelo WhatsApp e organizar aprovacao de clientes.',
        priority: 0.8,
    },
    {
        path: '/modelos',
        title: 'Modelos de orcamento | Zacly',
        description: 'Veja modelos de orcamento para prestadores, mecanicos, marceneiros, eletricistas, pintores e assistencias tecnicas.',
        priority: 0.75,
    },
    {
        path: '/sobre',
        title: 'Sobre a Zacly | App de orcamentos para autonomos',
        description: 'Conheca a Zacly, plataforma criada para ajudar autonomos e prestadores a sair do papel e vender servicos com propostas profissionais.',
        priority: 0.65,
    },
    {
        path: '/sobre-zacly',
        title: 'O que e Zacly? | App de orcamentos para autonomos',
        description: 'Entenda o que e a Zacly: uma plataforma brasileira para autonomos criarem orcamentos em PDF, enviarem pelo WhatsApp e acompanharem aprovacao.',
        priority: 0.75,
    },
    {
        path: '/contato',
        title: 'Contato Zacly | Suporte e atendimento',
        description: 'Fale com a Zacly para tirar duvidas sobre orcamentos profissionais, planos, assinatura e suporte da plataforma.',
        priority: 0.6,
    },
]

export const SEO_COMMERCIAL_PAGES: SeoCommercialPage[] = [
    {
        slug: 'app-de-orcamento',
        title: 'App de orcamento para prestadores de servico | Zacly',
        description: 'Gere orcamentos profissionais com PDF, WhatsApp, aprovacao online e pipeline simples para prestadores autonomos.',
        h1: 'App de orcamento para prestadores que querem sair do papel.',
        eyebrow: 'App de orcamento',
        intro: 'O Zacly ajuda autonomos e pequenos prestadores a criar propostas profissionais sem depender de Word, Excel, caderno ou mensagem solta.',
        keywords: ['app de orcamento', 'app para fazer orcamento', 'gerador de orcamento', 'orcamento para prestador de servico'],
        benefits: [
            'Crie orcamento com cliente, itens, prazo e total em poucos minutos.',
            'Envie pelo WhatsApp com link de aprovacao.',
            'Acompanhe cada proposta em um pipeline simples.',
        ],
        sections: [
            {
                heading: 'Feito para a rotina do autonomo',
                body: 'O objetivo nao e substituir sua forma de trabalhar por um sistema pesado. O Zacly organiza o que voce ja faz: explicar servico, mostrar valor, combinar prazo e conseguir aprovacao.',
            },
            {
                heading: 'Proposta com cara profissional',
                body: 'A apresentacao ajuda o cliente a confiar no valor do servico. No plano Pro, voce tambem remove a marca Zacly e usa sua identidade visual.',
            },
        ],
        faq: [
            {
                question: 'O Zacly e um app de orcamento gratis?',
                answer: 'Sim. O plano gratis permite comecar sem cartao, com 1 proposta simples por mes e 1 deguste Pro para comparar o visual profissional.',
            },
            {
                question: 'Preciso instalar aplicativo?',
                answer: 'Nao. O Zacly funciona pelo navegador do celular ou computador.',
            },
        ],
    },
    {
        slug: 'orcamento-pelo-whatsapp',
        title: 'Orcamento pelo WhatsApp com PDF e link de aprovacao | Zacly',
        description: 'Envie orcamentos profissionais pelo WhatsApp com mensagem pronta, PDF, link de aprovacao e acompanhamento do status.',
        h1: 'Orcamento pelo WhatsApp sem parecer improvisado.',
        eyebrow: 'WhatsApp + proposta',
        intro: 'O WhatsApp continua sendo o canal de resposta do cliente. O Zacly melhora esse momento com link de proposta, PDF e aprovacao organizada.',
        keywords: ['orcamento pelo whatsapp', 'enviar orcamento whatsapp', 'proposta pelo whatsapp', 'link de aprovacao whatsapp'],
        benefits: [
            'Mensagem de envio pronta para o cliente entender o proximo passo.',
            'Link publico para visualizar e aprovar a proposta.',
            'Menos preco solto e mais contexto para o cliente decidir.',
        ],
        sections: [
            {
                heading: 'Melhor que mandar preco solto',
                body: 'Quando o cliente recebe apenas o valor, ele compara por preco. Com uma proposta, ele enxerga escopo, prazo, condicoes e confianca.',
            },
            {
                heading: 'Aprovacao no link',
                body: 'O prestador nao aprova a propria proposta. O cliente decide pelo link e o status fica registrado no pipeline.',
            },
        ],
        faq: [
            {
                question: 'O cliente precisa baixar algum app?',
                answer: 'Nao. O cliente abre o link no navegador e pode aprovar, recusar ou pedir ajuste.',
            },
            {
                question: 'Consigo personalizar a mensagem?',
                answer: 'Sim, a personalizacao da mensagem de envio fica disponivel nos planos pagos.',
            },
        ],
    },
    {
        slug: 'orcamento-em-pdf',
        title: 'Orcamento em PDF profissional para autonomos | Zacly',
        description: 'Crie orcamentos em PDF com cliente, itens, total, prazo, condicoes e identidade visual profissional.',
        h1: 'Orcamento em PDF com aparencia profissional, sem montar documento manualmente.',
        eyebrow: 'PDF profissional',
        intro: 'O Zacly transforma as informacoes do servico em uma proposta organizada para enviar ao cliente com mais credibilidade.',
        keywords: ['orcamento em pdf', 'gerar orcamento pdf', 'orcamento profissional pdf', 'modelo de orcamento pdf'],
        benefits: [
            'PDF organizado para compartilhar com o cliente.',
            'Informacoes comerciais e escopo no mesmo documento.',
            'Planos pagos liberam PDF sem marca Zacly.',
        ],
        sections: [
            {
                heading: 'O PDF ajuda a formalizar o combinado',
                body: 'Cliente, servico, prazo, validade e total ficam organizados em um documento facil de consultar depois.',
            },
            {
                heading: 'A proposta tambem existe como link',
                body: 'Alem do PDF, o Zacly gera um link de aprovacao para o cliente decidir pelo celular.',
            },
        ],
        faq: [
            {
                question: 'O PDF do plano gratis tem marca Zacly?',
                answer: 'Sim. A proposta simples gratis pode manter marca Zacly. O deguste Pro mostra uma proposta premium, e o plano Pro remove a marca e libera mais personalizacao.',
            },
            {
                question: 'Posso baixar o PDF pelo celular?',
                answer: 'Sim. A proposta pode ser aberta e baixada pelo navegador do celular.',
            },
        ],
    },
    {
        slug: 'aprovacao-de-orcamento-online',
        title: 'Aprovacao de orcamento online por link | Zacly',
        description: 'Envie um link para o cliente aprovar, recusar ou pedir ajuste no orcamento antes de iniciar o servico.',
        h1: 'Aprovacao de orcamento online para evitar combinado perdido.',
        eyebrow: 'Aprovacao por link',
        intro: 'Com o Zacly, o cliente aprova a proposta pelo link publico. Isso deixa o processo mais confiavel para prestador e cliente.',
        keywords: ['aprovacao de orcamento online', 'aprovar proposta online', 'link de aprovacao de orcamento', 'aceite de orcamento'],
        benefits: [
            'Cliente aprova, recusa ou pede ajuste no link.',
            'Status da proposta muda automaticamente.',
            'Mais seguranca antes de comprar material ou iniciar o servico.',
        ],
        sections: [
            {
                heading: 'O aceite precisa ser claro',
                body: 'Aprovacao por mensagem pode se perder. Um link de proposta deixa mais claro qual escopo foi aprovado.',
            },
            {
                heading: 'O prestador nao aprova pelo cliente',
                body: 'A credibilidade aumenta quando a decisao fica com o cliente no link publico da proposta.',
            },
        ],
        faq: [
            {
                question: 'A aprovacao online tem validade juridica?',
                answer: 'O Zacly ajuda a registrar a decisao operacional do cliente, mas contratos e documentos juridicos devem ser avaliados com um profissional especializado.',
            },
            {
                question: 'O cliente pode pedir alteracao?',
                answer: 'Sim. O cliente pode pedir ajuste e o prestador pode editar e reenviar a proposta.',
            },
        ],
    },
    {
        slug: 'controle-de-orcamentos',
        title: 'Controle de orcamentos para prestadores | Zacly',
        description: 'Organize orcamentos enviados, aprovados, recusados e em andamento em um pipeline simples para autonomos.',
        h1: 'Controle de orcamentos simples para nao perder venda no WhatsApp.',
        eyebrow: 'Pipeline de propostas',
        intro: 'O Zacly mostra em que etapa cada proposta esta, para o autonomo nao depender de memoria, caderno ou rolagem infinita no WhatsApp.',
        keywords: ['controle de orcamentos', 'pipeline de orcamentos', 'gestao de propostas', 'organizar orcamentos'],
        benefits: [
            'Veja quais propostas foram criadas, enviadas e aprovadas.',
            'Acompanhe orcamentos que precisam de retorno.',
            'Transforme proposta aprovada em servico em andamento.',
        ],
        sections: [
            {
                heading: 'Menos oportunidade esquecida',
                body: 'Quando todos os orcamentos ficam em uma lista organizada, fica mais facil saber quem precisa receber retorno.',
            },
            {
                heading: 'Simples para quem trabalha sozinho',
                body: 'A proposta do Zacly e manter o controle leve, sem funcoes complexas que fogem da rotina do autonomo.',
            },
        ],
        faq: [
            {
                question: 'O Zacly e um CRM completo?',
                answer: 'Nao. Ele tem um controle simples de propostas e clientes, pensado para autonomos que hoje fazem tudo manualmente.',
            },
            {
                question: 'Consigo ver orcamentos aprovados?',
                answer: 'Sim. O pipeline mostra o andamento para acompanhar oportunidades aprovadas e em execucao.',
            },
        ],
    },
]

export const SEO_MODEL_PAGES: SeoModelPage[] = [
    {
        slug: 'orcamento-prestacao-de-servicos',
        title: 'Modelo de orcamento para prestacao de servicos | Zacly',
        description: 'Veja um modelo de orcamento para prestacao de servicos com cliente, escopo, itens, validade, prazo, pagamento e aceite.',
        h1: 'Modelo de orcamento para prestacao de servicos.',
        intro: 'Um bom modelo ajuda o prestador a nao esquecer informacoes importantes e passa mais confianca para o cliente.',
        useFor: 'prestadores autonomos, MEIs e pequenos servicos tecnicos',
        fields: ['Dados do cliente', 'Descricao do servico', 'Itens e quantidades', 'Valor total', 'Prazo de execucao', 'Validade da proposta', 'Forma de pagamento', 'Campo de aprovacao'],
        tips: ['Evite enviar apenas o valor final.', 'Explique o que esta incluso.', 'Defina validade para o cliente decidir.', 'Registre a aprovacao antes de iniciar.'],
    },
    {
        slug: 'orcamento-mecanica',
        title: 'Modelo de orcamento para mecanica | Zacly',
        description: 'Estrutura de orcamento para oficina mecanica com diagnostico, pecas, mao de obra, garantia e aprovacao do cliente.',
        h1: 'Modelo de orcamento para mecanica e oficina.',
        intro: 'Orcamentos de mecanica precisam separar peca, mao de obra, diagnostico e garantia para o cliente entender o valor.',
        useFor: 'mecanicos, oficinas pequenas e reparos automotivos',
        fields: ['Veiculo ou servico solicitado', 'Diagnostico', 'Pecas', 'Mao de obra', 'Garantia', 'Prazo', 'Valor total', 'Autorizacao do cliente'],
        tips: ['Separe peca de servico.', 'Inclua garantia quando existir.', 'Explique observacoes tecnicas em linguagem simples.', 'Peça aprovacao antes de comprar peca.'],
    },
    {
        slug: 'orcamento-marcenaria',
        title: 'Modelo de orcamento para marcenaria | Zacly',
        description: 'Modelo de proposta de marcenaria com medidas, materiais, ferragens, acabamento, entrega, instalacao e condicoes.',
        h1: 'Modelo de orcamento para marcenaria.',
        intro: 'Marcenaria exige clareza sobre materiais, medidas, acabamento, prazo e instalacao para reduzir retrabalho e duvidas.',
        useFor: 'marceneiros, moveis planejados, montagem e reparos',
        fields: ['Ambiente ou movel', 'Medidas principais', 'Material', 'Ferragens', 'Acabamento', 'Entrega e instalacao', 'Prazo', 'Condicoes de pagamento'],
        tips: ['Detalhe o que esta incluso na instalacao.', 'Evite prometer prazo sem validar material.', 'Use observacoes para pontos fora do escopo.', 'Deixe claro como sera a aprovacao.'],
    },
    {
        slug: 'orcamento-eletricista',
        title: 'Modelo de orcamento para eletricista | Zacly',
        description: 'Modelo de orcamento eletrico com visita, materiais, mao de obra, urgencia, prazo, validade e aprovacao.',
        h1: 'Modelo de orcamento para eletricista.',
        intro: 'Servicos eletricos precisam deixar materiais, mao de obra e condicoes bem separados para o cliente aprovar com seguranca.',
        useFor: 'eletricistas residenciais, comerciais e manutencoes eletricas',
        fields: ['Tipo de servico', 'Visita tecnica', 'Materiais', 'Mao de obra', 'Prazo', 'Validade', 'Condicoes', 'Aprovacao do cliente'],
        tips: ['Separe material de mao de obra.', 'Informe se a visita sera cobrada.', 'Inclua prazo e urgencia quando houver.', 'Registre o aceite antes de executar.'],
    },
    {
        slug: 'orcamento-pintura',
        title: 'Modelo de orcamento de pintura | Zacly',
        description: 'Modelo de orcamento para pintura residencial e comercial com ambientes, metragem, preparacao, tinta, demaos e prazo.',
        h1: 'Modelo de orcamento de pintura.',
        intro: 'Uma proposta de pintura fica mais clara quando separa ambiente, preparacao, materiais e prazo estimado.',
        useFor: 'pintores residenciais, comerciais, textura e reparos',
        fields: ['Ambientes', 'Metragem aproximada', 'Preparacao', 'Tinta ou material', 'Quantidade de demaos', 'Prazo', 'Valor total', 'Observacoes'],
        tips: ['Explique se material esta incluso.', 'Deixe claro se ha preparacao de parede.', 'Informe prazo por etapa.', 'Use fotos e observacoes quando necessario.'],
    },
    {
        slug: 'orcamento-assistencia-tecnica',
        title: 'Modelo de orcamento para assistencia tecnica | Zacly',
        description: 'Modelo para assistencia tecnica com equipamento, diagnostico, peca, mao de obra, garantia, prazo e aprovacao.',
        h1: 'Modelo de orcamento para assistencia tecnica.',
        intro: 'Assistencias tecnicas precisam separar diagnostico, peca e servico para evitar duvida sobre o que foi aprovado.',
        useFor: 'assistencias tecnicas, reparos, manutencoes e consertos',
        fields: ['Equipamento', 'Diagnostico', 'Peca necessaria', 'Mao de obra', 'Garantia', 'Prazo', 'Valor total', 'Aprovacao'],
        tips: ['Explique se o diagnostico sera cobrado.', 'Separe peca e servico.', 'Informe garantia do reparo.', 'Registre aceite antes de executar.'],
    },
]

export const SEO_GUIDE_ARTICLES: SeoGuideArticle[] = [
    {
        slug: 'como-fazer-orcamento-profissional',
        title: 'Como fazer um orcamento profissional | Guia para autonomos',
        description: 'Aprenda o que colocar em um orcamento profissional para passar confianca, evitar retrabalho e facilitar a aprovacao do cliente.',
        h1: 'Como fazer um orcamento profissional mesmo trabalhando sozinho.',
        intro: 'Um bom orcamento nao e apenas preco. Ele mostra escopo, prazo, condicoes e o que o cliente precisa decidir para o servico sair do papel.',
        readTime: '6 min',
        keywords: ['como fazer orcamento profissional', 'orcamento para autonomo', 'modelo de orcamento', 'proposta comercial simples'],
        sections: [
            {
                heading: 'Comece pelo problema do cliente',
                body: 'Antes de listar itens, deixe claro qual necessidade sera resolvida. Isso ajuda o cliente a comparar valor, nao apenas preco.',
                bullets: ['Nome do cliente', 'Servico solicitado', 'Contexto do atendimento', 'Resultado esperado'],
            },
            {
                heading: 'Separe itens, quantidades e valores',
                body: 'Um valor unico sem explicacao gera duvida. Quando itens e servicos aparecem organizados, o cliente entende melhor o investimento.',
                bullets: ['Descricao curta de cada item', 'Quantidade', 'Valor unitario', 'Total por linha'],
            },
            {
                heading: 'Defina prazo e condicoes comerciais',
                body: 'Prazo, validade e forma de pagamento reduzem mensagens de ida e volta e evitam mal entendido depois da aprovacao.',
                bullets: ['Validade da proposta', 'Prazo estimado', 'Forma de pagamento', 'O que nao esta incluso'],
            },
            {
                heading: 'Envie com um caminho claro de aprovacao',
                body: 'Depois de enviar, o cliente precisa saber exatamente onde aprovar, pedir ajuste ou tirar duvida. Um link de aprovacao torna esse passo mais simples.',
            },
        ],
        faq: [
            {
                question: 'Orcamento profissional precisa ser em PDF?',
                answer: 'Nao obrigatoriamente, mas o PDF ou link organizado transmite mais confianca do que preco solto no WhatsApp.',
            },
            {
                question: 'Posso fazer orcamento profissional pelo celular?',
                answer: 'Sim. O Zacly foi pensado para criar proposta pelo navegador do celular e enviar pelo WhatsApp.',
            },
        ],
    },
    {
        slug: 'orcamento-pelo-whatsapp',
        title: 'Orcamento pelo WhatsApp | Como enviar sem parecer improvisado',
        description: 'Veja como enviar orcamentos pelo WhatsApp com mais clareza, link de aprovacao e proposta profissional para o cliente.',
        h1: 'Como enviar orcamento pelo WhatsApp sem parecer improvisado.',
        intro: 'O WhatsApp e onde o cliente responde, mas a proposta nao precisa ser uma mensagem solta. O ideal e combinar praticidade com apresentacao profissional.',
        readTime: '5 min',
        keywords: ['orcamento pelo whatsapp', 'enviar proposta whatsapp', 'orcamento online whatsapp', 'proposta pelo whatsapp'],
        sections: [
            {
                heading: 'Evite mandar apenas o preco',
                body: 'Quando o cliente recebe apenas um valor, ele tende a comparar com outro prestador sem entender escopo, qualidade ou prazo.',
            },
            {
                heading: 'Use uma mensagem curta com link da proposta',
                body: 'A mensagem deve explicar que a proposta esta organizada e apontar o cliente para o link de visualizacao e aprovacao.',
                bullets: ['Cumprimente pelo nome', 'Informe o valor total', 'Inclua validade se existir', 'Mostre o link de aprovacao'],
            },
            {
                heading: 'Deixe o cliente aprovar no link',
                body: 'A aprovacao por link reduz risco de confusao e evita que o prestador aprove a propria proposta.',
            },
        ],
        faq: [
            {
                question: 'O cliente precisa baixar aplicativo?',
                answer: 'Nao. Ele abre o link no navegador do celular e pode aprovar por ali.',
            },
            {
                question: 'A mensagem do WhatsApp pode ser personalizada?',
                answer: 'No Zacly, a personalizacao da mensagem e recurso dos planos pagos. O plano gratis usa uma mensagem padrao.',
            },
        ],
    },
    {
        slug: 'modelo-de-orcamento-para-autonomo',
        title: 'Modelo de orcamento para autonomo | O que nao pode faltar',
        description: 'Entenda os campos essenciais de um modelo de orcamento para autonomo: cliente, escopo, itens, prazo, pagamento e aprovacao.',
        h1: 'Modelo de orcamento para autonomo: o que nao pode faltar.',
        intro: 'Quem trabalha por conta propria precisa de um modelo simples, mas completo o suficiente para passar seguranca e organizar o combinado.',
        readTime: '6 min',
        keywords: ['modelo de orcamento para autonomo', 'modelo de proposta para prestador', 'orcamento simples', 'orcamento de servico'],
        sections: [
            {
                heading: 'Dados do prestador e do cliente',
                body: 'Nome, telefone e dados comerciais basicos ajudam o cliente a reconhecer quem enviou a proposta e facilitam contato.',
            },
            {
                heading: 'Descricao do servico',
                body: 'Explique o que sera feito de forma objetiva. Detalhe etapas quando o servico for tecnico ou tiver varias partes.',
            },
            {
                heading: 'Itens e totais',
                body: 'Liste servicos, produtos, quantidades e valores. Isso evita discussao sobre o que estava ou nao incluso.',
            },
            {
                heading: 'Aprovacao e proximos passos',
                body: 'Inclua uma forma clara para o cliente aprovar e saber o que acontece depois da aprovacao.',
            },
        ],
        faq: [
            {
                question: 'Um autonomo pode usar orcamento sem CNPJ?',
                answer: 'Sim. O orcamento pode usar dados basicos do profissional. CNPJ ajuda, mas nao e obrigatorio para comecar no Zacly.',
            },
            {
                question: 'Modelo em Word ou app de orcamento?',
                answer: 'Um modelo em Word funciona, mas exige edicao manual. Um app como Zacly facilita reaproveitar clientes, itens e enviar pelo WhatsApp.',
            },
        ],
    },
    {
        slug: 'proposta-comercial-para-prestador-de-servico',
        title: 'Proposta comercial para prestador de servico | Guia simples',
        description: 'Aprenda como montar uma proposta comercial simples para prestadores de servico e aumentar a confianca do cliente.',
        h1: 'Proposta comercial para prestador de servico: simples, clara e facil de aprovar.',
        intro: 'Para servicos tecnicos e trabalhos sob demanda, a proposta precisa explicar valor, escopo e condicoes sem virar um documento complicado.',
        readTime: '7 min',
        keywords: ['proposta comercial prestador de servico', 'proposta de servico', 'orcamento comercial', 'proposta para autonomo'],
        sections: [
            {
                heading: 'Mostre o valor do trabalho',
                body: 'A proposta deve explicar o servico de forma que o cliente entenda o que esta comprando, nao apenas quanto vai pagar.',
            },
            {
                heading: 'Organize condicoes e prazo',
                body: 'Validade, pagamento, prazo estimado e observacoes finais ajudam o cliente a decidir com menos duvida.',
            },
            {
                heading: 'Use uma apresentacao consistente',
                body: 'Um visual profissional transmite mais confianca, principalmente para autonomos que ainda vendem por mensagem solta.',
            },
        ],
        faq: [
            {
                question: 'Qual a diferenca entre orcamento e proposta comercial?',
                answer: 'O orcamento costuma focar em preco. A proposta comercial tambem apresenta contexto, condicoes, beneficios e forma de aprovacao.',
            },
            {
                question: 'Zacly gera proposta comercial?',
                answer: 'Sim. O Zacly transforma itens, cliente, prazo e condicoes em uma proposta com link e PDF.',
            },
        ],
    },
]

export function getSeoGuideArticle(slug: string) {
    return SEO_GUIDE_ARTICLES.find((article) => article.slug === slug) || null
}

export function getSeoCommercialPage(slug: string) {
    return SEO_COMMERCIAL_PAGES.find((page) => page.slug === slug) || null
}

export function getSeoModelPage(slug: string) {
    return SEO_MODEL_PAGES.find((page) => page.slug === slug) || null
}

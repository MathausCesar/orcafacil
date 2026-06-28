export const PROFESSIONAL_CONTEXTS = [
    {
        id: 'general',
        name: 'Geral',
        shortName: 'Geral',
        description: 'Serve para qualquer prestador de servico.',
        defaultEstimatedDays: 3,
        suggestedPaymentMethods: ['pix'],
        defaultNotes: 'Escopo valido conforme itens descritos. Materiais extras ou servicos fora do combinado serao orcados separadamente.',
        proposalBullets: [
            'Escopo conforme itens descritos nesta proposta.',
            'Ajustes fora do combinado podem alterar prazo e valor.',
            'Inicio do servico apos aprovacao e combinacao de agenda.',
        ],
    },
    {
        id: 'mechanic',
        name: 'Mecanica automotiva',
        shortName: 'Mecanica',
        description: 'Reparo, manutencao, diagnostico e pecas automotivas.',
        defaultEstimatedDays: 2,
        suggestedPaymentMethods: ['pix', 'card'],
        defaultNotes: 'Pecas e servicos seguem o escopo informado. Caso surjam falhas adicionais durante a desmontagem ou diagnostico, um novo ajuste sera apresentado antes da execucao.',
        proposalBullets: [
            'Diagnostico e reparo conforme sintomas e itens aprovados.',
            'Pecas adicionais so entram no servico com autorizacao do cliente.',
            'Garantia aplicada sobre a mao de obra executada e pecas fornecidas, conforme condicoes informadas.',
        ],
    },
    {
        id: 'woodworker',
        name: 'Marcenaria',
        shortName: 'Marcenaria',
        description: 'Moveis sob medida, instalacao, ajustes e acabamento.',
        defaultEstimatedDays: 15,
        suggestedPaymentMethods: ['pix', 'installment'],
        defaultNotes: 'Medidas, materiais, ferragens e acabamento seguem o escopo aprovado. Alteracoes de projeto, medidas ou padrao de material podem alterar prazo e valor.',
        proposalBullets: [
            'Projeto, medidas e acabamento conforme escopo combinado.',
            'Materiais e ferragens incluidos apenas quando descritos nos itens.',
            'Instalacao sujeita a agenda e condicoes do local no dia combinado.',
        ],
    },
    {
        id: 'electrician',
        name: 'Eletrica',
        shortName: 'Eletrica',
        description: 'Instalacao, manutencao, quadro, tomadas e pontos eletricos.',
        defaultEstimatedDays: 3,
        suggestedPaymentMethods: ['pix', 'cash'],
        defaultNotes: 'Servico eletrico executado conforme pontos e materiais descritos. Adequacoes fora do escopo, necessidade de quebra, passagem extra ou troca de componentes serao combinadas antes da execucao.',
        proposalBullets: [
            'Execucao conforme pontos eletricos e materiais descritos.',
            'Adequacoes nao previstas serao alinhadas antes de qualquer cobranca extra.',
            'Recomendado manter acesso ao quadro e aos ambientes no dia do servico.',
        ],
    },
    {
        id: 'painter',
        name: 'Pintura',
        shortName: 'Pintura',
        description: 'Pintura residencial, comercial, acabamento e reparos.',
        defaultEstimatedDays: 5,
        suggestedPaymentMethods: ['pix', 'cash'],
        defaultNotes: 'Preparacao, quantidade de demaos e tinta seguem o combinado. Reparos de parede, massa, umidade ou materiais extras podem alterar o valor final se nao estiverem descritos.',
        proposalBullets: [
            'Pintura conforme areas, preparo e demaos informadas.',
            'Cor, tinta e acabamento devem ser confirmados antes do inicio.',
            'Reparos estruturais ou umidade nao inclusos precisam de novo alinhamento.',
        ],
    },
    {
        id: 'construction',
        name: 'Obra e reparos',
        shortName: 'Obra',
        description: 'Pedreiro, reforma, reparos, instalacoes e acabamento.',
        defaultEstimatedDays: 7,
        suggestedPaymentMethods: ['pix', 'installment'],
        defaultNotes: 'Prazo e valor consideram o escopo descrito e condicoes normais do local. Servicos extras, materiais adicionais ou alteracoes durante a obra serao orcados separadamente.',
        proposalBullets: [
            'Mao de obra e materiais incluidos apenas quando descritos nos itens.',
            'Alteracoes durante a execucao podem alterar prazo e valor.',
            'O local precisa estar liberado para execucao na data combinada.',
        ],
    },
    {
        id: 'hvac',
        name: 'Ar condicionado',
        shortName: 'Ar condicionado',
        description: 'Instalacao, higienizacao e manutencao de climatizacao.',
        defaultEstimatedDays: 3,
        suggestedPaymentMethods: ['pix', 'card'],
        defaultNotes: 'Instalacao ou manutencao considera acesso adequado ao equipamento e distancia informada. Tubulacao, suportes, carga de gas ou pecas extras so entram se descritos nos itens.',
        proposalBullets: [
            'Servico conforme equipamento, acesso e distancia informados.',
            'Pecas, gas, suportes ou tubulacao extra precisam estar descritos.',
            'Garantia condicionada ao uso correto e condicoes do equipamento.',
        ],
    },
    {
        id: 'tech',
        name: 'Tecnologia e suporte',
        shortName: 'Tecnologia',
        description: 'Informatica, rede, suporte tecnico e equipamentos.',
        defaultEstimatedDays: 2,
        suggestedPaymentMethods: ['pix', 'card'],
        defaultNotes: 'Atendimento tecnico conforme escopo informado. Pecas, licencas, deslocamentos ou configuracoes extras serao validados antes da execucao.',
        proposalBullets: [
            'Servico tecnico conforme escopo e equipamento informado.',
            'Licencas, pecas e acessos devem ser confirmados pelo cliente.',
            'Configuracoes adicionais podem exigir novo prazo ou valor.',
        ],
    },
    {
        id: 'design',
        name: 'Comunicacao visual',
        shortName: 'Comunicacao visual',
        description: 'Fachadas, adesivos, impressos, letreiros e identidade visual.',
        defaultEstimatedDays: 7,
        suggestedPaymentMethods: ['pix', 'installment'],
        defaultNotes: 'Arte, medidas, materiais e acabamento seguem o escopo aprovado. Provas, alteracoes de arte, instalacao ou material diferente podem alterar prazo e valor.',
        proposalBullets: [
            'Producao conforme arte, medidas e material aprovados.',
            'Alteracoes apos aprovacao podem impactar prazo e custo.',
            'Instalacao depende de acesso e condicoes do local.',
        ],
    },
    {
        id: 'food',
        name: 'Alimentos e eventos',
        shortName: 'Eventos',
        description: 'Confeitaria, salgados, buffet e servicos para eventos.',
        defaultEstimatedDays: 5,
        suggestedPaymentMethods: ['pix'],
        defaultNotes: 'Pedido produzido conforme quantidade, data e itens aprovados. Mudancas de quantidade, entrega, sabores ou horario precisam ser combinadas com antecedencia.',
        proposalBullets: [
            'Quantidade, sabores e data seguem o combinado nesta proposta.',
            'Alteracoes precisam respeitar prazo minimo de preparo.',
            'Entrega e montagem inclusas apenas quando descritas nos itens.',
        ],
    },
    {
        id: 'beauty',
        name: 'Beleza e estetica',
        shortName: 'Beleza',
        description: 'Atendimentos de beleza, estetica, cabelo, barba e unhas.',
        defaultEstimatedDays: 1,
        suggestedPaymentMethods: ['pix', 'cash', 'card'],
        defaultNotes: 'Atendimento realizado conforme servicos aprovados. Procedimentos extras, produtos especiais ou deslocamento fora do combinado serao cobrados separadamente.',
        proposalBullets: [
            'Servico executado conforme procedimento e horario combinados.',
            'Produtos especiais entram no valor apenas quando descritos.',
            'Reagendamento deve ser combinado com antecedencia.',
        ],
    },
] as const

export type ProfessionalContextId = typeof PROFESSIONAL_CONTEXTS[number]['id']
export type ProfessionalContext = typeof PROFESSIONAL_CONTEXTS[number]

export function normalizeProfessionalContext(value: string | null | undefined): ProfessionalContextId {
    return PROFESSIONAL_CONTEXTS.some((context) => context.id === value)
        ? value as ProfessionalContextId
        : 'general'
}

export function getProfessionalContext(value: string | null | undefined): ProfessionalContext {
    const normalized = normalizeProfessionalContext(value)
    return PROFESSIONAL_CONTEXTS.find((context) => context.id === normalized) || PROFESSIONAL_CONTEXTS[0]
}

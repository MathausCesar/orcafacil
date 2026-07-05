import {
    ProfessionalContextId,
    normalizeProfessionalContext,
} from '@/lib/professional-context'
import { normalizeProposalModel, type ProposalModelId } from '@/lib/proposal-style'
import { getLayoutRecommendationForContext } from '@/lib/profession-layout-recommendations'

export type OnboardingPricingTier = 'autonomous' | 'standard' | 'premium'

export type OnboardingSpecialty = {
    label: string
    value: string
    professionalContext?: ProfessionalContextId
}

export type OnboardingQuoteSettings = {
    categoryId: string
    categorySlug: string
    categoryName: string
    specialties: string[]
    pricingTier: OnboardingPricingTier
    professionalContext: ProfessionalContextId
    recommendedLayout: ProposalModelId
    recommendedLayoutReason: string
    completedAt: string
}

export type QuoteSettingsWithOnboarding = {
    onboarding?: Partial<OnboardingQuoteSettings>
}

export const ONBOARDING_SPECIALTIES_BY_CATEGORY: Record<string, OnboardingSpecialty[]> = {
    auto: [
        { label: 'Mecanica Geral', value: 'mecanica_geral', professionalContext: 'mechanic' },
        { label: 'Auto Eletrica', value: 'eletrica', professionalContext: 'electrician' },
        { label: 'Funilaria e Pintura', value: 'funilaria', professionalContext: 'mechanic' },
        { label: 'Estetica Automotiva', value: 'estetica', professionalContext: 'mechanic' },
        { label: 'Suspensao e Freios', value: 'freios', professionalContext: 'mechanic' },
        { label: 'Som e Acessorios', value: 'som', professionalContext: 'mechanic' },
    ],
    construction: [
        { label: 'Pedreiro / Alvenaria', value: 'pedreiro', professionalContext: 'construction' },
        { label: 'Pintura e Acabamento', value: 'pintor', professionalContext: 'painter' },
        { label: 'Marceneiro / Moveis Planejados', value: 'marceneiro', professionalContext: 'woodworker' },
        { label: 'Encanador / Hidraulica', value: 'encanador', professionalContext: 'construction' },
        { label: 'Marido de Aluguel', value: 'marido_aluguel', professionalContext: 'construction' },
        { label: 'Gesso e Drywall', value: 'gesso', professionalContext: 'construction' },
        { label: 'Telhados e Coberturas', value: 'telhado', professionalContext: 'construction' },
    ],
    tech: [
        { label: 'Eletricista Residencial', value: 'eletricista', professionalContext: 'electrician' },
        { label: 'Ar Condicionado', value: 'ar_condicionado', professionalContext: 'hvac' },
        { label: 'Informatica / TI', value: 'ti', professionalContext: 'tech' },
        { label: 'Seguranca Eletronica', value: 'seguranca', professionalContext: 'tech' },
    ],
    beauty: [
        { label: 'Cabeleireiro(a)', value: 'cabelo', professionalContext: 'beauty' },
        { label: 'Barbearia', value: 'barbearia', professionalContext: 'beauty' },
        { label: 'Manicure / Pedicure', value: 'unhas', professionalContext: 'beauty' },
        { label: 'Estetica Facial/Corporal', value: 'estetica', professionalContext: 'beauty' },
    ],
    education: [
        { label: 'Professor Particular', value: 'professor', professionalContext: 'general' },
        { label: 'Personal Trainer', value: 'personal', professionalContext: 'general' },
        { label: 'Consultoria', value: 'consultoria', professionalContext: 'general' },
    ],
    food: [
        { label: 'Salgados e Doces', value: 'salgados', professionalContext: 'food' },
        { label: 'Confeitaria', value: 'confeitaria', professionalContext: 'food' },
        { label: 'Buffet Completo', value: 'buffet', professionalContext: 'food' },
        { label: 'Servicos Extras', value: 'servicos', professionalContext: 'food' },
        { label: 'Decoracao de Eventos', value: 'decoracao', professionalContext: 'food' },
    ],
    design: [
        { label: 'Fachadas e Letreiros', value: 'fachadas', professionalContext: 'design' },
        { label: 'Adesivos e Envelopamento', value: 'adesivos', professionalContext: 'design' },
        { label: 'Placas e ACM', value: 'acm', professionalContext: 'design' },
        { label: 'Letras Caixa e Luminosos', value: 'letreiros', professionalContext: 'design' },
        { label: 'Banners e Impressao Digital', value: 'banners', professionalContext: 'design' },
        { label: 'Identidade Visual e Logotipos', value: 'identidade_visual', professionalContext: 'design' },
        { label: 'Artes Digitais e Redes Sociais', value: 'digital', professionalContext: 'design' },
        { label: 'Sinalizacao e Totens', value: 'sinalizacao', professionalContext: 'design' },
        { label: 'Envelopamento de Frotas', value: 'frotas', professionalContext: 'design' },
        { label: 'Impressos', value: 'impressos', professionalContext: 'design' },
    ],
    outros: [
        { label: 'Servicos Gerais', value: 'geral', professionalContext: 'general' },
        { label: 'Consultoria Especializada', value: 'consultoria_especializada', professionalContext: 'general' },
        { label: 'Atendimento ou Suporte', value: 'atendimento', professionalContext: 'general' },
        { label: 'Outras Especialidades', value: 'outras_especialidades', professionalContext: 'general' },
    ],
}

export const PRICING_TIER_COPY: Record<OnboardingPricingTier, {
    title: string
    description: string
    shortLabel: string
}> = {
    autonomous: {
        title: 'Preco competitivo',
        description: 'Quero comecar com valores mais acessiveis para fechar os primeiros servicos.',
        shortLabel: 'Competitivo',
    },
    standard: {
        title: 'Preco de mercado',
        description: 'Quero uma base equilibrada para cobrar de forma simples e profissional.',
        shortLabel: 'Mercado',
    },
    premium: {
        title: 'Servico premium',
        description: 'Tenho entrega mais completa e quero sugerir valores mais altos.',
        shortLabel: 'Premium',
    },
}

type CatalogSeedItem = {
    name: string
    price: number
    unit: string
    details: string
}

type CatalogSeedPreset = {
    services: CatalogSeedItem[]
    products: CatalogSeedItem[]
}

export type InitialCatalogItem = CatalogSeedItem & {
    type: 'service' | 'product'
}

const MAX_INITIAL_SERVICES = 12
const MAX_INITIAL_PRODUCTS = 8

const ONBOARDING_CATALOG_PRESETS: Record<string, CatalogSeedPreset> = {
    'auto:mecanica_geral': {
        services: [
            { name: 'Troca de oleo e filtro', price: 90, unit: 'servico', details: 'Mao de obra para substituicao de oleo e filtro, com verificacao visual de vazamentos.' },
            { name: 'Diagnostico mecanico inicial', price: 120, unit: 'servico', details: 'Avaliacao de ruidos, falhas, vazamentos e condicoes gerais antes do orcamento final.' },
            { name: 'Limpeza de bicos injetores', price: 180, unit: 'servico', details: 'Limpeza e teste dos bicos para melhorar consumo, marcha lenta e desempenho.' },
            { name: 'Troca de correia ou componente auxiliar', price: 220, unit: 'servico', details: 'Substituicao de correia, tensor ou componente auxiliar conforme avaliacao.' },
            { name: 'Revisao preventiva basica', price: 260, unit: 'servico', details: 'Checklist de filtros, fluidos, freios, arrefecimento e itens de seguranca.' },
        ],
        products: [
            { name: 'Oleo motor', price: 60, unit: 'litro', details: 'Oleo lubrificante conforme especificacao do veiculo.' },
            { name: 'Filtro de oleo', price: 40, unit: 'un', details: 'Filtro compativel com o modelo do veiculo.' },
            { name: 'Filtro de ar', price: 45, unit: 'un', details: 'Filtro de admissao para manutencao preventiva.' },
            { name: 'Aditivo de radiador', price: 38, unit: 'litro', details: 'Fluido para sistema de arrefecimento.' },
        ],
    },
    'auto:eletrica': {
        services: [
            { name: 'Diagnostico eletrico automotivo', price: 130, unit: 'servico', details: 'Teste de bateria, alternador, chicote, fusivel e falhas eletricas aparentes.' },
            { name: 'Instalacao de bateria', price: 70, unit: 'servico', details: 'Substituicao, fixacao e teste de carga da bateria.' },
            { name: 'Reparo de chicote ou conector', price: 180, unit: 'servico', details: 'Identificacao e reparo de fio, conector ou ponto de mau contato.' },
            { name: 'Instalacao de acessorio eletrico', price: 160, unit: 'servico', details: 'Instalacao de alarme, trava, sensor ou acessorio conforme compatibilidade.' },
        ],
        products: [
            { name: 'Bateria automotiva', price: 420, unit: 'un', details: 'Bateria conforme amperagem e aplicacao do veiculo.' },
            { name: 'Fusivel automotivo', price: 8, unit: 'un', details: 'Fusivel para reposicao em circuito eletrico automotivo.' },
            { name: 'Terminal de bateria', price: 25, unit: 'par', details: 'Terminais para conexao segura nos polos da bateria.' },
        ],
    },
    'auto:funilaria': {
        services: [
            { name: 'Reparo de amassado pequeno', price: 350, unit: 'peca', details: 'Correcao de amassado simples com preparo para acabamento.' },
            { name: 'Pintura de peca automotiva', price: 420, unit: 'peca', details: 'Pintura e acabamento de uma peca conforme cor e condicao do veiculo.' },
            { name: 'Retoque localizado', price: 180, unit: 'servico', details: 'Retoque em risco ou ponto localizado, quando tecnicamente viavel.' },
            { name: 'Polimento pos-pintura', price: 220, unit: 'servico', details: 'Acabamento e brilho apos reparo ou pintura.' },
        ],
        products: [
            { name: 'Massa plastica automotiva', price: 38, unit: 'un', details: 'Material para nivelamento de pequenos reparos.' },
            { name: 'Primer automotivo', price: 55, unit: 'un', details: 'Primer para preparacao antes da pintura.' },
            { name: 'Lixa automotiva', price: 18, unit: 'folha', details: 'Lixa para preparo e acabamento.' },
        ],
    },
    'auto:estetica': {
        services: [
            { name: 'Lavagem detalhada', price: 120, unit: 'servico', details: 'Lavagem interna e externa com limpeza de detalhes e acabamento.' },
            { name: 'Polimento tecnico', price: 380, unit: 'servico', details: 'Correcao de marcas superficiais e recuperacao de brilho da pintura.' },
            { name: 'Higienizacao interna', price: 260, unit: 'servico', details: 'Limpeza profunda de bancos, carpetes, painel e acabamentos internos.' },
            { name: 'Vitrificacao ou protecao de pintura', price: 650, unit: 'servico', details: 'Aplicacao de protecao conforme preparacao e produto escolhido.' },
        ],
        products: [
            { name: 'Cera automotiva', price: 65, unit: 'un', details: 'Produto para protecao e brilho da pintura.' },
            { name: 'Produto para higienizacao interna', price: 45, unit: 'un', details: 'Produto de limpeza para bancos, painel ou carpetes.' },
            { name: 'Boina de polimento', price: 55, unit: 'un', details: 'Boina para etapa de corte, refino ou lustro.' },
        ],
    },
    'auto:freios': {
        services: [
            { name: 'Troca de pastilhas de freio', price: 160, unit: 'eixo', details: 'Mao de obra para substituicao de pastilhas e verificacao do sistema.' },
            { name: 'Sangria do sistema de freio', price: 140, unit: 'servico', details: 'Substituicao parcial do fluido e retirada de ar do sistema.' },
            { name: 'Revisao de suspensao', price: 160, unit: 'servico', details: 'Avaliacao de buchas, amortecedores, bandejas e terminais.' },
            { name: 'Troca de amortecedor', price: 260, unit: 'par', details: 'Mao de obra para substituicao de amortecedores conforme eixo.' },
        ],
        products: [
            { name: 'Jogo de pastilhas de freio', price: 150, unit: 'jogo', details: 'Pastilhas compativeis com o veiculo.' },
            { name: 'Fluido de freio DOT4', price: 35, unit: 'frasco', details: 'Fluido para manutencao do sistema de freios.' },
            { name: 'Amortecedor', price: 280, unit: 'un', details: 'Peca conforme modelo e aplicacao.' },
        ],
    },
    'auto:som': {
        services: [
            { name: 'Instalacao de central multimidia', price: 220, unit: 'servico', details: 'Instalacao, fixacao, ligacao e teste de central multimidia.' },
            { name: 'Instalacao de alto-falantes', price: 160, unit: 'par', details: 'Instalacao e teste de alto-falantes em portas ou tampao.' },
            { name: 'Instalacao de modulo amplificador', price: 260, unit: 'servico', details: 'Passagem de cabo, aterramento e regulagem basica do modulo.' },
            { name: 'Revisao de som automotivo', price: 120, unit: 'servico', details: 'Diagnostico de ruido, falha de ligacao, fusivel ou configuracao.' },
        ],
        products: [
            { name: 'Kit de cabos para som', price: 90, unit: 'kit', details: 'Cabos e conexoes para instalacao de som automotivo.' },
            { name: 'Alto-falante automotivo', price: 180, unit: 'par', details: 'Par de alto-falantes conforme medida do veiculo.' },
            { name: 'Fusivel para som', price: 18, unit: 'un', details: 'Fusivel de protecao para sistema de som.' },
        ],
    },
    'construction:pedreiro': {
        services: [
            { name: 'Reboco de parede', price: 45, unit: 'm2', details: 'Aplicacao de argamassa e regularizacao de parede.' },
            { name: 'Assentamento de piso ceramico', price: 58, unit: 'm2', details: 'Assentamento com alinhamento, nivelamento e acabamento simples.' },
            { name: 'Contrapiso', price: 55, unit: 'm2', details: 'Execucao de base nivelada para receber revestimento.' },
            { name: 'Pequena alvenaria', price: 380, unit: 'diaria', details: 'Execucao de parede, fechamento ou reparo de alvenaria de baixa complexidade.' },
            { name: 'Diaria de pedreiro', price: 380, unit: 'dia', details: 'Mao de obra diaria para servicos combinados em obra ou reforma.' },
        ],
        products: [
            { name: 'Cimento 50kg', price: 42, unit: 'saco', details: 'Cimento para massa, contrapiso ou reparo.' },
            { name: 'Argamassa 20kg', price: 34, unit: 'saco', details: 'Argamassa para assentamento de revestimentos.' },
            { name: 'Areia media', price: 150, unit: 'm3', details: 'Areia para preparo de massa.' },
        ],
    },
    'construction:pintor': {
        services: [
            { name: 'Pintura de parede', price: 32, unit: 'm2', details: 'Aplicacao de tinta em parede interna ou externa conforme combinacao.' },
            { name: 'Aplicacao de massa corrida', price: 28, unit: 'm2', details: 'Preparacao de parede com massa e lixamento basico.' },
            { name: 'Pintura de portas ou grades', price: 180, unit: 'un', details: 'Pintura com esmalte ou produto adequado ao material.' },
            { name: 'Textura ou grafiato', price: 45, unit: 'm2', details: 'Aplicacao de textura decorativa conforme acabamento escolhido.' },
        ],
        products: [
            { name: 'Tinta latex 18L', price: 320, unit: 'lata', details: 'Tinta para pintura de parede.' },
            { name: 'Massa corrida 25kg', price: 95, unit: 'barrica', details: 'Massa para regularizacao de paredes internas.' },
            { name: 'Lixa para parede', price: 4, unit: 'un', details: 'Lixa para preparo entre demaos.' },
            { name: 'Fita crepe', price: 18, unit: 'un', details: 'Fita para isolamento e acabamento.' },
        ],
    },
    'construction:marceneiro': {
        services: [
            { name: 'Projeto e montagem de movel planejado', price: 850, unit: 'projeto', details: 'Medicao, planejamento, montagem e ajuste de movel sob medida.' },
            { name: 'Montagem de armario ou gabinete', price: 380, unit: 'servico', details: 'Montagem, alinhamento de portas e regulagem de ferragens.' },
            { name: 'Reparo em porta ou dobradica', price: 160, unit: 'servico', details: 'Ajuste, troca ou reforco de dobradicas, portas e puxadores.' },
            { name: 'Instalacao de painel ou prateleira', price: 220, unit: 'servico', details: 'Fixacao nivelada de painel, nicho ou prateleira em local adequado.' },
            { name: 'Corte e acabamento de MDF', price: 120, unit: 'peca', details: 'Corte, fita de borda e acabamento simples de peca em MDF.' },
        ],
        products: [
            { name: 'Chapa MDF', price: 240, unit: 'un', details: 'Chapa de MDF conforme cor e espessura escolhida.' },
            { name: 'Dobradica caneco', price: 18, unit: 'un', details: 'Dobradica para porta de armario.' },
            { name: 'Corredica telescopica', price: 45, unit: 'par', details: 'Corredica para gaveta.' },
            { name: 'Fita de borda', price: 12, unit: 'metro', details: 'Acabamento para bordas de MDF.' },
        ],
    },
    'construction:encanador': {
        services: [
            { name: 'Reparo de vazamento', price: 180, unit: 'servico', details: 'Identificacao e correcao de vazamento aparente em ponto hidraulico.' },
            { name: 'Troca de torneira ou sifao', price: 120, unit: 'servico', details: 'Substituicao e teste de vedacao de torneira, sifao ou flexivel.' },
            { name: 'Desentupimento simples', price: 180, unit: 'servico', details: 'Desobstrucao de pia, ralo ou ponto simples sem quebra.' },
            { name: 'Instalacao de ponto hidraulico', price: 260, unit: 'ponto', details: 'Criacao ou alteracao de ponto de agua ou esgoto conforme local.' },
        ],
        products: [
            { name: 'Cano PVC', price: 12, unit: 'metro', details: 'Tubo PVC conforme bitola usada no servico.' },
            { name: 'Conexao PVC', price: 9, unit: 'un', details: 'Joelho, luva, tee ou conexao conforme necessidade.' },
            { name: 'Veda rosca', price: 8, unit: 'un', details: 'Material para vedacao de roscas.' },
            { name: 'Registro ou valvula', price: 55, unit: 'un', details: 'Peca hidraulica para reposicao.' },
        ],
    },
    'construction:marido_aluguel': {
        services: [
            { name: 'Pacote de pequenos reparos', price: 220, unit: 'servico', details: 'Conjunto de ajustes simples combinados em uma visita.' },
            { name: 'Instalacao de suporte ou prateleira', price: 120, unit: 'servico', details: 'Fixacao de suporte, nicho, quadro ou prateleira.' },
            { name: 'Troca de fechadura', price: 140, unit: 'servico', details: 'Substituicao ou ajuste de fechadura, puxador ou dobradica.' },
            { name: 'Montagem de movel simples', price: 180, unit: 'servico', details: 'Montagem de movel comprado pronto com regulagem basica.' },
        ],
        products: [
            { name: 'Kit buchas e parafusos', price: 28, unit: 'kit', details: 'Insumos para fixacoes comuns.' },
            { name: 'Silicone ou vedante', price: 32, unit: 'un', details: 'Vedante para acabamento e pequenos reparos.' },
            { name: 'Fechadura simples', price: 85, unit: 'un', details: 'Fechadura para porta interna ou externa conforme modelo.' },
        ],
    },
    'construction:gesso': {
        services: [
            { name: 'Forro de drywall', price: 95, unit: 'm2', details: 'Instalacao de forro com estrutura, placas e acabamento basico.' },
            { name: 'Parede de drywall', price: 120, unit: 'm2', details: 'Montagem de parede com estrutura metalica e fechamento.' },
            { name: 'Reparo em gesso ou drywall', price: 180, unit: 'servico', details: 'Correcao de trinca, furo, placa solta ou ponto danificado.' },
            { name: 'Sanca ou moldura de gesso', price: 55, unit: 'metro', details: 'Instalacao de acabamento decorativo conforme medida.' },
        ],
        products: [
            { name: 'Placa de drywall', price: 58, unit: 'un', details: 'Placa para parede ou forro.' },
            { name: 'Perfil metalico', price: 18, unit: 'metro', details: 'Perfil para estrutura de drywall.' },
            { name: 'Massa para tratamento de juntas', price: 42, unit: 'saco', details: 'Massa para acabamento e reparos.' },
        ],
    },
    'construction:telhado': {
        services: [
            { name: 'Reparo em telhado', price: 360, unit: 'servico', details: 'Revisao e correcao pontual em telhas, rufos ou vedacoes.' },
            { name: 'Troca de telhas', price: 24, unit: 'un', details: 'Remocao e substituicao de telha quebrada ou deslocada.' },
            { name: 'Limpeza de calhas', price: 190, unit: 'servico', details: 'Limpeza e desobstrucao de calhas e pontos de escoamento.' },
            { name: 'Impermeabilizacao de cobertura', price: 75, unit: 'm2', details: 'Aplicacao de solucao impermeabilizante conforme area.' },
        ],
        products: [
            { name: 'Telha', price: 8, unit: 'un', details: 'Telha para substituicao pontual.' },
            { name: 'Manta impermeabilizante', price: 95, unit: 'rolo', details: 'Material para vedacao e impermeabilizacao.' },
            { name: 'Parafuso ou fixador para telha', price: 2, unit: 'un', details: 'Fixador para telhas e acabamentos.' },
        ],
    },
    'tech:eletricista': {
        services: [
            { name: 'Instalacao de tomada ou interruptor', price: 80, unit: 'ponto', details: 'Instalacao ou substituicao com teste de funcionamento.' },
            { name: 'Troca de disjuntor', price: 90, unit: 'un', details: 'Substituicao de disjuntor compativel com o circuito.' },
            { name: 'Instalacao de chuveiro eletrico', price: 140, unit: 'servico', details: 'Instalacao, conexao e teste eletrico do chuveiro.' },
            { name: 'Passagem de novo ponto eletrico', price: 180, unit: 'ponto', details: 'Passagem de fio e montagem de ponto conforme carga e local.' },
            { name: 'Revisao de quadro eletrico', price: 260, unit: 'servico', details: 'Avaliacao de disjuntores, conexoes, aquecimento e organizacao basica.' },
        ],
        products: [
            { name: 'Tomada completa', price: 24, unit: 'un', details: 'Tomada com modulo e espelho.' },
            { name: 'Disjuntor', price: 45, unit: 'un', details: 'Disjuntor conforme amperagem do circuito.' },
            { name: 'Fio eletrico 2,5mm', price: 5, unit: 'metro', details: 'Condutor para circuitos comuns.' },
            { name: 'Conector eletrico', price: 8, unit: 'un', details: 'Conector para emenda segura.' },
        ],
    },
    'tech:ar_condicionado': {
        services: [
            { name: 'Instalacao de ar condicionado split', price: 650, unit: 'servico', details: 'Instalacao com suporte, tubulacao basica, vacuo e teste.' },
            { name: 'Higienizacao de ar condicionado', price: 220, unit: 'un', details: 'Limpeza de evaporadora com produto adequado e teste final.' },
            { name: 'Manutencao preventiva de split', price: 280, unit: 'un', details: 'Limpeza, verificacao de dreno, conexoes e funcionamento.' },
            { name: 'Carga de gas refrigerante', price: 320, unit: 'servico', details: 'Verificacao de vazamento aparente e recarga conforme necessidade.' },
        ],
        products: [
            { name: 'Tubulacao de cobre', price: 85, unit: 'metro', details: 'Tubulacao para instalacao de split.' },
            { name: 'Suporte para condensadora', price: 120, unit: 'par', details: 'Suporte para unidade externa.' },
            { name: 'Gas refrigerante', price: 160, unit: 'kg', details: 'Gas conforme especificacao do equipamento.' },
        ],
    },
    'tech:ti': {
        services: [
            { name: 'Formatacao de computador', price: 180, unit: 'servico', details: 'Backup simples, instalacao de sistema e configuracao inicial.' },
            { name: 'Manutencao preventiva de computador', price: 160, unit: 'servico', details: 'Limpeza fisica, verificacao de desempenho e ajustes basicos.' },
            { name: 'Configuracao de rede Wi-Fi', price: 140, unit: 'servico', details: 'Configuracao de roteador, senha, rede visitante e testes.' },
            { name: 'Instalacao de SSD ou memoria', price: 120, unit: 'servico', details: 'Instalacao de componente e teste de funcionamento.' },
        ],
        products: [
            { name: 'SSD', price: 220, unit: 'un', details: 'Unidade de armazenamento para upgrade.' },
            { name: 'Memoria RAM', price: 180, unit: 'un', details: 'Modulo de memoria conforme compatibilidade.' },
            { name: 'Roteador Wi-Fi', price: 220, unit: 'un', details: 'Roteador para rede residencial ou pequena empresa.' },
        ],
    },
    'tech:seguranca': {
        services: [
            { name: 'Instalacao de camera de seguranca', price: 180, unit: 'ponto', details: 'Fixacao, passagem basica de cabo, direcionamento e teste.' },
            { name: 'Configuracao de DVR ou NVR', price: 240, unit: 'servico', details: 'Configuracao de gravador, acesso remoto e usuarios.' },
            { name: 'Instalacao de interfone', price: 220, unit: 'servico', details: 'Instalacao ou substituicao de interfone residencial ou comercial.' },
            { name: 'Manutencao de sistema de seguranca', price: 190, unit: 'servico', details: 'Revisao de cameras, cabos, fontes e conectores.' },
        ],
        products: [
            { name: 'Camera de seguranca', price: 180, unit: 'un', details: 'Camera para monitoramento.' },
            { name: 'Cabo CFTV', price: 4, unit: 'metro', details: 'Cabo para instalacao de camera.' },
            { name: 'Fonte 12V', price: 45, unit: 'un', details: 'Fonte para camera ou acessorio.' },
            { name: 'Conector CFTV', price: 8, unit: 'un', details: 'Conector para acabamento da instalacao.' },
        ],
    },
    'beauty:cabelo': {
        services: [
            { name: 'Corte feminino', price: 70, unit: 'servico', details: 'Corte, acabamento e orientacao de manutencao.' },
            { name: 'Escova ou finalizacao', price: 60, unit: 'servico', details: 'Escova, modelagem e finalizacao conforme cabelo.' },
            { name: 'Coloracao de cabelo', price: 180, unit: 'servico', details: 'Aplicacao de coloracao conforme avaliacao e comprimento.' },
            { name: 'Hidratacao capilar', price: 90, unit: 'servico', details: 'Tratamento para reposicao e brilho dos fios.' },
        ],
        products: [
            { name: 'Tintura capilar', price: 55, unit: 'un', details: 'Coloracao conforme tom escolhido.' },
            { name: 'Mascara de hidratacao', price: 65, unit: 'un', details: 'Produto para tratamento capilar.' },
            { name: 'Finalizador capilar', price: 45, unit: 'un', details: 'Produto para acabamento.' },
        ],
    },
    'beauty:barbearia': {
        services: [
            { name: 'Corte masculino', price: 45, unit: 'servico', details: 'Corte na maquina ou tesoura com acabamento.' },
            { name: 'Barba completa', price: 40, unit: 'servico', details: 'Barba com toalha quente, navalha e finalizacao.' },
            { name: 'Corte e barba', price: 80, unit: 'combo', details: 'Pacote de corte masculino e barba.' },
            { name: 'Pezinho ou acabamento', price: 20, unit: 'servico', details: 'Acabamento de nuca, costeleta e contorno.' },
        ],
        products: [
            { name: 'Pomada modeladora', price: 35, unit: 'un', details: 'Produto para finalizacao.' },
            { name: 'Locao pos-barba', price: 28, unit: 'un', details: 'Produto calmante pos-barba.' },
            { name: 'Lamina descartavel', price: 4, unit: 'un', details: 'Lamina para atendimento individual.' },
        ],
    },
    'beauty:unhas': {
        services: [
            { name: 'Manicure', price: 35, unit: 'servico', details: 'Cutilagem, lixamento e esmaltacao simples.' },
            { name: 'Pedicure', price: 40, unit: 'servico', details: 'Cuidado dos pes com lixamento, cutilagem e esmaltacao.' },
            { name: 'Manicure e pedicure', price: 70, unit: 'combo', details: 'Pacote completo de maos e pes.' },
            { name: 'Esmaltacao em gel', price: 70, unit: 'servico', details: 'Aplicacao de esmalte em gel conforme tecnica.' },
        ],
        products: [
            { name: 'Esmalte', price: 12, unit: 'un', details: 'Esmalte para atendimento.' },
            { name: 'Lixa de unha', price: 3, unit: 'un', details: 'Lixa descartavel ou individual.' },
            { name: 'Base fortalecedora', price: 18, unit: 'un', details: 'Base para preparacao da unha.' },
        ],
    },
    'beauty:estetica': {
        services: [
            { name: 'Design de sobrancelhas', price: 50, unit: 'servico', details: 'Mapeamento, limpeza e acabamento das sobrancelhas.' },
            { name: 'Limpeza de pele', price: 160, unit: 'servico', details: 'Higienizacao, extracao e finalizacao conforme pele.' },
            { name: 'Depilacao por area', price: 55, unit: 'area', details: 'Depilacao conforme area combinada.' },
            { name: 'Maquiagem social', price: 180, unit: 'servico', details: 'Maquiagem para evento com preparacao e finalizacao.' },
        ],
        products: [
            { name: 'Henna para sobrancelha', price: 35, unit: 'un', details: 'Produto para pigmentacao temporaria.' },
            { name: 'Cera depilatoria', price: 45, unit: 'un', details: 'Cera para atendimento estetico.' },
            { name: 'Mascara facial', price: 28, unit: 'un', details: 'Produto para tratamento facial.' },
        ],
    },
    'education:professor': {
        services: [
            { name: 'Aula particular', price: 90, unit: 'hora', details: 'Aula individual conforme disciplina e objetivo do aluno.' },
            { name: 'Pacote de aulas', price: 340, unit: 'pacote', details: 'Pacote de encontros com planejamento simples.' },
            { name: 'Reforco para prova', price: 120, unit: 'aula', details: 'Aula focada em revisao, exercicios e duvidas.' },
        ],
        products: [
            { name: 'Material didatico', price: 45, unit: 'un', details: 'Apostila, lista de exercicios ou material complementar.' },
            { name: 'Plano de estudos', price: 80, unit: 'un', details: 'Organizacao de topicos e cronograma de estudo.' },
        ],
    },
    'education:personal': {
        services: [
            { name: 'Treino presencial', price: 120, unit: 'sessao', details: 'Sessao orientada conforme objetivo e condicionamento.' },
            { name: 'Plano mensal de treino', price: 320, unit: 'mes', details: 'Planejamento de treino com ajustes periodicos.' },
            { name: 'Avaliacao fisica inicial', price: 100, unit: 'servico', details: 'Levantamento inicial de medidas, objetivos e restricoes.' },
        ],
        products: [
            { name: 'Ficha de treino', price: 60, unit: 'un', details: 'Ficha personalizada para acompanhamento.' },
            { name: 'Relatorio de evolucao', price: 90, unit: 'un', details: 'Resumo de progresso e proximas metas.' },
        ],
    },
    'education:consultoria': {
        services: [
            { name: 'Sessao de consultoria', price: 250, unit: 'sessao', details: 'Diagnostico, orientacao e proximas acoes.' },
            { name: 'Plano de acao', price: 480, unit: 'projeto', details: 'Documento com recomendacoes, prioridades e plano inicial.' },
            { name: 'Acompanhamento mensal', price: 650, unit: 'mes', details: 'Reunioes e suporte para execucao das recomendacoes.' },
        ],
        products: [
            { name: 'Relatorio tecnico', price: 180, unit: 'un', details: 'Documento com analise e conclusoes.' },
            { name: 'Checklist operacional', price: 90, unit: 'un', details: 'Lista de verificacao para execucao.' },
        ],
    },
    'food:salgados': {
        services: [
            { name: 'Cento de salgados fritos', price: 95, unit: 'cento', details: 'Salgados fritos prontos para consumo.' },
            { name: 'Cento de salgados congelados', price: 75, unit: 'cento', details: 'Salgados prontos para fritar ou assar.' },
            { name: 'Cento de docinhos tradicionais', price: 85, unit: 'cento', details: 'Docinhos de festa em forminha.' },
        ],
        products: [
            { name: 'Embalagem para salgados', price: 6, unit: 'un', details: 'Embalagem para transporte e entrega.' },
            { name: 'Kit descartaveis', price: 28, unit: 'kit', details: 'Pratos, guardanapos ou itens de apoio.' },
        ],
    },
    'food:confeitaria': {
        services: [
            { name: 'Bolo decorado', price: 140, unit: 'kg', details: 'Bolo personalizado conforme sabor, recheio e tema.' },
            { name: 'Bolo de pote', price: 8, unit: 'un', details: 'Bolo individual em pote.' },
            { name: 'Doces finos', price: 130, unit: 'cento', details: 'Doces com acabamento especial para eventos.' },
        ],
        products: [
            { name: 'Caixa para bolo', price: 12, unit: 'un', details: 'Embalagem para transporte.' },
            { name: 'Topo de bolo', price: 35, unit: 'un', details: 'Topo personalizado simples.' },
        ],
    },
    'food:buffet': {
        services: [
            { name: 'Buffet completo', price: 85, unit: 'pessoa', details: 'Cardapio, preparo e servico conforme evento.' },
            { name: 'Buffet coquetel', price: 65, unit: 'pessoa', details: 'Petiscos, finger foods e apoio ao evento.' },
            { name: 'Churrasco completo', price: 95, unit: 'pessoa', details: 'Carnes, acompanhamentos e preparo conforme combinacao.' },
        ],
        products: [
            { name: 'Refrigerante 2L', price: 12, unit: 'un', details: 'Bebida para evento.' },
            { name: 'Agua mineral', price: 3, unit: 'un', details: 'Agua para convidados.' },
            { name: 'Gelo', price: 18, unit: 'saco', details: 'Gelo para bebidas e conservacao.' },
        ],
    },
    'food:servicos': {
        services: [
            { name: 'Garcom para evento', price: 180, unit: 'diaria', details: 'Atendimento aos convidados por periodo combinado.' },
            { name: 'Copeira para evento', price: 180, unit: 'diaria', details: 'Apoio na organizacao, reposicao e limpeza de apoio.' },
            { name: 'Taxa de entrega', price: 45, unit: 'entrega', details: 'Entrega no local combinado.' },
        ],
        products: [
            { name: 'Kit descartaveis para evento', price: 2, unit: 'pessoa', details: 'Prato, copo, talheres ou guardanapo.' },
        ],
    },
    'food:decoracao': {
        services: [
            { name: 'Decoracao de mesa principal', price: 450, unit: 'servico', details: 'Montagem de mesa decorativa conforme tema.' },
            { name: 'Painel decorativo', price: 320, unit: 'servico', details: 'Montagem ou locacao de painel simples.' },
            { name: 'Arco de baloes', price: 280, unit: 'servico', details: 'Montagem de arco ou arranjo de baloes.' },
        ],
        products: [
            { name: 'Baloes', price: 35, unit: 'pacote', details: 'Baloes para decoracao.' },
            { name: 'Suporte de mesa', price: 80, unit: 'un', details: 'Item de apoio para decoracao.' },
        ],
    },
    'design:fachadas': {
        services: [
            { name: 'Projeto de fachada', price: 650, unit: 'projeto', details: 'Criacao visual com medidas, materiais e aplicacao sugerida.' },
            { name: 'Instalacao de fachada', price: 480, unit: 'servico', details: 'Instalacao conforme estrutura, altura e acesso.' },
            { name: 'Reforma de fachada existente', price: 520, unit: 'servico', details: 'Atualizacao, troca de lona, pintura ou acabamento.' },
        ],
        products: [
            { name: 'Chapa ACM', price: 180, unit: 'm2', details: 'Chapa para fachada e comunicacao visual.' },
            { name: 'Perfil de acabamento', price: 35, unit: 'metro', details: 'Perfil para acabamento de placa.' },
        ],
    },
    'design:adesivos': {
        services: [
            { name: 'Producao de adesivo', price: 85, unit: 'm2', details: 'Impressao, recorte ou preparacao de adesivo.' },
            { name: 'Aplicacao de adesivo', price: 65, unit: 'm2', details: 'Aplicacao em superficie limpa e adequada.' },
            { name: 'Remocao de adesivo antigo', price: 45, unit: 'm2', details: 'Remocao cuidadosa conforme superficie.' },
        ],
        products: [
            { name: 'Vinil adesivo', price: 70, unit: 'm2', details: 'Material adesivo para impressao ou recorte.' },
            { name: 'Mascara de transferencia', price: 18, unit: 'metro', details: 'Material para aplicacao de adesivo recortado.' },
        ],
    },
    'design:acm': {
        services: [
            { name: 'Placa em ACM', price: 340, unit: 'm2', details: 'Producao de placa em ACM com acabamento simples.' },
            { name: 'Instalacao de placa ACM', price: 260, unit: 'servico', details: 'Fixacao de placa conforme local e acesso.' },
        ],
        products: [
            { name: 'Chapa ACM', price: 180, unit: 'm2', details: 'Material para placa ou fachada.' },
            { name: 'Fita dupla face estrutural', price: 45, unit: 'rolo', details: 'Insumo para fixacao de acabamento.' },
        ],
    },
    'design:letreiros': {
        services: [
            { name: 'Letra caixa', price: 190, unit: 'un', details: 'Producao de letra caixa conforme tamanho e material.' },
            { name: 'Letreiro luminoso', price: 850, unit: 'servico', details: 'Producao e montagem de letreiro com iluminacao.' },
            { name: 'Instalacao de letra caixa', price: 380, unit: 'servico', details: 'Fixacao e alinhamento das letras no local.' },
        ],
        products: [
            { name: 'Modulo LED', price: 18, unit: 'un', details: 'Modulo para iluminacao.' },
            { name: 'Fonte para LED', price: 85, unit: 'un', details: 'Fonte para alimentacao de luminoso.' },
        ],
    },
    'design:banners': {
        services: [
            { name: 'Banner impresso', price: 95, unit: 'm2', details: 'Impressao em lona com acabamento simples.' },
            { name: 'Criacao de arte para banner', price: 120, unit: 'arte', details: 'Arte digital pronta para impressao.' },
        ],
        products: [
            { name: 'Lona para banner', price: 45, unit: 'm2', details: 'Material de impressao.' },
            { name: 'Bastao e ponteira', price: 18, unit: 'kit', details: 'Acabamento para banner.' },
        ],
    },
    'design:identidade_visual': {
        services: [
            { name: 'Criacao de logotipo', price: 650, unit: 'projeto', details: 'Desenvolvimento de marca com proposta visual inicial.' },
            { name: 'Manual basico de identidade', price: 480, unit: 'projeto', details: 'Paleta, tipografia e regras simples de uso.' },
            { name: 'Cartao de visita digital', price: 180, unit: 'arte', details: 'Arte digital para divulgacao.' },
        ],
        products: [
            { name: 'Arquivo aberto adicional', price: 120, unit: 'un', details: 'Entrega de arquivo editavel quando contratado.' },
        ],
    },
    'design:digital': {
        services: [
            { name: 'Arte para rede social', price: 80, unit: 'arte', details: 'Arte digital para post, campanha ou divulgacao.' },
            { name: 'Pacote de artes mensais', price: 650, unit: 'pacote', details: 'Pacote com criativos digitais conforme quantidade combinada.' },
            { name: 'Ajuste de arte existente', price: 45, unit: 'arte', details: 'Adaptacao simples de material enviado pelo cliente.' },
        ],
        products: [
            { name: 'Banco de imagens', price: 40, unit: 'un', details: 'Licenca ou imagem complementar quando necessario.' },
        ],
    },
    'design:sinalizacao': {
        services: [
            { name: 'Placa de sinalizacao', price: 180, unit: 'un', details: 'Producao de placa conforme tamanho e material.' },
            { name: 'Totem de comunicacao visual', price: 950, unit: 'servico', details: 'Producao ou instalacao de totem simples.' },
        ],
        products: [
            { name: 'PVC expandido', price: 90, unit: 'm2', details: 'Material para placas leves.' },
            { name: 'Adesivo impresso', price: 85, unit: 'm2', details: 'Adesivo para aplicacao em placa.' },
        ],
    },
    'design:frotas': {
        services: [
            { name: 'Envelopamento parcial de veiculo', price: 180, unit: 'm2', details: 'Aplicacao parcial de adesivo em veiculo.' },
            { name: 'Adesivacao de frota', price: 520, unit: 'veiculo', details: 'Producao e aplicacao de identificacao visual.' },
        ],
        products: [
            { name: 'Vinil automotivo', price: 120, unit: 'm2', details: 'Material para envelopamento ou adesivacao.' },
            { name: 'Laminacao protetora', price: 45, unit: 'm2', details: 'Protecao para adesivo impresso.' },
        ],
    },
    'design:impressos': {
        services: [
            { name: 'Cartao de visita', price: 140, unit: 'cento', details: 'Impressao de cartao com acabamento simples.' },
            { name: 'Panfleto ou flyer', price: 180, unit: 'milheiro', details: 'Impressao de material promocional.' },
            { name: 'Criacao de arte para impresso', price: 120, unit: 'arte', details: 'Arte pronta para impressao.' },
        ],
        products: [
            { name: 'Papel couche', price: 55, unit: 'cento', details: 'Material grafico para impressao.' },
            { name: 'Acabamento laminacao', price: 45, unit: 'cento', details: 'Acabamento para impressos.' },
        ],
    },
    'outros:geral': {
        services: [
            { name: 'Visita tecnica', price: 120, unit: 'visita', details: 'Avaliacao inicial e levantamento de necessidade.' },
            { name: 'Hora tecnica', price: 90, unit: 'hora', details: 'Atendimento cobrado por hora.' },
            { name: 'Diaria de servico', price: 320, unit: 'dia', details: 'Diaria de mao de obra para servico personalizado.' },
            { name: 'Servico personalizado', price: 200, unit: 'servico', details: 'Item inicial para adaptar ao trabalho do profissional.' },
        ],
        products: [
            { name: 'Material avulso', price: 50, unit: 'un', details: 'Insumo complementar usado no servico.' },
            { name: 'Peca de reposicao', price: 80, unit: 'un', details: 'Peca simples a detalhar no orcamento.' },
        ],
    },
    'outros:consultoria_especializada': {
        services: [
            { name: 'Consultoria especializada', price: 250, unit: 'servico', details: 'Analise, recomendacao e plano de acao.' },
            { name: 'Diagnostico inicial', price: 180, unit: 'servico', details: 'Levantamento de situacao, problemas e oportunidades.' },
            { name: 'Acompanhamento tecnico', price: 450, unit: 'mes', details: 'Acompanhamento por periodo combinado.' },
        ],
        products: [
            { name: 'Relatorio tecnico', price: 180, unit: 'un', details: 'Documento de conclusoes e orientacoes.' },
        ],
    },
    'outros:atendimento': {
        services: [
            { name: 'Atendimento ou suporte', price: 150, unit: 'servico', details: 'Atendimento pontual ou assistencia ao cliente.' },
            { name: 'Suporte por hora', price: 90, unit: 'hora', details: 'Suporte operacional por periodo contratado.' },
            { name: 'Pacote de atendimentos', price: 420, unit: 'pacote', details: 'Pacote de atendimentos recorrentes.' },
        ],
        products: [
            { name: 'Kit de apoio', price: 80, unit: 'kit', details: 'Materiais de apoio ao atendimento.' },
        ],
    },
    'outros:outras_especialidades': {
        services: [
            { name: 'Visita tecnica', price: 120, unit: 'visita', details: 'Avaliacao inicial e levantamento de necessidade.' },
            { name: 'Servico personalizado', price: 220, unit: 'servico', details: 'Item inicial para adaptar ao trabalho do profissional.' },
            { name: 'Diaria de servico', price: 320, unit: 'dia', details: 'Diaria de mao de obra para servico personalizado.' },
        ],
        products: [
            { name: 'Material avulso', price: 50, unit: 'un', details: 'Insumo complementar usado no servico.' },
            { name: 'Kit de insumos', price: 120, unit: 'kit', details: 'Conjunto de materiais basicos para execucao.' },
        ],
    },
}

const CATEGORY_FALLBACK_PRESETS: Record<string, string> = {
    auto: 'auto:mecanica_geral',
    construction: 'construction:marido_aluguel',
    tech: 'tech:eletricista',
    beauty: 'beauty:cabelo',
    education: 'education:consultoria',
    food: 'food:salgados',
    design: 'design:digital',
    outros: 'outros:geral',
}

export function normalizeCatalogItemName(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\b(de|da|do|das|dos|para|por|com|e|a|o|ou)\b/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

function dedupeCatalogItems(items: InitialCatalogItem[]) {
    const seen = new Set<string>()

    return items.filter((item) => {
        const key = normalizeCatalogItemName(item.name)
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
    })
}

export function getInitialCatalogForOnboarding(categorySlug: string | null | undefined, specialties: string[]) {
    const slug = categorySlug || 'outros'
    const selectedSpecialties = specialties.length > 0 ? specialties : ['geral']
    const fallbackKey = CATEGORY_FALLBACK_PRESETS[slug] || 'outros:geral'

    const presets = selectedSpecialties.map((specialty) => {
        const key = `${slug}:${specialty}`
        return ONBOARDING_CATALOG_PRESETS[key] || ONBOARDING_CATALOG_PRESETS[fallbackKey] || ONBOARDING_CATALOG_PRESETS['outros:geral']
    })

    const services = dedupeCatalogItems(
        presets.flatMap((preset) => preset.services.map((item) => ({ ...item, type: 'service' as const })))
    ).slice(0, MAX_INITIAL_SERVICES)

    const products = dedupeCatalogItems(
        presets.flatMap((preset) => preset.products.map((item) => ({ ...item, type: 'product' as const })))
    ).slice(0, MAX_INITIAL_PRODUCTS)

    return [...services, ...products]
}

export function getSpecialtiesForCategory(slug: string | null | undefined) {
    return ONBOARDING_SPECIALTIES_BY_CATEGORY[slug || ''] || []
}

export function getDefaultProfessionalContext(categorySlug: string | null | undefined, specialties: string[]) {
    const options = getSpecialtiesForCategory(categorySlug)
    const selected = options.find((option) => specialties.includes(option.value) && option.professionalContext)

    if (selected?.professionalContext) {
        return selected.professionalContext
    }

    const fallbackByCategory: Record<string, ProfessionalContextId> = {
        auto: 'mechanic',
        construction: 'construction',
        tech: 'tech',
        beauty: 'beauty',
        food: 'food',
        design: 'design',
    }

    return fallbackByCategory[categorySlug || ''] || 'general'
}

export function getRecommendedProposalModelForOnboarding(categorySlug: string | null | undefined, specialties: string[]) {
    const professionalContext = getDefaultProfessionalContext(categorySlug, specialties)
    return getLayoutRecommendationForContext(professionalContext, 'onboarding')
}

export function parseOnboardingQuoteSettings(raw: unknown): Partial<OnboardingQuoteSettings> | null {
    if (!raw) return null

    try {
        const value = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (!value || typeof value !== 'object') return null

        const record = value as QuoteSettingsWithOnboarding
        const onboarding = record.onboarding
        if (!onboarding || typeof onboarding !== 'object') return null

        return {
            ...onboarding,
            professionalContext: normalizeProfessionalContext(onboarding.professionalContext),
            recommendedLayout: typeof onboarding.recommendedLayout === 'string'
                ? normalizeProposalModel(onboarding.recommendedLayout)
                : undefined,
        }
    } catch {
        return null
    }
}

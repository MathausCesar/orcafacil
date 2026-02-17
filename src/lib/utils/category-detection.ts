import {
    Wrench,
    Hammer,
    Zap,
    Scissors,
    GraduationCap,
    Package,
    Car,
    Paintbrush,
    Sparkles,
    type LucideIcon,
} from 'lucide-react'

export interface CategoryInfo {
    icon: LucideIcon
    color: string
    name: string
}

/**
 * Detecta a categoria de um item baseado em palavras-chave na descrição
 */
export function detectItemCategory(description: string): CategoryInfo {
    const desc = description.toLowerCase()

    // Automotivo
    if (
        desc.includes('óleo') ||
        desc.includes('filtro') ||
        desc.includes('pneu') ||
        desc.includes('freio') ||
        desc.includes('embreagem') ||
        desc.includes('diagnóstico') ||
        desc.includes('injetor') ||
        desc.includes('motor') ||
        desc.includes('suspensão')
    ) {
        return {
            icon: Wrench,
            color: '#EF4444',
            name: 'Automotivo - Mecânica',
        }
    }

    if (
        desc.includes('lavagem') ||
        desc.includes('polimento') ||
        desc.includes('enceramento') ||
        desc.includes('detalhamento')
    ) {
        return {
            icon: Sparkles,
            color: '#3B82F6',
            name: 'Automotivo - Estética',
        }
    }

    if (desc.includes('som') || desc.includes('alarme') || desc.includes('ar condicionado')) {
        return {
            icon: Car,
            color: '#6366F1',
            name: 'Automotivo - Acessórios',
        }
    }

    // Construção
    if (
        desc.includes('piso') ||
        desc.includes('cerâmic') ||
        desc.includes('azulejo') ||
        desc.includes('reboco') ||
        desc.includes('massa') ||
        desc.includes('parede') ||
        desc.includes('laje') ||
        desc.includes('pedreiro') ||
        desc.includes('cimento') ||
        desc.includes('argamassa')
    ) {
        return {
            icon: Hammer,
            color: '#F59E0B',
            name: 'Construção - Obra',
        }
    }

    if (desc.includes('pintura') || desc.includes('tinta') || desc.includes('látex')) {
        return {
            icon: Paintbrush,
            color: '#EC4899',
            name: 'Construção - Pintura',
        }
    }

    if (
        desc.includes('porta') ||
        desc.includes('janela') ||
        desc.includes('acabamento') ||
        desc.includes('gesso')
    ) {
        return {
            icon: Package,
            color: '#8B5CF6',
            name: 'Construção - Acabamento',
        }
    }

    // Elétrica
    if (
        desc.includes('elétric') ||
        desc.includes('tomada') ||
        desc.includes('disjuntor') ||
        desc.includes('chuveiro') ||
        desc.includes('ventilador') ||
        desc.includes('ponto elétrico') ||
        desc.includes('fio') ||
        desc.includes('fiação')
    ) {
        return {
            icon: Zap,
            color: '#FBBF24',
            name: 'Elétrica',
        }
    }

    // Tecnologia
    if (
        desc.includes('computador') ||
        desc.includes('notebook') ||
        desc.includes('formatação') ||
        desc.includes('rede') ||
        desc.includes('wi-fi') ||
        desc.includes('tela')
    ) {
        return {
            icon: Zap,
            color: '#10B981',
            name: 'Tecnologia',
        }
    }

    // Beleza
    if (
        desc.includes('cabelo') ||
        desc.includes('corte') ||
        desc.includes('barba') ||
        desc.includes('manicure') ||
        desc.includes('pedicure') ||
        desc.includes('unhas') ||
        desc.includes('sobrancelha') ||
        desc.includes('maquiagem') ||
        desc.includes('escova') ||
        desc.includes('coloração') ||
        desc.includes('hidratação')
    ) {
        return {
            icon: Scissors,
            color: '#F472B6',
            name: 'Beleza & Estética',
        }
    }

    // Educação / Consultoria
    if (
        desc.includes('aula') ||
        desc.includes('consultoria') ||
        desc.includes('treinamento') ||
        desc.includes('curso')
    ) {
        return {
            icon: GraduationCap,
            color: '#6366F1',
            name: 'Educação',
        }
    }

    // Default
    return {
        icon: Package,
        color: '#64748B',
        name: 'Geral',
    }
}

/**
 * Ajusta o brilho de uma cor hexadecimal
 */
export function adjustColorBrightness(hex: string, percent: number): string {
    // Remove o # se presente
    const color = hex.replace('#', '')

    // Converte para RGB
    const r = parseInt(color.substring(0, 2), 16)
    const g = parseInt(color.substring(2, 4), 16)
    const b = parseInt(color.substring(4, 6), 16)

    // Ajusta o brilho
    const adjust = (value: number) => {
        const adjusted = value + (255 - value) * (percent / 100)
        return Math.min(255, Math.max(0, Math.round(adjusted)))
    }

    const newR = adjust(r)
    const newG = adjust(g)
    const newB = adjust(b)

    // Converte de volta para hex
    const toHex = (value: number) => value.toString(16).padStart(2, '0')

    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`
}

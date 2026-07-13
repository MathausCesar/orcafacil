import { getBrandKitFromQuoteSettings } from '@/lib/brand-kit'

export type WorkspaceBrandingSettings = {
    enabled: boolean
}

export type WorkspaceBranding = {
    enabled: boolean
    accentColor: string
    accentColorDark: string
    foregroundColor: string
    foregroundColorDark: string
    businessName: string
    logoUrl: string | null
}

type WorkspaceBrandingProfile = {
    businessName?: string | null
    logoUrl?: string | null
    primaryColor?: string | null
    quoteSettings?: unknown
    themeColor?: string | null
}

const DEFAULT_WORKSPACE_BRANDING: WorkspaceBrandingSettings = {
    enabled: false,
}

const DEFAULT_ACCENT = '#0D9B5C'

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function normalizeHexColor(value: unknown, fallback = DEFAULT_ACCENT) {
    return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
        ? value.toUpperCase()
        : fallback
}

function hexToRgb(value: string) {
    const normalized = normalizeHexColor(value).slice(1)
    return {
        r: Number.parseInt(normalized.slice(0, 2), 16),
        g: Number.parseInt(normalized.slice(2, 4), 16),
        b: Number.parseInt(normalized.slice(4, 6), 16),
    }
}

function mixHex(base: string, target: string, amount: number) {
    const from = hexToRgb(base)
    const to = hexToRgb(target)
    const ratio = Math.max(0, Math.min(1, amount))
    const channel = (first: number, second: number) => Math.round(first + ((second - first) * ratio))

    return `#${[channel(from.r, to.r), channel(from.g, to.g), channel(from.b, to.b)]
        .map((value) => value.toString(16).padStart(2, '0'))
        .join('')}`.toUpperCase()
}

function relativeLuminance(value: string) {
    const { r, g, b } = hexToRgb(value)
    const normalizeChannel = (channel: number) => {
        const normalized = channel / 255
        return normalized <= 0.03928
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4
    }

    return (0.2126 * normalizeChannel(r)) + (0.7152 * normalizeChannel(g)) + (0.0722 * normalizeChannel(b))
}

function contrastRatio(foreground: string, background: string) {
    const first = relativeLuminance(foreground)
    const second = relativeLuminance(background)
    const [light, dark] = first > second ? [first, second] : [second, first]
    return (light + 0.05) / (dark + 0.05)
}

function getAccessibleForeground(background: string) {
    return contrastRatio('#FFFFFF', background) >= contrastRatio('#0F172A', background)
        ? '#FFFFFF'
        : '#0F172A'
}

function getAccessibleAccent(base: string, background: string) {
    const target = relativeLuminance(background) > 0.5 ? '#0F172A' : '#FFFFFF'

    for (let step = 0; step <= 10; step += 1) {
        const candidate = mixHex(base, target, step / 10)
        if (contrastRatio(candidate, background) >= 4.5) return candidate
    }

    return target
}

export function getWorkspaceBrandingSettings(raw: unknown): WorkspaceBrandingSettings {
    try {
        const value = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (!isRecord(value) || !isRecord(value.workspaceBranding)) {
            return DEFAULT_WORKSPACE_BRANDING
        }

        return {
            enabled: value.workspaceBranding.enabled === true,
        }
    } catch {
        return DEFAULT_WORKSPACE_BRANDING
    }
}

export function resolveWorkspaceBranding(
    profile: WorkspaceBrandingProfile,
    isFree: boolean,
): WorkspaceBranding {
    const settings = getWorkspaceBrandingSettings(profile.quoteSettings)
    const brandKit = getBrandKitFromQuoteSettings(profile.quoteSettings)
    const accentCandidate = brandKit?.accentColor || profile.themeColor || profile.primaryColor || DEFAULT_ACCENT
    const accentColor = normalizeHexColor(accentCandidate)

    if (isFree || !settings.enabled || !profile.logoUrl) {
        return {
            enabled: false,
            accentColor,
            accentColorDark: accentColor,
            foregroundColor: getAccessibleForeground(accentColor),
            foregroundColorDark: getAccessibleForeground(accentColor),
            businessName: profile.businessName?.trim() || 'Meu negócio',
            logoUrl: profile.logoUrl || null,
        }
    }

    const accentColorLight = getAccessibleAccent(accentColor, '#FAFAF8')
    const accentColorDark = getAccessibleAccent(accentColor, '#111827')

    return {
        enabled: true,
        accentColor: accentColorLight,
        accentColorDark,
        foregroundColor: getAccessibleForeground(accentColorLight),
        foregroundColorDark: getAccessibleForeground(accentColorDark),
        businessName: profile.businessName?.trim() || 'Meu negócio',
        logoUrl: profile.logoUrl,
    }
}

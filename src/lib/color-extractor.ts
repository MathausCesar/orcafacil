const FALLBACK_COLOR = '#0D9B5C'
const DARK_NEUTRAL_COLOR = '#111827'
const LIGHT_NEUTRAL_COLOR = '#F8FAFC'

type ColorBucket = {
    r: number
    g: number
    b: number
    count: number
    saturation: number
    lightness: number
    hue: number
}

type RankedColor = ColorBucket & {
    hex: string
}

export type LogoIdentityAnalysis = {
    version: 'logo-analysis-v1'
    detectedAt: string
    width: number
    height: number
    hasTransparency: boolean
    primaryColor: string
    safeAccentColor: string
    secondaryColor: string
    neutralDark: string
    neutralLight: string
    recommendedTextColor: string
    recommendedModel: 'professional' | 'modern' | 'classic' | 'minimalist' | 'agency' | 'impact'
    visualTone: 'balanced' | 'formal' | 'creative'
    styleLabel: string
    palette: string[]
    confidence: number
    qualityScore: number
    qualityLabel: string
    warnings: string[]
    strengths: string[]
    contrast: {
        accentOnWhite: number
        accentOnDark: number
    }
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value))
}

function componentToHex(value: number) {
    const hex = clamp(Math.round(value), 0, 255).toString(16)
    return hex.length === 1 ? `0${hex}` : hex
}

function rgbToHex(r: number, g: number, b: number) {
    return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`
}

function hexToRgb(hex: string) {
    const value = hex.replace('#', '')
    if (!/^[0-9a-f]{6}$/i.test(value)) return null

    return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16),
    }
}

function rgbToHsl(r: number, g: number, b: number) {
    const red = r / 255
    const green = g / 255
    const blue = b / 255
    const max = Math.max(red, green, blue)
    const min = Math.min(red, green, blue)
    const lightness = (max + min) / 2

    if (max === min) {
        return { hue: 0, saturation: 0, lightness }
    }

    const delta = max - min
    const saturation = lightness > 0.5
        ? delta / (2 - max - min)
        : delta / (max + min)
    let hue = 0

    if (max === red) {
        hue = ((green - blue) / delta + (green < blue ? 6 : 0)) / 6
    } else if (max === green) {
        hue = ((blue - red) / delta + 2) / 6
    } else {
        hue = ((red - green) / delta + 4) / 6
    }

    return { hue, saturation, lightness }
}

function hueToRgb(p: number, q: number, t: number) {
    let value = t
    if (value < 0) value += 1
    if (value > 1) value -= 1
    if (value < 1 / 6) return p + (q - p) * 6 * value
    if (value < 1 / 2) return q
    if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6
    return p
}

function hslToHex(hue: number, saturation: number, lightness: number) {
    if (saturation === 0) {
        const value = lightness * 255
        return rgbToHex(value, value, value)
    }

    const q = lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - lightness * saturation
    const p = 2 * lightness - q

    return rgbToHex(
        hueToRgb(p, q, hue + 1 / 3) * 255,
        hueToRgb(p, q, hue) * 255,
        hueToRgb(p, q, hue - 1 / 3) * 255,
    )
}

function relativeLuminance(hex: string) {
    const rgb = hexToRgb(hex)
    if (!rgb) return 0

    const values = [rgb.r, rgb.g, rgb.b].map((component) => {
        const value = component / 255
        return value <= 0.03928
            ? value / 12.92
            : Math.pow((value + 0.055) / 1.055, 2.4)
    })

    return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722
}

function contrastRatio(colorA: string, colorB: string) {
    const light = Math.max(relativeLuminance(colorA), relativeLuminance(colorB))
    const dark = Math.min(relativeLuminance(colorA), relativeLuminance(colorB))
    return Number(((light + 0.05) / (dark + 0.05)).toFixed(2))
}

function scoreBucket(bucket: ColorBucket) {
    const readableLightness = bucket.lightness > 0.18 && bucket.lightness < 0.82 ? 1.25 : 0.72
    return bucket.count * (0.8 + bucket.saturation) * readableLightness
}

function colorDistance(colorA: RankedColor, colorB: RankedColor) {
    return Math.sqrt(
        Math.pow(colorA.r - colorB.r, 2)
        + Math.pow(colorA.g - colorB.g, 2)
        + Math.pow(colorA.b - colorB.b, 2),
    )
}

function makeSafeAccent(color: RankedColor | null) {
    if (!color) return FALLBACK_COLOR

    const saturation = clamp(color.saturation < 0.16 ? 0.32 : color.saturation, 0.30, 0.78)
    const lightness = clamp(color.lightness, 0.28, 0.54)
    let accent = hslToHex(color.hue, saturation, lightness)

    if (contrastRatio(accent, '#FFFFFF') < 3) {
        accent = hslToHex(color.hue, saturation, clamp(lightness - 0.12, 0.22, 0.42))
    }

    return accent
}

function pickDistinctColors(colors: RankedColor[]) {
    const distinct: RankedColor[] = []

    colors.forEach((color) => {
        if (distinct.every((selected) => colorDistance(color, selected) > 46)) {
            distinct.push(color)
        }
    })

    return distinct
}

function getQualityLabel(score: number) {
    if (score >= 0.82) return 'Logo nitida'
    if (score >= 0.58) return 'Logo utilizavel'
    return 'Logo pode melhorar'
}

function buildAnalysis(options: {
    colors: RankedColor[]
    fallbackColor: RankedColor | null
    width: number
    height: number
    hasTransparency: boolean
    sampledPixels: number
    usablePixels: number
}) {
    const distinctColors = pickDistinctColors(options.colors)
    const primary = distinctColors[0] || options.fallbackColor
    const safeAccentColor = makeSafeAccent(primary)
    const primaryColor = primary?.hex || safeAccentColor
    const accentRgb = hexToRgb(safeAccentColor) || { r: 13, g: 155, b: 92 }
    const accentHsl = rgbToHsl(accentRgb.r, accentRgb.g, accentRgb.b)
    const secondaryColor = distinctColors[1]?.hex || hslToHex(accentHsl.hue, 0.28, 0.78)
    const palette = Array.from(new Set([primaryColor, secondaryColor, safeAccentColor, ...distinctColors.slice(2, 4).map(color => color.hex)]))
    const averageSaturation = distinctColors.length
        ? distinctColors.reduce((sum, color) => sum + color.saturation, 0) / distinctColors.length
        : 0
    const averageLightness = distinctColors.length
        ? distinctColors.reduce((sum, color) => sum + color.lightness, 0) / distinctColors.length
        : 0.42
    const accentOnWhite = contrastRatio(safeAccentColor, '#FFFFFF')
    const accentOnDark = contrastRatio(safeAccentColor, DARK_NEUTRAL_COLOR)
    const recommendedTextColor = accentOnWhite >= accentOnDark ? '#FFFFFF' : DARK_NEUTRAL_COLOR
    const colorVariety = distinctColors.length

    let recommendedModel: LogoIdentityAnalysis['recommendedModel'] = 'professional'
    let visualTone: LogoIdentityAnalysis['visualTone'] = 'balanced'
    let styleLabel = 'Visual profissional'

    if (averageSaturation < 0.14 || colorVariety <= 1) {
        recommendedModel = 'classic'
        visualTone = 'formal'
        styleLabel = 'Visual sobrio'
    } else if (colorVariety >= 3 && averageSaturation > 0.42) {
        recommendedModel = 'modern'
        visualTone = 'creative'
        styleLabel = 'Visual destacado'
    } else if (averageLightness < 0.25) {
        recommendedModel = 'impact'
        visualTone = 'balanced'
        styleLabel = 'Visual forte'
    }

    const warnings: string[] = []
    const strengths: string[] = []
    let qualityScore = 1

    const minDimension = Math.min(options.width, options.height)
    const aspectRatio = options.width / Math.max(options.height, 1)
    const usableRatio = options.usablePixels / Math.max(options.sampledPixels, 1)

    if (minDimension < 160) {
        warnings.push('A logo pode ficar pequena ou pouco nitida no PDF.')
        qualityScore -= 0.22
    }

    if (aspectRatio > 7 || aspectRatio < 0.14) {
        warnings.push('O formato da logo e muito estreito; o sistema vai usar destaque controlado.')
        qualityScore -= 0.10
    }

    if (usableRatio < 0.035) {
        warnings.push('A imagem tem pouco conteudo visivel. Se possivel, envie uma logo mais limpa.')
        qualityScore -= 0.16
    }

    if (accentOnWhite < 3) {
        warnings.push('A cor original tinha pouco contraste; ajustamos para manter leitura.')
        qualityScore -= 0.08
    }

    if (colorVariety >= 4) {
        warnings.push('A logo tem muitas cores. A proposta usara uma paleta reduzida para nao ficar poluida.')
        qualityScore -= 0.06
    }

    if (warnings.length === 0) {
        strengths.push('Logo pronta para propostas profissionais.')
    }

    if (colorVariety > 0) strengths.push('Cor da marca identificada.')
    if (accentOnWhite >= 3) strengths.push('Contraste seguro para destaques.')
    if (options.hasTransparency) strengths.push('Fundo transparente detectado.')

    qualityScore = clamp(qualityScore, 0.24, 1)
    const confidence = clamp((qualityScore * 0.72) + (Math.min(colorVariety, 3) / 3 * 0.28), 0.28, 0.98)

    return {
        version: 'logo-analysis-v1',
        detectedAt: new Date().toISOString(),
        width: options.width,
        height: options.height,
        hasTransparency: options.hasTransparency,
        primaryColor,
        safeAccentColor,
        secondaryColor,
        neutralDark: DARK_NEUTRAL_COLOR,
        neutralLight: LIGHT_NEUTRAL_COLOR,
        recommendedTextColor,
        recommendedModel,
        visualTone,
        styleLabel,
        palette,
        confidence: Number(confidence.toFixed(2)),
        qualityScore: Number(qualityScore.toFixed(2)),
        qualityLabel: getQualityLabel(qualityScore),
        warnings,
        strengths,
        contrast: {
            accentOnWhite,
            accentOnDark,
        },
    } satisfies LogoIdentityAnalysis
}

export function analyzeLogoIdentity(imageSrc: string): Promise<LogoIdentityAnalysis> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'Anonymous'

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')

                if (!ctx) {
                    throw new Error('Canvas 2D context not supported')
                }

                const naturalWidth = img.naturalWidth || img.width
                const naturalHeight = img.naturalHeight || img.height
                const MAX_SIZE = 96
                let width = naturalWidth
                let height = naturalHeight

                if (width > height && width > MAX_SIZE) {
                    height *= MAX_SIZE / width
                    width = MAX_SIZE
                } else if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height
                    height = MAX_SIZE
                }

                canvas.width = Math.max(1, Math.round(width))
                canvas.height = Math.max(1, Math.round(height))
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
                const buckets = new Map<string, ColorBucket>()
                let neutralR = 0
                let neutralG = 0
                let neutralB = 0
                let neutralCount = 0
                let hasTransparency = false
                let usablePixels = 0
                const sampledPixels = imageData.length / 4

                for (let i = 0; i < imageData.length; i += 4) {
                    const alpha = imageData[i + 3]
                    if (alpha < 180) {
                        hasTransparency = true
                        continue
                    }

                    const r = imageData[i]
                    const g = imageData[i + 1]
                    const b = imageData[i + 2]
                    const isNearWhite = r > 242 && g > 242 && b > 242
                    if (isNearWhite) continue

                    const { hue, saturation, lightness } = rgbToHsl(r, g, b)

                    if (saturation < 0.08) {
                        if (lightness > 0.08 && lightness < 0.72) {
                            neutralR += r
                            neutralG += g
                            neutralB += b
                            neutralCount += 1
                            usablePixels += 1
                        }
                        continue
                    }

                    if (lightness < 0.10 || lightness > 0.90) continue

                    usablePixels += 1
                    const key = `${Math.round(r / 22)}-${Math.round(g / 22)}-${Math.round(b / 22)}`
                    const current = buckets.get(key)

                    if (current) {
                        current.r += r
                        current.g += g
                        current.b += b
                        current.count += 1
                        current.saturation += saturation
                        current.lightness += lightness
                        current.hue += hue
                    } else {
                        buckets.set(key, { r, g, b, count: 1, saturation, lightness, hue })
                    }
                }

                const ranked = Array.from(buckets.values())
                    .map((bucket) => {
                        const r = bucket.r / bucket.count
                        const g = bucket.g / bucket.count
                        const b = bucket.b / bucket.count

                        return {
                            ...bucket,
                            r,
                            g,
                            b,
                            saturation: bucket.saturation / bucket.count,
                            lightness: bucket.lightness / bucket.count,
                            hue: bucket.hue / bucket.count,
                            hex: rgbToHex(r, g, b),
                        }
                    })
                    .sort((a, b) => scoreBucket(b) - scoreBucket(a))

                const fallbackColor = neutralCount > 0
                    ? (() => {
                        const r = neutralR / neutralCount
                        const g = neutralG / neutralCount
                        const b = neutralB / neutralCount
                        const { hue, saturation, lightness } = rgbToHsl(r, g, b)
                        const hex = lightness < 0.22 ? DARK_NEUTRAL_COLOR : rgbToHex(r, g, b)

                        return { r, g, b, count: neutralCount, saturation, lightness, hue, hex }
                    })()
                    : null

                resolve(buildAnalysis({
                    colors: ranked,
                    fallbackColor,
                    width: naturalWidth,
                    height: naturalHeight,
                    hasTransparency,
                    sampledPixels,
                    usablePixels,
                }))
            } catch (err) {
                reject(err)
            }
        }

        img.onerror = () => {
            reject(new Error('Failed to load image for color extraction'))
        }

        img.src = imageSrc
    })
}

export function extractPrimaryColor(imageSrc: string): Promise<string> {
    return analyzeLogoIdentity(imageSrc).then((analysis) => analysis.safeAccentColor)
}

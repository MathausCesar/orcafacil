const FALLBACK_COLOR = '#0D9B5C'
const DARK_NEUTRAL_COLOR = '#111827'

type ColorBucket = {
    r: number
    g: number
    b: number
    count: number
    saturation: number
    lightness: number
}

function componentToHex(value: number) {
    const hex = Math.max(0, Math.min(255, Math.round(value))).toString(16)
    return hex.length === 1 ? `0${hex}` : hex
}

function rgbToHex(r: number, g: number, b: number) {
    return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`
}

function rgbToHsl(r: number, g: number, b: number) {
    const red = r / 255
    const green = g / 255
    const blue = b / 255
    const max = Math.max(red, green, blue)
    const min = Math.min(red, green, blue)
    const lightness = (max + min) / 2

    if (max === min) {
        return { saturation: 0, lightness }
    }

    const delta = max - min
    const saturation = lightness > 0.5
        ? delta / (2 - max - min)
        : delta / (max + min)

    return { saturation, lightness }
}

function scoreBucket(bucket: ColorBucket) {
    const readableLightness = bucket.lightness > 0.18 && bucket.lightness < 0.82 ? 1.25 : 0.72
    return bucket.count * (0.85 + bucket.saturation) * readableLightness
}

export function extractPrimaryColor(imageSrc: string): Promise<string> {
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

                const MAX_SIZE = 64
                let width = img.width
                let height = img.height

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

                for (let i = 0; i < imageData.length; i += 4) {
                    const alpha = imageData[i + 3]
                    if (alpha < 180) continue

                    const r = imageData[i]
                    const g = imageData[i + 1]
                    const b = imageData[i + 2]
                    const isNearWhite = r > 242 && g > 242 && b > 242
                    if (isNearWhite) continue

                    const { saturation, lightness } = rgbToHsl(r, g, b)

                    if (saturation < 0.08) {
                        if (lightness > 0.08 && lightness < 0.72) {
                            neutralR += r
                            neutralG += g
                            neutralB += b
                            neutralCount += 1
                        }
                        continue
                    }

                    if (lightness < 0.10 || lightness > 0.90) continue

                    const key = `${Math.round(r / 24)}-${Math.round(g / 24)}-${Math.round(b / 24)}`
                    const current = buckets.get(key)

                    if (current) {
                        current.r += r
                        current.g += g
                        current.b += b
                        current.count += 1
                        current.saturation += saturation
                        current.lightness += lightness
                    } else {
                        buckets.set(key, { r, g, b, count: 1, saturation, lightness })
                    }
                }

                const ranked = Array.from(buckets.values())
                    .map((bucket) => ({
                        ...bucket,
                        r: bucket.r / bucket.count,
                        g: bucket.g / bucket.count,
                        b: bucket.b / bucket.count,
                        saturation: bucket.saturation / bucket.count,
                        lightness: bucket.lightness / bucket.count,
                    }))
                    .sort((a, b) => scoreBucket(b) - scoreBucket(a))

                if (ranked[0]) {
                    resolve(rgbToHex(ranked[0].r, ranked[0].g, ranked[0].b))
                    return
                }

                if (neutralCount > 0) {
                    const r = neutralR / neutralCount
                    const g = neutralG / neutralCount
                    const b = neutralB / neutralCount
                    resolve(rgbToHsl(r, g, b).lightness < 0.22 ? DARK_NEUTRAL_COLOR : rgbToHex(r, g, b))
                    return
                }

                resolve(FALLBACK_COLOR)
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

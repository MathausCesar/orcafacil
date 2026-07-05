export type PreparedLogoFile = {
    file: File
    improved: boolean
    cropped: boolean
    resized: boolean
    originalWidth: number
    originalHeight: number
    outputWidth: number
    outputHeight: number
    cropRatio: number
}

const MAX_SOURCE_SIDE = 1600
const MAX_OUTPUT_SIDE = 1200
const MIN_CROP_GAIN = 0.08
const WHITE_BACKGROUND_LIMIT = 246

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file)
        const image = new Image()

        image.onload = () => {
            URL.revokeObjectURL(url)
            resolve(image)
        }

        image.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error('Nao foi possivel ler a imagem da logo.'))
        }

        image.src = url
    })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
    return new Promise((resolve) => {
        canvas.toBlob(resolve, type, quality)
    })
}

function makeFileName(originalName: string, extension: string) {
    const cleanName = originalName
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/[^a-z0-9_-]+/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase()

    return `${cleanName || 'logo'}-zacly.${extension}`
}

function shouldIgnorePixel(
    data: Uint8ClampedArray,
    index: number,
    ignoreWhiteBackground: boolean,
) {
    const alpha = data[index + 3]
    if (alpha < 24) return true

    if (!ignoreWhiteBackground) return false

    return (
        data[index] >= WHITE_BACKGROUND_LIMIT
        && data[index + 1] >= WHITE_BACKGROUND_LIMIT
        && data[index + 2] >= WHITE_BACKGROUND_LIMIT
    )
}

export async function prepareLogoFile(file: File): Promise<PreparedLogoFile> {
    try {
        const image = await loadImageFromFile(file)
        const originalWidth = image.naturalWidth || image.width
        const originalHeight = image.naturalHeight || image.height

        if (!originalWidth || !originalHeight) {
            return {
                file,
                improved: false,
                cropped: false,
                resized: false,
                originalWidth: 0,
                originalHeight: 0,
                outputWidth: 0,
                outputHeight: 0,
                cropRatio: 0,
            }
        }

        const sourceScale = Math.min(1, MAX_SOURCE_SIDE / Math.max(originalWidth, originalHeight))
        const sourceWidth = Math.max(1, Math.round(originalWidth * sourceScale))
        const sourceHeight = Math.max(1, Math.round(originalHeight * sourceScale))
        const sourceCanvas = document.createElement('canvas')
        const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true })

        if (!sourceContext) throw new Error('Canvas indisponivel.')

        sourceCanvas.width = sourceWidth
        sourceCanvas.height = sourceHeight
        sourceContext.drawImage(image, 0, 0, sourceWidth, sourceHeight)

        const imageData = sourceContext.getImageData(0, 0, sourceWidth, sourceHeight)
        const data = imageData.data
        let transparentPixels = 0

        for (let index = 0; index < data.length; index += 4) {
            if (data[index + 3] < 24) transparentPixels += 1
        }

        const ignoreWhiteBackground = transparentPixels / Math.max(1, data.length / 4) < 0.02
        let minX = sourceWidth
        let minY = sourceHeight
        let maxX = -1
        let maxY = -1

        for (let y = 0; y < sourceHeight; y += 1) {
            for (let x = 0; x < sourceWidth; x += 1) {
                const index = (y * sourceWidth + x) * 4
                if (shouldIgnorePixel(data, index, ignoreWhiteBackground)) continue

                minX = Math.min(minX, x)
                minY = Math.min(minY, y)
                maxX = Math.max(maxX, x)
                maxY = Math.max(maxY, y)
            }
        }

        if (maxX < minX || maxY < minY) {
            return {
                file,
                improved: false,
                cropped: false,
                resized: false,
                originalWidth,
                originalHeight,
                outputWidth: originalWidth,
                outputHeight: originalHeight,
                cropRatio: 0,
            }
        }

        const cropWidth = maxX - minX + 1
        const cropHeight = maxY - minY + 1
        const cropRatio = 1 - ((cropWidth * cropHeight) / (sourceWidth * sourceHeight))
        const cropped = cropRatio >= MIN_CROP_GAIN
        const resized = Math.max(originalWidth, originalHeight) > MAX_OUTPUT_SIDE || file.size > 1.5 * 1024 * 1024

        if (!cropped && !resized) {
            return {
                file,
                improved: false,
                cropped: false,
                resized: false,
                originalWidth,
                originalHeight,
                outputWidth: originalWidth,
                outputHeight: originalHeight,
                cropRatio: Number(cropRatio.toFixed(2)),
            }
        }

        const sourceCropX = cropped ? minX : 0
        const sourceCropY = cropped ? minY : 0
        const sourceCropWidth = cropped ? cropWidth : sourceWidth
        const sourceCropHeight = cropped ? cropHeight : sourceHeight
        const padding = Math.round(Math.min(80, Math.max(18, Math.max(sourceCropWidth, sourceCropHeight) * 0.08)))
        const paddedWidth = sourceCropWidth + padding * 2
        const paddedHeight = sourceCropHeight + padding * 2
        const outputScale = Math.min(1, MAX_OUTPUT_SIDE / Math.max(paddedWidth, paddedHeight))
        const outputWidth = Math.max(1, Math.round(paddedWidth * outputScale))
        const outputHeight = Math.max(1, Math.round(paddedHeight * outputScale))
        const outputCanvas = document.createElement('canvas')
        const outputContext = outputCanvas.getContext('2d')

        if (!outputContext) throw new Error('Canvas indisponivel.')

        outputCanvas.width = outputWidth
        outputCanvas.height = outputHeight
        outputContext.clearRect(0, 0, outputWidth, outputHeight)
        outputContext.imageSmoothingEnabled = true
        outputContext.imageSmoothingQuality = 'high'
        outputContext.drawImage(
            sourceCanvas,
            sourceCropX,
            sourceCropY,
            sourceCropWidth,
            sourceCropHeight,
            Math.round(padding * outputScale),
            Math.round(padding * outputScale),
            Math.round(sourceCropWidth * outputScale),
            Math.round(sourceCropHeight * outputScale),
        )

        const blob = await canvasToBlob(outputCanvas, 'image/webp', 0.92)
            || await canvasToBlob(outputCanvas, 'image/png')

        if (!blob) throw new Error('Nao foi possivel preparar a imagem.')

        const outputType = blob.type || 'image/webp'
        const extension = outputType.includes('png') ? 'png' : 'webp'
        const preparedFile = new File([blob], makeFileName(file.name, extension), {
            type: outputType,
            lastModified: Date.now(),
        })

        return {
            file: preparedFile.size < file.size || cropped || resized ? preparedFile : file,
            improved: preparedFile.size < file.size || cropped || resized,
            cropped,
            resized,
            originalWidth,
            originalHeight,
            outputWidth,
            outputHeight,
            cropRatio: Number(cropRatio.toFixed(2)),
        }
    } catch (error) {
        console.warn('Logo preparation failed. Using original file.', error)

        return {
            file,
            improved: false,
            cropped: false,
            resized: false,
            originalWidth: 0,
            originalHeight: 0,
            outputWidth: 0,
            outputHeight: 0,
            cropRatio: 0,
        }
    }
}

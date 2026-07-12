export type PreparedEvidenceImage = {
    file: File
    resized: boolean
    originalWidth: number
    originalHeight: number
}

const MAX_SIDE = 1600
const MAX_FILE_SIZE = 6 * 1024 * 1024

function loadImage(source: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error('Nao foi possivel ler a imagem.'))
        image.src = source
    })
}

function toBlob(canvas: HTMLCanvasElement, quality: number) {
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Nao foi possivel preparar a imagem.'))
        }, 'image/webp', quality)
    })
}

/** Converts the browser image to WebP and strips EXIF data before upload. */
export async function prepareEvidenceImage(file: File): Promise<PreparedEvidenceImage> {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error('Envie uma foto JPG, PNG ou WebP.')
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new Error('A foto deve ter no maximo 6MB.')
    }

    const source = URL.createObjectURL(file)
    try {
        const image = await loadImage(source)
        const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height))
        const width = Math.max(1, Math.round(image.width * scale))
        const height = Math.max(1, Math.round(image.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Seu navegador nao conseguiu preparar a foto.')

        context.drawImage(image, 0, 0, width, height)
        let output = await toBlob(canvas, 0.84)
        if (output.size > 1_500_000) output = await toBlob(canvas, 0.7)

        const name = `${file.name.replace(/\.[^.]+$/, '') || 'foto-proposta'}.webp`
        return {
            file: new File([output], name, { type: 'image/webp' }),
            resized: width !== image.width || height !== image.height || file.type !== 'image/webp',
            originalWidth: image.width,
            originalHeight: image.height,
        }
    } finally {
        URL.revokeObjectURL(source)
    }
}

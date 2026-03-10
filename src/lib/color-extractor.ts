/**
 * Extrai a cor primária ou dominante de uma imagem carregada.
 * Utiliza um elemento <canvas> invisível para amostrar pixeis do centro e da imagem como um todo.
 */

export function extractPrimaryColor(imageSrc: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Evita problemas de CORS quando possível

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    throw new Error('Canvas 2D context not supported');
                }

                // Usamos um tamanho reduzido para processamento rápido (Média global de cor)
                const MAX_SIZE = 50;

                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                const imageData = ctx.getImageData(0, 0, width, height).data;
                const length = imageData.length;

                let r = 0, g = 0, b = 0, count = 0;

                // Percorrer os bytes da imagem pegando apenas pixels com opacidade alta
                for (let i = 0; i < length; i += 4) {
                    const alpha = imageData[i + 3];

                    // Ignorar pixels "transparentes" ou próximos a isso (comuns em PNGs de logo)
                    if (alpha > 200) {
                        // Ignorar também pixels muito próximos a branco (fundo de logo JPEG) e preto
                        const red = imageData[i];
                        const green = imageData[i + 1];
                        const blue = imageData[i + 2];

                        const isWhite = red > 240 && green > 240 && blue > 240;
                        const isBlack = red < 15 && green < 15 && blue < 15;

                        if (!isWhite && !isBlack) {
                            r += red;
                            g += green;
                            b += blue;
                            count++;
                        }
                    }
                }

                if (count === 0) {
                    // Fallback: se a logo inteira for branco/preto/transparente, retornar uma cor padrão
                    resolve('#000000');
                    return;
                }

                // Media das cores
                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);

                const toHex = (c: number) => {
                    const hex = c.toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                };

                const hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
                resolve(hexColor);
            } catch (err) {
                reject(err);
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load image for color extraction'));
        };

        img.src = imageSrc;
    });
}

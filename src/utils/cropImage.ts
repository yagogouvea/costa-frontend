import { Area } from 'react-easy-crop';

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.src = url;
  });

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');

  // Use diretamente os valores do crop do react-easy-crop
  let sourceX = pixelCrop.x;
  let sourceY = pixelCrop.y;
  let sourceWidth = pixelCrop.width;
  let sourceHeight = pixelCrop.height;

  // Ajuste para não sair dos limites da imagem
  sourceX = Math.max(0, sourceX);
  sourceY = Math.max(0, sourceY);
  sourceWidth = Math.min(sourceWidth, image.naturalWidth - sourceX);
  sourceHeight = Math.min(sourceHeight, image.naturalHeight - sourceY);

  canvas.width = sourceWidth;
  canvas.height = sourceHeight;

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  console.log('drawImage params:', {
    sourceX, sourceY, sourceWidth, sourceHeight,
    destWidth: sourceWidth, destHeight: sourceHeight,
    imageWidth: image.naturalWidth, imageHeight: image.naturalHeight,
    pixelCrop
  });

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    sourceWidth,
    sourceHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      0.95
    );
  });
}

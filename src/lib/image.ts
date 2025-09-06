export type ImageProcessOptions = {
  maxDimension?: number; // max width/height of output
  quality?: number; // 0..1
  outputType?: 'image/webp' | 'image/jpeg';
  squareCrop?: boolean; // center crop to square
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = 'anonymous';
    img.src = src;
  });
}

export async function compressAndCropImage(file: File, opts: ImageProcessOptions = {}) {
  const {
    maxDimension = 1024,
    quality = 0.85,
    outputType = 'image/webp',
    squareCrop = false,
  } = opts;

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);

    // Determine source crop
    let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
    if (squareCrop) {
      const s = Math.min(img.width, img.height);
      sx = Math.floor((img.width - s) / 2);
      sy = Math.floor((img.height - s) / 2);
      sWidth = s;
      sHeight = s;
    }

    // Determine destination size with maxDimension constraint
    let dw = sWidth;
    let dh = sHeight;
    const scale = Math.min(1, maxDimension / Math.max(sWidth, sHeight));
    dw = Math.max(1, Math.round(sWidth * scale));
    dh = Math.max(1, Math.round(sHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = dw;
    canvas.height = dh;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, dw, dh);

    // toBlob and toDataURL fallback
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), outputType, quality);
    });

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });

    return { dataUrl, width: dw, height: dh, blob };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

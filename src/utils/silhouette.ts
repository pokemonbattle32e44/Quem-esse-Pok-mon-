/**
 * Generates a pure black silhouette PNG data URL from a Pokémon artwork URL
 * by converting every visible pixel (alpha > 15) to RGB(0, 0, 0) while
 * preserving the original alpha transparency channel.
 */
export async function generateSilhouetteDataUrl(
  imageUrl: string
): Promise<string | null> {
  if (!imageUrl || typeof document === 'undefined') return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const width = img.naturalWidth || 475;
        const height = img.naturalHeight || 475;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const { data } = imageData;

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha > 15) {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
          } else {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = imageUrl;
  });
}

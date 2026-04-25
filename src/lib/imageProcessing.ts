// Core utilities for pixel-level image processing inside the browser using HTML5 Canvas

export async function convertToBlackAndWhite(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context not supported."));

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // High-contrast threshold: values above 140 become white, below become black
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const v = avg > 140 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = v;
      }

      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        else reject(new Error("Failed to create blob from canvas."));
      }, 'image/jpeg', 0.95);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for B&W conversion."));
    };
    img.src = objectUrl;
  });
}

export async function applyAutoCropToFile(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const rect = getAutoCropRect(img);
      if (!rect) return resolve(file);

      const canvas = document.createElement("canvas");
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(file);

      ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
      canvas.toBlob((blob) => {
        resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file);
      }, 'image/jpeg', 0.95);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fail gracefully
    };
    img.src = objectUrl;
  });
}

// Detects the bounding box of non-white content for auto-cropping
export function getAutoCropRect(imageElement: HTMLImageElement): { x: number; y: number; width: number; height: number } | null {
  const canvas = document.createElement("canvas");
  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(imageElement, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let left = canvas.width, right = 0;
  let top = canvas.height, bottom = 0;
  const bgThreshold = 240;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      if ((data[i] + data[i + 1] + data[i + 2]) / 3 < bgThreshold) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }

  if (left < right && top < bottom) {
    const pad = 20;
    const x = Math.max(0, left - pad);
    const y = Math.max(0, top - pad);
    const width = Math.min(canvas.width, right + pad) - x;
    const height = Math.min(canvas.height, bottom + pad) - y;
    return { x, y, width, height };
  }

  return null;
}

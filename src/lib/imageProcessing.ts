// Core utilities for pixel-level image processing inside the browser using HTML5 Canvas

// Thresholding function to replicate high-contrast Black and White photocopier/scanner outputs
export async function convertToBlackAndWhite(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) return reject("Canvas context fundamentally not supported in this browser environment.");
      
      // Draw the original image naturally to the canvas bounds
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Strict contrast translation algorithm
      for (let i = 0; i < data.length; i += 4) {
        // Average the RGB spectrum to get generic luminance
        const avg = (data[i] + data[i+1] + data[i+2]) / 3;
        
        // Strict threshold gate: High contrast '140' slices light grays completely out as whitespace
        // while plunging anything darker directly into pure black.
        const colorValue = avg > 140 ? 255 : 0;
        
        data[i] = colorValue;     // R
        data[i+1] = colorValue;   // G
        data[i+2] = colorValue;   // B
      }
      
      // Commit mapping backwards
      ctx.putImageData(imageData, 0, 0);
      
      // Rip standard jpeg blob natively from DOM
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        } else {
          reject("System failed binding Binary Blob output from HTML5 mapping constraint.");
        }
      }, 'image/jpeg', 0.95);
    };
    
  img.onerror = () => reject("Encountered decoding failure importing the target image blob.");
    img.src = URL.createObjectURL(file);
  });
}

export async function applyAutoCropToFile(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      const rect = getAutoCropRect(img);
      if (!rect) return resolve(file); // Gracefully return original if no clear background bounds found
      
      const canvas = document.createElement("canvas");
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) return resolve(file);
      
      // Paint only the cropped sub-rectangle section mapping dynamically
      ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        } else {
          resolve(file); // Fail gracefully
        }
      }, 'image/jpeg', 0.95);
    };
    
    img.onerror = () => resolve(file); // Fail gracefully passing original file back into workflow
    img.src = URL.createObjectURL(file);
  });
}

// Custom Edge Detection finding bounds of white / empty background sheets
export function getAutoCropRect(imageElement: HTMLImageElement): { x: number, y: number, width: number, height: number } | null {
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
  
  // Set our bright whitespace bounds limit
  const backgroundThreshold = 240; 

  // Fast mathematical iterative sweep detecting non-whitespace pixels
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      const r = data[i], g = data[i+1], b = data[i+2];
      const luminance = (r + g + b) / 3;
      
      if (luminance < backgroundThreshold) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }

  // Confirm legitimate logical bounds were actively detected and are not mathematically overlapping
  if (left < right && top < bottom) {
    const padding = 20; // Allow breathing room explicitly
    return {
      x: Math.max(0, left - padding),
      y: Math.max(0, top - padding),
      width: Math.min(canvas.width - left, right - left + padding * 2),
      height: Math.min(canvas.height - top, bottom - top + padding * 2)
    };
  }
  
  return null;
}

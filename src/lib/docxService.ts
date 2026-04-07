export async function pdfToDocx(file: File): Promise<Blob> {
  const SECRET = "1chCpK7rpKp3VJed7HxkFtzR7bbRRuZe";

  const formData = new FormData();
  formData.append('File', file);

  const response = await fetch(`https://v2.convertapi.com/convert/pdf/to/docx?Secret=${SECRET}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Conversion Error:", errorText);
    throw new Error(`Conversion API failed with status ${response.status}`);
  }

  const data = await response.json();

  if (!data.Files || data.Files.length === 0) {
    throw new Error("API returned no converted files.");
  }

  // The base64 file data string provided by ConvertAPI
  const base64Data = data.Files[0].FileData;
  
  // Clean off potential data uri prefixes if they exist (ConvertAPI usually provides raw base64)
  const b64 = base64Data.split(',').pop() || base64Data;
  
  // Standard b64 to Blob methodology for browsers
  const byteCharacters = atob(b64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

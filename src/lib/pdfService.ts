import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Converts an array of image files to a single PDF document.
 */
export async function imagesToPdf(imageFiles: File[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const file of imageFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const imageBytes = new Uint8Array(arrayBuffer);
    
    let imageObj;
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      imageObj = await pdfDoc.embedJpg(imageBytes);
    } else if (file.type === 'image/png') {
      imageObj = await pdfDoc.embedPng(imageBytes);
    } else {
      continue; // Skip unsupported image types
    }

    const { width, height } = imageObj;
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(imageObj, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  return await pdfDoc.save();
}

/**
 * Merges multiple PDF files into one.
 */
export async function mergePdfs(pdfFiles: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of pdfFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
    });
  }

  return await mergedPdf.save();
}

/**
 * Generates a stand-alone cover page PDF
 */
export async function generateCoverPage(options: {
  semester: string;
  courseTitle: string;
  courseCode: string;
  studentName: string;
  teacherName: string;
  studentId: string;
  department: string;
  batch: string;
  submissionDate: string;
}): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  
  // Use professional Times New Roman as requested
  const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const drawCenterText = (text: string, y: number, size: number, font: any, color: any = rgb(0, 0, 0)) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y,
      size,
      font,
      color,
    });
  };

  // Header Elements
  drawCenterText("Daffodil International University", height - 80, 24, timesBold, rgb(0, 0.3, 0.7));
  drawCenterText("Department of Computing and Information System", height - 110, 16, timesBold);
  drawCenterText("Faculty of Science & Information Technology", height - 135, 14, timesBold);

  // Assignment section (No background, green text)
  const pillY = height - 190;
  
  const assignmentText = "Assignment";
  const assignmentWidth = timesBold.widthOfTextAtSize(assignmentText, 16);
  page.drawText(assignmentText, {
    x: (width - assignmentWidth) / 2,
    y: pillY + 12,
    size: 16,
    font: timesBold,
    color: rgb(0.1, 0.6, 0.3), // Clear green
  });

  if (options.semester) {
    drawCenterText(`Semester ${options.semester}`, pillY - 40, 14, timesFont);
  }

  // Course Details
  page.drawText(`Course Title:`, { x: 70, y: pillY - 90, size: 14, font: timesBold });
  page.drawText(options.courseTitle || "", { x: 170, y: pillY - 90, size: 14, font: timesFont });
  
  page.drawText(`Course Code:`, { x: 70, y: pillY - 115, size: 14, font: timesBold });
  page.drawText(options.courseCode || "", { x: 170, y: pillY - 115, size: 14, font: timesFont });

  // Columns: Asymmetric Leaf Boxes (Top-Left rounded, Bottom-Right rounded)
  const boxY = pillY - 320;
  const boxHeight = 160;
  const boxWidth = (width - 160) / 2; // Two boxes side by side

  // Cubic Bezier SVG path avoids the pdf-lib regex crash! Commas removed to prevent parsing bug.
  const leafSvg = `M 0 20 C 0 8.95 8.95 0 20 0 L ${boxWidth} 0 L ${boxWidth} ${boxHeight - 20} C ${boxWidth} ${boxHeight - 8.95} ${boxWidth - 8.95} ${boxHeight} ${boxWidth - 20} ${boxHeight} L 0 ${boxHeight} Z`;

  // Left Box (Submitted By)
  page.drawSvgPath(leafSvg, {
    x: 70,
    y: boxY + boxHeight,
    borderColor: rgb(0, 0.4, 0.8),
    borderWidth: 1.5,
    color: rgb(0.97, 0.97, 0.97), // Light gray fill
  });

  page.drawText("Submitted by:", { x: 90, y: boxY + boxHeight - 30, size: 14, font: timesBold });
  page.drawLine({ start: { x: 90, y: boxY + boxHeight - 32 }, end: { x: 180, y: boxY + boxHeight - 32 }, thickness: 1, color: rgb(0, 0, 0) });
  
  let leftY = boxY + boxHeight - 60;
  page.drawText(options.studentName || " ", { x: 90, y: leftY, size: 13, font: timesFont });
  leftY -= 20;
  page.drawText(`Student ID: ${options.studentId}`, { x: 90, y: leftY, size: 13, font: timesFont });
  leftY -= 20;
  page.drawText(options.department || "Department of CIS", { x: 90, y: leftY, size: 13, font: timesFont });
  leftY -= 20;
  page.drawText(`Batch: ${options.batch}`, { x: 90, y: leftY, size: 13, font: timesFont });

  // Right Box (Submitted To)
  const rightBoxX = 70 + boxWidth + 20;
  page.drawSvgPath(leafSvg, {
    x: rightBoxX,
    y: boxY + boxHeight,
    borderColor: rgb(0, 0.4, 0.8),
    borderWidth: 1.5,
    color: rgb(0.97, 0.97, 0.97), // Light gray fill
  });

  page.drawText("Submitted to:", { x: rightBoxX + 20, y: boxY + boxHeight - 30, size: 14, font: timesBold });
  page.drawLine({ start: { x: rightBoxX + 20, y: boxY + boxHeight - 32 }, end: { x: rightBoxX + 110, y: boxY + boxHeight - 32 }, thickness: 1, color: rgb(0, 0, 0) });
  
  let rightY = boxY + boxHeight - 60;
  page.drawText(options.teacherName || " ", { x: rightBoxX + 20, y: rightY, size: 13, font: timesFont });
  rightY -= 20;
  page.drawText("Department of CIS", { x: rightBoxX + 20, y: rightY, size: 13, font: timesFont });

  // Footer (Submission Date)
  page.drawText(`Submission Date: ${options.submissionDate}`, { x: 70, y: boxY - 40, size: 13, font: timesFont });

  return await pdfDoc.save();
}

/**
 * Returns the total number of pages in a given PDF File
 */
export async function getPdfPageCount(pdfFile: File): Promise<number> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfBytes = new Uint8Array(arrayBuffer);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  return pdfDoc.getPageCount();
}

/**
 * Reorders or deletes pages of a PDF based on the provided page index array
 */
export async function reorderAndSavePdf(pdfFile: File, pageOrder: number[]): Promise<Uint8Array> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfBytes = new Uint8Array(arrayBuffer);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const newPdf = await PDFDocument.create();
  
  const copiedPages = await newPdf.copyPages(pdfDoc, pageOrder);
  copiedPages.forEach((page) => {
    newPdf.addPage(page);
  });

  return await newPdf.save();
}

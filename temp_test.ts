import { PDFDocument, rgb } from 'pdf-lib';

async function testPdf() {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    
    const boxY = height - 320;
    const boxHeight = 160;
    const boxWidth = (width - 160) / 2;

    const leafSvg = `M 0 20 C 0 8.95 8.95 0 20 0 L ${boxWidth} 0 L ${boxWidth} ${boxHeight - 20} C ${boxWidth} ${boxHeight - 8.95} ${boxWidth - 8.95} ${boxHeight} ${boxWidth - 20} ${boxHeight} L 0 ${boxHeight} Z`;

    page.drawSvgPath(leafSvg, {
      x: 70,
      y: boxY + boxHeight,
      borderColor: rgb(0, 0.4, 0.8),
      borderWidth: 1.5,
      color: rgb(0.97, 0.97, 0.97),
    });

    const out = await pdfDoc.save();
    console.log("SUCCESS, SIZE:", out.length);
  } catch (err) {
    console.error("FAILED:");
    console.error(err);
  }
}

testPdf();

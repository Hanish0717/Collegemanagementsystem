import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generateReceiptPdf(element: HTMLElement | null, filename = 'receipt.pdf') {
  if (!element) throw new Error('No element provided for PDF generation');
  // Render element to canvas at higher scale for better quality
  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
}

export default generateReceiptPdf;

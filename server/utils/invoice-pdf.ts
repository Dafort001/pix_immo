import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Invoice } from '@shared/schema';

export async function generateInvoicePDF(invoice: Invoice): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
  
  // Embed the fonts
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;
  
  // Colors
  const primaryColor = rgb(0.29, 0.35, 0.29); // #4A5849
  const accentColor = rgb(0.66, 0.36, 0.18); // #A85B2E
  const textColor = rgb(0.2, 0.2, 0.2);
  const grayColor = rgb(0.4, 0.4, 0.4);
  
  // Header - Company Name
  page.drawText('pix.immo', {
    x: margin,
    y: y,
    size: 24,
    font: helveticaBold,
    color: primaryColor
  });
  
  // Invoice Number (top right)
  const invoiceNumText = invoice.invoiceNumber;
  page.drawText(invoiceNumText, {
    x: width - margin - helveticaBold.widthOfTextAtSize(invoiceNumText, 16),
    y: y,
    size: 16,
    font: helveticaBold,
    color: accentColor
  });
  
  y -= 20;
  
  // Company Details
  const companyDetails = [
    'Professionelle Immobilienfotografie',
    'Hamburg, Deutschland',
    'Tel: +49 (0) 40 XXX XXXXX',
    'E-Mail: kontakt@pix.immo'
  ];
  
  companyDetails.forEach((line) => {
    page.drawText(line, {
      x: margin,
      y: y,
      size: 9,
      font: helvetica,
      color: grayColor
    });
    y -= 12;
  });
  
  // Status Badge (top right under invoice number)
  const status = getStatusLabel(invoice.status);
  const statusY = height - margin - 25;
  page.drawText(status, {
    x: width - margin - helvetica.widthOfTextAtSize(status, 9) - 10,
    y: statusY,
    size: 9,
    font: helveticaBold,
    color: textColor
  });
  
  y -= 30;
  
  // Customer Section
  page.drawText('Rechnung an:', {
    x: margin,
    y: y,
    size: 9,
    font: helvetica,
    color: grayColor
  });
  y -= 15;
  
  page.drawText(invoice.customerName, {
    x: margin,
    y: y,
    size: 11,
    font: helveticaBold,
    color: textColor
  });
  y -= 15;
  
  if (invoice.customerAddress) {
    const addressLines = invoice.customerAddress.split('\n');
    addressLines.forEach((line) => {
      page.drawText(line, {
        x: margin,
        y: y,
        size: 10,
        font: helvetica,
        color: textColor
      });
      y -= 13;
    });
  }
  
  page.drawText(invoice.customerEmail, {
    x: margin,
    y: y,
    size: 10,
    font: helvetica,
    color: textColor
  });
  y -= 25;
  
  // Date Information
  const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString('de-DE');
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('de-DE') : '-';
  
  page.drawText(`Rechnungsdatum: ${invoiceDate}`, {
    x: margin,
    y: y,
    size: 9,
    font: helvetica,
    color: textColor
  });
  
  page.drawText(`Fälligkeitsdatum: ${dueDate}`, {
    x: width - margin - helvetica.widthOfTextAtSize(`Fälligkeitsdatum: ${dueDate}`, 9),
    y: y,
    size: 9,
    font: helvetica,
    color: textColor
  });
  
  y -= 30;
  
  // Title
  page.drawText('Rechnung', {
    x: margin,
    y: y,
    size: 16,
    font: helveticaBold,
    color: primaryColor
  });
  
  y -= 30;
  
  // Table Header
  page.drawRectangle({
    x: margin,
    y: y - 25,
    width: width - 2 * margin,
    height: 25,
    color: primaryColor
  });
  
  page.drawText('Beschreibung', {
    x: margin + 10,
    y: y - 17,
    size: 10,
    font: helvetica,
    color: rgb(1, 1, 1)
  });
  
  page.drawText('Menge', {
    x: width - margin - 200,
    y: y - 17,
    size: 10,
    font: helvetica,
    color: rgb(1, 1, 1)
  });
  
  page.drawText('Einzelpreis', {
    x: width - margin - 130,
    y: y - 17,
    size: 10,
    font: helvetica,
    color: rgb(1, 1, 1)
  });
  
  page.drawText('Gesamtpreis', {
    x: width - margin - 60,
    y: y - 17,
    size: 10,
    font: helvetica,
    color: rgb(1, 1, 1)
  });
  
  y -= 35;
  
  // Line Items
  const lineItems = JSON.parse(invoice.lineItems || '[]');
  
  lineItems.forEach((item: any) => {
    const description = item.description || invoice.serviceDescription;
    const quantity = String(item.quantity || 1);
    const unitPrice = formatCurrency(item.unitPrice || invoice.netAmount);
    const totalPrice = formatCurrency(item.totalPrice || invoice.netAmount);
    
    page.drawText(description, {
      x: margin + 10,
      y: y,
      size: 10,
      font: helvetica,
      color: textColor,
      maxWidth: 250
    });
    
    page.drawText(quantity, {
      x: width - margin - 185,
      y: y,
      size: 10,
      font: helvetica,
      color: textColor
    });
    
    page.drawText(unitPrice, {
      x: width - margin - 130,
      y: y,
      size: 10,
      font: helvetica,
      color: textColor
    });
    
    page.drawText(totalPrice, {
      x: width - margin - 60,
      y: y,
      size: 10,
      font: helvetica,
      color: textColor
    });
    
    y -= 20;
  });
  
  // Draw line
  page.drawLine({
    start: { x: margin, y: y },
    end: { x: width - margin, y: y },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9)
  });
  
  y -= 30;
  
  // Totals Section
  const totalsX = width - margin - 150;
  
  // Net Amount
  page.drawText('Nettobetrag:', {
    x: totalsX,
    y: y,
    size: 10,
    font: helvetica,
    color: textColor
  });
  
  page.drawText(formatCurrency(invoice.netAmount), {
    x: width - margin - 60,
    y: y,
    size: 10,
    font: helvetica,
    color: textColor
  });
  
  y -= 18;
  
  // VAT
  page.drawText(`MwSt. (${invoice.vatRate}%):`, {
    x: totalsX,
    y: y,
    size: 10,
    font: helvetica,
    color: textColor
  });
  
  page.drawText(formatCurrency(invoice.vatAmount), {
    x: width - margin - 60,
    y: y,
    size: 10,
    font: helvetica,
    color: textColor
  });
  
  y -= 25;
  
  // Draw total box
  page.drawRectangle({
    x: totalsX - 10,
    y: y - 5,
    width: 155,
    height: 25,
    color: rgb(0.96, 0.96, 0.96)
  });
  
  // Gross Amount
  page.drawText('Gesamtbetrag:', {
    x: totalsX,
    y: y + 3,
    size: 12,
    font: helveticaBold,
    color: textColor
  });
  
  page.drawText(formatCurrency(invoice.grossAmount), {
    x: width - margin - 60,
    y: y + 3,
    size: 12,
    font: helveticaBold,
    color: textColor
  });
  
  y -= 50;
  
  // Notes (if any)
  if (invoice.notes) {
    page.drawText('Notizen:', {
      x: margin,
      y: y,
      size: 10,
      font: helveticaBold,
      color: accentColor
    });
    y -= 15;
    
    page.drawText(invoice.notes, {
      x: margin,
      y: y,
      size: 9,
      font: helvetica,
      color: textColor,
      maxWidth: width - 2 * margin
    });
  }
  
  // Footer
  const footerY = 80;
  const footerLines = [
    'pix.immo GmbH · Hamburg · Deutschland',
    'USt-IdNr: DE123456789 · Geschäftsführer: Max Mustermann',
    'Bankverbindung: IBAN DE89 3704 0044 0532 0130 00 · BIC: COBADEFFXXX',
    '',
    'Zahlbar innerhalb von 14 Tagen ohne Abzug.'
  ];
  
  let footerLineY = footerY;
  footerLines.forEach((line) => {
    const textWidth = helvetica.widthOfTextAtSize(line, 8);
    page.drawText(line, {
      x: (width - textWidth) / 2,
      y: footerLineY,
      size: 8,
      font: helvetica,
      color: grayColor
    });
    footerLineY -= 12;
  });
  
  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(cents / 100);
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'ENTWURF',
    sent: 'VERSENDET',
    paid: 'BEZAHLT',
    cancelled: 'STORNIERT'
  };
  return labels[status] || status.toUpperCase();
}

import { jsPDF } from 'jspdf';
import { Document } from '../types/document';
import html2canvas from 'html2canvas';

export async function generatePDF(document: Document) {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Add title and header with styling
    pdf.setFontSize(24);
    pdf.setTextColor(59, 130, 246); // Blue color
    pdf.text('Document Translation', margin, margin);
    
    pdf.setFontSize(14);
    pdf.setTextColor(0);
    pdf.text(document.name, margin, margin + 12);
    
    // Add metadata with styling
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128); // Gray color
    const metadata = [
      `Created: ${new Date(document.uploadDate).toLocaleString()}`,
      `Document Size: ${(document.size / 1024).toFixed(1)}KB`
    ];
    metadata.forEach((line, index) => {
      pdf.text(line, margin, margin + 20 + (index * 5));
    });
    
    let yPosition = margin + 35;
    
    // Add divider line
    pdf.setDrawColor(229, 231, 235); // Light gray
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
    
    // Original text section
    if (document.originalText) {
      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55); // Dark gray
      pdf.text('Original Text', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(11);
      pdf.setTextColor(55, 65, 81); // Medium gray
      const splitOriginal = pdf.splitTextToSize(document.originalText, contentWidth);
      
      // Add background for original text
      pdf.setFillColor(249, 250, 251); // Very light gray
      pdf.rect(margin - 2, yPosition - 2, contentWidth + 4, (splitOriginal.length * 5) + 4, 'F');
      
      pdf.text(splitOriginal, margin, yPosition);
      yPosition += (splitOriginal.length * 5) + 15;
    }
    
    // Add divider between sections
    if (document.translatedText) {
      pdf.setDrawColor(229, 231, 235);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
    }
    
    // Translated text section
    if (document.translatedText) {
      // Check if we need a new page
      if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Translated Text', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(11);
      pdf.setTextColor(55, 65, 81);
      const splitTranslated = pdf.splitTextToSize(document.translatedText, contentWidth);
      
      // Add background for translated text
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margin - 2, yPosition - 2, contentWidth + 4, (splitTranslated.length * 5) + 4, 'F');
      
      pdf.text(splitTranslated, margin, yPosition);
    }
    
    // Add footer
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175); // Light gray
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF with a clean filename
    const cleanFileName = document.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    
    pdf.save(`${cleanFileName}_translation.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}
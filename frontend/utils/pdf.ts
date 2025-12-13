import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { GeneratedContent } from '../types';

// Load image and convert to base64
function loadImageAsDataUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

// Split text into lines that fit within width
function splitTextIntoLines(pdf: jsPDF, text: string, maxWidth: number, fontSize: number): string[] {
  // Set font size temporarily to calculate width correctly
  const originalSize = pdf.getFontSize();
  pdf.setFontSize(fontSize);
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = pdf.getTextWidth(testLine);
    
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // Restore original font size
  pdf.setFontSize(originalSize);
  
  return lines;
}

export async function exportContentToPdf(content: GeneratedContent, fileName = 'magineai-magazine.pdf') {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;
  const lineHeight = 6; // Reduced for tighter spacing
  const sectionSpacing = 8; // Reduced spacing

  // Helper to set background on current page
  const setPageBackground = () => {
    pdf.setFillColor(10, 10, 26);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  };

  // Helper to add new page if needed
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      setPageBackground(); // Set dark background on new page
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper to add text with wrapping
  const addText = (text: string, fontSize: number, isBold = false, color: [number, number, number] = [255, 255, 255]) => {
    pdf.setFontSize(fontSize);
    pdf.setTextColor(color[0], color[1], color[2]);
    if (isBold) {
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setFont('helvetica', 'normal');
    }

    const lines = splitTextIntoLines(pdf, text, contentWidth);
    
    lines.forEach((line) => {
      checkNewPage(lineHeight);
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
  };

  // Set background color (dark blue)
  pdf.setFillColor(10, 10, 26);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Cover Page - Title
  pdf.setTextColor(200, 200, 255);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('MAGINEAI ISSUE', margin, yPosition);
  yPosition += 10; // Increased spacing

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  const titleLines = splitTextIntoLines(pdf, content.title || 'Untitled Story', contentWidth, 24);
  titleLines.forEach((line) => {
    checkNewPage(12); // Check if we need new page (lineHeight * 2)
    pdf.text(line, margin, yPosition);
    yPosition += 12; // Increased spacing for title lines
  });
  yPosition += sectionSpacing;

  // Introduction
  if (content.introduction) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(200, 200, 200);
    const introLines = splitTextIntoLines(pdf, content.introduction, contentWidth, 12);
    introLines.forEach((line) => {
      checkNewPage(7); // Check if we need new page
      pdf.text(line, margin, yPosition);
      yPosition += 7; // Consistent line height
    });
    yPosition += sectionSpacing * 2;
  }

  // New page for main content
  pdf.addPage();
  setPageBackground(); // Set dark background on new page
  yPosition = margin;

  // Main Story Section
  if (content.mainStory) {
    checkNewPage(15); // Reserve space for heading
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(150, 150, 255);
    pdf.text('Main Story', margin, yPosition);
    yPosition += 10; // Spacing after heading

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(240, 240, 240); // Brighter for better visibility
    const storyLines = splitTextIntoLines(pdf, content.mainStory, contentWidth, 11);
    storyLines.forEach((line) => {
      checkNewPage(7); // Check if we need new page
      pdf.text(line, margin, yPosition);
      yPosition += 7; // Consistent line height (no overlap)
    });
    yPosition += sectionSpacing * 2;
  }

  // Character Highlights Section
  if (content.characterHighlights) {
    checkNewPage(15); // Reserve space for heading
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(150, 150, 255);
    pdf.text('Characters', margin, yPosition);
    yPosition += 10; // Spacing after heading

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(240, 240, 240); // Brighter for better visibility
    const charLines = splitTextIntoLines(pdf, content.characterHighlights, contentWidth, 11);
    charLines.forEach((line) => {
      checkNewPage(7); // Check if we need new page
      pdf.text(line, margin, yPosition);
      yPosition += 7; // Consistent line height (no overlap)
    });
    yPosition += sectionSpacing * 2;
  }

  // Conclusion Section
  if (content.conclusion) {
    checkNewPage(15); // Reserve space for heading
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(150, 150, 255);
    pdf.text('Moral & Wrap-up', margin, yPosition);
    yPosition += 10; // Spacing after heading

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(240, 240, 240); // Brighter for better visibility
    const conclusionLines = splitTextIntoLines(pdf, content.conclusion, contentWidth, 11);
    conclusionLines.forEach((line) => {
      checkNewPage(7); // Check if we need new page
      pdf.text(line, margin, yPosition);
      yPosition += 7; // Consistent line height (no overlap)
    });
  }

  // Add images if available
  if (content.images && content.images.length > 0) {
    for (let i = 0; i < content.images.length; i++) {
      try {
        checkNewPage(60); // Reserve space for image
        const imgData = await loadImageAsDataUrl(content.images[i]);
        const imgWidth = contentWidth;
        const imgHeight = 50; // Fixed height for images
        
        pdf.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + sectionSpacing;
      } catch (error) {
        console.warn(`Failed to load image ${i + 1}:`, error);
        // Continue with next image
      }
    }
  }

  pdf.save(fileName);
}

// Legacy function for backward compatibility (uses html2canvas)
export async function exportElementToPdf(elementId: string, fileName = 'magineai-magazine.pdf') {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Preview not ready for export');

  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#0a0a1a',
      allowTaint: true,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    
    if (imgHeight > pageHeight) {
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    } else {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    }
    
    pdf.save(fileName);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}


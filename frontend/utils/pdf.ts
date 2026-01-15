import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { GeneratedContent, MagazineStructure, MagazinePage } from '../types';

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
  const lineHeight = 6;

  // Helper to set background on current page
  const setPageBackground = () => {
    pdf.setFillColor(10, 10, 26);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  };

  // Helper to add new page if needed (or force new page)
  const addNewPage = () => {
    pdf.addPage();
    setPageBackground();
    yPosition = margin;
  };

  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      addNewPage();
      return true;
    }
    return false;
  };

  // Initial setup
  setPageBackground();
  pdf.setTextColor(255, 255, 255);

  let magazine: MagazineStructure | null = null;
  try {
    magazine = JSON.parse(content.mainStory);
  } catch (e) {
    // Not JSON, assume legacy flat story
  }

  if (magazine && magazine.pages) {
    // --- RENDER STRUCTURED MAGAZINE ---

    for (let i = 0; i < magazine.pages.length; i++) {
      const page = magazine.pages[i];

      // Start every logical page on a new PDF page (except the first one if it's empty)
      if (i > 0) addNewPage();

      // Page Number
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Page ${page.pageNumber}`, pageWidth - margin - 10, margin);
      yPosition += 5;

      // Type-Specific Rendering
      if (page.type === 'COVER') {
        // Title (Centered)
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(30);
        pdf.setTextColor(255, 215, 0); // Gold
        const titleLines = splitTextIntoLines(pdf, page.title || content.title, contentWidth, 30);
        titleLines.forEach(line => {
          const textWidth = pdf.getTextWidth(line);
          pdf.text(line, (pageWidth - textWidth) / 2, pageHeight / 3);
        });

        // Tagline/Content
        if (page.content) {
          pdf.setFontSize(16);
          pdf.setTextColor(200, 200, 255);
          const taglineLines = splitTextIntoLines(pdf, page.content, contentWidth, 16);
          let taglineY = pageHeight / 2;
          taglineLines.forEach(line => {
            const textWidth = pdf.getTextWidth(line);
            pdf.text(line, (pageWidth - textWidth) / 2, taglineY);
            taglineY += 10;
          });
        }

        // Cover Image (Background - simulated by placing it large)
        if (page.image) {
          try {
            const imgData = await loadImageAsDataUrl(page.image);
            // Render underneath title? complicated in jsPDF without strict layering control.
            // Let's put it at the bottom half
            pdf.addImage(imgData, 'JPEG', margin, pageHeight / 2 + 20, contentWidth, 80);
          } catch (e) { console.warn("Cover image load failed"); }
        }

      } else if (page.type === 'CONTENTS') {
        pdf.setFontSize(22);
        pdf.setTextColor(255, 255, 255);
        pdf.text("Table of Contents", margin, yPosition);
        yPosition += 20;

        // Parse TOC JSON if possible, otherwise use raw text
        try {
          const tocItems = JSON.parse(page.content || '[]');
          if (Array.isArray(tocItems)) {
            pdf.setFontSize(12);
            tocItems.forEach((item: any) => {
              pdf.text(`${item.page} ................................. ${item.title}`, margin, yPosition);
              yPosition += 10;
            });
          } else {
            // Fallback
            pdf.setFontSize(11);
            const lines = splitTextIntoLines(pdf, page.content || '', contentWidth, 11);
            lines.forEach(l => { pdf.text(l, margin, yPosition); yPosition += 7; });
          }
        } catch (e) {
          pdf.setFontSize(11);
          const lines = splitTextIntoLines(pdf, page.content || '', contentWidth, 11);
          lines.forEach(l => { pdf.text(l, margin, yPosition); yPosition += 7; });
        }
      } else {
        // Standard Page (Chapter, Intro, etc.)

        // Title
        if (page.title) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(18);
          pdf.setTextColor(150, 150, 255);
          pdf.text(page.title, margin, yPosition);
          yPosition += 15;
        }

        // Image
        if (page.image) {
          try {
            const imgData = await loadImageAsDataUrl(page.image);
            pdf.addImage(imgData, 'JPEG', margin, yPosition, contentWidth, 60);
            yPosition += 65;
          } catch (e) { console.warn("Page image load failed"); }
        }

        // Content
        if (page.content) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11);
          pdf.setTextColor(230, 230, 230);
          const lines = splitTextIntoLines(pdf, page.content, contentWidth, 11);
          lines.forEach(line => {
            checkNewPage(7);
            pdf.text(line, margin, yPosition);
            yPosition += 7;
          });
        }
      }
    }

  } else {
    // --- LEGACY FALLBACK RENDERER ---

    // Cover Page - Title
    pdf.setTextColor(200, 200, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('MAGINEAI ISSUE', margin, yPosition);
    yPosition += 10;

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    const titleLines = splitTextIntoLines(pdf, content.title || 'Untitled Story', contentWidth, 24);
    titleLines.forEach((line) => {
      checkNewPage(12);
      pdf.text(line, margin, yPosition);
      yPosition += 12;
    });
    yPosition += 8;

    // Introduction
    if (content.introduction) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(200, 200, 200);
      const introLines = splitTextIntoLines(pdf, content.introduction, contentWidth, 12);
      introLines.forEach((line) => {
        checkNewPage(7);
        pdf.text(line, margin, yPosition);
        yPosition += 7;
      });
      yPosition += 16;
    }

    // Main Story Section
    if (content.mainStory) {
      checkNewPage(15);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(150, 150, 255);
      pdf.text('Main Story', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(240, 240, 240);
      const storyLines = splitTextIntoLines(pdf, content.mainStory, contentWidth, 11);
      storyLines.forEach((line) => {
        checkNewPage(7);
        pdf.text(line, margin, yPosition);
        yPosition += 7;
      });
      yPosition += 16;
    }

    // Images (Legacy Array)
    if (content.images && content.images.length > 0) {
      for (let i = 0; i < content.images.length; i++) {
        try {
          checkNewPage(60);
          const imgData = await loadImageAsDataUrl(content.images[i]);
          pdf.addImage(imgData, 'JPEG', margin, yPosition, contentWidth, 50);
          yPosition += 58;
        } catch (error) {
          console.warn(`Failed to load image ${i + 1}:`, error);
        }
      }
    }
  }

  pdf.save(fileName);
}

// Capture multiple elements (pages) and combine into one PDF
export async function exportMultiPageToPdf(elementIds: string[], fileName = 'magineai-magazine.pdf') {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < elementIds.length; i++) {
    const element = document.getElementById(elementIds[i]);
    if (!element) continue;

    try {
      // Wait a bit for images to be ready (optional, but safer)
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#1f2937', // Match dark theme or make transparent
        windowWidth: 1200 // Force consistent rendering width
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95); // JPEG slightly smaller than PNG
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * dev_scale_factor(pageWidth)) / canvas.width; // Calculate based on ratio

      // Determine rendering dimensions to fit page "contain" style or "cover"
      const ratio = canvas.width / canvas.height;
      const pdfRatio = pageWidth / pageHeight;

      let renderW = pageWidth;
      let renderH = pageWidth / ratio;

      if (renderH > pageHeight) {
        // If too tall, fit to height
        renderH = pageHeight;
        renderW = pageHeight * ratio;
      }

      // Center the image
      const x = (pageWidth - renderW) / 2;
      const y = (pageHeight - renderH) / 2;

      if (i > 0) pdf.addPage();

      // Fill background for uniformity
      pdf.setFillColor(10, 10, 26);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      pdf.addImage(imgData, 'JPEG', x, y, renderW, renderH);

    } catch (error) {
      console.error(`Failed to capture page ${i}:`, error);
    }
  }

  pdf.save(fileName);
}

function dev_scale_factor(width: number) { return 1; } // Dummy helper if needed, logic integrated above.

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

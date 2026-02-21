import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include lastAutoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}



export interface ExportMarker {
  name: string;
  value: number;
  unit: string;
  referenceRange?: {
    low?: number;
    high?: number;
    unit?: string;
  };
  status: 'low' | 'normal' | 'high';
  medgemmaContent?: {
    whatIsIt: string;
    researchContext: string;
    foodPatterns: string;
  };
}

function formatRange(rr?: ExportMarker['referenceRange'], fallbackUnit?: string) {
  if (!rr) return 'N/A';

  const lowOk = typeof rr.low === 'number';
  const highOk = typeof rr.high === 'number';
  const unit = rr.unit ?? fallbackUnit ?? '';

  // If neither value exists, treat as N/A
  if (!lowOk && !highOk) return 'N/A';

  // If one side is missing, show an em dash
  const lowText = lowOk ? String(rr.low) : '—';
  const highText = highOk ? String(rr.high) : '—';

  return `${lowText}-${highText}${unit ? ` ${unit}` : ''}`;
}

export async function generatePDFReport(markers: ExportMarker[]): Promise<void> {
  const doc = new jsPDF();

  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Lab Results Literacy Companion', margin, yPosition);

  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);

  yPosition += 15;

  // Privacy Notice
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 200);
  doc.setFont('helvetica', 'bold');
  doc.text('Privacy-First Processing', margin, yPosition);

  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80);
  const privacyText = 'This report was generated 100% locally on your device. No data was sent to any server.';
  const privacyLines = doc.splitTextToSize(privacyText, contentWidth);
  doc.text(privacyLines, margin, yPosition);

  yPosition += privacyLines.length * 4 + 10;

  // Disclaimer box
  doc.setFillColor(255, 250, 240);
  doc.rect(margin, yPosition - 5, contentWidth, 25, 'F');
  doc.setFontSize(8);
  doc.setTextColor(150, 100, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPORTANT DISCLAIMER', margin + 2, yPosition);

  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  const disclaimerText =
    'This is educational information only. It is NOT medical advice, diagnosis, or treatment. Always consult your healthcare provider for interpretation of your lab results.';
  const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 4);
  doc.text(disclaimerLines, margin + 2, yPosition);

  yPosition += 30;

  // Summary Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Results Summary', margin, yPosition);

  yPosition += 8;

  const summaryData = markers.map((m) => {
    const status = m.status === 'low' ? 'Below' : m.status === 'high' ? 'Above' : 'Normal';
    const range = formatRange(m.referenceRange, m.unit);

    return [m.name, `${m.value} ${m.unit}`, range, status];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Marker', 'Your Value', 'Reference Range', 'Status']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], fontSize: 10 },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 35 },
      2: { cellWidth: 45 },
      3: { cellWidth: 30 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const status = data.cell.raw as string;
        if (status.includes('Below')) data.cell.styles.textColor = [200, 0, 0];
        else if (status.includes('Above')) data.cell.styles.textColor = [200, 100, 0];
        else data.cell.styles.textColor = [0, 150, 0];
      }
    },
  });

  const finalY = doc.lastAutoTable.finalY || yPosition + 50;
  yPosition = finalY + 15;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Detailed Information', margin, yPosition);

  yPosition += 10;

  for (const marker of markers) {
    // New page guard
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    // Marker header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(marker.name, margin, yPosition);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40);
    doc.text(`${marker.value} ${marker.unit}`, margin + 80, yPosition);

    yPosition += 6;

    // Range line in details 
    const rangeLine = `Reference Range: ${formatRange(marker.referenceRange, marker.unit)}`;
    doc.setFontSize(9);
    doc.setTextColor(90);
    doc.text(rangeLine, margin, yPosition);
    yPosition += 8;

    if (marker.medgemmaContent) {
      // What is it
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 100, 200);
      doc.text('What is this?', margin, yPosition);

      yPosition += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40);
      const whatLines = doc.splitTextToSize(marker.medgemmaContent.whatIsIt, contentWidth);
      doc.text(whatLines, margin, yPosition);
      yPosition += whatLines.length * 4 + 6;

      // New page guard
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      // Research
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 100, 200);
      doc.text('What does research say?', margin, yPosition);

      yPosition += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40);
      const researchLines = doc.splitTextToSize(marker.medgemmaContent.researchContext, contentWidth);
      doc.text(researchLines, margin, yPosition);
      yPosition += researchLines.length * 4 + 6;

      // Food
      if (marker.medgemmaContent.foodPatterns?.trim()) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 100, 200);
        doc.text('Food & Nutrition Context:', margin, yPosition);

        yPosition += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40);
        const foodLines = doc.splitTextToSize(marker.medgemmaContent.foodPatterns, contentWidth);
        doc.text(foodLines, margin, yPosition);
        yPosition += foodLines.length * 4 + 6;
      }
    }

    // Separator
    doc.setDrawColor(200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
  }

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | Generated by Lab Results Literacy Companion`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`lab-results-${new Date().toISOString().split('T')[0]}.pdf`);
}

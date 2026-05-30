import type { TenderAnalysisResult } from '@/types';
import { formatCurrency, formatPercentage, formatDateTime, getProjectTypeLabel, getRiskLabel } from './utils';

export async function generatePDFReport(result: TenderAnalysisResult): Promise<void> {
  // Dynamic import to avoid SSR issues
  const jsPDF = (await import('jspdf')).default;
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 18;

  // ── Color palette ──────────────────────────────────────
  const DARK    = [15, 17, 23] as [number, number, number];
  const MID     = [28, 32, 44] as [number, number, number];
  const GOLD    = [251, 191, 36] as [number, number, number];
  const LIGHT   = [240, 243, 248] as [number, number, number];
  const MUTED   = [110, 118, 140] as [number, number, number];
  const EMERALD = [52, 211, 153] as [number, number, number];
  const ROSE    = [251, 113, 133] as [number, number, number];
  const AMBER   = [245, 158, 11] as [number, number, number];

  // ── Page 1: Cover / Header ─────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, 297, 'F');

  // Gold accent bar
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, 4, 297, 'F');

  // Header block
  doc.setFillColor(...MID);
  doc.roundedRect(margin, 15, W - margin * 2, 45, 3, 3, 'F');

  // Logo / title
  doc.setFillColor(...GOLD);
  doc.roundedRect(margin + 8, 22, 10, 10, 2, 2, 'F');
  doc.setFontSize(7);
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.text('TIS', margin + 9.5, 28.5);

  doc.setTextColor(...LIGHT);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Tender Intelligence System', margin + 22, 29);

  doc.setTextColor(...MUTED);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('LAPORAN ANALISIS TENDER — CONFIDENTIAL', margin + 22, 35);

  doc.setTextColor(...MUTED);
  doc.setFontSize(7.5);
  doc.text(`Digenerate: ${formatDateTime(result.createdAt)}   |   ID: ${result.id}`, margin + 22, 42);
  doc.text(`Advanced Tender Intelligence Engine v2.4.1`, margin + 22, 47);

  // Project name section
  doc.setFillColor(25, 28, 38);
  doc.roundedRect(margin, 68, W - margin * 2, 28, 3, 3, 'F');

  doc.setTextColor(...MUTED);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('NAMA PROYEK', margin + 8, 76);

  doc.setTextColor(...LIGHT);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const projName = doc.splitTextToSize(result.projectName, W - margin * 2 - 16);
  doc.text(projName, margin + 8, 82);

  doc.setTextColor(...MUTED);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    `${getProjectTypeLabel(result.input.projectType)}  ·  ${result.input.location}  ·  ${result.input.projectDuration} Hari`,
    margin + 8, 91
  );

  // ── KPI Cards row ──────────────────────────────────────
  const cardY = 106;
  const cardW = (W - margin * 2 - 12) / 4;

  const kpis = [
    { label: 'HARGA REKOMENDASI', value: formatCurrency(result.recommendedPrice, true), color: GOLD },
    { label: 'PELUANG MENANG', value: `${result.winProbability}%`, color: result.winProbability >= 65 ? EMERALD : result.winProbability >= 45 ? AMBER : ROSE },
    { label: 'PROYEKSI MARGIN', value: formatPercentage(result.marginPercentage), color: result.marginPercentage >= 12 ? EMERALD : AMBER },
    { label: 'TINGKAT RISIKO', value: getRiskLabel(result.overallRisk), color: result.overallRisk === 'rendah' || result.overallRisk === 'sangat_rendah' ? EMERALD : result.overallRisk === 'sedang' ? AMBER : ROSE },
  ];

  kpis.forEach((kpi, i) => {
    const x = margin + i * (cardW + 4);
    doc.setFillColor(...MID);
    doc.roundedRect(x, cardY, cardW, 24, 2, 2, 'F');

    doc.setDrawColor(...(kpi.color as [number, number, number]));
    doc.setLineWidth(0.5);
    doc.roundedRect(x, cardY, cardW, 24, 2, 2, 'S');

    doc.setTextColor(...MUTED);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(kpi.label, x + 4, cardY + 7);

    doc.setTextColor(...(kpi.color as [number, number, number]));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(kpi.value, x + 4, cardY + 17);
  });

  // ── Biaya Breakdown Table ──────────────────────────────
  const y1 = cardY + 34;

  sectionHeader(doc, margin, y1, W - margin * 2, 'ANALISIS STRUKTUR BIAYA', GOLD, DARK, MID);

  autoTable(doc, {
    startY: y1 + 10,
    margin: { left: margin, right: margin },
    head: [['Komponen Biaya', 'Nilai (Rp)', 'Persentase']],
    body: [
      ['Biaya Material', formatCurrency(result.input.materialCost), `${((result.input.materialCost / result.totalCost) * 100).toFixed(1)}%`],
      ['Biaya Tenaga Kerja', formatCurrency(result.input.laborCost), `${((result.input.laborCost / result.totalCost) * 100).toFixed(1)}%`],
      ['Biaya Operasional', formatCurrency(result.input.operationalCost), `${((result.input.operationalCost / result.totalCost) * 100).toFixed(1)}%`],
      ['Overhead & Faktor Lokasi', formatCurrency(result.totalCost - result.input.materialCost - result.input.laborCost - result.input.operationalCost), `${(((result.totalCost - result.input.materialCost - result.input.laborCost - result.input.operationalCost) / result.totalCost) * 100).toFixed(1)}%`],
      ['Total Harga Pokok (HPP)', formatCurrency(result.totalCost), '100%'],
      ['Margin Keuntungan', formatCurrency(result.projectedMargin), formatPercentage(result.marginPercentage)],
      ['HARGA PENAWARAN OPTIMAL', formatCurrency(result.recommendedPrice), '—'],
    ],
    headStyles: { fillColor: MID, textColor: GOLD, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fillColor: [20, 22, 32] as [number,number,number], textColor: LIGHT, fontSize: 8 },
    alternateRowStyles: { fillColor: [24, 27, 38] as [number,number,number] },
    rowPageBreak: 'auto',
    didParseCell: (data) => {
      if (data.row.index === 6) {
        data.cell.styles.fillColor = [40, 35, 15] as [number,number,number];
        data.cell.styles.textColor = GOLD;
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // ── Risk Factors Table ─────────────────────────────────
  const y2 = (doc as any).lastAutoTable.finalY + 10;

  sectionHeader(doc, margin, y2, W - margin * 2, 'MATRIKS PENILAIAN RISIKO', GOLD, DARK, MID);

  autoTable(doc, {
    startY: y2 + 10,
    margin: { left: margin, right: margin },
    head: [['Kategori Risiko', 'Tingkat', 'Skor', 'Deskripsi']],
    body: result.riskFactors.map(f => [
      f.category,
      getRiskLabel(f.level),
      `${f.score}/100`,
      f.description,
    ]),
    headStyles: { fillColor: MID, textColor: GOLD, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fillColor: [20, 22, 32] as [number,number,number], textColor: LIGHT, fontSize: 7.5 },
    alternateRowStyles: { fillColor: [24, 27, 38] as [number,number,number] },
    columnStyles: { 3: { cellWidth: 75 } },
  });

  // ── Page 2 ─────────────────────────────────────────────
  doc.addPage();
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, 297, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, 4, 297, 'F');

  // Ringkasan strategis
  const p2y = 18;
  sectionHeader(doc, margin, p2y, W - margin * 2, 'RINGKASAN STRATEGIS', GOLD, DARK, MID);

  doc.setFillColor(...MID);
  doc.roundedRect(margin, p2y + 10, W - margin * 2, 32, 2, 2, 'F');

  doc.setTextColor(...MUTED);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const summaryLines = doc.splitTextToSize(result.strategicSummary, W - margin * 2 - 14);
  doc.text(summaryLines.slice(0, 6), margin + 7, p2y + 18);

  // Rekomendasi
  const p2y2 = p2y + 52;
  sectionHeader(doc, margin, p2y2, W - margin * 2, 'REKOMENDASI TINDAKAN', GOLD, DARK, MID);

  autoTable(doc, {
    startY: p2y2 + 10,
    margin: { left: margin, right: margin },
    head: [['#', 'Rekomendasi']],
    body: result.recommendations.map((r, i) => [`${i + 1}`, r]),
    headStyles: { fillColor: MID, textColor: GOLD, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fillColor: [20, 22, 32] as [number,number,number], textColor: LIGHT, fontSize: 8 },
    alternateRowStyles: { fillColor: [24, 27, 38] as [number,number,number] },
    columnStyles: { 0: { cellWidth: 10 } },
  });

  // Peringatan
  if (result.keyWarnings.length > 0) {
    const p2y3 = (doc as any).lastAutoTable.finalY + 10;
    sectionHeader(doc, margin, p2y3, W - margin * 2, 'PERINGATAN KRITIS', ROSE, DARK, MID);

    autoTable(doc, {
      startY: p2y3 + 10,
      margin: { left: margin, right: margin },
      head: [['#', 'Peringatan']],
      body: result.keyWarnings.map((w, i) => [`${i + 1}`, w]),
      headStyles: { fillColor: [40, 18, 22] as [number,number,number], textColor: ROSE, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fillColor: [20, 22, 32] as [number,number,number], textColor: LIGHT, fontSize: 8 },
      alternateRowStyles: { fillColor: [24, 27, 38] as [number,number,number] },
      columnStyles: { 0: { cellWidth: 10 } },
    });
  }

  // Footer
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(18, 20, 28);
    doc.rect(0, 285, W, 12, 'F');
    doc.setFontSize(6.5);
    doc.setTextColor(...MUTED);
    doc.text('Tender Intelligence System — Laporan ini bersifat rahasia dan hanya untuk internal.', margin, 291);
    doc.text(`Hal ${i} / ${pages}`, W - margin, 291, { align: 'right' });
  }

  // Save
  const filename = `TIS_${result.projectName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}_${Date.now()}.pdf`;
  doc.save(filename);
}

function sectionHeader(
  doc: any,
  x: number, y: number, w: number,
  text: string,
  color: [number,number,number],
  darkBg: [number,number,number],
  midBg: [number,number,number]
) {
  doc.setFillColor(...midBg);
  doc.roundedRect(x, y, w, 8, 1, 1, 'F');
  doc.setDrawColor(...color);
  doc.setLineWidth(0.4);
  doc.roundedRect(x, y, w, 8, 1, 1, 'S');

  doc.setFillColor(...color);
  doc.rect(x, y, 3, 8, 'F');

  doc.setTextColor(...color);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(text, x + 8, y + 5.5);
}

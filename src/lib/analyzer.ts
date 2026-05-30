import type {
  TenderInput,
  TenderAnalysisResult,
  RiskFactor,
  RiskLevel,
  ConfidenceLevel,
} from '@/types';
import { generateId, getWinProbabilityLabel } from './utils';

// ============================================================
// TENDER INTELLIGENCE ANALYSIS ENGINE
// Core calculation logic - no external dependencies
// ============================================================

const LOCATION_FACTORS: Record<string, number> = {
  'DKI Jakarta': 1.25,
  'Banten': 1.15,
  'Jawa Barat': 1.10,
  'Jawa Tengah': 1.05,
  'Jawa Timur': 1.05,
  'Bali': 1.10,
  'Kalimantan Timur': 1.20,
  'Kalimantan Selatan': 1.15,
  'Sumatera Utara': 1.10,
  'Sumatera Selatan': 1.08,
  'Riau': 1.12,
  'Sulawesi Selatan': 1.08,
  'Lainnya': 1.00,
};

const PROJECT_TYPE_OVERHEAD: Record<string, number> = {
  konstruksi_gedung: 0.08,
  konstruksi_jalan: 0.07,
  konstruksi_jembatan: 0.09,
  mekanikal_elektrikal: 0.10,
  interior_finishing: 0.12,
  pengadaan_barang: 0.05,
  jasa_konsultansi: 0.15,
  infrastruktur_utilitas: 0.08,
  renovasi_rehabilitasi: 0.11,
  lainnya: 0.10,
};

const URGENCY_MULTIPLIER: Record<string, number> = {
  rendah: 1.0,
  sedang: 1.03,
  tinggi: 1.06,
  sangat_tinggi: 1.10,
};

export function runTenderAnalysis(input: TenderInput): TenderAnalysisResult {
  const locationFactor = LOCATION_FACTORS[input.location] || 1.0;
  const overhead = PROJECT_TYPE_OVERHEAD[input.projectType] || 0.10;
  const urgencyMult = URGENCY_MULTIPLIER[input.urgencyLevel] || 1.0;

  // === COST CALCULATION ===
  const directCost = input.materialCost + input.laborCost + input.operationalCost;
  const overheadCost = directCost * overhead;
  const adjustedCost = (directCost + overheadCost) * locationFactor * urgencyMult;
  const totalCost = adjustedCost;

  // === MARGIN & PRICING ===
  const targetMarginDecimal = input.targetMargin / 100;
  const recommendedPrice = totalCost / (1 - targetMarginDecimal);
  const minimumPrice = totalCost * 1.05; // 5% absolute minimum
  const maximumPrice = input.projectValue * 0.98; // just under budget

  const effectivePrice = Math.min(
    Math.max(recommendedPrice, minimumPrice),
    maximumPrice
  );

  const projectedMargin = effectivePrice - totalCost;
  const marginPercentage = (projectedMargin / effectivePrice) * 100;

  // === WIN PROBABILITY ===
  const priceRatio = effectivePrice / input.competitorEstimate;

  let winBase = 50;

  // Price vs competitor
  if (priceRatio < 0.88) winBase += 25;
  else if (priceRatio < 0.93) winBase += 18;
  else if (priceRatio < 0.97) winBase += 12;
  else if (priceRatio < 1.0) winBase += 5;
  else if (priceRatio < 1.03) winBase -= 5;
  else if (priceRatio < 1.08) winBase -= 15;
  else winBase -= 25;

  // Margin health impact on win probability
  if (marginPercentage < 5) winBase -= 10; // Too low margin = risky behavior, lower confidence
  else if (marginPercentage > 30) winBase -= 8; // Too high = overpriced
  else if (marginPercentage >= 10 && marginPercentage <= 20) winBase += 5;

  // Urgency factor
  if (input.urgencyLevel === 'sangat_tinggi') winBase -= 5;
  else if (input.urgencyLevel === 'rendah') winBase += 3;

  // Location competitive factor
  if (input.location === 'DKI Jakarta') winBase -= 5; // More competition
  else if (['Lainnya', 'Kalimantan Timur'].includes(input.location)) winBase += 5; // Less competition

  const winProbability = Math.min(95, Math.max(5, Math.round(winBase)));

  // === COMPETITOR POSITIONING ===
  let competitorPositioning: TenderAnalysisResult['competitorPositioning'];
  if (priceRatio < 0.90) competitorPositioning = 'jauh_lebih_murah';
  else if (priceRatio < 0.97) competitorPositioning = 'lebih_murah';
  else if (priceRatio <= 1.03) competitorPositioning = 'kompetitif';
  else if (priceRatio <= 1.10) competitorPositioning = 'lebih_mahal';
  else competitorPositioning = 'jauh_lebih_mahal';

  // === PRICING STATUS ===
  let pricingStatus: TenderAnalysisResult['pricingStatus'];
  if (marginPercentage < 5) pricingStatus = 'underprice';
  else if (priceRatio > 1.12) pricingStatus = 'overprice';
  else if (priceRatio > 1.05) pricingStatus = 'slight_high';
  else pricingStatus = 'optimal';

  // === RISK ASSESSMENT ===
  const riskFactors = calculateRiskFactors(input, marginPercentage, priceRatio, winProbability);
  const riskScore = calculateRiskScore(riskFactors);
  const overallRisk = scoreToRiskLevel(riskScore);

  // === CONFIDENCE ===
  const confidenceScore = calculateConfidence(input, marginPercentage, winProbability);
  const confidenceLevel = scoreToConfidenceLevel(confidenceScore);

  // === SCORES ===
  const profitabilityScore = Math.min(100, Math.max(0, Math.round(
    (marginPercentage / 25) * 100
  )));
  const competitivenessScore = Math.min(100, Math.max(0, winProbability));
  const sustainabilityScore = Math.min(100, Math.max(0, Math.round(
    profitabilityScore * 0.4 + competitivenessScore * 0.4 + (100 - riskScore) * 0.2
  )));

  // === STRATEGIC OUTPUT ===
  const {
    strategicSummary,
    keyWarnings,
    recommendations,
    competitiveAdvantages,
  } = generateStrategicOutput(
    input,
    effectivePrice,
    marginPercentage,
    winProbability,
    overallRisk,
    pricingStatus,
    competitorPositioning
  );

  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    projectName: input.projectName,
    input,

    recommendedPrice: Math.round(effectivePrice),
    minimumPrice: Math.round(minimumPrice),
    maximumPrice: Math.round(maximumPrice),
    totalCost: Math.round(totalCost),
    projectedMargin: Math.round(projectedMargin),
    marginPercentage: Math.round(marginPercentage * 10) / 10,

    winProbability,
    winProbabilityLabel: getWinProbabilityLabel(winProbability),
    competitorPositioning,
    pricingStatus,

    overallRisk,
    riskScore: Math.round(riskScore),
    riskFactors,

    confidenceLevel,
    confidenceScore: Math.round(confidenceScore),

    strategicSummary,
    keyWarnings,
    recommendations,
    competitiveAdvantages,

    profitabilityScore,
    competitivenessScore,
    sustainabilityScore,
  };
}

function calculateRiskFactors(
  input: TenderInput,
  marginPercentage: number,
  priceRatio: number,
  winProb: number
): RiskFactor[] {
  const factors: RiskFactor[] = [];

  // Margin Risk
  let marginRisk: RiskLevel;
  let marginScore: number;
  if (marginPercentage < 5) { marginRisk = 'sangat_tinggi'; marginScore = 90; }
  else if (marginPercentage < 8) { marginRisk = 'tinggi'; marginScore = 70; }
  else if (marginPercentage < 12) { marginRisk = 'sedang'; marginScore = 45; }
  else if (marginPercentage < 20) { marginRisk = 'rendah'; marginScore = 20; }
  else { marginRisk = 'sangat_rendah'; marginScore = 10; }

  factors.push({
    category: 'Risiko Margin',
    level: marginRisk,
    score: marginScore,
    description: `Margin proyeksi ${marginPercentage.toFixed(1)}% dari nilai kontrak. ${
      marginPercentage < 8 ? 'Margin sangat tipis, rentan terhadap eskalasi biaya.' :
      marginPercentage > 25 ? 'Margin tinggi berpotensi mengurangi daya saing harga.' :
      'Margin dalam batas aman untuk operasional.'
    }`,
    recommendation: marginPercentage < 8
      ? 'Pertimbangkan untuk mengoptimalkan struktur biaya atau negosiasi harga material.'
      : marginPercentage > 25
      ? 'Evaluasi apakah harga terlalu tinggi dibandingkan pasar.'
      : 'Pertahankan struktur biaya saat ini.',
  });

  // Competition Risk
  let compRisk: RiskLevel;
  let compScore: number;
  if (priceRatio > 1.10) { compRisk = 'sangat_tinggi'; compScore = 85; }
  else if (priceRatio > 1.05) { compRisk = 'tinggi'; compScore = 65; }
  else if (priceRatio > 1.0) { compRisk = 'sedang'; compScore = 40; }
  else if (priceRatio > 0.95) { compRisk = 'rendah'; compScore = 20; }
  else { compRisk = 'sangat_rendah'; compScore = 10; }

  factors.push({
    category: 'Tekanan Kompetitor',
    level: compRisk,
    score: compScore,
    description: `Penawaran Anda ${priceRatio > 1 ? `${((priceRatio - 1) * 100).toFixed(1)}% lebih tinggi` : `${((1 - priceRatio) * 100).toFixed(1)}% lebih rendah`} dari estimasi pesaing.`,
    recommendation: priceRatio > 1.05
      ? 'Perlu strategi value proposition yang kuat atau optimasi harga kompetitif.'
      : 'Posisi harga kompetitif. Fokus pada kualifikasi teknis dan track record.',
  });

  // Urgency Risk
  let urgencyRisk: RiskLevel;
  let urgencyScore: number;
  if (input.urgencyLevel === 'sangat_tinggi') { urgencyRisk = 'tinggi'; urgencyScore = 65; }
  else if (input.urgencyLevel === 'tinggi') { urgencyRisk = 'sedang'; urgencyScore = 45; }
  else if (input.urgencyLevel === 'sedang') { urgencyRisk = 'rendah'; urgencyScore = 25; }
  else { urgencyRisk = 'sangat_rendah'; urgencyScore = 10; }

  factors.push({
    category: 'Risiko Waktu',
    level: urgencyRisk,
    score: urgencyScore,
    description: `Tingkat urgensi ${input.urgencyLevel === 'sangat_tinggi' ? 'sangat tinggi' : input.urgencyLevel} meningkatkan risiko eskalasi biaya operasional dan lembur.`,
    recommendation: (['tinggi','sangat_tinggi'] as RiskLevel[]).includes(urgencyRisk)
      ? 'Pastikan buffer biaya lembur dan mobilisasi cepat sudah diperhitungkan dalam RAB.'
      : 'Timeline masih dapat dikelola dengan perencanaan normal.',
  });

  // Project Scale Risk
  const scaleRatio = input.projectValue / 10_000_000_000; // relative to 10B
  let scaleRisk: RiskLevel;
  let scaleScore: number;
  if (scaleRatio > 5) { scaleRisk = 'tinggi'; scaleScore = 60; }
  else if (scaleRatio > 2) { scaleRisk = 'sedang'; scaleScore = 35; }
  else if (scaleRatio > 0.5) { scaleRisk = 'rendah'; scaleScore = 20; }
  else { scaleRisk = 'sangat_rendah'; scaleScore = 10; }

  factors.push({
    category: 'Skala Proyek',
    level: scaleRisk,
    score: scaleScore,
    description: `Nilai proyek ${(input.projectValue / 1_000_000_000).toFixed(1)}M memerlukan kapasitas modal kerja dan manajemen yang ${scaleRatio > 2 ? 'sangat besar' : 'memadai'}.`,
    recommendation: scaleRisk === 'tinggi'
      ? 'Pastikan ketersediaan jaminan pelaksanaan dan modal kerja yang cukup.'
      : 'Kapasitas proyek dalam jangkauan wajar.',
  });

  return factors;
}

function calculateRiskScore(factors: RiskFactor[]): number {
  const weights = [0.35, 0.30, 0.20, 0.15];
  return factors.reduce((sum, f, i) => sum + f.score * (weights[i] || 0.25), 0);
}

function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 75) return 'sangat_tinggi';
  if (score >= 55) return 'tinggi';
  if (score >= 35) return 'sedang';
  if (score >= 15) return 'rendah';
  return 'sangat_rendah';
}

function calculateConfidence(
  input: TenderInput,
  marginPercentage: number,
  winProb: number
): number {
  let score = 70; // base

  // Data completeness
  if (input.scopeNotes && input.scopeNotes.length > 20) score += 10;
  if (input.projectDuration > 0) score += 5;

  // Reasonableness checks
  if (marginPercentage >= 8 && marginPercentage <= 25) score += 10;
  if (winProb >= 40 && winProb <= 80) score += 5;

  // Cost structure
  const totalCost = input.materialCost + input.laborCost + input.operationalCost;
  const costRatio = totalCost / input.projectValue;
  if (costRatio >= 0.5 && costRatio <= 0.85) score += 5;

  return Math.min(98, Math.max(20, score));
}

function scoreToConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 85) return 'sangat_tinggi';
  if (score >= 70) return 'tinggi';
  if (score >= 50) return 'sedang';
  if (score >= 30) return 'rendah';
  return 'sangat_rendah';
}

function generateStrategicOutput(
  input: TenderInput,
  recommendedPrice: number,
  marginPercentage: number,
  winProbability: number,
  riskLevel: RiskLevel,
  pricingStatus: TenderAnalysisResult['pricingStatus'],
  competitorPositioning: TenderAnalysisResult['competitorPositioning']
) {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  const advantages: string[] = [];

  // Pricing warnings
  if (pricingStatus === 'underprice') {
    warnings.push('PERINGATAN: Harga penawaran berada di bawah titik aman profitabilitas. Risiko kerugian operasional tinggi.');
  }
  if (pricingStatus === 'overprice') {
    warnings.push('PERINGATAN: Harga penawaran signifikan di atas estimasi pesaing. Peluang menang sangat rendah.');
  }
  if (marginPercentage < 8) {
    warnings.push(`Margin bersih ${marginPercentage.toFixed(1)}% terlalu tipis untuk menanggung eskalasi biaya yang tidak terduga.`);
  }
  if (input.urgencyLevel === 'sangat_tinggi') {
    warnings.push('Deadline sangat ketat meningkatkan risiko biaya tambahan dan potensi penalti keterlambatan.');
  }

  // Recommendations
  if (competitorPositioning === 'lebih_mahal' || competitorPositioning === 'jauh_lebih_mahal') {
    recommendations.push('Evaluasi potensi efisiensi biaya material tanpa mengorbankan kualitas teknis.');
    recommendations.push('Perkuat dokumen teknis dan referensi proyek serupa untuk justifikasi harga premium.');
  }
  if (winProbability >= 60) {
    recommendations.push('Posisi harga kompetitif. Fokus pada kelengkapan administrasi dan dokumen kualifikasi.');
  }
  if (marginPercentage >= 15) {
    recommendations.push('Margin sehat memberikan ruang negosiasi jika diperlukan. Gunakan dengan bijak.');
  }
  recommendations.push('Siapkan contingency plan minimal 3% dari nilai kontrak untuk risiko eskalasi material.');
  recommendations.push('Pastikan semua sub-vendor sudah memberikan penawaran final sebelum submittal.');

  // Competitive advantages
  if (competitorPositioning === 'lebih_murah' || competitorPositioning === 'jauh_lebih_murah') {
    advantages.push('Harga lebih kompetitif memberikan keunggulan langsung dalam seleksi teknis-komersial.');
  }
  if (winProbability >= 65) {
    advantages.push('Peluang menang tinggi berdasarkan analisis komparatif pasar.');
  }
  if (marginPercentage >= 12 && marginPercentage <= 22) {
    advantages.push('Struktur margin sehat dan berkelanjutan untuk pelaksanaan proyek jangka panjang.');
  }
  advantages.push('Posisi penawaran telah dioptimalkan berdasarkan data pasar terkini.');

  const strategicSummary = generateSummary(
    input, recommendedPrice, marginPercentage, winProbability, riskLevel, pricingStatus
  );

  return {
    strategicSummary,
    keyWarnings: warnings.slice(0, 4),
    recommendations: recommendations.slice(0, 5),
    competitiveAdvantages: advantages.slice(0, 4),
  };
}

function generateSummary(
  input: TenderInput,
  price: number,
  margin: number,
  winProb: number,
  risk: RiskLevel,
  status: string
): string {
  const priceStr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);

  return `Berdasarkan analisis komprehensif terhadap proyek "${input.projectName}" dengan estimasi nilai Rp ${(input.projectValue / 1_000_000_000).toFixed(1)} miliar di wilayah ${input.location}, sistem merekomendasikan harga penawaran optimal sebesar ${priceStr} dengan proyeksi margin bersih ${margin.toFixed(1)}%. Peluang memenangkan tender ini dinilai ${winProb}% dengan tingkat risiko keseluruhan ${risk.replace('_', ' ')}. ${status === 'optimal' ? 'Posisi harga berada pada zona optimal kompetitif.' : status === 'overprice' ? 'Diperlukan evaluasi struktur biaya untuk meningkatkan daya saing.' : status === 'underprice' ? 'Perhatian khusus diperlukan untuk menjaga profitabilitas minimal.' : 'Harga sedikit di atas rata-rata pasar namun masih dalam batas acceptable.'} Pastikan seluruh komponen biaya telah diperhitungkan dengan cermat sebelum pengajuan penawaran final.`;
}

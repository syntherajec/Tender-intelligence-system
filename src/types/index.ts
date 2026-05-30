// ============================================================
// TENDER INTELLIGENCE SYSTEM — Type Definitions
// ============================================================

export type UserRole = 'admin' | 'analyst' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  analysisCount: number;
  accessExpiry?: string;
}

export type ProjectType =
  | 'konstruksi_gedung'
  | 'konstruksi_jalan'
  | 'konstruksi_jembatan'
  | 'mekanikal_elektrikal'
  | 'interior_finishing'
  | 'pengadaan_barang'
  | 'jasa_konsultansi'
  | 'infrastruktur_utilitas'
  | 'renovasi_rehabilitasi'
  | 'lainnya';

export type ProjectLocation =
  | 'DKI Jakarta'
  | 'Jawa Barat'
  | 'Jawa Tengah'
  | 'Jawa Timur'
  | 'Banten'
  | 'Sumatera Utara'
  | 'Sumatera Selatan'
  | 'Riau'
  | 'Kalimantan Timur'
  | 'Kalimantan Selatan'
  | 'Sulawesi Selatan'
  | 'Bali'
  | 'Lainnya';

export type UrgencyLevel = 'rendah' | 'sedang' | 'tinggi' | 'sangat_tinggi';

export interface TenderInput {
  projectName: string;
  projectType: ProjectType;
  projectValue: number;
  materialCost: number;
  laborCost: number;
  operationalCost: number;
  location: ProjectLocation;
  competitorEstimate: number;
  targetMargin: number;
  urgencyLevel: UrgencyLevel;
  projectDuration: number;
  scopeNotes?: string;
}

export type RiskLevel = 'sangat_rendah' | 'rendah' | 'sedang' | 'tinggi' | 'sangat_tinggi';
export type ConfidenceLevel = 'sangat_rendah' | 'rendah' | 'sedang' | 'tinggi' | 'sangat_tinggi';

export interface RiskFactor {
  category: string;
  level: RiskLevel;
  score: number;
  description: string;
  recommendation: string;
}

export interface TenderAnalysisResult {
  id: string;
  createdAt: string;
  projectName: string;
  input: TenderInput;

  // Pricing Analysis
  recommendedPrice: number;
  minimumPrice: number;
  maximumPrice: number;
  totalCost: number;
  projectedMargin: number;
  marginPercentage: number;

  // Win Analysis
  winProbability: number;
  winProbabilityLabel: string;
  competitorPositioning: 'jauh_lebih_murah' | 'lebih_murah' | 'kompetitif' | 'lebih_mahal' | 'jauh_lebih_mahal';
  pricingStatus: 'underprice' | 'optimal' | 'slight_high' | 'overprice';

  // Risk Assessment
  overallRisk: RiskLevel;
  riskScore: number;
  riskFactors: RiskFactor[];

  // Confidence & Analysis
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;

  // Strategic Output
  strategicSummary: string;
  keyWarnings: string[];
  recommendations: string[];
  competitiveAdvantages: string[];

  // Scoring
  profitabilityScore: number;
  competitivenessScore: number;
  sustainabilityScore: number;
}

export interface AnalysisRecord {
  id: string;
  projectName: string;
  projectType: ProjectType;
  projectValue: number;
  winProbability: number;
  recommendedPrice: number;
  riskLevel: RiskLevel;
  status: 'draft' | 'submitted' | 'won' | 'lost' | 'pending';
  createdAt: string;
  userId: string;
}

export interface DashboardStats {
  totalAnalyses: number;
  totalProjectValue: number;
  averageWinRate: number;
  activeProjects: number;
  monthlyAnalyses: { month: string; count: number; value: number }[];
  riskDistribution: { risk: string; count: number; percentage: number }[];
  winRateTrend: { period: string; rate: number }[];
  projectTypeDistribution: { type: string; count: number; value: number }[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalAnalyses: number;
  revenueThisMonth: number;
}

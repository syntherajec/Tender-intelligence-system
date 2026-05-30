import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ProjectType, RiskLevel, ConfidenceLevel, UrgencyLevel } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (value >= 1_000_000_000_000) {
      return `Rp ${(value / 1_000_000_000_000).toFixed(2)} T`;
    }
    if (value >= 1_000_000_000) {
      return `Rp ${(value / 1_000_000_000).toFixed(2)} M`;
    }
    if (value >= 1_000_000) {
      return `Rp ${(value / 1_000_000).toFixed(1)} Jt`;
    }
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getProjectTypeLabel(type: ProjectType): string {
  const labels: Record<ProjectType, string> = {
    konstruksi_gedung: 'Konstruksi Gedung',
    konstruksi_jalan: 'Konstruksi Jalan',
    konstruksi_jembatan: 'Konstruksi Jembatan',
    mekanikal_elektrikal: 'Mekanikal & Elektrikal',
    interior_finishing: 'Interior & Finishing',
    pengadaan_barang: 'Pengadaan Barang',
    jasa_konsultansi: 'Jasa Konsultansi',
    infrastruktur_utilitas: 'Infrastruktur & Utilitas',
    renovasi_rehabilitasi: 'Renovasi & Rehabilitasi',
    lainnya: 'Lainnya',
  };
  return labels[type] || type;
}

export function getRiskLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    sangat_rendah: 'Sangat Rendah',
    rendah: 'Rendah',
    sedang: 'Sedang',
    tinggi: 'Tinggi',
    sangat_tinggi: 'Sangat Tinggi',
  };
  return labels[level] || level;
}

export function getConfidenceLabel(level: ConfidenceLevel): string {
  const labels: Record<ConfidenceLevel, string> = {
    sangat_rendah: 'Sangat Rendah',
    rendah: 'Rendah',
    sedang: 'Sedang',
    tinggi: 'Tinggi',
    sangat_tinggi: 'Sangat Tinggi',
  };
  return labels[level] || level;
}

export function getUrgencyLabel(level: UrgencyLevel): string {
  const labels: Record<UrgencyLevel, string> = {
    rendah: 'Rendah',
    sedang: 'Sedang',
    tinggi: 'Tinggi',
    sangat_tinggi: 'Sangat Tinggi',
  };
  return labels[level] || level;
}

export function getRiskColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    sangat_rendah: 'text-emerald-400',
    rendah: 'text-green-400',
    sedang: 'text-amber-400',
    tinggi: 'text-orange-400',
    sangat_tinggi: 'text-rose-400',
  };
  return colors[level] || 'text-gray-400';
}

export function getRiskBadgeColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    sangat_rendah: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rendah: 'bg-green-500/10 text-green-400 border-green-500/20',
    sedang: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    tinggi: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    sangat_tinggi: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  return colors[level] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
}

export function getWinProbabilityColor(probability: number): string {
  if (probability >= 75) return 'text-emerald-400';
  if (probability >= 55) return 'text-green-400';
  if (probability >= 40) return 'text-amber-400';
  if (probability >= 25) return 'text-orange-400';
  return 'text-rose-400';
}

export function getWinProbabilityLabel(probability: number): string {
  if (probability >= 75) return 'Peluang Sangat Tinggi';
  if (probability >= 55) return 'Peluang Tinggi';
  if (probability >= 40) return 'Peluang Sedang';
  if (probability >= 25) return 'Peluang Rendah';
  return 'Peluang Sangat Rendah';
}

export function calculateTotalCost(
  material: number,
  labor: number,
  operational: number
): number {
  return material + labor + operational;
}

export function generateId(): string {
  return `TIS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'konstruksi_gedung', label: 'Konstruksi Gedung' },
  { value: 'konstruksi_jalan', label: 'Konstruksi Jalan' },
  { value: 'konstruksi_jembatan', label: 'Konstruksi Jembatan' },
  { value: 'mekanikal_elektrikal', label: 'Mekanikal & Elektrikal' },
  { value: 'interior_finishing', label: 'Interior & Finishing' },
  { value: 'pengadaan_barang', label: 'Pengadaan Barang' },
  { value: 'jasa_konsultansi', label: 'Jasa Konsultansi' },
  { value: 'infrastruktur_utilitas', label: 'Infrastruktur & Utilitas' },
  { value: 'renovasi_rehabilitasi', label: 'Renovasi & Rehabilitasi' },
  { value: 'lainnya', label: 'Lainnya' },
];

export const LOCATIONS = [
  'DKI Jakarta',
  'Jawa Barat',
  'Jawa Tengah',
  'Jawa Timur',
  'Banten',
  'Sumatera Utara',
  'Sumatera Selatan',
  'Riau',
  'Kalimantan Timur',
  'Kalimantan Selatan',
  'Sulawesi Selatan',
  'Bali',
  'Lainnya',
] as const;

export const URGENCY_LEVELS: { value: UrgencyLevel; label: string; description: string }[] = [
  { value: 'rendah', label: 'Rendah', description: '> 60 hari' },
  { value: 'sedang', label: 'Sedang', description: '30-60 hari' },
  { value: 'tinggi', label: 'Tinggi', description: '14-30 hari' },
  { value: 'sangat_tinggi', label: 'Sangat Tinggi', description: '< 14 hari' },
];

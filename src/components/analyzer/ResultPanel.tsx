'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  ShieldAlert, Target, BarChart3, FileDown, Minus,
  ChevronRight, Info, Zap, DollarSign, Percent, Clock,
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  PolarAngleAxis, Tooltip,
} from 'recharts';
import type { TenderAnalysisResult } from '@/types';
import {
  formatCurrency, formatPercentage,
  getRiskBadgeColor, getRiskLabel,
  getWinProbabilityColor, cn,
} from '@/lib/utils';
import { generatePDFReport } from '@/lib/pdfExport';

interface ResultPanelProps {
  result: TenderAnalysisResult;
}

const STAGGER = {
  container: { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } },
};

export function ResultPanel({ result }: ResultPanelProps) {
  const winColor =
    result.winProbability >= 65 ? '#34d399' :
    result.winProbability >= 45 ? '#fbbf24' : '#fb7185';

  const winData = [{ name: 'win', value: result.winProbability, fill: winColor }];

  const handleExportPDF = async () => {
    try {
      await generatePDFReport(result);
    } catch {
      alert('Export PDF gagal. Coba lagi.');
    }
  };

  return (
    <motion.div
      variants={STAGGER.container}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* ── TOP ROW: Key Metrics ─────────────────────────── */}
      <motion.div variants={STAGGER.item}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Recommended Price */}
          <MetricCard
            label="Harga Rekomendasi"
            value={formatCurrency(result.recommendedPrice, true)}
            sublabel={`Range: ${formatCurrency(result.minimumPrice, true)} – ${formatCurrency(result.maximumPrice, true)}`}
            icon={<DollarSign className="w-4 h-4" />}
            color="amber"
            featured
          />
          {/* Win Probability */}
          <MetricCard
            label="Peluang Menang"
            value={`${result.winProbability}%`}
            sublabel={result.winProbabilityLabel}
            icon={<Target className="w-4 h-4" />}
            color={result.winProbability >= 65 ? 'emerald' : result.winProbability >= 45 ? 'amber' : 'rose'}
          />
          {/* Net Margin */}
          <MetricCard
            label="Proyeksi Margin"
            value={formatPercentage(result.marginPercentage)}
            sublabel={formatCurrency(result.projectedMargin, true)}
            icon={<Percent className="w-4 h-4" />}
            color={result.marginPercentage >= 12 ? 'emerald' : result.marginPercentage >= 7 ? 'amber' : 'rose'}
          />
          {/* Risk */}
          <MetricCard
            label="Tingkat Risiko"
            value={getRiskLabel(result.overallRisk)}
            sublabel={`Skor: ${result.riskScore}/100`}
            icon={<ShieldAlert className="w-4 h-4" />}
            color={
              result.overallRisk === 'sangat_rendah' || result.overallRisk === 'rendah' ? 'emerald' :
              result.overallRisk === 'sedang' ? 'amber' : 'rose'
            }
          />
        </div>
      </motion.div>

      {/* ── MIDDLE ROW: Gauge + Pricing Analysis ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Win probability gauge */}
        <motion.div variants={STAGGER.item} className="lg:col-span-2">
          <div className="glass-card p-6 h-full flex flex-col">
            <h3 className="section-heading mb-1">Win Probability Score</h3>
            <p className="text-xs text-muted-foreground mb-4">Berbasis analisis komparatif pasar</p>

            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    startAngle={225}
                    endAngle={-45}
                    data={winData}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar
                      dataKey="value"
                      background={{ fill: 'rgba(255,255,255,0.04)' }}
                      cornerRadius={8}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                {/* Center value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-4xl font-bold" style={{ color: winColor }}>
                    {result.winProbability}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <WinIndicator
                label="Posisi vs Kompetitor"
                value={COMPETITOR_LABELS[result.competitorPositioning]}
                status={
                  result.competitorPositioning === 'lebih_murah' || result.competitorPositioning === 'jauh_lebih_murah'
                    ? 'good'
                    : result.competitorPositioning === 'kompetitif'
                    ? 'neutral'
                    : 'bad'
                }
              />
              <WinIndicator
                label="Status Pricing"
                value={PRICING_LABELS[result.pricingStatus]}
                status={
                  result.pricingStatus === 'optimal' ? 'good' :
                  result.pricingStatus === 'slight_high' ? 'neutral' : 'bad'
                }
              />
              <WinIndicator
                label="Kepercayaan Analisis"
                value={`${result.confidenceScore}%`}
                status={result.confidenceScore >= 75 ? 'good' : result.confidenceScore >= 55 ? 'neutral' : 'bad'}
              />
            </div>
          </div>
        </motion.div>

        {/* Pricing breakdown */}
        <motion.div variants={STAGGER.item} className="lg:col-span-3">
          <div className="glass-card p-6 h-full">
            <h3 className="section-heading mb-4">Breakdown Biaya & Harga</h3>

            <div className="space-y-3">
              {/* Cost bars */}
              {[
                { label: 'Biaya Material', value: result.input.materialCost, total: result.totalCost, color: 'bg-blue-500' },
                { label: 'Biaya Tenaga Kerja', value: result.input.laborCost, total: result.totalCost, color: 'bg-purple-500' },
                { label: 'Biaya Operasional', value: result.input.operationalCost, total: result.totalCost, color: 'bg-cyan-500' },
                { label: 'Overhead & Lokasi', value: result.totalCost - (result.input.materialCost + result.input.laborCost + result.input.operationalCost), total: result.totalCost, color: 'bg-orange-500' },
              ].map((item, i) => (
                <CostBar key={i} {...item} />
              ))}

              <div className="border-t border-border/50 pt-3 mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Biaya (HPP)</span>
                  <span className="font-mono font-bold text-foreground">{formatCurrency(result.totalCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Margin ({formatPercentage(result.marginPercentage)})</span>
                  <span className="font-mono font-bold text-emerald-400">+{formatCurrency(result.projectedMargin)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-border/50 pt-2">
                  <span className="text-foreground">Harga Penawaran Optimal</span>
                  <span className="font-mono text-amber-400 text-base">{formatCurrency(result.recommendedPrice)}</span>
                </div>
              </div>
            </div>

            {/* Score gauges */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: 'Profitabilitas', score: result.profitabilityScore },
                { label: 'Daya Saing', score: result.competitivenessScore },
                { label: 'Keberlanjutan', score: result.sustainabilityScore },
              ].map((s, i) => (
                <ScoreGauge key={i} label={s.label} score={s.score} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── RISK FACTORS ─────────────────────────────────── */}
      <motion.div variants={STAGGER.item}>
        <div className="glass-card p-6">
          <h3 className="section-heading mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Matriks Penilaian Risiko
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.riskFactors.map((factor, i) => (
              <RiskFactorCard key={i} factor={factor} index={i} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── STRATEGIC SUMMARY ────────────────────────────── */}
      <motion.div variants={STAGGER.item}>
        <div className="glass-card p-6">
          <h3 className="section-heading mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Ringkasan Strategis
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.strategicSummary}
          </p>
        </div>
      </motion.div>

      {/* ── RECOMMENDATIONS + WARNINGS ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Warnings */}
        {result.keyWarnings.length > 0 && (
          <motion.div variants={STAGGER.item}>
            <div className="glass-card p-5 border-rose-500/10 h-full">
              <h3 className="section-heading mb-3 flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                Peringatan Kritis
              </h3>
              <ul className="space-y-2.5">
                {result.keyWarnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        <motion.div variants={STAGGER.item}>
          <div className="glass-card p-5 border-emerald-500/10 h-full">
            <h3 className="section-heading mb-3 flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Rekomendasi Tindakan
            </h3>
            <ul className="space-y-2.5">
              {result.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Competitive Advantages */}
        <motion.div variants={STAGGER.item} className="lg:col-span-2">
          <div className="glass-card p-5 border-amber-500/10">
            <h3 className="section-heading mb-3 flex items-center gap-2 text-amber-400">
              <TrendingUp className="w-4 h-4" />
              Keunggulan Kompetitif
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {result.competitiveAdvantages.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── EXPORT ───────────────────────────────────────── */}
      <motion.div variants={STAGGER.item}>
        <div className="flex flex-col sm:flex-row items-center gap-4 p-5 glass-card border-amber-500/10">
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">Ekspor Laporan Analisis</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Unduh laporan PDF profesional siap presentasi untuk klien atau manajemen.
            </p>
          </div>
          <button
            onClick={handleExportPDF}
            className="btn-gold flex items-center gap-2 whitespace-nowrap"
          >
            <FileDown className="w-4 h-4" />
            Unduh Laporan PDF
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Sub-components ────────────────────────────────────────

const COMPETITOR_LABELS: Record<string, string> = {
  jauh_lebih_murah: 'Jauh Lebih Murah',
  lebih_murah: 'Lebih Murah',
  kompetitif: 'Kompetitif',
  lebih_mahal: 'Lebih Mahal',
  jauh_lebih_mahal: 'Jauh Lebih Mahal',
};

const PRICING_LABELS: Record<string, string> = {
  underprice: '⚠ Terlalu Murah',
  optimal: '✓ Optimal',
  slight_high: '~ Sedikit Tinggi',
  overprice: '✗ Terlalu Mahal',
};

interface MetricCardProps {
  label: string;
  value: string;
  sublabel: string;
  icon: React.ReactNode;
  color: 'amber' | 'emerald' | 'rose' | 'blue';
  featured?: boolean;
}

const COLOR_MAP = {
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', val: 'text-amber-400' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', val: 'text-emerald-400' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', val: 'text-rose-400' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', val: 'text-blue-400' },
};

function MetricCard({ label, value, sublabel, icon, color, featured }: MetricCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div className={cn(
      'glass-card p-4 flex flex-col gap-2',
      featured && 'border-amber-500/20 shadow-glow'
    )}>
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center border', c.bg, c.border, c.text)}>
        {icon}
      </div>
      <div>
        <p className={cn('text-xl font-bold font-display leading-none', c.val)}>{value}</p>
        <p className="text-sm font-medium text-foreground mt-1">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{sublabel}</p>
      </div>
    </div>
  );
}

function WinIndicator({ label, value, status }: { label: string; value: string; status: 'good' | 'neutral' | 'bad' }) {
  const statusColor = status === 'good' ? 'text-emerald-400' : status === 'neutral' ? 'text-amber-400' : 'text-rose-400';
  const StatusIcon = status === 'good' ? CheckCircle2 : status === 'neutral' ? Minus : AlertTriangle;
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className={cn('flex items-center gap-1 text-xs font-medium', statusColor)}>
        <StatusIcon className="w-3 h-3" />
        {value}
      </div>
    </div>
  );
}

interface CostBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

function CostBar({ label, value, total, color }: CostBarProps) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{formatCurrency(value, true)} ({pct.toFixed(1)}%)</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={cn('h-full rounded-full', color)}
        />
      </div>
    </div>
  );
}

function ScoreGauge({ label, score }: { label: string; score: number }) {
  const color = score >= 70 ? '#34d399' : score >= 45 ? '#fbbf24' : '#fb7185';
  return (
    <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-muted/30">
      <div className="relative w-14 h-14">
        <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
          <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
          <motion.circle
            cx="24" cy="24" r="18"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 18}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 18 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 18 * (1 - score / 100) }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold font-mono" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

function RiskFactorCard({ factor, index }: { factor: any; index: number }) {
  const badgeClass = getRiskBadgeColor(factor.level);
  const scoreColor = factor.score >= 65 ? 'bg-rose-500' : factor.score >= 40 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
      className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-2.5"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{factor.category}</p>
        <span className={cn('status-badge whitespace-nowrap', badgeClass)}>
          {getRiskLabel(factor.level)}
        </span>
      </div>

      {/* Score bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Risk Score</span>
          <span className="font-mono text-foreground">{factor.score}/100</span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${factor.score}%` }}
            transition={{ duration: 0.6, delay: 0.2 * index }}
            className={cn('h-full rounded-full', scoreColor)}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{factor.description}</p>

      <div className="flex items-start gap-1.5 pt-1 border-t border-border/40">
        <Info className="w-3 h-3 text-amber-400/70 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-400/80">{factor.recommendation}</p>
      </div>
    </motion.div>
  );
}

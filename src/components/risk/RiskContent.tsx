'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert, AlertTriangle, TrendingDown, CheckCircle2,
  BarChart3, Activity, Zap, Info,
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts';
import { useAppStore } from '@/lib/store';
import {
  getRiskLabel, getRiskBadgeColor,
  getWinProbabilityColor, formatCurrency, cn,
} from '@/lib/utils';
import type { RiskLevel } from '@/types';

// ── Static risk intelligence data ──────────────────────
const MARKET_RISK_RADAR = [
  { factor: 'Persaingan Harga', score: 72 },
  { factor: 'Eskalasi Material', score: 58 },
  { factor: 'Ketersediaan SDM', score: 43 },
  { factor: 'Risiko Regulasi', score: 38 },
  { factor: 'Fluktuasi Kurs', score: 52 },
  { factor: 'Risiko Politik', score: 29 },
];

const SECTOR_RISKS = [
  { sector: 'Gedung', value: 65, color: '#fbbf24' },
  { sector: 'Jalan', value: 48, color: '#34d399' },
  { sector: 'Jembatan', value: 72, color: '#fb923c' },
  { sector: 'MEP', value: 58, color: '#818cf8' },
  { sector: 'Interior', value: 42, color: '#34d399' },
  { sector: 'Utilitas', value: 67, color: '#fb7185' },
];

const RISK_ALERTS = [
  {
    severity: 'tinggi' as RiskLevel,
    title: 'Eskalasi Harga Baja & Besi',
    desc: 'Kenaikan harga material baja diproyeksi +8-12% dalam 30 hari ke depan berdasarkan tren pasar LME.',
    impact: 'Proyek konstruksi baja',
    time: '2 jam lalu',
  },
  {
    severity: 'sedang' as RiskLevel,
    title: 'Keterbatasan Tenaga Ahli Sipil',
    desc: 'Permintaan tenaga sipil bersertifikasi meningkat 34% di Jabodetabek. Potensi eskalasi biaya labor.',
    impact: 'Semua jenis proyek',
    time: '6 jam lalu',
  },
  {
    severity: 'rendah' as RiskLevel,
    title: 'Pembaruan SNI Beton 2025',
    desc: 'Standar nasional beton diperbarui. Pastikan spesifikasi RAB telah disesuaikan dengan SNI terbaru.',
    impact: 'Konstruksi beton',
    time: '1 hari lalu',
  },
  {
    severity: 'sedang' as RiskLevel,
    title: 'Angin Musim Potensial Nov–Feb',
    desc: 'Musim penghujan terprediksi lebih panjang. Buffer waktu dan proteksi cuaca perlu dipertimbangkan.',
    impact: 'Proyek outdoor',
    time: '3 hari lalu',
  },
];

const STAGGER = {
  container: { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } },
};

export function RiskContent() {
  const { analyses } = useAppStore();

  const portfolioStats = useMemo(() => {
    const total = analyses.length;
    if (total === 0) return { high: 0, medium: 0, low: 0, avgWin: 0 };
    const high = analyses.filter(a => a.riskLevel === 'tinggi' || a.riskLevel === 'sangat_tinggi').length;
    const medium = analyses.filter(a => a.riskLevel === 'sedang').length;
    const low = total - high - medium;
    const avgWin = Math.round(analyses.reduce((s, a) => s + a.winProbability, 0) / total);
    return { high, medium, low, avgWin };
  }, [analyses]);

  const recentHighRisk = analyses
    .filter(a => a.riskLevel === 'tinggi' || a.riskLevel === 'sangat_tinggi')
    .slice(0, 3);

  return (
    <motion.div
      variants={STAGGER.container}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* Header cards */}
      <motion.div variants={STAGGER.item}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Risiko Tinggi', value: portfolioStats.high, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
            { label: 'Risiko Sedang', value: portfolioStats.medium, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
            { label: 'Risiko Rendah', value: portfolioStats.low, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { label: 'Rata-rata Win Rate', value: `${portfolioStats.avgWin}%`, icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          ].map((c, i) => (
            <div key={i} className={cn('glass-card p-4 border', c.border)}>
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', c.bg)}>
                <c.icon className={cn('w-4.5 h-4.5', c.color)} />
              </div>
              <p className="text-2xl font-bold font-display text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Radar */}
        <motion.div variants={STAGGER.item}>
          <div className="glass-card p-5 h-full">
            <div className="mb-4">
              <h3 className="section-heading">Radar Risiko Pasar</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Indikator risiko makro industri konstruksi</p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={MARKET_RISK_RADAR}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis
                  dataKey="factor"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                />
                <Radar
                  name="Skor Risiko"
                  dataKey="score"
                  stroke="#fbbf24"
                  fill="#fbbf24"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
                <Tooltip
                  formatter={(v: any) => [`${v}/100`, 'Skor Risiko']}
                  contentStyle={{
                    backgroundColor: 'hsl(222 18% 10%)',
                    border: '1px solid hsl(222 15% 16%)',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sector risk bar */}
        <motion.div variants={STAGGER.item}>
          <div className="glass-card p-5 h-full">
            <div className="mb-4">
              <h3 className="section-heading">Risiko per Sektor</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Indeks risiko relatif per jenis proyek</p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={SECTOR_RISKS} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${v}`}
                />
                <YAxis
                  type="category"
                  dataKey="sector"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <Tooltip
                  formatter={(v: any) => [`${v}/100`, 'Risk Index']}
                  contentStyle={{
                    backgroundColor: 'hsl(222 18% 10%)',
                    border: '1px solid hsl(222 15% 16%)',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {SECTOR_RISKS.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Risk alerts */}
      <motion.div variants={STAGGER.item}>
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-heading flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Intelijen Risiko Terkini
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pemantauan kondisi pasar dan faktor risiko eksternal
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400">Live Monitor</span>
            </div>
          </div>

          <div className="space-y-3">
            {RISK_ALERTS.map((alert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className={cn(
                  'p-4 rounded-xl border flex gap-3',
                  alert.severity === 'tinggi' || alert.severity === 'sangat_tinggi'
                    ? 'bg-rose-500/5 border-rose-500/15'
                    : alert.severity === 'sedang'
                    ? 'bg-amber-500/5 border-amber-500/15'
                    : 'bg-emerald-500/5 border-emerald-500/15'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                  alert.severity === 'tinggi' || alert.severity === 'sangat_tinggi'
                    ? 'bg-rose-500/15 text-rose-400'
                    : alert.severity === 'sedang'
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-emerald-500/15 text-emerald-400'
                )}>
                  {alert.severity === 'tinggi' || alert.severity === 'sangat_tinggi'
                    ? <AlertTriangle className="w-4 h-4" />
                    : alert.severity === 'sedang'
                    ? <Activity className="w-4 h-4" />
                    : <Info className="w-4 h-4" />
                  }
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn('status-badge text-xs', getRiskBadgeColor(alert.severity))}>
                        {getRiskLabel(alert.severity)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{alert.desc}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground/60">Dampak: {alert.impact}</span>
                    <span className="text-xs text-muted-foreground/40">·</span>
                    <span className="text-xs text-muted-foreground/60">{alert.time}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* High-risk portfolio items */}
      {recentHighRisk.length > 0 && (
        <motion.div variants={STAGGER.item}>
          <div className="glass-card p-5 border-rose-500/10">
            <h3 className="section-heading mb-3 flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
              Proyek Risiko Tinggi dalam Portfolio
            </h3>
            <div className="space-y-2">
              {recentHighRisk.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                  <TrendingDown className="w-4 h-4 text-rose-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.projectName}</p>
                    <p className="text-xs text-muted-foreground">Win: {a.winProbability}% · {formatCurrency(a.projectValue, true)}</p>
                  </div>
                  <span className={cn('status-badge', getRiskBadgeColor(a.riskLevel))}>
                    {getRiskLabel(a.riskLevel)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

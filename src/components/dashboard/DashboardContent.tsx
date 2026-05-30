'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  BarChart3,
  FileText,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import {
  formatCurrency,
  formatPercentage,
  formatDate,
  getProjectTypeLabel,
  getRiskBadgeColor,
  getRiskLabel,
  getWinProbabilityColor,
} from '@/lib/utils';
import { cn } from '@/lib/utils';

const MONTHLY_DATA = [
  { month: 'Jan', analyses: 8, value: 45, won: 5 },
  { month: 'Feb', analyses: 12, value: 67, won: 8 },
  { month: 'Mar', analyses: 9, value: 52, won: 6 },
  { month: 'Apr', analyses: 15, value: 89, won: 11 },
  { month: 'Mei', analyses: 11, value: 74, won: 7 },
  { month: 'Jun', analyses: 18, value: 102, won: 14 },
  { month: 'Jul', analyses: 14, value: 85, won: 9 },
];

const RISK_DATA = [
  { name: 'Rendah', value: 38, color: '#34d399' },
  { name: 'Sedang', value: 31, color: '#fbbf24' },
  { name: 'Tinggi', value: 21, color: '#fb923c' },
  { name: 'Sangat Tinggi', value: 10, color: '#fb7185' },
];

const WIN_RATE_DATA = [
  { period: 'Q1 2024', rate: 52 },
  { period: 'Q2 2024', rate: 58 },
  { period: 'Q3 2024', rate: 64 },
  { period: 'Q4 2024', rate: 71 },
  { period: 'Q1 2025', rate: 68 },
  { period: 'Q2 2025', rate: 74 },
];

const STATS = [
  {
    title: 'Total Analisis',
    value: '87',
    change: '+12%',
    trend: 'up',
    icon: FileText,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    subtitle: 'vs bulan lalu',
  },
  {
    title: 'Win Rate Rata-rata',
    value: '74%',
    change: '+6%',
    trend: 'up',
    icon: Target,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    subtitle: 'dari 87 analisis',
  },
  {
    title: 'Nilai Proyek Total',
    value: 'Rp 284M',
    change: '+23%',
    trend: 'up',
    icon: BarChart3,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    subtitle: 'dalam analisis aktif',
  },
  {
    title: 'Risiko Kritis',
    value: '3',
    change: '-2',
    trend: 'down',
    icon: AlertTriangle,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    subtitle: 'proyek perlu perhatian',
  },
];

const STAGGER = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="text-xs">
            {p.name}: {p.name === 'value' ? `Rp ${p.value}M` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardContent() {
  const { analyses } = useAppStore();

  return (
    <motion.div
      variants={STAGGER.container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Welcome banner */}
      <motion.div variants={STAGGER.item}>
        <div className="glass-card p-5 flex items-center gap-4 border-amber-500/10">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold text-foreground">
              Selamat Datang di Tender Intelligence System
            </p>
            <p className="text-sm text-muted-foreground">
              Platform analitik tender terdepan. Mulai analisis baru atau review riwayat proyek Anda.
            </p>
          </div>
          <Link href="/analyzer">
            <button className="btn-gold hidden sm:flex items-center gap-2 text-sm py-2 px-4">
              Analisis Baru <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={STAGGER.item}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {STATS.map((stat, i) => (
          <StatCard key={i} stat={stat} delay={i * 0.05} />
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main chart */}
        <motion.div variants={STAGGER.item} className="lg:col-span-2">
          <div className="glass-card p-5 h-full">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="section-heading">Aktivitas Analisis</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Volume analisis bulanan</p>
              </div>
              <span className="status-badge bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <TrendingUp className="w-3 h-3" /> Live
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MONTHLY_DATA}>
                <defs>
                  <linearGradient id="analyses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="won" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="analyses"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  fill="url(#analyses)"
                  name="Total Analisis"
                />
                <Area
                  type="monotone"
                  dataKey="won"
                  stroke="#34d399"
                  strokeWidth={2}
                  fill="url(#won)"
                  name="Menang"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Risk distribution */}
        <motion.div variants={STAGGER.item}>
          <div className="glass-card p-5 h-full">
            <div className="mb-5">
              <h3 className="section-heading">Distribusi Risiko</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Semua proyek yang dianalisis</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={RISK_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {RISK_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value}%`, '']}
                  contentStyle={{
                    backgroundColor: 'hsl(222 18% 10%)',
                    border: '1px solid hsl(222 15% 16%)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {RISK_DATA.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-xs font-mono text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Win Rate Trend + Recent Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Win rate trend */}
        <motion.div variants={STAGGER.item} className="lg:col-span-2">
          <div className="glass-card p-5 h-full">
            <div className="mb-5">
              <h3 className="section-heading">Tren Win Rate</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Per kuartal (2024–2025)</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={WIN_RATE_DATA} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="period"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(v: any) => [`${v}%`, 'Win Rate']}
                  contentStyle={{
                    backgroundColor: 'hsl(222 18% 10%)',
                    border: '1px solid hsl(222 15% 16%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                  {WIN_RATE_DATA.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.rate >= 70 ? '#34d399' : entry.rate >= 60 ? '#fbbf24' : '#fb923c'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent analyses */}
        <motion.div variants={STAGGER.item} className="lg:col-span-3">
          <div className="glass-card p-5 h-full">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="section-heading">Analisis Terbaru</h3>
                <p className="text-xs text-muted-foreground mt-0.5">5 analisis terakhir</p>
              </div>
              <Link
                href="/history"
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                Lihat semua <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {analyses.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    record.status === 'won' ? 'bg-emerald-500/15' :
                    record.status === 'lost' ? 'bg-rose-500/15' :
                    'bg-amber-500/15'
                  )}>
                    {record.status === 'won' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : record.status === 'lost' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {record.projectName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getProjectTypeLabel(record.projectType)} · {formatDate(record.createdAt)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={cn(
                      'text-sm font-bold font-mono',
                      getWinProbabilityColor(record.winProbability)
                    )}>
                      {record.winProbability}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(record.recommendedPrice, true)}
                    </p>
                  </div>

                  <div className={cn(
                    'status-badge shrink-0',
                    getRiskBadgeColor(record.riskLevel)
                  )}>
                    {getRiskLabel(record.riskLevel)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

interface StatCardProps {
  stat: (typeof STATS)[number];
  delay: number;
}

function StatCard({ stat, delay }: StatCardProps) {
  const Icon = stat.icon;
  const isPositive = stat.trend === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="glass-card-hover p-5 cursor-default"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', stat.bg, stat.border)}>
          <Icon className={cn('w-5 h-5', stat.color)} />
        </div>
        <div className={cn(
          'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
          isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
        )}>
          {isPositive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {stat.change}
        </div>
      </div>

      <div>
        <p className="text-2xl font-bold font-display metric-value text-foreground">
          {stat.value}
        </p>
        <p className="text-sm font-medium text-foreground/80 mt-0.5">{stat.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{stat.subtitle}</p>
      </div>
    </motion.div>
  );
}

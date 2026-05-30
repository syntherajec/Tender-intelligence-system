'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, CheckCircle, AlertTriangle, Clock, XCircle,
  FileText, TrendingUp, BarChart3, ChevronRight, Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import {
  formatCurrency, formatDate, getProjectTypeLabel,
  getRiskBadgeColor, getRiskLabel, getWinProbabilityColor, cn,
} from '@/lib/utils';
import type { AnalysisRecord } from '@/types';

const STATUS_MAP = {
  draft:     { label: 'Draft',     icon: Clock,        color: 'bg-muted text-muted-foreground border-border' },
  submitted: { label: 'Diajukan', icon: FileText,      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  won:       { label: 'Menang',   icon: CheckCircle,   color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  lost:      { label: 'Kalah',    icon: XCircle,       color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  pending:   { label: 'Proses',   icon: Clock,         color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

const STAGGER = {
  container: { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } },
};

export function HistoryContent() {
  const { analyses, clearAnalyses } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'win'>('date');

  const filtered = useMemo(() => {
    let list = [...analyses];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.projectName.toLowerCase().includes(q) ||
        getProjectTypeLabel(a.projectType).toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter(a => a.status === statusFilter);
    }

    list.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'value') return b.projectValue - a.projectValue;
      if (sortBy === 'win') return b.winProbability - a.winProbability;
      return 0;
    });

    return list;
  }, [analyses, search, statusFilter, sortBy]);

  // Summary stats
  const stats = useMemo(() => ({
    total: analyses.length,
    won: analyses.filter(a => a.status === 'won').length,
    totalValue: analyses.reduce((s, a) => s + a.projectValue, 0),
    avgWin: analyses.length ? Math.round(analyses.reduce((s, a) => s + a.winProbability, 0) / analyses.length) : 0,
  }), [analyses]);

  return (
    <motion.div
      variants={STAGGER.container}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* Summary bar */}
      <motion.div variants={STAGGER.item}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Analisis', value: stats.total, icon: FileText, color: 'text-blue-400' },
            { label: 'Proyek Menang', value: stats.won, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Total Nilai', value: formatCurrency(stats.totalValue, true), icon: BarChart3, color: 'text-amber-400' },
            { label: 'Avg Win Rate', value: `${stats.avgWin}%`, icon: TrendingUp, color: 'text-purple-400' },
          ].map((s, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-3">
              <s.icon className={cn('w-5 h-5 shrink-0', s.color)} />
              <div>
                <p className="text-lg font-bold font-display text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={STAGGER.item}>
        <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari proyek..."
              className="input-enterprise pl-9"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-enterprise sm:w-40"
          >
            <option value="all">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Diajukan</option>
            <option value="won">Menang</option>
            <option value="lost">Kalah</option>
            <option value="pending">Proses</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="input-enterprise sm:w-44"
          >
            <option value="date">Terbaru</option>
            <option value="value">Nilai Tertinggi</option>
            <option value="win">Win Rate Tertinggi</option>
          </select>
        </div>
      </motion.div>

      {/* Results count */}
      <motion.div variants={STAGGER.item} className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Menampilkan <span className="text-foreground font-medium">{filtered.length}</span> dari {analyses.length} analisis
        </p>
        {analyses.length > 0 && (
          <button
            onClick={() => { if (confirm('Hapus semua riwayat?')) clearAnalyses(); }}
            className="text-xs text-rose-400/70 hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Hapus Semua
          </button>
        )}
      </motion.div>

      {/* Analysis list */}
      {filtered.length === 0 ? (
        <motion.div variants={STAGGER.item}>
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
            <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="font-display font-semibold text-foreground">Belum ada analisis</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search || statusFilter !== 'all'
                ? 'Tidak ada hasil untuk filter yang dipilih'
                : 'Mulai analisis tender pertama Anda'}
            </p>
            {!search && statusFilter === 'all' && (
              <Link href="/analyzer" className="btn-gold mt-4 text-sm py-2 px-4 flex items-center gap-2">
                Analisis Sekarang <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {filtered.map((record, i) => (
            <motion.div
              key={record.id}
              variants={STAGGER.item}
              whileHover={{ x: 2, transition: { duration: 0.1 } }}
            >
              <AnalysisRow record={record} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function AnalysisRow({ record }: { record: AnalysisRecord }) {
  const status = STATUS_MAP[record.status] || STATUS_MAP.draft;
  const StatusIcon = status.icon;

  return (
    <div className="glass-card p-4 hover:border-amber-500/20 transition-all duration-200">
      <div className="flex items-center gap-4">
        {/* Status icon */}
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border',
          status.color
        )}>
          <StatusIcon className="w-4 h-4" />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-foreground truncate">
              {record.projectName}
            </p>
            <span className={cn('status-badge shrink-0', status.color)}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground">
              {getProjectTypeLabel(record.projectType)}
            </span>
            <span className="text-xs text-muted-foreground/50">·</span>
            <span className="text-xs text-muted-foreground">{formatDate(record.createdAt)}</span>
            <span className="text-xs text-muted-foreground/50">·</span>
            <span className={cn('status-badge text-xs', getRiskBadgeColor(record.riskLevel))}>
              {getRiskLabel(record.riskLevel)}
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="hidden sm:flex items-center gap-6 shrink-0">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Pagu Proyek</p>
            <p className="text-sm font-mono font-bold text-foreground">
              {formatCurrency(record.projectValue, true)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Harga Optimal</p>
            <p className="text-sm font-mono font-bold text-amber-400">
              {formatCurrency(record.recommendedPrice, true)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className={cn('text-xl font-bold font-display', getWinProbabilityColor(record.winProbability))}>
              {record.winProbability}%
            </p>
          </div>
        </div>
      </div>

      {/* Mobile: additional metrics */}
      <div className="sm:hidden flex gap-4 mt-3 pt-3 border-t border-border/40">
        <div>
          <p className="text-xs text-muted-foreground">Pagu</p>
          <p className="text-sm font-mono font-bold text-foreground">{formatCurrency(record.projectValue, true)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Optimal</p>
          <p className="text-sm font-mono font-bold text-amber-400">{formatCurrency(record.recommendedPrice, true)}</p>
        </div>
        <div className="ml-auto">
          <p className="text-xs text-muted-foreground">Win Rate</p>
          <p className={cn('text-xl font-bold font-display', getWinProbabilityColor(record.winProbability))}>
            {record.winProbability}%
          </p>
        </div>
      </div>
    </div>
  );
}

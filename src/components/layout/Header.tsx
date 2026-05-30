'use client';

import { usePathname } from 'next/navigation';
import type { Session } from 'next-auth';
import { motion } from 'framer-motion';
import {
  Bell,
  Search,
  Menu,
  Clock,
  Cpu,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatDateTime } from '@/lib/utils';
import { useState, useEffect } from 'react';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Ringkasan analisis dan statistik proyek' },
  '/analyzer': { title: 'Analisa Tender', subtitle: 'Kalkulasi harga penawaran optimal' },
  '/history': { title: 'Riwayat Analisis', subtitle: 'Log dan arsip analisis tender' },
  '/risk': { title: 'Risk Engine', subtitle: 'Penilaian risiko proyek komprehensif' },
  '/admin': { title: 'Panel Admin', subtitle: 'Manajemen pengguna dan akses sistem' },
};

interface HeaderProps {
  session: Session;
}

export function Header({ session }: HeaderProps) {
  const pathname = usePathname();
  const { toggleSidebar } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  const pageInfo = PAGE_TITLES[pathname] || {
    title: 'Tender Intelligence',
    subtitle: 'Advanced Tender Analysis Platform',
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 h-16 px-6 bg-background/80 backdrop-blur-md border-b border-border">
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h1 className="font-display text-base font-semibold text-foreground leading-tight">
          {pageInfo.title}
        </h1>
        <p className="text-xs text-muted-foreground hidden sm:block">
          {pageInfo.subtitle}
        </p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* System status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Engine Online</span>
          <Cpu className="w-3 h-3 text-emerald-400/70" />
        </div>

        {/* Time */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-mono">{formatDateTime(currentTime)}</span>
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full" />
        </button>
      </div>
    </header>
  );
}

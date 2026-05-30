'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Session } from 'next-auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Calculator,
  History,
  ShieldAlert,
  Users,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface SidebarProps {
  session: Session;
}

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Ringkasan & Statistik',
  },
  {
    label: 'Analisa Tender',
    href: '/analyzer',
    icon: Calculator,
    description: 'Kalkulasi Harga Optimal',
  },
  {
    label: 'Riwayat Analisis',
    href: '/history',
    icon: History,
    description: 'Log Analisis Sebelumnya',
  },
  {
    label: 'Risk Engine',
    href: '/risk',
    icon: ShieldAlert,
    description: 'Penilaian Risiko Proyek',
  },
];

const ADMIN_NAV_ITEMS = [
  {
    label: 'Kelola Pengguna',
    href: '/admin',
    icon: Users,
    description: 'Manajemen Akses',
  },
];

export function Sidebar({ session }: SidebarProps) {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const pathname = usePathname();
  const isAdmin = (session.user as any)?.role === 'admin';
  const userName = session.user?.name || 'User';
  const userEmail = session.user?.email || '';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-full z-30 bg-card border-r border-border flex flex-col overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-border shrink-0">
        <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
          <Shield className="w-4.5 h-4.5 text-gray-900" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="ml-3 overflow-hidden"
            >
              <p className="font-display font-bold text-foreground text-sm leading-tight whitespace-nowrap">
                TIS
              </p>
              <p className="text-muted-foreground text-xs whitespace-nowrap">
                Tender Intelligence
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={toggleSidebar}
          className={cn(
            'ml-auto text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg p-1.5 transition-colors shrink-0',
            !sidebarOpen && 'mx-auto ml-0'
          )}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1">
        {/* Main nav */}
        {sidebarOpen && (
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2">
            Menu Utama
          </p>
        )}

        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
            expanded={sidebarOpen}
          />
        ))}

        {isAdmin && (
          <>
            {sidebarOpen && (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2 mt-5 mb-2">
                Administrasi
              </p>
            )}
            {!sidebarOpen && <div className="my-2 border-t border-border/50" />}
            {ADMIN_NAV_ITEMS.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                expanded={sidebarOpen}
              />
            ))}
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border p-3 space-y-1 shrink-0">
        {/* User profile */}
        <div
          className={cn(
            'flex items-center gap-3 px-2 py-2 rounded-lg',
            sidebarOpen && 'bg-muted/50'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
            {userInitials}
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-foreground truncate leading-tight">
                  {userName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userEmail}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn(
            'flex items-center gap-3 w-full px-2 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm',
            !sidebarOpen && 'justify-center'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {sidebarOpen && <span>Keluar</span>}
        </button>
      </div>
    </motion.aside>
  );
}

interface NavItemProps {
  item: {
    label: string;
    href: string;
    icon: React.ElementType;
    description: string;
  };
  isActive: boolean;
  expanded: boolean;
}

function NavItem({ item, isActive, expanded }: NavItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-200 group relative',
        isActive
          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        !expanded && 'justify-center'
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-400 rounded-r" />
      )}

      <Icon className={cn('w-4.5 h-4.5 shrink-0', isActive ? 'text-amber-400' : '')} />

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 min-w-0"
          >
            <p className="text-sm font-medium leading-tight whitespace-nowrap">{item.label}</p>
            <p className={cn(
              'text-xs leading-tight whitespace-nowrap truncate',
              isActive ? 'text-amber-400/60' : 'text-muted-foreground/70'
            )}>
              {item.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip when collapsed */}
      {!expanded && (
        <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-card border border-border text-xs text-foreground whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-50">
          {item.label}
        </div>
      )}
    </Link>
  );
}

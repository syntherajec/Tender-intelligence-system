'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Shield, ShieldOff, Clock, CheckCircle,
  XCircle, MoreVertical, Mail, Building2, Crown, Eye,
  Pencil, BarChart3, Search, RefreshCw,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '@/lib/store';
import { formatDate, formatDateTime, cn } from '@/lib/utils';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  company: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
  analysisCount: number;
  accessExpiry: string | null;
}

const createUserSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  company: z.string().min(2, 'Nama perusahaan minimal 2 karakter'),
  role: z.enum(['admin', 'analyst', 'viewer']),
  accessExpiry: z.string().optional(),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

const ROLE_STYLES = {
  admin:   { label: 'Admin',   icon: Crown, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  analyst: { label: 'Analyst', icon: BarChart3, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  viewer:  { label: 'Viewer',  icon: Eye, color: 'bg-muted text-muted-foreground border-border' },
};

const STAGGER = {
  container: { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } },
};

export function AdminContent() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { addToast } = useAppStore();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'analyst' },
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      addToast({ type: 'error', title: 'Gagal memuat data pengguna' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleActive = async (userId: string, currentState: boolean) => {
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_active', userId }),
      });
      const data = await res.json();
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentState } : u));
      addToast({ type: 'success', title: data.message });
    } catch {
      addToast({ type: 'error', title: 'Aksi gagal' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateUser = async (formData: CreateUserForm) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', data: formData }),
      });
      const data = await res.json();
      setUsers(prev => [...prev, data.user]);
      addToast({ type: 'success', title: data.message });
      setShowCreateModal(false);
      reset();
    } catch {
      addToast({ type: 'error', title: 'Gagal membuat pengguna' });
    }
  };

  const filtered = users.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.company.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    totalAnalyses: users.reduce((s, u) => s + u.analysisCount, 0),
    expiringSoon: users.filter(u => {
      if (!u.accessExpiry) return false;
      const days = (new Date(u.accessExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days > 0 && days < 30;
    }).length,
  };

  return (
    <motion.div
      variants={STAGGER.container}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* Stats */}
      <motion.div variants={STAGGER.item}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Pengguna', value: stats.total, icon: Users, color: 'text-blue-400' },
            { label: 'Pengguna Aktif', value: stats.active, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Total Analisis', value: stats.totalAnalyses, icon: BarChart3, color: 'text-amber-400' },
            { label: 'Akses Kadaluarsa', value: stats.expiringSoon, icon: Clock, color: 'text-rose-400' },
          ].map((s, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-3">
              <s.icon className={cn('w-5 h-5 shrink-0', s.color)} />
              <div>
                <p className="text-xl font-bold font-display text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div variants={STAGGER.item}>
        <div className="glass-card p-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari pengguna, email, perusahaan..."
              className="input-enterprise pl-9"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-amber-500/30 transition-all text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-gold flex items-center gap-2 text-sm py-2.5"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Pengguna
            </button>
          </div>
        </div>
      </motion.div>

      {/* User table */}
      <motion.div variants={STAGGER.item}>
        <div className="glass-card overflow-hidden">
          {/* Table header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-3">Pengguna</div>
            <div className="col-span-2">Perusahaan</div>
            <div className="col-span-2">Role & Status</div>
            <div className="col-span-2">Aktivitas</div>
            <div className="col-span-2">Akses</div>
            <div className="col-span-1 text-right">Aksi</div>
          </div>

          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Tidak ada pengguna ditemukan</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((user, i) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onToggle={handleToggleActive}
                  loading={actionLoading === user.id}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Create user modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-md p-6"
            >
              <h3 className="font-display text-lg font-bold text-foreground mb-1">Tambah Pengguna Baru</h3>
              <p className="text-sm text-muted-foreground mb-5">Buat akun pengguna baru untuk sistem</p>

              <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Nama Lengkap *</label>
                  <input {...register('name')} placeholder="Nama pengguna" className="input-enterprise" />
                  {errors.name && <p className="text-xs text-rose-400">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email *</label>
                  <input {...register('email')} type="email" placeholder="email@perusahaan.com" className="input-enterprise" />
                  {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Perusahaan *</label>
                  <input {...register('company')} placeholder="PT. Nama Perusahaan" className="input-enterprise" />
                  {errors.company && <p className="text-xs text-rose-400">{errors.company.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Role</label>
                    <select {...register('role')} className="input-enterprise">
                      <option value="analyst">Analyst</option>
                      <option value="viewer">Viewer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Masa Akses</label>
                    <input {...register('accessExpiry')} type="date" className="input-enterprise" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); reset(); }}
                    className="flex-1 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-amber-500/30 transition-all text-sm"
                  >
                    Batal
                  </button>
                  <button type="submit" className="flex-1 btn-gold text-sm py-2.5">
                    Buat Pengguna
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface UserRowProps {
  user: UserRecord;
  onToggle: (id: string, current: boolean) => void;
  loading: boolean;
  index: number;
}

function UserRow({ user, onToggle, loading, index }: UserRowProps) {
  const role = ROLE_STYLES[user.role] || ROLE_STYLES.viewer;
  const RoleIcon = role.icon;
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      className="px-5 py-4 hover:bg-muted/20 transition-colors"
    >
      {/* Mobile layout */}
      <div className="lg:hidden space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <ToggleButton user={user} onToggle={onToggle} loading={loading} />
        </div>
        <div className="flex gap-2 ml-12">
          <span className={cn('status-badge text-xs', role.color)}>
            <RoleIcon className="w-3 h-3" /> {role.label}
          </span>
          <span className={cn(
            'status-badge text-xs',
            user.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          )}>
            {user.isActive ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
        <div className="col-span-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        <div className="col-span-2">
          <p className="text-xs text-muted-foreground truncate">{user.company}</p>
        </div>

        <div className="col-span-2 flex flex-col gap-1">
          <span className={cn('status-badge w-fit text-xs', role.color)}>
            <RoleIcon className="w-3 h-3" /> {role.label}
          </span>
          <span className={cn(
            'status-badge w-fit text-xs',
            user.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          )}>
            {user.isActive ? '● Aktif' : '○ Nonaktif'}
          </span>
        </div>

        <div className="col-span-2">
          <p className="text-xs text-muted-foreground">
            {user.analysisCount} analisis
          </p>
          <p className="text-xs text-muted-foreground">
            Login: {user.lastLogin ? formatDate(user.lastLogin) : 'Belum pernah'}
          </p>
        </div>

        <div className="col-span-2">
          {user.accessExpiry ? (
            <div>
              <p className="text-xs text-muted-foreground">Akses s/d:</p>
              <p className={cn(
                'text-xs font-medium',
                new Date(user.accessExpiry) < new Date() ? 'text-rose-400' :
                (new Date(user.accessExpiry).getTime() - Date.now()) < 30 * 24 * 60 * 60 * 1000
                  ? 'text-amber-400' : 'text-emerald-400'
              )}>
                {formatDate(user.accessExpiry)}
              </p>
            </div>
          ) : (
            <p className="text-xs text-emerald-400">Unlimited</p>
          )}
        </div>

        <div className="col-span-1 flex justify-end">
          <ToggleButton user={user} onToggle={onToggle} loading={loading} />
        </div>
      </div>
    </motion.div>
  );
}

function ToggleButton({ user, onToggle, loading }: { user: UserRecord; onToggle: (id: string, c: boolean) => void; loading: boolean }) {
  return (
    <button
      onClick={() => onToggle(user.id, user.isActive)}
      disabled={loading || user.role === 'admin'}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
        user.isActive
          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
        (loading || user.role === 'admin') && 'opacity-50 cursor-not-allowed'
      )}
    >
      {loading ? (
        <div className="spinner w-3 h-3" />
      ) : user.isActive ? (
        <><ShieldOff className="w-3 h-3" />Nonaktifkan</>
      ) : (
        <><Shield className="w-3 h-3" />Aktifkan</>
      )}
    </button>
  );
}

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ChevronRight,
  Activity,
  TrendingUp,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password diperlukan'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setAuthError('Email atau password tidak valid');
      } else if (result?.ok) {
        router.replace('/dashboard');
      }
    } catch {
      setAuthError('Terjadi kesalahan sistem. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden relative">
      <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[128px] pointer-events-none" />

      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative">
        <div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <p className="font-display font-bold text-foreground text-lg leading-none">TIS</p>
              <p className="text-muted-foreground text-xs leading-none mt-0.5">Tender Intelligence System</p>
            </div>
          </motion.div>
        </div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h1 className="font-display text-4xl font-bold text-foreground leading-tight">
              Platform Analitik
              <br />
              <span className="text-gradient-gold">Tender Terdepan</span>
              <br />
              di Indonesia
            </h1>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed max-w-sm">
              Sistem intelijen pengadaan berbasis data untuk kontraktor, vendor, dan konsultan proyek profesional.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-4"
          >
            {[
              { icon: BarChart3, label: 'Analisis Harga', value: 'Akurat' },
              { icon: TrendingUp, label: 'Win Rate', value: '+34%' },
              { icon: Activity, label: 'Risk Score', value: 'Real-time' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="glass-card p-4 text-center"
              >
                <stat.icon className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                <p className="text-lg font-bold font-display text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="glass-card p-5"
          >
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              &quot;TIS telah mengubah cara kami menyusun penawaran tender. Win rate proyek kami naik 40% dalam 6 bulan pertama.&quot;
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold">
                BS
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Budi Santoso</p>
                <p className="text-xs text-muted-foreground">Direktur, PT. Jaya Konstruksi</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs text-muted-foreground"
        >
          © 2025 Tender Intelligence System. Versi 2.4.1. Hak cipta dilindungi.
        </motion.p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-gray-900" />
            </div>
            <p className="font-display font-bold text-foreground">Tender Intelligence System</p>
          </div>

          <div className="glass-card p-8">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium uppercase tracking-widest">
                  Secure Portal
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mt-2">
                Masuk ke Sistem
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Masukkan kredensial akun Anda untuk melanjutkan
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email Akun</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="nama@perusahaan.com"
                    autoComplete="email"
                    className="input-enterprise pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    className="input-enterprise pl-10 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <AnimatePresence>
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-rose-300">{authError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-gold w-full flex items-center justify-center gap-2 py-3 mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="spinner" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Sistem</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Sistem terlindungi enkripsi AES-256.{' '}
            <span className="text-amber-400/70">Tidak terafiliasi dengan LKPP.</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

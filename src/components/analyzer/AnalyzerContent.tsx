'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Calculator,
  ChevronRight,
  RefreshCw,
  Cpu,
  CheckCircle2,
  FileDown,
} from 'lucide-react';
import { TenderInput, TenderAnalysisResult } from '@/types';
import { useAppStore } from '@/lib/store';
import { PROJECT_TYPES, LOCATIONS, URGENCY_LEVELS } from '@/lib/utils';
import { ResultPanel } from './ResultPanel';
import { cn } from '@/lib/utils';

const analyzerSchema = z.object({
  projectName: z.string().min(5, 'Nama proyek minimal 5 karakter'),
  projectType: z.string().min(1, 'Pilih jenis proyek'),
  projectValue: z.number().min(100_000_000, 'Nilai proyek minimal Rp 100 juta'),
  materialCost: z.number().min(0, 'Biaya material tidak boleh negatif'),
  laborCost: z.number().min(0, 'Biaya tenaga kerja tidak boleh negatif'),
  operationalCost: z.number().min(0, 'Biaya operasional tidak boleh negatif'),
  location: z.string().min(1, 'Pilih lokasi proyek'),
  competitorEstimate: z.number().min(100_000_000, 'Estimasi pesaing minimal Rp 100 juta'),
  targetMargin: z.number().min(1).max(50, 'Target margin 1-50%'),
  urgencyLevel: z.string().min(1, 'Pilih tingkat urgensi'),
  projectDuration: z.number().min(1, 'Durasi proyek minimal 1 hari'),
  scopeNotes: z.string().optional(),
});

type AnalyzerFormData = z.infer<typeof analyzerSchema>;

const ANALYSIS_STEPS = [
  'Memvalidasi data input...',
  'Menghitung struktur biaya...',
  'Menganalisis pasar kompetitor...',
  'Mengevaluasi faktor risiko...',
  'Memproses rekomendasi strategis...',
  'Mengoptimalkan harga penawaran...',
  'Menyusun laporan analisis...',
];

export function AnalyzerContent() {
  const [result, setResult] = useState<TenderAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const { addAnalysis, addToast } = useAppStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<AnalyzerFormData>({
    resolver: zodResolver(analyzerSchema),
    defaultValues: {
      targetMargin: 15,
      projectDuration: 180,
      urgencyLevel: 'sedang',
      projectType: 'konstruksi_gedung',
      location: 'DKI Jakarta',
    },
  });

  const watchedValues = watch(['materialCost', 'laborCost', 'operationalCost', 'projectValue']);
  const totalCostPreview =
    (watchedValues[0] || 0) + (watchedValues[1] || 0) + (watchedValues[2] || 0);
  const projectValue = watchedValues[3] || 0;
  const costRatio = projectValue > 0 ? (totalCostPreview / projectValue) * 100 : 0;

  const onSubmit = async (data: AnalyzerFormData) => {
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setResult(null);

    // Simulate analysis steps for UX
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setAnalysisStep(i);
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
    }

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: data as TenderInput }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const { result: analysisResult } = await response.json();
      setResult(analysisResult);

      // Save to history
      addAnalysis({
        id: analysisResult.id,
        projectName: analysisResult.projectName,
        projectType: data.projectType as any,
        projectValue: data.projectValue,
        winProbability: analysisResult.winProbability,
        recommendedPrice: analysisResult.recommendedPrice,
        riskLevel: analysisResult.overallRisk,
        status: 'draft',
        createdAt: analysisResult.createdAt,
        userId: 'current',
      });

      addToast({
        type: 'success',
        title: 'Analisis Selesai',
        message: `${data.projectName} berhasil dianalisis.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Analisis Gagal',
        message: 'Terjadi kesalahan. Silakan coba lagi.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    reset();
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {/* Analysis Form */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="xl:col-span-2">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Section: Project Info */}
                  <FormSection
                    title="Informasi Proyek"
                    icon={<Calculator className="w-4 h-4" />}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <FormField label="Nama Proyek" error={errors.projectName?.message} required>
                          <input
                            {...register('projectName')}
                            placeholder="Contoh: Pembangunan Gedung Kantor 5 Lantai - Jakarta"
                            className="input-enterprise"
                          />
                        </FormField>
                      </div>

                      <FormField label="Jenis Proyek" error={errors.projectType?.message} required>
                        <select {...register('projectType')} className="input-enterprise">
                          {PROJECT_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label="Lokasi Proyek" error={errors.location?.message} required>
                        <select {...register('location')} className="input-enterprise">
                          {LOCATIONS.map(l => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      </FormField>

                      <FormField
                        label="Nilai Pagu Anggaran (Rp)"
                        error={errors.projectValue?.message}
                        required
                      >
                        <input
                          {...register('projectValue', { valueAsNumber: true })}
                          type="number"
                          placeholder="5000000000"
                          className="input-enterprise font-mono"
                        />
                      </FormField>

                      <FormField
                        label="Durasi Proyek (Hari)"
                        error={errors.projectDuration?.message}
                        required
                      >
                        <input
                          {...register('projectDuration', { valueAsNumber: true })}
                          type="number"
                          placeholder="180"
                          className="input-enterprise font-mono"
                        />
                      </FormField>
                    </div>
                  </FormSection>

                  {/* Section: Cost Structure */}
                  <FormSection
                    title="Struktur Biaya (RAB)"
                    icon={<span className="text-xs font-bold text-amber-400">Rp</span>}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        label="Biaya Material (Rp)"
                        error={errors.materialCost?.message}
                        required
                      >
                        <input
                          {...register('materialCost', { valueAsNumber: true })}
                          type="number"
                          placeholder="2500000000"
                          className="input-enterprise font-mono"
                        />
                      </FormField>

                      <FormField
                        label="Biaya Tenaga Kerja (Rp)"
                        error={errors.laborCost?.message}
                        required
                      >
                        <input
                          {...register('laborCost', { valueAsNumber: true })}
                          type="number"
                          placeholder="1200000000"
                          className="input-enterprise font-mono"
                        />
                      </FormField>

                      <FormField
                        label="Biaya Operasional (Rp)"
                        error={errors.operationalCost?.message}
                        required
                      >
                        <input
                          {...register('operationalCost', { valueAsNumber: true })}
                          type="number"
                          placeholder="800000000"
                          className="input-enterprise font-mono"
                        />
                      </FormField>
                    </div>

                    {/* Cost preview */}
                    {totalCostPreview > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-3 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Total Biaya Langsung:</span>
                          <span className="font-mono text-sm font-bold text-foreground">
                            Rp {totalCostPreview.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full',
                          costRatio < 60 ? 'bg-emerald-500/10 text-emerald-400' :
                          costRatio < 80 ? 'bg-amber-500/10 text-amber-400' :
                          'bg-rose-500/10 text-rose-400'
                        )}>
                          {costRatio.toFixed(1)}% dari pagu
                        </div>
                      </motion.div>
                    )}
                  </FormSection>

                  {/* Section: Market Analysis */}
                  <FormSection
                    title="Analisis Pasar & Kompetisi"
                    icon={<ChevronRight className="w-4 h-4" />}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        label="Estimasi Harga Pesaing (Rp)"
                        error={errors.competitorEstimate?.message}
                        required
                        hint="Perkiraan penawaran kompetitor utama"
                      >
                        <input
                          {...register('competitorEstimate', { valueAsNumber: true })}
                          type="number"
                          placeholder="4500000000"
                          className="input-enterprise font-mono"
                        />
                      </FormField>

                      <FormField
                        label="Target Margin (%)"
                        error={errors.targetMargin?.message}
                        required
                        hint="Persentase keuntungan yang diinginkan"
                      >
                        <input
                          {...register('targetMargin', { valueAsNumber: true })}
                          type="number"
                          min="1"
                          max="50"
                          step="0.5"
                          className="input-enterprise font-mono"
                        />
                      </FormField>

                      <FormField
                        label="Urgensi Deadline"
                        error={errors.urgencyLevel?.message}
                        required
                      >
                        <select {...register('urgencyLevel')} className="input-enterprise">
                          {URGENCY_LEVELS.map(u => (
                            <option key={u.value} value={u.value}>
                              {u.label} ({u.description})
                            </option>
                          ))}
                        </select>
                      </FormField>
                    </div>

                    <div className="mt-4">
                      <FormField label="Catatan Scope / Spesifikasi Khusus" hint="Opsional - informasi tambahan untuk analisis lebih akurat">
                        <textarea
                          {...register('scopeNotes')}
                          placeholder="Contoh: Proyek menggunakan spesifikasi premium, lokasi akses terbatas, diperlukan mobilisasi alat berat..."
                          rows={3}
                          className="input-enterprise resize-none"
                        />
                      </FormField>
                    </div>
                  </FormSection>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="btn-gold w-full flex items-center justify-center gap-3 py-4 text-base"
                  >
                    {isAnalyzing ? (
                      <>
                        <Cpu className="w-5 h-5 animate-pulse" />
                        <span>{ANALYSIS_STEPS[analysisStep]}</span>
                      </>
                    ) : (
                      <>
                        <Cpu className="w-5 h-5" />
                        <span>Jalankan Analisis Tender</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full h-1.5 bg-muted rounded-full overflow-hidden"
                    >
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{
                          width: `${((analysisStep + 1) / ANALYSIS_STEPS.length) * 100}%`
                        }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                      />
                    </motion.div>
                  )}
                </form>
              </div>

              {/* Side info panel */}
              <div className="space-y-4">
                <div className="glass-card p-5">
                  <h3 className="section-heading mb-4 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-amber-400" />
                    Advanced Tender Intelligence Engine
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Analisis Harga Kompetitif', desc: 'Kalkulasi harga optimal vs kompetitor' },
                      { label: 'Win Probability Score', desc: 'Estimasi peluang menang berbasis data' },
                      { label: 'Risk Assessment Matrix', desc: 'Penilaian 4 dimensi risiko proyek' },
                      { label: 'Strategic Recommendation', desc: 'Rekomendasi strategi penawaran' },
                      { label: 'PDF Report Export', desc: 'Laporan analisis siap presentasi' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5 border-amber-500/10">
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">
                    Tips Analisis
                  </p>
                  <ul className="space-y-2">
                    {[
                      'Masukkan biaya riil dari RAB terbaru',
                      'Estimasi pesaing dari data tender serupa',
                      'Sesuaikan target margin dengan kompleksitas',
                      'Catatan scope membantu akurasi analisis',
                    ].map((tip, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-amber-400/60 mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Hasil Analisis Tender
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {result.projectName}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg border border-border hover:border-amber-500/30 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Analisis Baru
              </button>
            </div>
            <ResultPanel result={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function FormSection({ title, icon, children }: FormSectionProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-6 h-6 rounded-md bg-amber-500/15 flex items-center justify-center text-amber-400">
          {icon}
        </div>
        <h3 className="section-heading">{title}</h3>
      </div>
      {children}
    </div>
  );
}

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

function FormField({ label, error, hint, required, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground flex items-center gap-1">
        {label}
        {required && <span className="text-amber-400 text-xs">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-rose-400">{error}</p>
      )}
    </div>
  );
}

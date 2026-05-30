import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  TenderAnalysisResult,
  AnalysisRecord,
  ToastMessage,
  User,
} from '@/types';

interface AppStore {
  // Analysis State
  analyses: AnalysisRecord[];
  currentAnalysis: TenderAnalysisResult | null;
  isAnalyzing: boolean;

  // UI State
  sidebarOpen: boolean;
  toasts: ToastMessage[];

  // Actions
  setCurrentAnalysis: (analysis: TenderAnalysisResult | null) => void;
  addAnalysis: (record: AnalysisRecord) => void;
  setIsAnalyzing: (value: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (value: boolean) => void;

  // Toast Actions
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Clear
  clearAnalyses: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      analyses: generateMockAnalyses(),
      currentAnalysis: null,
      isAnalyzing: false,
      sidebarOpen: true,
      toasts: [],

      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),

      addAnalysis: (record) =>
        set((state) => ({
          analyses: [record, ...state.analyses].slice(0, 100),
        })),

      setIsAnalyzing: (value) => set({ isAnalyzing: value }),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (value) => set({ sidebarOpen: value }),

      addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }));
        // Auto-remove after duration
        setTimeout(() => {
          get().removeToast(id);
        }, toast.duration || 5000);
      },

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      clearAnalyses: () => set({ analyses: [] }),
    }),
    {
      name: 'tis-app-storage',
      partialize: (state) => ({
        analyses: state.analyses,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

function generateMockAnalyses(): AnalysisRecord[] {
  return [
    {
      id: 'TIS-001-MOCK',
      projectName: 'Gedung Perkantoran 8 Lantai - Jakarta Selatan',
      projectType: 'konstruksi_gedung',
      projectValue: 15_000_000_000,
      winProbability: 72,
      recommendedPrice: 14_250_000_000,
      riskLevel: 'sedang',
      status: 'submitted',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      userId: '2',
    },
    {
      id: 'TIS-002-MOCK',
      projectName: 'Rehabilitasi Jalan Tol Seksi 4 - Cikampek',
      projectType: 'konstruksi_jalan',
      projectValue: 45_000_000_000,
      winProbability: 58,
      recommendedPrice: 43_200_000_000,
      riskLevel: 'rendah',
      status: 'won',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      userId: '2',
    },
    {
      id: 'TIS-003-MOCK',
      projectName: 'Pengadaan Peralatan MEP - RSUD Tangerang',
      projectType: 'mekanikal_elektrikal',
      projectValue: 8_500_000_000,
      winProbability: 41,
      recommendedPrice: 8_100_000_000,
      riskLevel: 'sedang',
      status: 'pending',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      userId: '2',
    },
    {
      id: 'TIS-004-MOCK',
      projectName: 'Interior Fit-Out Kantor Kementerian PUPR',
      projectType: 'interior_finishing',
      projectValue: 3_200_000_000,
      winProbability: 83,
      recommendedPrice: 3_050_000_000,
      riskLevel: 'rendah',
      status: 'won',
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      userId: '2',
    },
    {
      id: 'TIS-005-MOCK',
      projectName: 'Pembangunan Jembatan Penghubung - Kalimantan Timur',
      projectType: 'konstruksi_jembatan',
      projectValue: 28_000_000_000,
      winProbability: 29,
      recommendedPrice: 26_600_000_000,
      riskLevel: 'tinggi',
      status: 'lost',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      userId: '2',
    },
  ];
}

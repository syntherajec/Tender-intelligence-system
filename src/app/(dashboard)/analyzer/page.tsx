import type { Metadata } from 'next';
import { AnalyzerContent } from '@/components/analyzer/AnalyzerContent';

export const metadata: Metadata = {
  title: 'Analisa Tender',
};

export default function AnalyzerPage() {
  return <AnalyzerContent />;
}

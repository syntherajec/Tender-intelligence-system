import type { Metadata } from 'next';
import { RiskContent } from '@/components/risk/RiskContent';

export const metadata: Metadata = { title: 'Risk Engine' };

export default function RiskPage() {
  return <RiskContent />;
}

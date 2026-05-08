'use client';

import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';

/**
 * Recharts paketi büyük (~75KB gzipped). Dashboard'da 4 grafik var ama
 * kullanıcı çoğunlukla en üstteki KPI'lara bakar — grafikler client'ta
 * tembel yüklenirse ilk paint çok daha hızlı olur.
 */

const ChartFallback = () => (
  <Card className="p-5 lg:p-6">
    <div className="h-6 w-32 rounded-md skeleton mb-3" />
    <div className="h-3 w-48 rounded-md skeleton mb-5 opacity-60" />
    <div className="h-56 rounded-xl skeleton" />
  </Card>
);

export const MonthlyTrendChart = dynamic(
  () => import('./MonthlyTrendChart').then((m) => m.MonthlyTrendChart),
  { ssr: false, loading: ChartFallback },
);

export const ComparisonLineChart = dynamic(
  () => import('./MonthlyTrendChart').then((m) => m.ComparisonLineChart),
  { ssr: false, loading: ChartFallback },
);

export const HourlyDistributionChart = dynamic(
  () => import('./HourlyDistributionChart').then((m) => m.HourlyDistributionChart),
  { ssr: false, loading: ChartFallback },
);

export const RevenueDonut = dynamic(
  () => import('./RevenueDonut').then((m) => m.RevenueDonut),
  { ssr: false, loading: ChartFallback },
);

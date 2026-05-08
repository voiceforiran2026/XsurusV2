'use client';

import dynamic from 'next/dynamic';
import { MapSkeleton } from '@/components/common/LoadingSkeleton';

// Leaflet `window` global'ine bağlı — SSR'da yüklenemez.
export const LiveMapClient = dynamic(() => import('./LiveMap'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

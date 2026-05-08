'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { MapSkeleton } from '@/components/common/LoadingSkeleton';

// Leaflet client-only (window dependency)
export const DispatchMap = dynamic(() => import('./DispatchMapInternal').then((m) => m.DispatchMapInternal), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

// Saf coğrafi yardımcılar — test edilebilir, dış bağımlılığı yok.

export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * İki nokta arasındaki büyük çember mesafesini km cinsinden döner.
 */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const x =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return EARTH_RADIUS_KM * c;
}

/**
 * Şehir içi yolların düz hattan ortalama %30 daha uzun olmasını yaklaşıklar.
 * Demo için Google Distance Matrix yerine kullanılır.
 */
export function estimateRoadDistanceKm(a: LatLng, b: LatLng): number {
  return haversineKm(a, b) * 1.3;
}

export function formatLatLng({ lat, lng }: LatLng, decimals = 5): string {
  return `${lat.toFixed(decimals)}, ${lng.toFixed(decimals)}`;
}

import {
  searchMockPlaces,
  getMockPlaceById,
  placeLabel,
} from './places-mock';

export interface PlaceSuggestion {
  placeId: string;
  primary: string;
  secondary: string;
}

export interface PlaceDetail {
  placeId: string;
  address: string;
  lat: number;
  lng: number;
}

// Sunucu-yalnızca anahtarı tercih et (key client'a sızmasın);
// fallback: NEXT_PUBLIC_GOOGLE_MAPS_KEY (geriye dönük uyumluluk).
function getKey(): string {
  return (
    process.env.GOOGLE_PLACES_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ??
    ''
  );
}
export const GOOGLE_AVAILABLE = getKey().length > 0;

function logGoogleError(scope: string, info: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[places:${scope}]`, info);
  }
}

/**
 * Adres öneri arama. Anahtar yoksa otomatik mock fallback.
 */
export async function searchPlaces(
  query: string,
): Promise<PlaceSuggestion[]> {
  const key = getKey();
  if (key) {
    try {
      const url = new URL(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json',
      );
      url.searchParams.set('input', query);
      url.searchParams.set('language', 'tr');
      url.searchParams.set('components', 'country:tr');
      url.searchParams.set('key', key);

      const res = await fetch(url, { cache: 'no-store' });
      const body = (await res.json().catch(() => null)) as {
        status?: string;
        error_message?: string;
        predictions?: Array<{
          place_id: string;
          structured_formatting: {
            main_text: string;
            secondary_text?: string;
          };
        }>;
      } | null;

      // Google'ın status alanı: 'OK' veya 'ZERO_RESULTS' → sonuç var/yok
      // 'REQUEST_DENIED', 'INVALID_REQUEST', 'OVER_QUERY_LIMIT' → konfigürasyon sorunu
      if (res.ok && body && (body.status === 'OK' || body.status === 'ZERO_RESULTS')) {
        return (body.predictions ?? []).slice(0, 6).map((p) => ({
          placeId: p.place_id,
          primary: p.structured_formatting.main_text,
          secondary: p.structured_formatting.secondary_text ?? '',
        }));
      }
      logGoogleError('autocomplete', {
        httpStatus: res.status,
        apiStatus: body?.status,
        message: body?.error_message,
      });
    } catch (e) {
      logGoogleError('autocomplete', e);
    }
  }

  return searchMockPlaces(query).map((p) => ({
    placeId: p.placeId,
    primary: p.name,
    secondary: `${p.district}, ${p.city}`,
  }));
}

/**
 * Place detayı (lat/lng + adres). Anahtar yoksa mock'tan döner.
 */
export async function getPlaceDetail(
  placeId: string,
): Promise<PlaceDetail | null> {
  const key = getKey();
  // tr-... mock placeId — Google'a değil mock'a git
  if (key && !placeId.startsWith('tr-')) {
    try {
      const url = new URL(
        'https://maps.googleapis.com/maps/api/place/details/json',
      );
      url.searchParams.set('place_id', placeId);
      url.searchParams.set('fields', 'formatted_address,geometry');
      url.searchParams.set('language', 'tr');
      url.searchParams.set('key', key);

      const res = await fetch(url, { cache: 'no-store' });
      const body = (await res.json().catch(() => null)) as {
        status?: string;
        error_message?: string;
        result?: {
          formatted_address?: string;
          geometry?: { location?: { lat: number; lng: number } };
        };
      } | null;

      if (res.ok && body?.status === 'OK' && body.result?.geometry?.location) {
        return {
          placeId,
          address: body.result.formatted_address ?? '',
          lat: body.result.geometry.location.lat,
          lng: body.result.geometry.location.lng,
        };
      }
      logGoogleError('details', {
        httpStatus: res.status,
        apiStatus: body?.status,
        message: body?.error_message,
      });
    } catch (e) {
      logGoogleError('details', e);
    }
  }

  const mock = getMockPlaceById(placeId);
  if (!mock) return null;
  return {
    placeId: mock.placeId,
    address: placeLabel(mock),
    lat: mock.lat,
    lng: mock.lng,
  };
}

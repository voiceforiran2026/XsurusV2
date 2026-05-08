// Saf simülatör — sürücünün hedefe doğru lineer + ufak gürültülü hareketi.
// Test edilebilir, yan etkisi yok. UI tarafı `startSimulator` ile interval kurar.
//
// Kullanım: ACCEPTED durumunda sürücü pickup'a gider, IN_PROGRESS'te dropoff'a.
// Hedefe < 100m kalınca tamamlanmış sayılır (caller status transition tetikler).

import { haversineKm, type LatLng } from './geo';

export interface SimulatorState {
  current: LatLng;
  target: LatLng;
  distanceRemaining: number;
}

export function makeState(start: LatLng, target: LatLng): SimulatorState {
  return {
    current: { ...start },
    target: { ...target },
    distanceRemaining: haversineKm(start, target),
  };
}

/**
 * State'i `stepKm` kadar hedefe doğru taşır. Geriye `reached` döner.
 * Hedefe < `arrivedThresholdKm` kalmışsa snap eder.
 */
export function stepToward(
  state: SimulatorState,
  stepKm = 0.05,
  arrivedThresholdKm = 0.08,
): { reached: boolean; position: LatLng; distanceRemaining: number } {
  const remaining = haversineKm(state.current, state.target);
  state.distanceRemaining = remaining;

  if (remaining < arrivedThresholdKm) {
    state.current = { ...state.target };
    state.distanceRemaining = 0;
    return { reached: true, position: state.current, distanceRemaining: 0 };
  }

  const fraction = Math.min(stepKm / remaining, 1);
  // Küçük perturbasyon (~5-10m) gerçekçilik için
  const jitter = () => (Math.random() - 0.5) * 0.0001;
  const newLat = state.current.lat + (state.target.lat - state.current.lat) * fraction + jitter();
  const newLng = state.current.lng + (state.target.lng - state.current.lng) * fraction + jitter();

  state.current = { lat: newLat, lng: newLng };
  state.distanceRemaining = haversineKm(state.current, state.target);
  return { reached: false, position: state.current, distanceRemaining: state.distanceRemaining };
}

/**
 * Pickup'a yaklaşık ~1.5-2.5 km uzaklıktan rastgele bir başlangıç noktası üretir
 * (sürücü "yola çıktı" hissini verir).
 */
export function randomStartNear(target: LatLng, radiusKm = 2): LatLng {
  // 1 km ≈ 0.009 derece (kabaca)
  const angle = Math.random() * Math.PI * 2;
  const distDeg = (Math.random() * 0.5 + 0.5) * radiusKm * 0.009;
  return {
    lat: target.lat + Math.cos(angle) * distDeg,
    lng: target.lng + Math.sin(angle) * distDeg,
  };
}

export interface SimulatorHandle {
  stop: () => void;
  state: SimulatorState;
}

/**
 * Tarayıcı tarafı interval başlatıcı. SSR-safe değildir, sadece client'ta çağırın.
 *
 * @returns SimulatorHandle — handle.stop() ile durdurabilirsiniz
 */
export function startSimulator(
  initial: SimulatorState,
  onStep: (info: { position: LatLng; distanceRemaining: number; reached: boolean }) => void,
  options: { stepKm?: number; intervalMs?: number; arrivedThresholdKm?: number } = {},
): SimulatorHandle {
  const { stepKm = 0.05, intervalMs = 1000, arrivedThresholdKm = 0.08 } = options;
  const state = initial;

  const tick = () => {
    const info = stepToward(state, stepKm, arrivedThresholdKm);
    onStep(info);
    if (info.reached) {
      clearInterval(timer);
    }
  };

  // İlk tick'i hemen at, sonra interval başlat
  const timer = setInterval(tick, intervalMs);
  // İlk tick'i bir mikrodan sonra at (state ilk konum olarak yansısın)
  queueMicrotask(() => onStep({ position: state.current, distanceRemaining: state.distanceRemaining, reached: false }));

  return {
    stop: () => clearInterval(timer),
    state,
  };
}

import { create } from 'zustand';
import type { SessionUser } from '@/types/domain';

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  setUser: (user: SessionUser | null) => void;
  bootstrap: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  setUser: (user) => set({ user }),
  bootstrap: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const { user } = await res.json();
        set({ user: user ?? null });
      }
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) {
        // Server logout başarısız bile olsa client-side state'i temizle
        // (cookie maxAge dolacak; tekrar deneyebilir)
      }
    } catch {
      // Network hatası — yine de local logout yap
    }
    // Logout sonrası "/" → tekrar carousel görmek istemiyorsa kullanıcı flag korunur.
    // Korunmasını istemiyorsak silebiliriz; demo için flag korumak daha az şaşırtıcı:
    // tekrar onboarding'e yönlendirmiyoruz. (Karar: korunsun.)
    set({ user: null });
  },
}));

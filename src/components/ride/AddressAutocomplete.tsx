'use client';

import * as React from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RidePoint } from '@/stores/useRideStore';
import type { PlaceSuggestion } from '@/lib/places';

interface AddressAutocompleteProps {
  label?: string;
  placeholder?: string;
  value: RidePoint | null;
  onChange: (point: RidePoint | null) => void;
  iconColor?: 'foreground' | 'green' | 'destructive';
  autoFocus?: boolean;
}

export function AddressAutocomplete({
  label,
  placeholder = 'Adres ara…',
  value,
  onChange,
  iconColor = 'foreground',
  autoFocus,
}: AddressAutocompleteProps) {
  const [query, setQuery] = React.useState(value?.address ?? '');
  const [results, setResults] = React.useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [highlighted, setHighlighted] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Eğer dışarıdan value değişirse input'u senkronize et
  React.useEffect(() => {
    if (value) setQuery(value.address);
    else if (!value && query) setQuery('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Debounced search
  React.useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }
    if (value && value.address === query) {
      // Seçim sonrası tekrar fetch'e gerek yok
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    // 150ms debounce: kullanıcı yazmayı bitirdikten sonra hızlı sonuç.
    // Önceden 250ms idi → 100ms'lik fark, "yavaş" hissinin büyük kısmı.
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/places/autocomplete?q=${encodeURIComponent(query)}`,
          { signal: ctrl.signal },
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.results ?? []);
          setHighlighted(0);
        }
      } catch {
        // abort veya network hatası — sessizce yut
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Dışarı tıklayınca kapat
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const selectSuggestion = async (sug: PlaceSuggestion) => {
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/places/details?placeId=${encodeURIComponent(sug.placeId)}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      const point: RidePoint = {
        placeId: data.placeId,
        address: data.address || `${sug.primary}, ${sug.secondary}`,
        lat: data.lat,
        lng: data.lng,
      };
      setQuery(point.address);
      onChange(point);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && open && results[highlighted]) {
      e.preventDefault();
      void selectSuggestion(results[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    onChange(null);
    inputRef.current?.focus();
  };

  const iconBg = {
    foreground: 'bg-foreground text-background',
    green: 'bg-foreground text-background',
    destructive: 'bg-destructive text-destructive-foreground',
  }[iconColor];

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 ml-1 block">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl border bg-background pl-2 pr-3 py-1 transition-colors duration-150',
          'focus-within:border-foreground',
        )}
      >
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full shrink-0',
            iconBg,
          )}
        >
          <MapPin className="h-4 w-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (value) onChange(null);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-1 bg-transparent py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none"
          aria-autocomplete="list"
          aria-haspopup="listbox"
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {!loading && query.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Temizle"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-2 w-full rounded-xl border bg-popover shadow-soft-lg overflow-hidden max-h-80 overflow-y-auto animate-fade-in"
        >
            {results.map((r, i) => (
              <li key={r.placeId}>
                <button
                  type="button"
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => selectSuggestion(r)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-100',
                    i === highlighted ? 'bg-muted' : 'hover:bg-muted/50',
                  )}
                  role="option"
                  aria-selected={i === highlighted}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {r.primary}
                    </div>
                    {r.secondary && (
                      <div className="text-xs text-muted-foreground truncate">
                        {r.secondary}
                      </div>
                    )}
                  </div>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

import type { Metadata } from 'next';
import { Settings, Globe, Bell, Database, Lock, Wrench } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PRICING_CONFIG } from '@/lib/pricing';
import { formatPercent, formatTL } from '@/lib/format';

export const metadata: Metadata = { title: 'Ayarlar' };

export default function AdminAyarlarPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">Yönetim</p>
        <h1 className="heading-display text-3xl font-bold">Ayarlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo ortamı için statik ayarlar.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <SectionHeader icon={<Wrench className="h-4 w-4" />} title="Fiyatlandırma" />
          <div className="space-y-2.5 text-sm">
            <Row label="X Ride taban" value={formatTL(PRICING_CONFIG.RIDE.base)} />
            <Row label="X Ride / km" value={formatTL(PRICING_CONFIG.RIDE.perKm)} />
            <Row label="X Go taban" value={formatTL(PRICING_CONFIG.GO.base)} />
            <Row label="X Go / km" value={formatTL(PRICING_CONFIG.GO.perKm)} />
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader icon={<Database className="h-4 w-4" />} title="Havuz Dağılımı" />
          <div className="space-y-2.5 text-sm">
            <Row label="Sürücü payı" value={formatPercent(PRICING_CONFIG.driverShare)} />
            <Row label="Sistem komisyonu" value={formatPercent(PRICING_CONFIG.systemCommission)} />
            <Row label="Yolcu chip kazanımı" value={formatPercent(PRICING_CONFIG.chipReward)} />
            <Row label="1 chip değeri" value="1 ₺" />
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader icon={<Globe className="h-4 w-4" />} title="Bölge & Dil" />
          <div className="space-y-2.5 text-sm">
            <Row label="Varsayılan dil" value="Türkçe (tr-TR)" />
            <Row label="Para birimi" value="Türk Lirası (₺)" />
            <Row label="Saat dilimi" value="Europe/Istanbul" />
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader icon={<Bell className="h-4 w-4" />} title="Bildirimler" />
          <div className="space-y-2.5 text-sm">
            <Row label="Real-time kanalı" value="BroadcastChannel" />
            <Row label="Polling fallback" value="3 saniye" />
            <Row label="Yolculuk olayları" value="Aktif" />
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader icon={<Lock className="h-4 w-4" />} title="Güvenlik" />
          <div className="space-y-2.5 text-sm">
            <Row label="Oturum süresi" value="7 gün" />
            <Row label="Cookie modu" value="httpOnly + lax" />
            <Row label="Şifre algoritması" value="bcrypt (10 round)" />
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader icon={<Settings className="h-4 w-4" />} title="Demo" />
          <div className="space-y-2.5 text-sm">
            <Row label="Veri kaynağı" value="SQLite (taşınabilir)" />
            <Row label="Harita" value="Mock + Google Places" />
            <Row label="Sürüm" value="0.1.0" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-foreground/5">
        {icon}
      </div>
      <h2 className="text-sm font-semibold">{title}</h2>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

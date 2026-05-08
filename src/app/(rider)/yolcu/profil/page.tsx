import type { Metadata } from 'next';
import { Mail, Phone, Star, ChevronRight } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { db } from '@/lib/db';
import { RiderShell } from '@/components/layout/RiderShell';
import { Card } from '@/components/ui/card';
import { SignOutButton } from '@/components/layout/SignOutButton';

export const metadata: Metadata = { title: 'Profil' };

export default async function ProfilPage() {
  const user = (await getCurrentUser())!;
  const profile = await db.riderProfile.findUnique({
    where: { userId: user.id },
  });
  const userRow = await db.user.findUnique({
    where: { id: user.id },
    select: { phone: true },
  });

  return (
    <RiderShell>
      <div className="px-5 py-4 max-w-md mx-auto space-y-5">
        <div className="text-center pt-4 pb-2">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-foreground text-background text-2xl font-bold">
            {user.fullName
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </div>
          <h1 className="text-xl font-bold">{user.fullName}</h1>
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-current text-foreground" />
            {(profile?.rating ?? 5).toFixed(1)} · {profile?.totalRides ?? 0}{' '}
            yolculuk
          </div>
        </div>

        <Card className="divide-y">
          <ContactRow icon={Mail} label="E-posta" value={user.email} />
          {userRow?.phone && (
            <ContactRow icon={Phone} label="Telefon" value={userRow.phone} />
          )}
        </Card>

        <Card className="divide-y">
          <PrefRow label="Bildirimler" />
          <PrefRow label="Dil" value="Türkçe" />
          <PrefRow label="Yardım Merkezi" />
        </Card>

        <SignOutButton variant="full" className="w-full text-destructive hover:text-destructive" />
      </div>
    </RiderShell>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 first:rounded-t-2xl last:rounded-b-2xl">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function PrefRow({ label, value }: { label: string; value?: string }) {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-between gap-3 p-4 first:rounded-t-2xl last:rounded-b-2xl hover:bg-muted/40 transition-colors text-left"
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        {value}
        <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

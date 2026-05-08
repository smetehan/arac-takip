import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { getDashboardOzet } from '@/lib/sermaye';

export async function GET() {
  const auth = await requireUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const ozet = await getDashboardOzet();

  // Aylık kâr verisi (son 12 ay)
  const satilan = await prisma.arac.findMany({
    where: { durum: 'SATILDI', satimTarihi: { not: null } },
    include: { masraflar: true },
    orderBy: { satimTarihi: 'asc' },
  });

  const aylikKar = {};
  satilan.forEach((a) => {
    const ay = new Date(a.satimTarihi).toISOString().slice(0, 7);
    const masraf = a.masraflar.reduce((s, m) => s + m.tutar, 0);
    const net = (a.satimFiyati || 0) - a.alimFiyati - masraf;
    aylikKar[ay] = (aylikKar[ay] || 0) + net;
  });

  const aylikData = Object.entries(aylikKar)
    .map(([ay, kar]) => ({ ay, kar }))
    .sort((a, b) => a.ay.localeCompare(b.ay));

  // Marka dağılımı
  const markalar = {};
  satilan.forEach((a) => {
    markalar[a.marka] = (markalar[a.marka] || 0) + 1;
  });
  const markaData = Object.entries(markalar).map(([marka, sayi]) => ({ marka, sayi }));

  return NextResponse.json({ ozet, aylikData, markaData });
}

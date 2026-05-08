import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, requireAdmin } from '@/lib/auth';

// Araçları listele
export async function GET() {
  const auth = await requireUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const araclar = await prisma.arac.findMany({
    include: {
      resimler: { take: 1 },
      masraflar: true,
      _count: { select: { resimler: true, masraflar: true, islemler: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ araclar });
}

// Yeni araç ekle (admin)
export async function POST(req) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const data = await req.json();
    const arac = await prisma.arac.create({
      data: {
        marka: data.marka,
        model: data.model,
        uretimYili: parseInt(data.uretimYili),
        km: parseInt(data.km),
        renk: data.renk,
        plaka: data.plaka || null,
        alimFiyati: parseFloat(data.alimFiyati),
        alimTarihi: new Date(data.alimTarihi),
        notlar: data.notlar || null,
        kaydedenId: auth.user.id,
      },
    });
    return NextResponse.json({ arac });
  } catch (e) {
    return NextResponse.json({ error: 'Araç eklenemedi: ' + e.message }, { status: 500 });
  }
}

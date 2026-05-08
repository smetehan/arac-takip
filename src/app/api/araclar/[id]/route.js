import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, requireAdmin } from '@/lib/auth';
import { getAracNetKar } from '@/lib/sermaye';

export async function GET(_req, { params }) {
  const auth = await requireUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = parseInt(params.id);
  const arac = await prisma.arac.findUnique({
    where: { id },
    include: {
      resimler: true,
      masraflar: { orderBy: { tarih: 'desc' } },
      islemler: { orderBy: { tarih: 'desc' } },
      sermayeHareketleri: {
        include: { user: { select: { ad: true, soyad: true } } },
      },
    },
  });
  if (!arac) return NextResponse.json({ error: 'Araç bulunamadı' }, { status: 404 });

  const kar = await getAracNetKar(id);
  return NextResponse.json({ arac, kar });
}

export async function PUT(req, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = parseInt(params.id);
  const data = await req.json();
  try {
    const arac = await prisma.arac.update({
      where: { id },
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
      },
    });
    return NextResponse.json({ arac });
  } catch (e) {
    return NextResponse.json({ error: 'Güncellenemedi: ' + e.message }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = parseInt(params.id);
  try {
    // Kâr/zarar dağıtımı yapıldıysa sermaye hareketleri de silinmeli
    // Cascade ile olacak ama yine de transaction ile
    await prisma.arac.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Silinemedi: ' + e.message }, { status: 500 });
  }
}

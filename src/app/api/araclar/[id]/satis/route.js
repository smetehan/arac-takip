import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { aracSatildigindaKariDagit } from '@/lib/sermaye';

export async function POST(req, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const aracId = parseInt(params.id);
  const data = await req.json();

  if (!data.satimFiyati || !data.satimTarihi) {
    return NextResponse.json({ error: 'Satım fiyatı ve tarihi gerekli' }, { status: 400 });
  }

  try {
    // Önce aracı satıldı olarak işaretle
    await prisma.arac.update({
      where: { id: aracId },
      data: {
        satimFiyati: parseFloat(data.satimFiyati),
        satimTarihi: new Date(data.satimTarihi),
        alici: data.alici || null,
        durum: 'SATILDI',
      },
    });

    // Sonra kâr/zararı ortaklara dağıt
    const sonuc = await aracSatildigindaKariDagit(aracId);

    return NextResponse.json({ ok: true, ...sonuc });
  } catch (e) {
    // Hata durumunda durumu geri al
    await prisma.arac.update({
      where: { id: aracId },
      data: { durum: 'STOKTA', satimFiyati: null, satimTarihi: null, alici: null },
    }).catch(() => {});
    return NextResponse.json({ error: 'Satış kaydedilemedi: ' + e.message }, { status: 500 });
  }
}

// Satışı geri al (admin için)
export async function DELETE(_req, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const aracId = parseInt(params.id);
  try {
    // Kâr/zarar payı hareketlerini sil
    await prisma.sermayeHareket.deleteMany({
      where: {
        aracId,
        tip: { in: ['KAR_PAYI', 'ZARAR_PAYI'] },
      },
    });
    // Aracı stoğa geri al
    await prisma.arac.update({
      where: { id: aracId },
      data: {
        durum: 'STOKTA',
        satimFiyati: null,
        satimTarihi: null,
        alici: null,
        sermayeSnapshot: null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Geri alınamadı: ' + e.message }, { status: 500 });
  }
}

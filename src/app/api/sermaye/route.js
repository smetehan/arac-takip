import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { getKullaniciSermayesi } from '@/lib/sermaye';

export async function POST(req) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { userId, tutar, tip, aciklama, tarih } = await req.json();

    if (!userId || !tutar || !tip) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }

    if (!['YATIRMA', 'CEKME'].includes(tip)) {
      return NextResponse.json({ error: 'Geçersiz tip' }, { status: 400 });
    }

    const tutarSayi = parseFloat(tutar);
    if (tutarSayi <= 0) {
      return NextResponse.json({ error: 'Tutar pozitif olmalı' }, { status: 400 });
    }

    // Çekme işleminde yeterli bakiye var mı?
    if (tip === 'CEKME') {
      const mevcut = await getKullaniciSermayesi(parseInt(userId));
      if (tutarSayi > mevcut) {
        return NextResponse.json(
          { error: `Yetersiz bakiye. Mevcut sermaye: ${mevcut.toFixed(2)} TL` },
          { status: 400 }
        );
      }
    }

    const hareket = await prisma.sermayeHareket.create({
      data: {
        userId: parseInt(userId),
        tutar: tip === 'YATIRMA' ? tutarSayi : -tutarSayi,
        tip,
        aciklama: aciklama || (tip === 'YATIRMA' ? 'Sermaye yatırma' : 'Sermaye çekme'),
        tarih: tarih ? new Date(tarih) : new Date(),
      },
    });

    return NextResponse.json({ hareket });
  } catch (e) {
    return NextResponse.json({ error: 'İşlem başarısız: ' + e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const url = new URL(req.url);
  const id = parseInt(url.searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });

  try {
    const hareket = await prisma.sermayeHareket.findUnique({ where: { id } });
    if (!hareket) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
    // Kâr/zarar paylarını manuel silmeyi engelle (satışı geri al kullanılmalı)
    if (hareket.tip === 'KAR_PAYI' || hareket.tip === 'ZARAR_PAYI') {
      return NextResponse.json(
        { error: 'Kâr/zarar payı manuel silinemez. Önce ilgili aracın satışını geri alın.' },
        { status: 400 }
      );
    }
    await prisma.sermayeHareket.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Silinemedi' }, { status: 500 });
  }
}

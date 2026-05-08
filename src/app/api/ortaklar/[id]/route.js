import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { getKullaniciSermayesi } from '@/lib/sermaye';

export async function GET(_req, { params }) {
  const auth = await requireUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = parseInt(params.id);

  // Ortak sadece kendi raporunu görebilir, admin herkesi
  if (auth.user.rol !== 'ADMIN' && auth.user.id !== id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const ortak = await prisma.user.findUnique({
    where: { id },
    select: { id: true, ad: true, soyad: true, email: true, rol: true, createdAt: true },
  });
  if (!ortak) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });

  const hareketler = await prisma.sermayeHareket.findMany({
    where: { userId: id },
    include: {
      arac: { select: { id: true, marka: true, model: true, uretimYili: true } },
    },
    orderBy: { tarih: 'desc' },
  });

  const sermaye = await getKullaniciSermayesi(id);

  // Toplam yatırılan, çekilen, kar, zarar
  const ozet = hareketler.reduce(
    (acc, h) => {
      if (h.tip === 'YATIRMA') acc.yatirilan += h.tutar;
      else if (h.tip === 'CEKME') acc.cekilen += Math.abs(h.tutar);
      else if (h.tip === 'KAR_PAYI') acc.kar += h.tutar;
      else if (h.tip === 'ZARAR_PAYI') acc.zarar += Math.abs(h.tutar);
      return acc;
    },
    { yatirilan: 0, cekilen: 0, kar: 0, zarar: 0 }
  );

  return NextResponse.json({ ortak, hareketler, sermaye, ozet });
}

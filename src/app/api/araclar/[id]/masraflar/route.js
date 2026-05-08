import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(req, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const aracId = parseInt(params.id);
  const data = await req.json();

  try {
    const masraf = await prisma.masraf.create({
      data: {
        aracId,
        baslik: data.baslik,
        tutar: parseFloat(data.tutar),
        kategori: data.kategori || 'DIGER',
        aciklama: data.aciklama || null,
        tarih: data.tarih ? new Date(data.tarih) : new Date(),
      },
    });
    return NextResponse.json({ masraf });
  } catch (e) {
    return NextResponse.json({ error: 'Masraf eklenemedi: ' + e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const url = new URL(req.url);
  const masrafId = parseInt(url.searchParams.get('masrafId'));
  if (!masrafId) return NextResponse.json({ error: 'masrafId gerekli' }, { status: 400 });

  try {
    await prisma.masraf.delete({ where: { id: masrafId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Silinemedi' }, { status: 500 });
  }
}

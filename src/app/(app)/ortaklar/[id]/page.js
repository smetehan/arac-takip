import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getKullaniciSermayesi } from '@/lib/sermaye';
import { formatTL, formatDate } from '@/lib/format';
import OrtakDetayClient from './OrtakDetayClient';

export const dynamic = 'force-dynamic';

const TIP_LABEL = {
  YATIRMA: 'Yatırma',
  CEKME: 'Çekme',
  KAR_PAYI: 'Kâr Payı',
  ZARAR_PAYI: 'Zarar Payı',
};

export default async function OrtakDetayPage({ params }) {
  const user = await getCurrentUser();
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  // Yetki: kendisi veya admin
  if (user.rol !== 'ADMIN' && user.id !== id) {
    redirect('/dashboard');
  }

  const ortak = await prisma.user.findUnique({
    where: { id },
    select: { id: true, ad: true, soyad: true, email: true, rol: true, createdAt: true },
  });
  if (!ortak) notFound();

  const hareketler = await prisma.sermayeHareket.findMany({
    where: { userId: id },
    include: {
      arac: { select: { id: true, marka: true, model: true, uretimYili: true } },
    },
    orderBy: { tarih: 'desc' },
  });

  const sermaye = await getKullaniciSermayesi(id);

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

  return (
    <div>
      <Link href="/ortaklar" className="text-sm text-ink-500 mb-4 inline-block hover:text-ink-900">
        ← Ortaklara dön
      </Link>

      <div className="grid md:grid-cols-2 gap-6 mb-8 items-end">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-500 mb-2">{ortak.rol === 'ADMIN' ? 'Yönetici' : 'Ortak'}</div>
          <h1 className="display text-5xl mb-2">{ortak.ad} {ortak.soyad}</h1>
          <p className="text-ink-500 text-sm">{ortak.email}</p>
        </div>

        <div className="card p-6">
          <div className="text-xs uppercase tracking-widest text-ink-500 mb-2">Mevcut Sermaye</div>
          <div className="stat-num mono">{formatTL(sermaye)}</div>
        </div>
      </div>

      {/* Özet kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Mini label="Toplam Yatırılan" val={formatTL(ozet.yatirilan)} />
        <Mini label="Toplam Çekilen" val={formatTL(ozet.cekilen)} />
        <Mini label="Kâr Payı" val={formatTL(ozet.kar)} accent="good" />
        <Mini label="Zarar Payı" val={formatTL(ozet.zarar)} accent="bad" />
      </div>

      {/* Hareketler */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="heading text-2xl">Hareket Geçmişi</h2>
        <span className="text-sm text-ink-500">{hareketler.length} kayıt</span>
      </div>

      {hareketler.length === 0 ? (
        <div className="card p-10 text-center text-ink-500">
          Henüz sermaye hareketi yok.
        </div>
      ) : (
        <OrtakDetayClient hareketler={JSON.parse(JSON.stringify(hareketler))} isAdmin={user.rol === 'ADMIN'} />
      )}
    </div>
  );
}

function Mini({ label, val, accent }) {
  const renk =
    accent === 'good' ? 'text-green-700' : accent === 'bad' ? 'text-red-700' : '';
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wider text-ink-500 mb-1">{label}</div>
      <div className={`text-lg mono font-medium ${renk}`}>{val}</div>
    </div>
  );
}

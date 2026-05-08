import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { formatTL, formatDate, formatNumber } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AraclarPage({ searchParams }) {
  const user = await getCurrentUser();
  const filtre = searchParams?.durum || 'TUM';

  const where = filtre === 'TUM' ? {} : { durum: filtre };
  const araclar = await prisma.arac.findMany({
    where,
    include: {
      resimler: { take: 1 },
      masraflar: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-500 mb-2">Araç Filosu</div>
          <h1 className="display text-5xl">Araçlar</h1>
        </div>
        {user.rol === 'ADMIN' && (
          <Link href="/araclar/yeni" className="btn btn-primary">
            <span>+</span> Yeni Araç
          </Link>
        )}
      </div>

      {/* Filtre */}
      <div className="flex gap-2 mb-6">
        {[
          { val: 'TUM', label: `Tümü (${araclar.length})` },
          { val: 'STOKTA', label: 'Stokta' },
          { val: 'SATILDI', label: 'Satıldı' },
        ].map((f) => (
          <Link
            key={f.val}
            href={`/araclar${f.val === 'TUM' ? '' : `?durum=${f.val}`}`}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              filtre === f.val ? 'bg-ink-900 text-bg' : 'bg-white border border-ink-100 text-ink-600 hover:bg-ink-50'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {araclar.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-ink-500 mb-4">Henüz araç eklenmemiş.</p>
          {user.rol === 'ADMIN' && (
            <Link href="/araclar/yeni" className="btn btn-primary">İlk aracı ekle</Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {araclar.map((a) => {
            const masraf = a.masraflar.reduce((s, m) => s + m.tutar, 0);
            const net = a.satimFiyati ? a.satimFiyati - a.alimFiyati - masraf : null;
            const resim = a.resimler[0]?.url;

            return (
              <Link key={a.id} href={`/araclar/${a.id}`} className="card overflow-hidden hover:shadow-card transition-all group">
                <div className="aspect-[4/3] bg-ink-100 relative overflow-hidden">
                  {resim ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resim} alt={`${a.marka} ${a.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-300">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d="M3 17l1.5-4.5a2 2 0 0 1 1.9-1.5h11.2a2 2 0 0 1 1.9 1.5L21 17M5 17h14M5 17v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2M15 17v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2"/>
                        <circle cx="7.5" cy="14.5" r="1"/>
                        <circle cx="16.5" cy="14.5" r="1"/>
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`badge ${a.durum === 'STOKTA' ? 'badge-stokta' : 'badge-satildi'}`}>
                      {a.durum === 'STOKTA' ? 'Stokta' : 'Satıldı'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-xs text-ink-500 mb-1">{a.uretimYili} · {a.renk}</div>
                  <h3 className="heading text-xl mb-1">{a.marka} {a.model}</h3>
                  <div className="text-xs text-ink-500 mb-3 mono">{formatNumber(a.km)} km{a.plaka ? ` · ${a.plaka}` : ''}</div>

                  <div className="flex items-center justify-between pt-3 border-t border-ink-100">
                    <div>
                      <div className="text-xs text-ink-500">Alım</div>
                      <div className="mono text-sm font-medium">{formatTL(a.alimFiyati)}</div>
                    </div>
                    {net !== null ? (
                      <div className="text-right">
                        <div className="text-xs text-ink-500">Net</div>
                        <div className={`mono text-sm font-medium ${net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {net >= 0 ? '+' : ''}{formatTL(net)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="text-xs text-ink-500">Tarih</div>
                        <div className="text-sm">{formatDate(a.alimTarihi)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

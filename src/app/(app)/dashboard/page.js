import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getDashboardOzet, getKullaniciSermayesi } from '@/lib/sermaye';
import { prisma } from '@/lib/prisma';
import { formatTL, formatPercent, formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const ozet = await getDashboardOzet();
  const kendiSermaye = await getKullaniciSermayesi(user.id);

  // Son satılan araçlar
  const sonSatilan = await prisma.arac.findMany({
    where: { durum: 'SATILDI' },
    include: { masraflar: true },
    orderBy: { satimTarihi: 'desc' },
    take: 4,
  });

  return (
    <div>
      {/* Hero */}
      <div className="mb-12 grid md:grid-cols-2 gap-6 items-end">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-500 mb-3">
            Hoş geldiniz, {user.ad}
          </div>
          <h1 className="display text-6xl">Genel<br/>Bakış</h1>
        </div>
        <div className="card p-6">
          <div className="text-xs uppercase tracking-widest text-ink-500 mb-2">
            Sizin sermayeniz
          </div>
          <div className="stat-num mono">{formatTL(kendiSermaye)}</div>
          <Link href={`/ortaklar/${user.id}`} className="mt-3 inline-block text-sm text-ink-500 underline underline-offset-4">
            Detaylı geçmişi görüntüle →
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Stoktaki Araç" value={ozet.stoktakiAracSayisi} />
        <StatCard label="Satılan Araç" value={ozet.satilanAracSayisi} />
        <StatCard label="Toplam Sermaye" value={formatTL(ozet.toplamSermaye)} small />
        <StatCard
          label="Net Kâr"
          value={formatTL(ozet.toplamNetKar)}
          small
          accent={ozet.toplamNetKar >= 0 ? 'good' : 'bad'}
        />
      </div>

      {/* Ortak dağılımı + son satılanlar */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading text-xl">Ortak Sermaye Dağılımı</h2>
            <Link href="/ortaklar" className="text-xs text-ink-500 underline underline-offset-4">
              Tümü →
            </Link>
          </div>
          {ozet.ortaklar.length === 0 ? (
            <p className="text-sm text-ink-500">Henüz ortak yok.</p>
          ) : (
            <div className="space-y-4">
              {ozet.ortaklar.map((o) => (
                <div key={o.userId}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-sm font-medium">{o.ad} {o.soyad}</div>
                    <div className="text-sm mono">{formatTL(o.sermaye)}</div>
                  </div>
                  <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ink-900 rounded-full transition-all"
                      style={{ width: `${o.oran * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-ink-500 mt-0.5">{formatPercent(o.oran)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading text-xl">Son Satılan Araçlar</h2>
            <Link href="/araclar" className="text-xs text-ink-500 underline underline-offset-4">
              Tümü →
            </Link>
          </div>
          {sonSatilan.length === 0 ? (
            <p className="text-sm text-ink-500">Henüz satılan araç yok.</p>
          ) : (
            <div className="space-y-3">
              {sonSatilan.map((a) => {
                const masraf = a.masraflar.reduce((s, m) => s + m.tutar, 0);
                const net = (a.satimFiyati || 0) - a.alimFiyati - masraf;
                return (
                  <Link
                    key={a.id}
                    href={`/araclar/${a.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-ink-50 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-sm">{a.marka} {a.model}</div>
                      <div className="text-xs text-ink-500">
                        {formatDate(a.satimTarihi)} · {a.uretimYili}
                      </div>
                    </div>
                    <div className={`mono text-sm font-medium ${net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {net >= 0 ? '+' : ''}{formatTL(net)}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Hızlı eylemler */}
      {user.rol === 'ADMIN' && (
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/araclar/yeni" className="btn btn-primary">
            <span>+</span> Yeni Araç Ekle
          </Link>
          <Link href="/ortaklar" className="btn btn-ghost">
            Sermaye İşlemi Yap
          </Link>
          <Link href="/raporlar" className="btn btn-ghost">
            Raporları Gör
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, small, accent }) {
  const renkSinifi =
    accent === 'good' ? 'text-green-700' : accent === 'bad' ? 'text-red-700' : '';
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-widest text-ink-500 mb-2">{label}</div>
      <div className={`${small ? 'text-2xl' : 'stat-num'} mono ${renkSinifi}`}>{value}</div>
    </div>
  );
}

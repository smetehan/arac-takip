import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getOrtaklarinSermayeleri } from '@/lib/sermaye';
import { formatTL, formatPercent } from '@/lib/format';
import OrtaklarClient from './OrtaklarClient';

export const dynamic = 'force-dynamic';

export default async function OrtaklarPage() {
  const user = await getCurrentUser();
  const ortaklar = await getOrtaklarinSermayeleri();
  const toplam = ortaklar.reduce((s, o) => s + o.sermaye, 0);

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-ink-500 mb-2">Ekip</div>
        <h1 className="display text-5xl">Ortaklar</h1>
      </div>

      {/* Toplam sermaye kartı */}
      <div className="card p-6 mb-6">
        <div className="text-xs uppercase tracking-widest text-ink-500 mb-2">Toplam Havuz Sermayesi</div>
        <div className="stat-num mono">{formatTL(toplam)}</div>
        <div className="text-sm text-ink-500 mt-1">{ortaklar.filter(o => o.sermaye > 0).length} aktif ortak</div>
      </div>

      {/* Sermaye işlemi - sadece admin */}
      {user.rol === 'ADMIN' && (
        <OrtaklarClient ortaklar={ortaklar} />
      )}

      {/* Ortak listesi */}
      <div className="card overflow-hidden">
        <table className="table-clean">
          <thead>
            <tr>
              <th>Ortak</th>
              <th>E-posta</th>
              <th className="text-right">Sermayesi</th>
              <th className="text-right">Oran</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ortaklar.map((o) => {
              const erisim = user.rol === 'ADMIN' || user.id === o.userId;
              return (
                <tr key={o.userId}>
                  <td className="font-medium">{o.ad} {o.soyad}</td>
                  <td className="text-ink-500">{o.email}</td>
                  <td className="text-right mono">{formatTL(o.sermaye)}</td>
                  <td className="text-right mono text-ink-500">{formatPercent(o.oran)}</td>
                  <td className="text-right">
                    {erisim ? (
                      <Link href={`/ortaklar/${o.userId}`} className="text-sm text-ink-500 underline underline-offset-4 hover:text-ink-900">
                        Detay
                      </Link>
                    ) : (
                      <span className="text-xs text-ink-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

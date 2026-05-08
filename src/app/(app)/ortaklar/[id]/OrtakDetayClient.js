'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatTL, formatDate } from '@/lib/format';

const TIP_LABEL = {
  YATIRMA: 'Yatırma',
  CEKME: 'Çekme',
  KAR_PAYI: 'Kâr Payı',
  ZARAR_PAYI: 'Zarar Payı',
};

const TIP_RENK = {
  YATIRMA: 'bg-blue-50 text-blue-800',
  CEKME: 'bg-orange-50 text-orange-800',
  KAR_PAYI: 'bg-green-50 text-green-800',
  ZARAR_PAYI: 'bg-red-50 text-red-800',
};

export default function OrtakDetayClient({ hareketler, isAdmin }) {
  const router = useRouter();

  async function sil(id) {
    if (!confirm('Bu hareketi silmek istediğinizden emin misiniz?')) return;
    const r = await fetch(`/api/sermaye?id=${id}`, { method: 'DELETE' });
    if (r.ok) router.refresh();
    else {
      const data = await r.json();
      alert(data.error || 'Silinemedi');
    }
  }

  return (
    <div className="card overflow-hidden">
      <table className="table-clean">
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Tip</th>
            <th>Açıklama</th>
            <th className="text-right">Tutar</th>
            {isAdmin && <th></th>}
          </tr>
        </thead>
        <tbody>
          {hareketler.map((h) => {
            const pozitif = h.tutar >= 0;
            const silinebilir = h.tip === 'YATIRMA' || h.tip === 'CEKME';
            return (
              <tr key={h.id}>
                <td className="text-ink-500 whitespace-nowrap">{formatDate(h.tarih)}</td>
                <td>
                  <span className={`badge ${TIP_RENK[h.tip] || 'bg-ink-100 text-ink-700'}`}>
                    {TIP_LABEL[h.tip] || h.tip}
                  </span>
                </td>
                <td>
                  {h.aciklama && <div className="text-sm">{h.aciklama}</div>}
                  {h.arac && (
                    <Link href={`/araclar/${h.arac.id}`} className="text-xs text-ink-500 underline underline-offset-4">
                      → {h.arac.marka} {h.arac.model} ({h.arac.uretimYili})
                    </Link>
                  )}
                </td>
                <td className={`text-right mono font-medium ${pozitif ? 'text-green-700' : 'text-red-700'}`}>
                  {pozitif ? '+' : ''}{formatTL(h.tutar)}
                </td>
                {isAdmin && (
                  <td className="text-right">
                    {silinebilir && (
                      <button onClick={() => sil(h.id)} className="text-ink-400 hover:text-red-700 p-1" title="Sil">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        </svg>
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

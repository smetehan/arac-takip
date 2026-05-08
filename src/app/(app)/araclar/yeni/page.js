'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function YeniAracPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    marka: '',
    model: '',
    uretimYili: new Date().getFullYear(),
    km: '',
    renk: '',
    plaka: '',
    alimFiyati: '',
    alimTarihi: new Date().toISOString().slice(0, 10),
    notlar: '',
  });
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  function guncelle(field, val) {
    setForm({ ...form, [field]: val });
  }

  async function gonder(e) {
    e.preventDefault();
    setHata('');
    setYukleniyor(true);
    try {
      const r = await fetch('/api/araclar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) {
        setHata(data.error || 'Eklenemedi');
      } else {
        router.push(`/araclar/${data.arac.id}`);
        router.refresh();
      }
    } catch {
      setHata('Bağlantı hatası');
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <Link href="/araclar" className="text-sm text-ink-500 mb-4 inline-block hover:text-ink-900">
        ← Araçlara dön
      </Link>
      <h1 className="display text-5xl mb-8">Yeni Araç</h1>

      <form onSubmit={gonder} className="card p-8 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Marka</label>
            <input className="input" value={form.marka} onChange={(e) => guncelle('marka', e.target.value)} required placeholder="Renault" />
          </div>
          <div>
            <label className="label">Model</label>
            <input className="input" value={form.model} onChange={(e) => guncelle('model', e.target.value)} required placeholder="Megane" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Üretim Yılı</label>
            <input type="number" className="input" value={form.uretimYili} onChange={(e) => guncelle('uretimYili', e.target.value)} required min="1900" max={new Date().getFullYear() + 1} />
          </div>
          <div>
            <label className="label">KM</label>
            <input type="number" className="input" value={form.km} onChange={(e) => guncelle('km', e.target.value)} required min="0" />
          </div>
          <div>
            <label className="label">Renk</label>
            <input className="input" value={form.renk} onChange={(e) => guncelle('renk', e.target.value)} required placeholder="Beyaz" />
          </div>
        </div>

        <div>
          <label className="label">Plaka (opsiyonel)</label>
          <input className="input" value={form.plaka} onChange={(e) => guncelle('plaka', e.target.value)} placeholder="06 ABC 123" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Alım Fiyatı (TL)</label>
            <input type="number" step="0.01" className="input mono" value={form.alimFiyati} onChange={(e) => guncelle('alimFiyati', e.target.value)} required min="0" />
          </div>
          <div>
            <label className="label">Alım Tarihi</label>
            <input type="date" className="input" value={form.alimTarihi} onChange={(e) => guncelle('alimTarihi', e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="label">Notlar (opsiyonel)</label>
          <textarea className="input" rows={3} value={form.notlar} onChange={(e) => guncelle('notlar', e.target.value)} placeholder="Aracın durumu, alım kaynağı vs." />
        </div>

        {hata && <div className="p-3 rounded-lg bg-red-50 text-red-800 text-sm">{hata}</div>}

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn btn-primary" disabled={yukleniyor}>
            {yukleniyor ? 'Kaydediliyor...' : 'Aracı Kaydet'}
          </button>
          <Link href="/araclar" className="btn btn-ghost">İptal</Link>
        </div>
      </form>

      <p className="text-xs text-ink-500 mt-4">
        Aracı kaydettikten sonra resim ve masraf ekleyebilir, satış işlemini yapabilirsiniz.
      </p>
    </div>
  );
}

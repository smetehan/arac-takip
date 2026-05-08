'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrtaklarClient({ ortaklar }) {
  const router = useRouter();
  const [acik, setAcik] = useState(false);
  const [form, setForm] = useState({
    userId: ortaklar[0]?.userId || '',
    tip: 'YATIRMA',
    tutar: '',
    aciklama: '',
    tarih: new Date().toISOString().slice(0, 10),
  });
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');

  async function gonder(e) {
    e.preventDefault();
    setHata('');
    setYukleniyor(true);
    const r = await fetch('/api/sermaye', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setYukleniyor(false);
    if (r.ok) {
      setAcik(false);
      setForm({ ...form, tutar: '', aciklama: '' });
      router.refresh();
    } else {
      const data = await r.json();
      setHata(data.error || 'Hata');
    }
  }

  if (!acik) {
    return (
      <div className="mb-6">
        <button onClick={() => setAcik(true)} className="btn btn-primary">
          <span>+</span> Sermaye İşlemi
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={gonder} className="card p-6 mb-6">
      <h3 className="heading text-xl mb-4">Sermaye İşlemi</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="label">Ortak</label>
          <select className="input" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} required>
            {ortaklar.map((o) => (
              <option key={o.userId} value={o.userId}>{o.ad} {o.soyad}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">İşlem Tipi</label>
          <select className="input" value={form.tip} onChange={(e) => setForm({ ...form, tip: e.target.value })}>
            <option value="YATIRMA">Sermaye Yatırma (+)</option>
            <option value="CEKME">Sermaye Çekme (−)</option>
          </select>
        </div>
        <div>
          <label className="label">Tutar (TL)</label>
          <input type="number" step="0.01" className="input mono" value={form.tutar} onChange={(e) => setForm({ ...form, tutar: e.target.value })} required min="0.01" />
        </div>
        <div>
          <label className="label">Tarih</label>
          <input type="date" className="input" value={form.tarih} onChange={(e) => setForm({ ...form, tarih: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Açıklama (opsiyonel)</label>
          <input className="input" value={form.aciklama} onChange={(e) => setForm({ ...form, aciklama: e.target.value })} />
        </div>
      </div>

      {hata && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm">{hata}</div>}

      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={yukleniyor}>
          {yukleniyor ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        <button type="button" onClick={() => setAcik(false)} className="btn btn-ghost">İptal</button>
      </div>
    </form>
  );
}

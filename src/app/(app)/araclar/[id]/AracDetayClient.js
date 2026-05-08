'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatTL, formatDate, formatNumber, formatDateInput } from '@/lib/format';

const KATEGORILER = ['TAMIR', 'BAKIM', 'PARCA', 'VERGI', 'DIGER'];

export default function AracDetayClient({ arac, kar, user }) {
  const router = useRouter();
  const isAdmin = user.rol === 'ADMIN';
  const [tab, setTab] = useState('genel');
  const [aktifResim, setAktifResim] = useState(0);

  function refresh() {
    router.refresh();
  }

  return (
    <div>
      <Link href="/araclar" className="text-sm text-ink-500 mb-4 inline-block hover:text-ink-900">
        ← Araçlara dön
      </Link>

      {/* Hero */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <ResimGalerisi
          arac={arac}
          aktifResim={aktifResim}
          setAktifResim={setAktifResim}
          isAdmin={isAdmin}
          onChange={refresh}
        />

        <div>
          <span className={`badge ${arac.durum === 'STOKTA' ? 'badge-stokta' : 'badge-satildi'} mb-3`}>
            {arac.durum === 'STOKTA' ? 'Stokta' : 'Satıldı'}
          </span>
          <h1 className="display text-5xl mb-2">{arac.marka} {arac.model}</h1>
          <p className="text-ink-500 mb-6">
            {arac.uretimYili} · {arac.renk} · {formatNumber(arac.km)} km
            {arac.plaka ? ` · ${arac.plaka}` : ''}
          </p>

          {/* Kâr/zarar özet */}
          <div className="card p-5 mb-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">Alım</div>
                <div className="mono font-medium">{formatTL(kar.alim)}</div>
              </div>
              <div>
                <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">Masraf</div>
                <div className="mono font-medium">{formatTL(kar.masraf)}</div>
              </div>
              <div>
                <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">Satım</div>
                <div className="mono font-medium">{kar.satim ? formatTL(kar.satim) : '—'}</div>
              </div>
            </div>
            {kar.realize && (
              <div className="mt-4 pt-4 border-t border-ink-100 flex items-end justify-between">
                <div>
                  <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">Net {kar.net >= 0 ? 'Kâr' : 'Zarar'}</div>
                  <div className={`stat-num mono ${kar.net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {kar.net >= 0 ? '+' : ''}{formatTL(kar.net)}
                  </div>
                </div>
                <a
                  href={`/api/araclar/${arac.id}/pdf`}
                  className="btn btn-ghost text-sm"
                  target="_blank"
                  rel="noopener"
                >
                  PDF İndir
                </a>
              </div>
            )}
          </div>

          {/* Hızlı eylemler */}
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              {arac.durum === 'STOKTA' ? (
                <SatisButonu arac={arac} onChange={refresh} />
              ) : (
                <SatisGeriAlButonu arac={arac} onChange={refresh} />
              )}
              <SilButonu arac={arac} />
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-ink-100 mb-6">
        {[
          { id: 'genel', label: 'Genel Bilgiler' },
          { id: 'masraflar', label: `Masraflar (${arac.masraflar.length})` },
          { id: 'dagitim', label: 'Ortak Dağılımı' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px ${
              tab === t.id ? 'border-ink-900 text-ink-900 font-medium' : 'border-transparent text-ink-500 hover:text-ink-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'genel' && <GenelBilgiler arac={arac} />}
      {tab === 'masraflar' && (
        <MasraflarTab arac={arac} isAdmin={isAdmin} onChange={refresh} />
      )}
      {tab === 'dagitim' && <DagitimTab arac={arac} />}
    </div>
  );
}

// ============== Resim Galerisi ==============

function ResimGalerisi({ arac, aktifResim, setAktifResim, isAdmin, onChange }) {
  const fileRef = useRef(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function yukle(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setYukleniyor(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('aracId', String(arac.id));
    try {
      const r = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!r.ok) {
        const data = await r.json();
        alert(data.error || 'Yüklenemedi');
      } else {
        onChange();
      }
    } finally {
      setYukleniyor(false);
      e.target.value = '';
    }
  }

  async function sil(resimId) {
    if (!confirm('Resmi silmek istediğinizden emin misiniz?')) return;
    await fetch(`/api/upload?resimId=${resimId}`, { method: 'DELETE' });
    setAktifResim(0);
    onChange();
  }

  const aktif = arac.resimler[aktifResim];

  return (
    <div>
      <div className="aspect-[4/3] bg-ink-100 rounded-2xl overflow-hidden mb-3 relative">
        {aktif ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={aktif.url} alt={`${arac.marka} ${arac.model}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-ink-300 gap-3">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M3 17l1.5-4.5a2 2 0 0 1 1.9-1.5h11.2a2 2 0 0 1 1.9 1.5L21 17M5 17h14M5 17v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2M15 17v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2"/>
              <circle cx="7.5" cy="14.5" r="1"/>
              <circle cx="16.5" cy="14.5" r="1"/>
            </svg>
            <span className="text-sm">Henüz resim yok</span>
          </div>
        )}

        {isAdmin && aktif && (
          <button
            onClick={() => sil(aktif.id)}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-red-700 p-2 rounded-full shadow"
            title="Resmi sil"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>
            </svg>
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {arac.resimler.map((r, i) => (
          <button
            key={r.id}
            onClick={() => setAktifResim(i)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              aktifResim === i ? 'border-ink-900' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}

        {isAdmin && (
          <>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-ink-200 text-ink-400 hover:border-ink-900 hover:text-ink-900 transition-all flex items-center justify-center"
              disabled={yukleniyor}
            >
              {yukleniyor ? (
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.2-8.5"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={yukle} />
          </>
        )}
      </div>
    </div>
  );
}

// ============== Genel Bilgiler ==============

function GenelBilgiler({ arac }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card p-6">
        <h3 className="heading text-lg mb-4">Araç Detayları</h3>
        <dl className="space-y-3 text-sm">
          <Bilgi label="Marka" val={arac.marka} />
          <Bilgi label="Model" val={arac.model} />
          <Bilgi label="Üretim Yılı" val={arac.uretimYili} />
          <Bilgi label="Renk" val={arac.renk} />
          <Bilgi label="KM" val={`${formatNumber(arac.km)} km`} />
          <Bilgi label="Plaka" val={arac.plaka || '—'} />
        </dl>
      </div>

      <div className="card p-6">
        <h3 className="heading text-lg mb-4">İşlem Bilgileri</h3>
        <dl className="space-y-3 text-sm">
          <Bilgi label="Alım Tarihi" val={formatDate(arac.alimTarihi)} />
          <Bilgi label="Alım Fiyatı" val={<span className="mono">{formatTL(arac.alimFiyati)}</span>} />
          <Bilgi label="Satım Tarihi" val={arac.satimTarihi ? formatDate(arac.satimTarihi) : '—'} />
          <Bilgi label="Satım Fiyatı" val={arac.satimFiyati ? <span className="mono">{formatTL(arac.satimFiyati)}</span> : '—'} />
          <Bilgi label="Alıcı" val={arac.alici || '—'} />
        </dl>
      </div>

      {arac.notlar && (
        <div className="card p-6 md:col-span-2">
          <h3 className="heading text-lg mb-3">Notlar</h3>
          <p className="text-sm text-ink-700 whitespace-pre-wrap">{arac.notlar}</p>
        </div>
      )}
    </div>
  );
}

function Bilgi({ label, val }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium text-right">{val}</dd>
    </div>
  );
}

// ============== Masraflar Tab ==============

function MasraflarTab({ arac, isAdmin, onChange }) {
  const [ekleAcik, setEkleAcik] = useState(false);
  const [form, setForm] = useState({
    baslik: '',
    tutar: '',
    kategori: 'TAMIR',
    aciklama: '',
    tarih: new Date().toISOString().slice(0, 10),
  });
  const [yukleniyor, setYukleniyor] = useState(false);

  async function ekle(e) {
    e.preventDefault();
    setYukleniyor(true);
    const r = await fetch(`/api/araclar/${arac.id}/masraflar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setYukleniyor(false);
    if (r.ok) {
      setEkleAcik(false);
      setForm({ baslik: '', tutar: '', kategori: 'TAMIR', aciklama: '', tarih: new Date().toISOString().slice(0, 10) });
      onChange();
    } else {
      const data = await r.json();
      alert(data.error || 'Eklenemedi');
    }
  }

  async function sil(masrafId) {
    if (!confirm('Masrafı silmek istiyor musunuz?')) return;
    await fetch(`/api/araclar/${arac.id}/masraflar?masrafId=${masrafId}`, { method: 'DELETE' });
    onChange();
  }

  const toplam = arac.masraflar.reduce((s, m) => s + m.tutar, 0);

  return (
    <div>
      {isAdmin && (
        <div className="mb-4">
          {ekleAcik ? (
            <form onSubmit={ekle} className="card p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Başlık</label>
                  <input className="input" value={form.baslik} onChange={(e) => setForm({ ...form, baslik: e.target.value })} required placeholder="Yağ değişimi" />
                </div>
                <div>
                  <label className="label">Tutar (TL)</label>
                  <input type="number" step="0.01" className="input mono" value={form.tutar} onChange={(e) => setForm({ ...form, tutar: e.target.value })} required min="0" />
                </div>
                <div>
                  <label className="label">Kategori</label>
                  <select className="input" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
                    {KATEGORILER.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Tarih</label>
                  <input type="date" className="input" value={form.tarih} onChange={(e) => setForm({ ...form, tarih: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Açıklama (opsiyonel)</label>
                <input className="input" value={form.aciklama} onChange={(e) => setForm({ ...form, aciklama: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary text-sm" disabled={yukleniyor}>{yukleniyor ? 'Ekleniyor...' : 'Ekle'}</button>
                <button type="button" onClick={() => setEkleAcik(false)} className="btn btn-ghost text-sm">İptal</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setEkleAcik(true)} className="btn btn-primary text-sm">
              <span>+</span> Masraf Ekle
            </button>
          )}
        </div>
      )}

      {arac.masraflar.length === 0 ? (
        <div className="card p-10 text-center text-ink-500">
          Bu araca henüz masraf eklenmemiş.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Başlık</th>
                <th>Kategori</th>
                <th className="text-right">Tutar</th>
                {isAdmin && <th className="w-12"></th>}
              </tr>
            </thead>
            <tbody>
              {arac.masraflar.map((m) => (
                <tr key={m.id}>
                  <td className="text-ink-500">{formatDate(m.tarih)}</td>
                  <td>
                    <div className="font-medium">{m.baslik}</div>
                    {m.aciklama && <div className="text-xs text-ink-500">{m.aciklama}</div>}
                  </td>
                  <td><span className="badge bg-ink-100 text-ink-700">{m.kategori}</span></td>
                  <td className="text-right mono font-medium">{formatTL(m.tutar)}</td>
                  {isAdmin && (
                    <td>
                      <button onClick={() => sil(m.id)} className="text-ink-400 hover:text-red-700 p-1" title="Sil">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-ink-50 font-medium">
                <td colSpan={3} className="text-right uppercase tracking-wider text-xs text-ink-500">Toplam</td>
                <td className="text-right mono">{formatTL(toplam)}</td>
                {isAdmin && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

// ============== Dağıtım Tab ==============

function DagitimTab({ arac }) {
  if (arac.durum !== 'SATILDI') {
    return (
      <div className="card p-10 text-center text-ink-500">
        Bu araç henüz satılmadı. Satıldığında, satış anındaki sermaye oranlarına göre kâr/zarar otomatik dağıtılacak.
      </div>
    );
  }

  const snapshot = arac.sermayeSnapshot ? JSON.parse(arac.sermayeSnapshot) : null;

  if (!snapshot && arac.sermayeHareketleri.length === 0) {
    return (
      <div className="card p-10 text-center text-ink-500">
        Bu araç için kâr dağıtımı kaydı bulunamadı.
      </div>
    );
  }

  const dagitim = snapshot || arac.sermayeHareketleri.map((h) => ({
    userId: h.userId,
    ad: h.user.ad,
    soyad: h.user.soyad,
    sermaye: 0,
    oran: 0,
    pay: h.tutar,
  }));

  const toplam = dagitim.reduce((s, d) => s + d.pay, 0);

  return (
    <div>
      <div className="card p-6 mb-4">
        <p className="text-sm text-ink-500 mb-2">
          Bu araç satıldığında ortakların satış anındaki sermaye oranlarına göre kâr/zarar dağıtıldı.
        </p>
        <p className="text-sm">
          Toplam Net: <span className={`mono font-medium ${toplam >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {toplam >= 0 ? '+' : ''}{formatTL(toplam)}
          </span>
        </p>
      </div>

      <div className="card overflow-hidden">
        <table className="table-clean">
          <thead>
            <tr>
              <th>Ortak</th>
              {snapshot && <th className="text-right">Sermayesi</th>}
              {snapshot && <th className="text-right">Oran</th>}
              <th className="text-right">Pay</th>
            </tr>
          </thead>
          <tbody>
            {dagitim.map((d) => (
              <tr key={d.userId}>
                <td className="font-medium">{d.ad} {d.soyad}</td>
                {snapshot && <td className="text-right mono">{formatTL(d.sermaye)}</td>}
                {snapshot && <td className="text-right mono text-ink-500">%{(d.oran * 100).toFixed(2)}</td>}
                <td className={`text-right mono font-medium ${d.pay >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {d.pay >= 0 ? '+' : ''}{formatTL(d.pay)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============== Satış / Sil Butonları ==============

function SatisButonu({ arac, onChange }) {
  const [acik, setAcik] = useState(false);
  const [form, setForm] = useState({
    satimFiyati: '',
    satimTarihi: new Date().toISOString().slice(0, 10),
    alici: '',
  });
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');

  async function gonder(e) {
    e.preventDefault();
    setHata('');
    setYukleniyor(true);
    const r = await fetch(`/api/araclar/${arac.id}/satis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setYukleniyor(false);
    if (r.ok) {
      setAcik(false);
      onChange();
    } else {
      const data = await r.json();
      setHata(data.error || 'Hata');
    }
  }

  if (!acik) {
    return (
      <button onClick={() => setAcik(true)} className="btn btn-accent">
        Aracı Sat
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setAcik(false)}>
      <form onSubmit={gonder} className="card p-7 max-w-md w-full bg-white">
        <h3 className="heading text-2xl mb-2">Aracı Sat</h3>
        <p className="text-sm text-ink-500 mb-5">
          Satış kaydedildiğinde net kâr/zarar, ortakların satış anındaki sermaye oranlarına göre otomatik dağıtılacak.
        </p>

        <div className="space-y-4">
          <div>
            <label className="label">Satım Fiyatı (TL)</label>
            <input type="number" step="0.01" className="input mono" value={form.satimFiyati} onChange={(e) => setForm({ ...form, satimFiyati: e.target.value })} required min="0" autoFocus />
          </div>
          <div>
            <label className="label">Satım Tarihi</label>
            <input type="date" className="input" value={form.satimTarihi} onChange={(e) => setForm({ ...form, satimTarihi: e.target.value })} required />
          </div>
          <div>
            <label className="label">Alıcı (opsiyonel)</label>
            <input className="input" value={form.alici} onChange={(e) => setForm({ ...form, alici: e.target.value })} placeholder="Ahmet Yılmaz" />
          </div>
        </div>

        {hata && <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm">{hata}</div>}

        <div className="flex gap-2 mt-6">
          <button type="submit" className="btn btn-accent" disabled={yukleniyor}>
            {yukleniyor ? 'Kaydediliyor...' : 'Satışı Onayla'}
          </button>
          <button type="button" onClick={() => setAcik(false)} className="btn btn-ghost">İptal</button>
        </div>
      </form>
    </div>
  );
}

function SatisGeriAlButonu({ arac, onChange }) {
  async function geriAl() {
    if (!confirm('Satışı geri almak istediğinizden emin misiniz? Ortaklara dağıtılan kâr/zarar payları da iptal edilecek.')) return;
    const r = await fetch(`/api/araclar/${arac.id}/satis`, { method: 'DELETE' });
    if (r.ok) onChange();
    else {
      const data = await r.json();
      alert(data.error || 'Geri alınamadı');
    }
  }
  return <button onClick={geriAl} className="btn btn-ghost text-sm">Satışı Geri Al</button>;
}

function SilButonu({ arac }) {
  const router = useRouter();
  async function sil() {
    if (!confirm('Bu aracı tamamen silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;
    const r = await fetch(`/api/araclar/${arac.id}`, { method: 'DELETE' });
    if (r.ok) router.push('/araclar');
    else alert('Silinemedi');
  }
  return <button onClick={sil} className="btn btn-danger text-sm">Aracı Sil</button>;
}

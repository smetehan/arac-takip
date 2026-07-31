'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { TEMPLATES, ILAN_CSS } from '@/lib/ilan/templates';

// ⚙️ Galeri bilgileri — kendi bilgilerinle değiştir (ileride settings tablosundan da çekebilirsin)
const GALERI = {
  ad: 'MERİDYEN OTO',
  mono: 'M',
  alt: 'Güvenilir Galeri · Ankara',
  telefon: '0555 555 55 55',
  adres: 'Çankaya / Ankara · www.meridyenoto.com',
};

const TUM_ROZETLER = ['Takasa Uygun', 'Kredi İmkanı', 'Servis Bakımlı', 'Garanti', 'Boyasız', 'Değişensiz'];

export default function IlanOlusturucu({ arac, siteUrl }) {
  const base = siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const autoUrl = `${base}/ilan/${arac.id}`;

  const [f, setF] = useState({
    tpl: 'mavi',
    foto: 0,
    fiyat: arac.ilanFiyati != null ? String(arac.ilanFiyati)
         : arac.satimFiyati != null ? String(arac.satimFiyati) : '',
    tel: GALERI.telefon,
    // Hibrit: arac.ilanUrl varsa onu kullan, yoksa otomatik /ilan/{id}
    url: (arac.ilanUrl && arac.ilanUrl.trim()) || autoUrl,
    yakit: arac.yakit || 'Benzin',
    vites: arac.vites || 'Otomatik',
    guc: arac.motorGucu || '',
    kasa: arac.kasaTipi || '',
    cekis: arac.cekis || '',
    hasar: arac.hasarDurumu || 'Hasarsız',
    chips: { 'Takasa Uygun': true, 'Kredi İmkanı': true, 'Servis Bakımlı': true },
  });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const data = {
    marka: arac.marka, model: arac.model, yil: arac.uretimYili, km: arac.km, renk: arac.renk,
    stok: arac.id, plaka: arac.plaka,
    altbaslik: [arac.plaka, f.kasa, f.guc].filter(Boolean).join(' · '),
    foto: arac.resimler?.[f.foto]?.url || null,
    fiyat: f.fiyat, tel: f.tel, url: f.url,
    yakit: f.yakit, vites: f.vites, guc: f.guc, kasa: f.kasa, cekis: f.cekis, hasar: f.hasar,
    chips: Object.keys(f.chips).filter((k) => f.chips[k]),
    galeri: GALERI,
  };

  const Tpl = TEMPLATES[f.tpl].Component;
  const qr = (
    <QRCodeSVG value={f.url || ' '} bgColor="#ffffff" fgColor="#0E2A4E" level="M"
      style={{ width: '100%', height: '100%' }} />
  );

  // --- önizlemeyi panele sığdır (transform scale) ---
  const wrapRef = useRef(null);
  const sheetRef = useRef(null);
  const [scale, setScale] = useState(0.5);
  const [dims, setDims] = useState({ w: 1123, h: 794 });
  useEffect(() => {
    function fit() {
      const wrap = wrapRef.current;
      const sheet = sheetRef.current?.firstElementChild;
      if (!wrap || !sheet) return;
      const w = sheet.offsetWidth, h = sheet.offsetHeight;
      const s = Math.min(wrap.clientWidth / w, 1);
      setDims({ w, h });
      setScale(s > 0 ? s : 1);
    }
    fit();
    const ro = new ResizeObserver(fit);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [f.tpl]);

  return (
    <div className="ilan-root" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <style dangerouslySetInnerHTML={{ __html: ILAN_CSS + PRINT_CSS }} />

      {/* ---------- Kontroller ---------- */}
      <aside className="ilan-panel" style={{ width: 340, flexShrink: 0 }}>
        <Link href={`/araclar/${arac.id}`} className="text-sm text-ink-500 mb-4 inline-block hover:text-ink-900">
          ← Araca dön
        </Link>

        <div className="mb-5">
          <label className="label">Şablon</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(TEMPLATES).map(([k, t]) => (
              <button
                key={k}
                onClick={() => set('tpl', k)}
                className={`card ${f.tpl === k ? 'ring-2 ring-ink-900' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 10, textAlign: 'left', cursor: 'pointer' }}
              >
                <span style={{ width: 34, height: 24, borderRadius: 5, background: t.sw, flexShrink: 0 }} />
                <span>
                  <span style={{ fontSize: 13, fontWeight: 600, display: 'block' }}>{t.ad}</span>
                  <span className="text-xs text-ink-500">{t.ds}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="label">İlan Fiyatı (₺)</label>
          <input className="input mono" value={f.fiyat} onChange={(e) => set('fiyat', e.target.value)} placeholder="1285000" />
        </div>
        <div className="mb-4">
          <label className="label">Telefon</label>
          <input className="input mono" value={f.tel} onChange={(e) => set('tel', e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="label">İlan URL (→ QR)</label>
          <input className="input" value={f.url} onChange={(e) => set('url', e.target.value)} />
          <p className="text-xs text-ink-500 mt-1">Boş bırakırsan otomatik: {autoUrl}</p>
        </div>

        {arac.resimler?.length > 0 && (
          <div className="mb-4">
            <label className="label">Fotoğraf</label>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {arac.resimler.map((r, i) => (
                <button
                  key={r.id ?? i}
                  onClick={() => set('foto', i)}
                  style={{
                    width: 46, height: 38, borderRadius: 7, overflow: 'hidden', padding: 0, cursor: 'pointer',
                    border: `2px solid ${f.foto === i ? '#111827' : 'transparent'}`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="label">Teknik Özellikler</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input className="input" placeholder="Yakıt" value={f.yakit} onChange={(e) => set('yakit', e.target.value)} />
            <input className="input" placeholder="Vites" value={f.vites} onChange={(e) => set('vites', e.target.value)} />
            <input className="input" placeholder="Motor Gücü" value={f.guc} onChange={(e) => set('guc', e.target.value)} />
            <input className="input" placeholder="Kasa Tipi" value={f.kasa} onChange={(e) => set('kasa', e.target.value)} />
            <input className="input" placeholder="Çekiş" value={f.cekis} onChange={(e) => set('cekis', e.target.value)} />
            <input className="input" placeholder="Hasar / Boya" value={f.hasar} onChange={(e) => set('hasar', e.target.value)} />
          </div>
        </div>

        <div className="mb-5">
          <label className="label">Rozetler</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {TUM_ROZETLER.map((c) => (
              <button
                key={c}
                onClick={() => set('chips', { ...f.chips, [c]: !f.chips[c] })}
                className={`badge ${f.chips[c] ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-700'}`}
                style={{ cursor: 'pointer' }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary w-full" onClick={() => window.print()}>
          Yazdır / PDF (A4 Yatay)
        </button>
      </aside>

      {/* ---------- Önizleme ---------- */}
      <div ref={wrapRef} style={{ flex: 1, minWidth: 0 }}>
        <div
          className="ilan-print-area"
          style={{ width: dims.w * scale, height: dims.h * scale, margin: '0 auto', position: 'relative' }}
        >
          <div
            ref={sheetRef}
            className="ilan-scale"
            style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: 'top left', boxShadow: '0 20px 60px rgba(0,0,0,.22)' }}
          >
            <Tpl data={data} qr={qr} />
          </div>
        </div>
      </div>
    </div>
  );
}

const PRINT_CSS = `
@media print {
  @page { size:A4 landscape; margin:0; }
  body * { visibility:hidden !important; }
  .ilan-print-area, .ilan-print-area * { visibility:visible !important; }
  .ilan-print-area { position:fixed !important; left:0; top:0; width:auto !important; height:auto !important; margin:0 !important; }
  .ilan-scale { position:static !important; transform:none !important; box-shadow:none !important; }
  .ilan-panel { display:none !important; }
}
`;

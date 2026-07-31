'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { TEMPLATES, THEMES, ILAN_CSS, CarDiagram, STATES, CYCLE } from '@/lib/ilan/templates';

// ⚙️ Galeri bilgileri — kendi bilgilerinle değiştir
const GALERI = {
  ad: 'ANAFARTALAR MOTORS',
  mono: 'A',
  alt: 'Oto Kent · Ankara',
  telefon: '0543 613 06 40',
  adres: 'Yenimahalle / Ankara · ',
};

const TUM_ROZETLER = ['Takasa Uygun', 'Kredi İmkanı', 'Servis Bakımlı', 'Garanti', 'Boyasız', 'Değişensiz'];

const ilkTema = Object.keys(TEMPLATES)[0];

export default function IlanOlusturucu({ arac, siteUrl }) {
  const base = siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const autoUrl = `${base}/ilan/${arac.id}`;

  const [f, setF] = useState({
    tpl: ilkTema,
    foto: 0,
    fiyat: arac.ilanFiyati != null ? String(arac.ilanFiyati)
         : arac.satimFiyati != null ? String(arac.satimFiyati) : '',
    tel: GALERI.telefon,
    url: (arac.ilanUrl && arac.ilanUrl.trim()) || autoUrl,
    yakit: arac.yakit || 'Benzin',
    vites: arac.vites || 'Otomatik',
    guc: arac.motorGucu || '',
    kasa: arac.kasaTipi || '',
    chips: { 'Takasa Uygun': true, 'Kredi İmkanı': true, 'Servis Bakımlı': true },
    boya: parseBoya(arac.boyaDurumu), // { panelId: 'boyali' | 'degisen' | ... }
  });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  function cyclePanel(id) {
    setF((s) => {
      const cur = s.boya[id] || 'orijinal';
      const nx = CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length];
      const boya = { ...s.boya };
      if (nx === 'orijinal') delete boya[id]; else boya[id] = nx;
      return { ...s, boya };
    });
  }

  const data = {
    marka: arac.marka, model: arac.model, yil: arac.uretimYili, km: arac.km, renk: arac.renk,
    stok: arac.id, plaka: arac.plaka,
    altbaslik: [arac.plaka, f.kasa, f.guc].filter(Boolean).join(' · '),
    foto: arac.resimler?.[f.foto]?.url || null,
    fiyat: f.fiyat, tel: f.tel, url: f.url,
    yakit: f.yakit, vites: f.vites, guc: f.guc, kasa: f.kasa,
    chips: Object.keys(f.chips).filter((k) => f.chips[k]),
    boya: f.boya,
    galeri: GALERI,
  };

  const Tpl = TEMPLATES[f.tpl].Component;
  const qr = <QRCodeSVG value={f.url || ' '} bgColor="#ffffff" fgColor={THEME_QR(f.tpl)} level="M" style={{ width: '100%', height: '100%' }} />;

  // önizlemeyi sığdır
  const wrapRef = useRef(null);
  const sheetRef = useRef(null);
  const [scale, setScale] = useState(0.5);
  const [dims, setDims] = useState({ w: 1123, h: 794 });
  useEffect(() => {
    function fit() {
      const wrap = wrapRef.current, sheet = sheetRef.current?.firstElementChild;
      if (!wrap || !sheet) return;
      const w = sheet.offsetWidth, h = sheet.offsetHeight;
      setDims({ w, h });
      setScale(Math.min(wrap.clientWidth / w, 1) || 1);
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
      <aside className="ilan-panel" style={{ width: 360, flexShrink: 0 }}>
        <Link href={`/araclar/${arac.id}`} className="text-sm text-ink-500 mb-4 inline-block hover:text-ink-900">← Araca dön</Link>

        <div className="mb-5">
          <label className="label">Tema</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {Object.entries(TEMPLATES).map(([k, t]) => (
              <button key={k} onClick={() => set('tpl', k)}
                className={`card ${f.tpl === k ? 'ring-2 ring-ink-900' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: 9, padding: 9, textAlign: 'left', cursor: 'pointer' }}>
                <span style={{ width: 26, height: 26, borderRadius: 6, background: t.sw, flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{t.ad}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Boya & Değişen editörü */}
        <div className="mb-5">
          <label className="label">Boya & Değişen (parçaya tıkla)</label>
          <div className="card" style={{ display: 'flex', gap: 12, padding: 12, alignItems: 'flex-start' }}>
            <CarDiagram boya={f.boya} onPanel={cyclePanel} style={{ width: 92, height: 'auto', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {Object.entries(STATES).map(([k, s]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 4, background: s.renk, border: '1px solid #e5e7eb' }} />
                  {s.ad}
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => set('boya', {})} className="btn btn-ghost text-xs mt-2">Tümünü orijinal yap</button>
          <p className="text-xs text-ink-500 mt-1">Sıra: Orijinal → Lokal Boyalı → Boyalı → Değişen</p>
        </div>

        <div className="mb-4"><label className="label">İlan Fiyatı (₺)</label>
          <input className="input mono" value={f.fiyat} onChange={(e) => set('fiyat', e.target.value)} placeholder="1285000" /></div>
        <div className="mb-4"><label className="label">Telefon</label>
          <input className="input mono" value={f.tel} onChange={(e) => set('tel', e.target.value)} /></div>
        <div className="mb-4"><label className="label">İlan URL (→ QR)</label>
          <input className="input" value={f.url} onChange={(e) => set('url', e.target.value)} />
          <p className="text-xs text-ink-500 mt-1">Boşsa otomatik: {autoUrl}</p></div>

        {arac.resimler?.length > 0 && (
          <div className="mb-4">
            <label className="label">Fotoğraf</label>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {arac.resimler.map((r, i) => (
                <button key={r.id ?? i} onClick={() => set('foto', i)}
                  style={{ width: 46, height: 38, borderRadius: 7, overflow: 'hidden', padding: 0, cursor: 'pointer', border: `2px solid ${f.foto === i ? '#111827' : 'transparent'}` }}>
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
            <select className="input" value={f.yakit} onChange={(e) => set('yakit', e.target.value)}>
              <option value="Benzin">Benzin</option>
              <option value="Benzin+LPG">Benzin+LPG</option>
              <option value="Dizel">Dizel</option>
              <option value="Elektrik">Elektrik</option>
            </select>
            <select className="input" value={f.vites} onChange={(e) => set('vites', e.target.value)}>
              <option value="Manuel">Manuel</option>
              <option value="Otomatik">Otomatik</option>
            </select>
            <input className="input" placeholder="Motor Gücü" value={f.guc} onChange={(e) => set('guc', e.target.value)} />
            <input className="input" placeholder="Kasa Tipi" value={f.kasa} onChange={(e) => set('kasa', e.target.value)} />
          </div>
        </div>

        <div className="mb-5">
          <label className="label">Rozetler</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {TUM_ROZETLER.map((c) => (
              <button key={c} onClick={() => set('chips', { ...f.chips, [c]: !f.chips[c] })}
                className={`badge ${f.chips[c] ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-700'}`}
                style={{ cursor: 'pointer' }}>{c}</button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary w-full" onClick={() => window.print()}>Yazdır / PDF (A4 Yatay)</button>
      </aside>

      {/* ---------- Önizleme ---------- */}
      <div ref={wrapRef} style={{ flex: 1, minWidth: 0 }}>
        <div className="ilan-print-area" style={{ width: dims.w * scale, height: dims.h * scale, margin: '0 auto', position: 'relative' }}>
          <div ref={sheetRef} className="ilan-scale"
            style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: 'top left', boxShadow: '0 20px 60px rgba(0,0,0,.22)' }}>
            <Tpl data={data} qr={qr} />
          </div>
        </div>
      </div>
    </div>
  );
}

// arac.boyaDurumu JSON string → obje
function parseBoya(raw) {
  if (!raw) return {};
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return {}; }
}
// QR koyu rengini temaya göre ayarla
function THEME_QR(id) { return (THEMES[id] || THEMES.mavi).dark; }

const PRINT_CSS = `
@media print {
  @page { size:A4 landscape; margin:0; }
  html, body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
  body * { visibility:hidden !important; }
  .ilan-print-area, .ilan-print-area * { visibility:visible !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
  .ilan-print-area { position:fixed !important; left:0; top:0; width:auto !important; height:auto !important; margin:0 !important; }
  .ilan-scale { position:static !important; transform:none !important; box-shadow:none !important; }
  .ilan-panel { display:none !important; }
}
`;

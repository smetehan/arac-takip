// src/lib/ilan/templates.jsx
// Şablon registry: her tema tek bir `ilanData` objesi + `qr` node alır.
// Yeni tema eklemek için: bir Component yaz, TEMPLATES'e bir satır ekle. Başka yeri değiştirme.

export const fmtTL = (n) =>
  new Intl.NumberFormat('tr-TR').format(Number(String(n ?? '').replace(/[^\d]/g, '')) || 0);

/* =========================================================
   TEMA 1 — KURUMSAL MAVİ (fotoğraflı, iki sütun)
   ========================================================= */
function Mavi({ data: d, qr }) {
  return (
    <div className="ilan-sheet t-mavi">
      <header className="head">
        <div className="brand">
          <div className="mono-logo">{d.galeri.mono}</div>
          <div>
            <div className="b-name">{d.galeri.ad}</div>
            <div className="b-sub">{d.galeri.alt}</div>
          </div>
        </div>
        <div className="head-right">
          <div className="stock"><div className="k">Stok No</div><div className="v">A-{d.stok}</div></div>
          <div className="tag">Satılık</div>
        </div>
      </header>

      <div className="main">
        <div className="col-photo">
          <div className="photo">
            {d.foto ? <img src={d.foto} alt={`${d.marka} ${d.model}`} /> : <div className="photo-empty">Fotoğraf yok</div>}
            <div className="year-badge">{d.yil} Model</div>
          </div>
          <div className="car-block">
            <div className="car">{d.marka} <span>{d.model}</span></div>
            <div className="trim">{d.altbaslik}</div>
            <div className="chips">
              {d.chips.map((c, i) => <span key={c} className={'chip' + (i === 0 ? ' hl' : '')}>{c}</span>)}
            </div>
          </div>
        </div>

        <div className="col-specs">
          <div className="specs-title">Teknik Özellikler</div>
          <div className="grid">
            <div className="cell"><div className="lab">Kilometre</div><div className="val mono">{fmtTL(d.km)} <small>km</small></div></div>
            <div className="cell"><div className="lab">Yakıt</div><div className="val">{d.yakit || '—'}</div></div>
            <div className="cell"><div className="lab">Vites</div><div className="val">{d.vites || '—'}</div></div>
            <div className="cell"><div className="lab">Motor Gücü</div><div className="val mono">{d.guc || '—'}</div></div>
            <div className="cell"><div className="lab">Kasa Tipi</div><div className="val">{d.kasa || '—'}</div></div>
            <div className="cell"><div className="lab">Renk</div><div className="val">{d.renk || '—'}</div></div>
            <div className="cell"><div className="lab">Çekiş</div><div className="val">{d.cekis || '—'}</div></div>
            <div className="cell"><div className="lab">Hasar / Boya</div><div className="val"><span className="ok">{d.hasar || '—'}</span></div></div>
          </div>
        </div>
      </div>

      <footer className="foot">
        <div className="price">
          <div className="p-lab">Fiyat</div>
          <div className="amount"><span>₺</span>{d.fiyat ? fmtTL(d.fiyat) : '—'}</div>
          <div className="p-note">Pazarlık payı vardır · Takas / kredi olur</div>
        </div>
        <div className="contact">
          <div className="c-lab">İletişim</div>
          <div className="phone">{d.tel}</div>
          <div className="addr">{d.galeri.ad} · {d.galeri.adres}</div>
        </div>
        <div className="qr-wrap">
          <div className="qr">{qr}</div>
          <div className="qr-cap">İlan Detayı</div>
        </div>
      </footer>
    </div>
  );
}

/* =========================================================
   TEMA 2 — LACİVERT ALTIN (spec-sheet, premium)
   ========================================================= */
function Altin({ data: d, qr }) {
  const specs = [
    ['Kilometre', <span className="mono" key="km">{fmtTL(d.km)} <small>km</small></span>],
    ['Yakıt', d.yakit || '—'],
    ['Vites', d.vites || '—'],
    ['Motor Gücü', <span className="mono" key="g">{d.guc || '—'}</span>],
    ['Kasa Tipi', d.kasa || '—'],
    ['Renk', d.renk || '—'],
    ['Çekiş', d.cekis || '—'],
    ['Hasar / Boya', <span className="ok" key="h">{d.hasar || '—'}</span>],
  ];
  return (
    <div className="ilan-sheet t-altin">
      <header className="head">
        <div className="brand">
          <div className="mono-logo">{d.galeri.mono}</div>
          <div>
            <div className="b-name">{d.galeri.ad}</div>
            <div className="b-sub">{d.galeri.alt}</div>
          </div>
        </div>
        <div className="head-right">
          <div className="stock"><div className="k">Stok No</div><div className="v">A-{d.stok}</div></div>
          <div className="tag">Satılık</div>
        </div>
      </header>

      <section className="hero">
        <div>
          <span className="year">{d.yil} Model</span>
          <div className="car">{d.marka} <span>{d.model}</span></div>
          <div className="trim">{d.altbaslik}</div>
        </div>
        <div className="chips">
          {d.chips.map((c, i) => <span key={c} className={'chip' + (i === 0 ? ' hl' : '')}>{c}</span>)}
        </div>
      </section>

      <div className="ticks">
        {Array.from({ length: 40 }).map((_, i) => <i key={i} className={i % 5 === 0 ? 'big' : ''} />)}
      </div>

      <section className="specs">
        {specs.map((s, i) => {
          const cls = ['cell'];
          if (i % 4 !== 3) cls.push('br');
          if (i % 4 !== 0) cls.push('pl');
          if (i >= 4) cls.push('bt');
          return (
            <div key={i} className={cls.join(' ')}>
              <div className="lab">{s[0]}</div>
              <div className="val">{s[1]}</div>
            </div>
          );
        })}
      </section>

      <footer className="foot">
        <div className="price">
          <div className="p-lab">Fiyat</div>
          <div className="amount"><span>₺</span>{d.fiyat ? fmtTL(d.fiyat) : '—'}</div>
          <div className="p-note">Pazarlık payı vardır · Takas / kredi olur</div>
        </div>
        <div className="contact">
          <div className="c-lab">İletişim</div>
          <div className="phone">{d.tel}</div>
          <div className="addr">{d.galeri.ad} · {d.galeri.adres}</div>
        </div>
        <div className="qr-wrap">
          <div className="qr">{qr}</div>
          <div className="qr-cap">İlan Detayı</div>
        </div>
      </footer>
    </div>
  );
}

/* =========================================================
   REGISTRY
   ========================================================= */
export const TEMPLATES = {
  mavi:  { ad: 'Kurumsal Mavi',  ds: 'Fotoğraflı · iki sütun', sw: 'linear-gradient(135deg,#2F80D6,#0E2A4E)', Component: Mavi },
  altin: { ad: 'Lacivert Altın', ds: 'Spec-sheet · premium',   sw: 'linear-gradient(135deg,#C6902F,#14181F)', Component: Altin },
};

/* =========================================================
   SCOPED CSS  (tüm stiller .ilan-sheet altında; app'in Tailwind'ini etkilemez)
   ========================================================= */
export const ILAN_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800;900&family=Inter:wght@400;500;600;700&family=Spline+Sans+Mono:wght@500;600;700&display=swap');

.ilan-sheet{ font-family:'Inter',sans-serif; -webkit-font-smoothing:antialiased; }
.ilan-sheet *{ box-sizing:border-box; margin:0; padding:0; }
.ilan-sheet .mono{ font-family:'Spline Sans Mono',monospace; }

/* ===== MAVİ ===== */
.t-mavi{ width:297mm; height:210mm; background:#F5F8FC; display:flex; flex-direction:column; overflow:hidden; color:#0E2A4E; }
.t-mavi .head{ background:#0E2A4E; color:#fff; padding:9mm 13mm 8mm; display:flex; align-items:center; justify-content:space-between; position:relative; }
.t-mavi .head::after{ content:""; position:absolute; left:0; right:0; bottom:0; height:3px; background:linear-gradient(90deg,#2F80D6,#1E5FA8 45%,transparent); }
.t-mavi .brand{ display:flex; align-items:center; gap:14px; }
.t-mavi .mono-logo{ width:50px; height:50px; border-radius:12px; background:linear-gradient(135deg,#2F80D6,#1E5FA8); display:grid; place-items:center; font-family:'Archivo'; font-weight:900; font-size:23px; color:#fff; }
.t-mavi .b-name{ font-family:'Archivo'; font-weight:800; font-size:23px; letter-spacing:.02em; line-height:1; }
.t-mavi .b-sub{ font-size:10.5px; color:#9FB4CE; letter-spacing:.28em; text-transform:uppercase; margin-top:6px; }
.t-mavi .head-right{ display:flex; align-items:center; gap:16px; }
.t-mavi .stock{ text-align:right; line-height:1.2; }
.t-mavi .stock .k{ font-size:9.5px; letter-spacing:.24em; color:#7E93AE; text-transform:uppercase; }
.t-mavi .stock .v{ font-family:'Spline Sans Mono'; font-weight:600; font-size:15px; }
.t-mavi .tag{ font-family:'Archivo'; font-weight:800; font-size:14px; letter-spacing:.16em; background:#2F80D6; color:#fff; padding:9px 15px; border-radius:8px; text-transform:uppercase; }
.t-mavi .main{ flex:1; display:grid; grid-template-columns:1.15fr 1fr; min-height:0; }
.t-mavi .col-photo{ padding:8mm 6mm 7mm 13mm; display:flex; flex-direction:column; min-height:0; }
.t-mavi .photo{ flex:1; min-height:0; border-radius:14px; overflow:hidden; position:relative; background:#EAF1FA; }
.t-mavi .photo img{ width:100%; height:100%; object-fit:cover; display:block; }
.t-mavi .photo-empty{ width:100%; height:100%; display:grid; place-items:center; color:#89ABD1; font-size:14px; }
.t-mavi .year-badge{ position:absolute; top:12px; left:12px; font-family:'Spline Sans Mono'; font-weight:700; font-size:14px; color:#fff; background:#0E2A4E; border-radius:8px; padding:6px 13px; letter-spacing:.04em; }
.t-mavi .car-block{ margin-top:7mm; }
.t-mavi .car{ font-family:'Archivo'; font-weight:900; font-size:52px; line-height:.9; letter-spacing:-.02em; }
.t-mavi .car span{ color:#2F80D6; }
.t-mavi .trim{ font-size:15px; color:#5A6B80; font-weight:500; margin-top:9px; }
.t-mavi .chips{ display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
.t-mavi .chip{ font-size:12px; font-weight:600; border-radius:999px; padding:6px 14px; background:#fff; color:#1E5FA8; border:1px solid #DCE5EF; }
.t-mavi .chip.hl{ background:#1E5FA8; color:#fff; border-color:#1E5FA8; }
.t-mavi .col-specs{ background:#fff; border-left:1px solid #DCE5EF; padding:9mm 13mm 8mm 11mm; display:flex; flex-direction:column; }
.t-mavi .specs-title{ font-size:11px; font-weight:700; letter-spacing:.2em; color:#1E5FA8; text-transform:uppercase; margin-bottom:6mm; }
.t-mavi .grid{ display:grid; grid-template-columns:1fr 1fr; flex:1; }
.t-mavi .cell{ padding-bottom:5mm; }
.t-mavi .cell:nth-child(odd){ padding-right:8mm; border-right:1px solid #DCE5EF; }
.t-mavi .cell:nth-child(even){ padding-left:8mm; }
.t-mavi .cell:nth-child(n+3){ padding-top:5mm; border-top:1px solid #DCE5EF; }
.t-mavi .lab{ font-size:10px; font-weight:600; letter-spacing:.14em; color:#5A6B80; text-transform:uppercase; margin-bottom:7px; }
.t-mavi .val{ font-family:'Archivo'; font-weight:700; font-size:22px; color:#0E2A4E; line-height:1.05; }
.t-mavi .val small{ font-size:13px; color:#5A6B80; font-weight:600; font-family:'Inter'; }
.t-mavi .ok{ color:#159a54; }
.t-mavi .foot{ background:#0E2A4E; color:#fff; padding:7mm 13mm; display:grid; grid-template-columns:1.05fr 1fr auto; align-items:center; gap:22px; position:relative; }
.t-mavi .foot::before{ content:""; position:absolute; left:0; right:0; top:0; height:3px; background:linear-gradient(90deg,transparent,#1E5FA8 55%,#2F80D6); }
.t-mavi .p-lab,.t-mavi .c-lab{ font-size:10.5px; letter-spacing:.24em; color:#7E93AE; text-transform:uppercase; margin-bottom:6px; }
.t-mavi .amount{ font-family:'Spline Sans Mono'; font-weight:700; font-size:48px; line-height:.9; }
.t-mavi .amount span{ font-size:28px; color:#2F80D6; margin-right:4px; }
.t-mavi .p-note{ font-size:12px; color:#9FB4CE; margin-top:8px; }
.t-mavi .contact{ border-left:1px solid rgba(255,255,255,.14); padding-left:22px; }
.t-mavi .phone{ font-family:'Spline Sans Mono'; font-weight:700; font-size:28px; }
.t-mavi .addr{ font-size:12px; color:#9FB4CE; margin-top:7px; line-height:1.5; }
.t-mavi .qr-wrap{ display:flex; flex-direction:column; align-items:center; gap:6px; }
.t-mavi .qr{ width:90px; height:90px; border-radius:10px; background:#fff; padding:7px; }
.t-mavi .qr svg{ width:100%; height:100%; display:block; }
.t-mavi .qr-cap{ font-size:9px; letter-spacing:.14em; color:#7E93AE; text-transform:uppercase; }

/* ===== ALTIN ===== */
.t-altin{ width:297mm; height:210mm; background:#F7F7F4; display:flex; flex-direction:column; overflow:hidden; color:#14181F; }
.t-altin .head{ background:#14181F; color:#fff; padding:11mm 14mm 9mm; display:flex; align-items:center; justify-content:space-between; position:relative; }
.t-altin .head::after{ content:""; position:absolute; left:0; right:0; bottom:0; height:3px; background:linear-gradient(90deg,#C6902F,#E0B45A 40%,transparent); }
.t-altin .brand{ display:flex; align-items:center; gap:14px; }
.t-altin .mono-logo{ width:52px; height:52px; border-radius:12px; border:1.5px solid #C6902F; display:grid; place-items:center; font-family:'Archivo'; font-weight:900; font-size:24px; color:#E0B45A; }
.t-altin .b-name{ font-family:'Archivo'; font-weight:800; font-size:24px; letter-spacing:.02em; line-height:1; }
.t-altin .b-sub{ font-size:11px; color:#A9B0BA; letter-spacing:.28em; text-transform:uppercase; margin-top:6px; }
.t-altin .head-right{ display:flex; align-items:center; gap:18px; }
.t-altin .stock{ text-align:right; line-height:1.2; }
.t-altin .stock .k{ font-size:10px; letter-spacing:.24em; color:#8A929D; text-transform:uppercase; }
.t-altin .stock .v{ font-family:'Spline Sans Mono'; font-weight:600; font-size:15px; }
.t-altin .tag{ font-family:'Archivo'; font-weight:800; font-size:15px; letter-spacing:.16em; color:#14181F; background:#E0B45A; padding:9px 16px; border-radius:8px; text-transform:uppercase; }
.t-altin .hero{ padding:9mm 14mm 4mm; display:flex; align-items:flex-end; justify-content:space-between; gap:20px; }
.t-altin .year{ display:inline-block; font-family:'Spline Sans Mono'; font-weight:600; font-size:15px; color:#C6902F; border:1.5px solid #C6902F; border-radius:6px; padding:3px 12px; letter-spacing:.06em; margin-bottom:10px; }
.t-altin .car{ font-family:'Archivo'; font-weight:900; font-size:66px; line-height:.92; letter-spacing:-.02em; }
.t-altin .car span{ color:#C6902F; }
.t-altin .trim{ font-size:17px; color:#6C7480; font-weight:500; margin-top:10px; }
.t-altin .chips{ display:flex; flex-direction:column; align-items:flex-end; gap:8px; }
.t-altin .chip{ font-size:12.5px; font-weight:600; border-radius:999px; padding:7px 15px; white-space:nowrap; background:#fff; border:1px solid #E4E2DA; }
.t-altin .chip.hl{ background:#14181F; color:#fff; border-color:#14181F; }
.t-altin .ticks{ margin:8mm 14mm 0; height:14px; display:flex; align-items:flex-end; }
.t-altin .ticks i{ flex:1; height:6px; background:#E4E2DA; }
.t-altin .ticks i.big{ height:14px; background:#C6902F; }
.t-altin .specs{ padding:7mm 14mm 4mm; display:grid; grid-template-columns:repeat(4,1fr); flex:1; }
.t-altin .cell{ padding-bottom:5mm; }
.t-altin .cell.br{ border-right:1px solid #E4E2DA; padding-right:6mm; }
.t-altin .cell.pl{ padding-left:6mm; }
.t-altin .cell.bt{ border-top:1px solid #E4E2DA; padding-top:5mm; }
.t-altin .lab{ font-size:11px; font-weight:600; letter-spacing:.16em; color:#6C7480; text-transform:uppercase; margin-bottom:8px; }
.t-altin .val{ font-family:'Archivo'; font-weight:700; font-size:24px; color:#101826; line-height:1.05; }
.t-altin .val small{ font-size:14px; color:#6C7480; font-weight:600; font-family:'Inter'; }
.t-altin .ok{ color:#1f7a3d; }
.t-altin .foot{ background:#14181F; color:#fff; padding:8mm 14mm; display:grid; grid-template-columns:1.1fr 1fr auto; align-items:center; gap:22px; position:relative; }
.t-altin .foot::before{ content:""; position:absolute; left:0; right:0; top:0; height:3px; background:linear-gradient(90deg,transparent,#E0B45A 60%,#C6902F); }
.t-altin .p-lab,.t-altin .c-lab{ font-size:11px; letter-spacing:.24em; color:#8A929D; text-transform:uppercase; margin-bottom:6px; }
.t-altin .amount{ font-family:'Spline Sans Mono'; font-weight:700; font-size:52px; line-height:.9; color:#E0B45A; }
.t-altin .amount span{ font-size:30px; color:#fff; margin-right:4px; }
.t-altin .p-note{ font-size:12.5px; color:#B7BEC8; margin-top:9px; }
.t-altin .contact{ border-left:1px solid rgba(255,255,255,.14); padding-left:22px; }
.t-altin .phone{ font-family:'Spline Sans Mono'; font-weight:700; font-size:30px; }
.t-altin .addr{ font-size:12.5px; color:#A9B0BA; margin-top:8px; line-height:1.5; }
.t-altin .qr-wrap{ display:flex; flex-direction:column; align-items:center; gap:7px; }
.t-altin .qr{ width:96px; height:96px; border-radius:10px; background:#fff; padding:8px; }
.t-altin .qr svg{ width:100%; height:100%; display:block; }
.t-altin .qr-cap{ font-size:9.5px; letter-spacing:.14em; color:#8A929D; text-transform:uppercase; }
`;

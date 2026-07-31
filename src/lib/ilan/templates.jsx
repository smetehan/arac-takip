// src/lib/ilan/templates.jsx
// Tek düzen (fotoğraflı iki sütun) + çoklu renk teması.
// Boya & Değişen şeması (13 parça) + lejant dahil.
// Yeni tema eklemek: THEMES'e bir satır ekle. Yeni DÜZEN eklemek: yeni Component + TEMPLATES satırı.

export const fmtTL = (n) =>
  new Intl.NumberFormat('tr-TR').format(Number(String(n ?? '').replace(/[^\d]/g, '')) || 0);

/* ================= TEMALAR ================= */
export const THEMES = {
  mavi:  { ad: 'Kurumsal Mavi',  paper:'#F5F8FC', card:'#fff', dark:'#0E2A4E', acc:'#2F80D6', acc2:'#1E5FA8', ink:'#0E2A4E', mut:'#5A6B80', line:'#DCE5EF', tint:'#EAF1FA' },
  altin: { ad: 'Antrasit Altın', paper:'#F7F7F4', card:'#fff', dark:'#14181F', acc:'#C6902F', acc2:'#B0821F', ink:'#14181F', mut:'#6C7480', line:'#E7E4DC', tint:'#F0ECE2' },
  zumrut:{ ad: 'Zümrüt Yeşil',   paper:'#F2FAF6', card:'#fff', dark:'#0C2E22', acc:'#12A36B', acc2:'#0E7A50', ink:'#0C2E22', mut:'#4B6157', line:'#D6EBE0', tint:'#E4F5EC' },
  bordo: { ad: 'Bordo',          paper:'#FAF5F6', card:'#fff', dark:'#2A1418', acc:'#B0324B', acc2:'#8E2740', ink:'#2A1418', mut:'#6E5257', line:'#EBDCDF', tint:'#F6E9EC' },
};
const themeVars = (t) => ({
  '--paper': t.paper, '--card': t.card, '--dark': t.dark, '--acc': t.acc, '--acc2': t.acc2,
  '--ink': t.ink, '--mut': t.mut, '--line': t.line, '--tint': t.tint,
});

/* ================= BOYA & DEĞİŞEN ================= */
// Tepeden araç silueti — her parça bir path/rect (tıklanabilir + renklenebilir).
export const PANELS = [
  { id:'onTampon',    ad:'Ön Tampon',         d:'M48,58 L48,40 Q48,22 70,22 L170,22 Q192,22 192,40 L192,58 Z' },
  { id:'kaput',       ad:'Kaput',             d:'M82,60 L158,60 L166,150 L74,150 Z' },
  { id:'solOnCam',    ad:'Sol Ön Çamurluk',   d:'M50,60 L72,60 L72,150 L50,150 Q43,105 50,60 Z' },
  { id:'sagOnCam',    ad:'Sağ Ön Çamurluk',   d:'M168,60 L190,60 Q197,105 190,150 L168,150 Z' },
  { id:'tavan',       ad:'Tavan',             rect:{ x:74, y:186, w:92, h:114, rx:12 } },
  { id:'solOnKapi',   ad:'Sol Ön Kapı',       rect:{ x:48, y:188, w:26, h:54, rx:3 } },
  { id:'solArkaKapi', ad:'Sol Arka Kapı',     rect:{ x:48, y:244, w:26, h:54, rx:3 } },
  { id:'sagOnKapi',   ad:'Sağ Ön Kapı',       rect:{ x:166, y:188, w:26, h:54, rx:3 } },
  { id:'sagArkaKapi', ad:'Sağ Arka Kapı',     rect:{ x:166, y:244, w:26, h:54, rx:3 } },
  { id:'bagaj',       ad:'Bagaj Kapağı',      d:'M74,336 L166,336 L160,422 L80,422 Z' },
  { id:'solArkaCam',  ad:'Sol Arka Çamurluk', d:'M50,336 Q43,380 50,422 L72,422 L72,336 Z' },
  { id:'sagArkaCam',  ad:'Sağ Arka Çamurluk', d:'M168,336 L190,336 Q197,380 190,422 L168,422 Z' },
  { id:'arkaTampon',  ad:'Arka Tampon',       d:'M48,424 L192,424 L192,442 Q192,460 170,460 L70,460 Q48,460 48,442 Z' },
];
export const STATES = {
  orijinal: { ad:'Orijinal',     renk:'#D6DCE4' },
  lokal:    { ad:'Lokal Boyalı', renk:'#FBBF24' },
  boyali:   { ad:'Boyalı',       renk:'#F97316' },
  degisen:  { ad:'Değişen',      renk:'#EF4444' },
};
export const CYCLE = ['orijinal', 'lokal', 'boyali', 'degisen'];

// Araç şeması. boya = { panelId: 'boyali' | 'degisen' | ... }. onPanel verilirse tıklanabilir.
export function CarDiagram({ boya = {}, onPanel = null, style }) {
  const stroke = '#8A96A6';
  return (
    <svg viewBox="0 0 240 480" xmlns="http://www.w3.org/2000/svg" style={style}>
      {/* tekerlekler (dekor, arkada) */}
      <g fill="#2B3340">
        <rect x="34" y="86" width="13" height="46" rx="6" />
        <rect x="193" y="86" width="13" height="46" rx="6" />
        <rect x="34" y="344" width="13" height="46" rx="6" />
        <rect x="193" y="344" width="13" height="46" rx="6" />
      </g>

      {/* boyanabilir parçalar */}
      {PANELS.map((p) => {
        const st = boya[p.id] || 'orijinal';
        const common = {
          fill: STATES[st].renk, stroke, strokeWidth: 1.4, strokeLinejoin: 'round',
          onClick: onPanel ? () => onPanel(p.id) : undefined,
          style: onPanel ? { cursor: 'pointer' } : undefined,
        };
        return p.d
          ? <path key={p.id} d={p.d} {...common}>{onPanel ? <title>{p.ad}</title> : null}</path>
          : <rect key={p.id} x={p.rect.x} y={p.rect.y} width={p.rect.w} height={p.rect.h} rx={p.rect.rx} {...common}>{onPanel ? <title>{p.ad}</title> : null}</rect>;
      })}

      {/* camlar + aynalar (dekor, üstte) */}
      <path d="M74,152 L166,152 L158,185 L82,185 Z" fill="#C4D0DD" stroke={stroke} strokeWidth="1.1" />
      <path d="M82,301 L158,301 L166,334 L74,334 Z" fill="#C4D0DD" stroke={stroke} strokeWidth="1.1" />
      <rect x="40" y="176" width="10" height="13" rx="3" fill="#AEB6C2" />
      <rect x="190" y="176" width="10" height="13" rx="3" fill="#AEB6C2" />

      <text x="120" y="13" textAnchor="middle" fontSize="10" fontWeight="700" fill="#94A3B8" fontFamily="Inter" letterSpacing="1">ÖN</text>
    </svg>
  );
}

function boyaOzet(boya) {
  const grup = (k) => PANELS.filter((p) => boya[p.id] === k).map((p) => p.ad);
  const degisen = grup('degisen');
  const boyali = [...grup('boyali'), ...grup('lokal')];
  return { degisen, boyali };
}

/* ================= DÜZEN (tek, tema parametreli) ================= */
function Layout({ data: d, qr, theme }) {
  const t = THEMES[theme] || THEMES.mavi;
  const { degisen, boyali } = boyaOzet(d.boya || {});
  const cells = [
    ['Kilometre', <span className="mono" key="km">{fmtTL(d.km)} <small>km</small></span>],
    ['Yakıt', d.yakit || '—'],
    ['Vites', d.vites || '—'],
    ['Motor Gücü', <span className="mono" key="g">{d.guc || '—'}</span>],
    ['Kasa', d.kasa || '—'],
    ['Renk', d.renk || '—'],
  ];
  return (
    <div className="ilan-sheet" style={themeVars(t)}>
      <header className="head">
        <div className="brand">
          <div className="logo">{d.galeri.mono}</div>
          <div><div className="bname">{d.galeri.ad}</div><div className="bsub">{d.galeri.alt}</div></div>
        </div>
        <div className="hr">
          <div className="stk"><div className="k">Stok No</div><div className="v">A-{d.stok}</div></div>
          <div className="tag">Satılık</div>
        </div>
      </header>

      <div className="main">
        <div className="cph">
          <div className="photo">
            {d.foto ? <img src={d.foto} alt={`${d.marka} ${d.model}`} /> : <div className="photo-empty">Fotoğraf yok</div>}
            <div className="yb">{d.yil} Model</div>
          </div>
          <div className="cb">
            <div className="car">{d.marka} <span>{d.model}</span></div>
            <div className="trim">{d.altbaslik}</div>
            <div className="chips">
              {d.chips.map((c, i) => <span key={c} className={'chip' + (i === 0 ? ' hl' : '')}>{c}</span>)}
            </div>
          </div>
        </div>

        <div className="csp">
          <div className="st">Teknik Özellikler</div>
          <div className="grid">
            {cells.map((c, i) => (
              <div key={i} className="cell"><div className="lab">{c[0]}</div><div className="val">{c[1]}</div></div>
            ))}
          </div>

          <div className="boya">
            <div className="dg"><CarDiagram boya={d.boya || {}} /></div>
            <div className="info">
              <div className="bt">Boya & Değişen</div>
              <div className="lg">
                {Object.entries(STATES).map(([k, s]) => (
                  <div key={k} className="r"><span className="d" style={{ background: s.renk }} />{s.ad}</div>
                ))}
              </div>
              <div className="summ">
                <div><b>Değişen:</b> {degisen.length ? degisen.join(', ') : 'Yok'}</div>
                <div style={{ marginTop: 4 }}><b>Boyalı:</b> {boyali.length ? boyali.join(', ') : 'Yok'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="foot">
        <div>
          <div className="plab">Fiyat</div>
          <div className="amt"><span>₺</span>{d.fiyat ? fmtTL(d.fiyat) : '—'}</div>
          <div className="pnote">Pazarlık payı vardır · Takas / kredi olur</div>
        </div>
        <div className="contact">
          <div className="clab">İletişim</div>
          <div className="phone">{d.tel}</div>
          <div className="addr">{d.galeri.ad} · {d.galeri.adres}</div>
        </div>
        <div className="qrw"><div className="qr">{qr}</div><div className="qrc">İlan Detayı</div></div>
      </footer>
    </div>
  );
}

/* ================= REGISTRY (her tema bir şablon) ================= */
export const TEMPLATES = Object.fromEntries(
  Object.entries(THEMES).map(([id, t]) => [
    id,
    {
      ad: t.ad,
      ds: 'Fotoğraflı · boya şemalı',
      sw: `linear-gradient(135deg,${t.acc},${t.dark})`,
      Component: (props) => <Layout {...props} theme={id} />,
    },
  ])
);

/* ================= SCOPED CSS ================= */
export const ILAN_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800;900&family=Inter:wght@400;500;600;700&family=Spline+Sans+Mono:wght@500;600;700&display=swap');

.ilan-sheet{ font-family:'Inter',sans-serif; -webkit-font-smoothing:antialiased; width:297mm; height:210mm; display:flex; flex-direction:column; overflow:hidden; background:var(--paper); color:var(--ink); }
.ilan-sheet *{ box-sizing:border-box; margin:0; padding:0; }
.ilan-sheet .mono{ font-family:'Spline Sans Mono',monospace; }

.ilan-sheet .head{ background:var(--dark); color:#fff; padding:9mm 13mm 8mm; display:flex; align-items:center; justify-content:space-between; position:relative; }
.ilan-sheet .head::after{ content:""; position:absolute; left:0; right:0; bottom:0; height:3px; background:linear-gradient(90deg,var(--acc),var(--acc2) 45%,transparent); }
.ilan-sheet .brand{ display:flex; align-items:center; gap:14px; }
.ilan-sheet .logo{ width:50px; height:50px; border-radius:12px; background:linear-gradient(135deg,var(--acc),var(--acc2)); display:grid; place-items:center; font-family:'Archivo'; font-weight:900; font-size:23px; color:#fff; }
.ilan-sheet .bname{ font-family:'Archivo'; font-weight:800; font-size:23px; letter-spacing:.02em; line-height:1; }
.ilan-sheet .bsub{ font-size:10.5px; color:rgba(255,255,255,.6); letter-spacing:.28em; text-transform:uppercase; margin-top:6px; }
.ilan-sheet .hr{ display:flex; align-items:center; gap:16px; }
.ilan-sheet .stk{ text-align:right; line-height:1.2; }
.ilan-sheet .stk .k{ font-size:9.5px; letter-spacing:.24em; color:rgba(255,255,255,.5); text-transform:uppercase; }
.ilan-sheet .stk .v{ font-family:'Spline Sans Mono'; font-weight:600; font-size:15px; }
.ilan-sheet .tag{ font-family:'Archivo'; font-weight:800; font-size:14px; letter-spacing:.16em; background:var(--acc); color:#fff; padding:9px 15px; border-radius:8px; text-transform:uppercase; }

.ilan-sheet .main{ flex:1; display:grid; grid-template-columns:1.1fr 1fr; min-height:0; }
.ilan-sheet .cph{ padding:8mm 6mm 7mm 13mm; display:flex; flex-direction:column; min-height:0; }
.ilan-sheet .photo{ flex:1; min-height:0; border-radius:14px; overflow:hidden; position:relative; background:var(--tint); }
.ilan-sheet .photo img{ width:100%; height:100%; object-fit:cover; display:block; }
.ilan-sheet .photo-empty{ width:100%; height:100%; display:grid; place-items:center; color:var(--mut); font-size:14px; }
.ilan-sheet .yb{ position:absolute; top:12px; left:12px; font-family:'Spline Sans Mono'; font-weight:700; font-size:14px; color:#fff; background:var(--dark); border-radius:8px; padding:6px 13px; }
.ilan-sheet .cb{ margin-top:6mm; }
.ilan-sheet .car{ font-family:'Archivo'; font-weight:900; font-size:50px; line-height:.9; letter-spacing:-.02em; }
.ilan-sheet .car span{ color:var(--acc); }
.ilan-sheet .trim{ font-size:15px; color:var(--mut); font-weight:500; margin-top:8px; }
.ilan-sheet .chips{ display:flex; flex-wrap:wrap; gap:8px; margin-top:11px; }
.ilan-sheet .chip{ font-size:12px; font-weight:600; border-radius:999px; padding:6px 14px; background:#fff; color:var(--acc2); border:1px solid var(--line); }
.ilan-sheet .chip.hl{ background:var(--acc2); color:#fff; border-color:var(--acc2); }

.ilan-sheet .csp{ background:var(--card); border-left:1px solid var(--line); padding:8mm 12mm 7mm 11mm; display:flex; flex-direction:column; min-height:0; }
.ilan-sheet .st{ font-size:11px; font-weight:700; letter-spacing:.2em; color:var(--acc2); text-transform:uppercase; margin-bottom:4mm; }
.ilan-sheet .grid{ display:grid; grid-template-columns:1fr 1fr 1fr; }
.ilan-sheet .cell{ padding:0 0 4mm; }
.ilan-sheet .cell:not(:nth-child(3n)){ padding-right:5mm; }
.ilan-sheet .cell:nth-child(n+4){ border-top:1px solid var(--line); padding-top:4mm; }
.ilan-sheet .lab{ font-size:9.5px; font-weight:600; letter-spacing:.12em; color:var(--mut); text-transform:uppercase; margin-bottom:5px; }
.ilan-sheet .val{ font-family:'Archivo'; font-weight:700; font-size:19px; color:var(--ink); line-height:1.05; }
.ilan-sheet .val small{ font-size:12px; color:var(--mut); font-weight:600; font-family:'Inter'; }

.ilan-sheet .boya{ margin-top:5mm; border-top:1px solid var(--line); padding-top:5mm; display:flex; gap:6mm; flex:1; min-height:0; }
.ilan-sheet .boya .dg{ width:31mm; flex-shrink:0; }
.ilan-sheet .boya .dg svg{ width:100%; height:auto; }
.ilan-sheet .boya .info{ flex:1; min-width:0; }
.ilan-sheet .boya .bt{ font-size:11px; font-weight:700; letter-spacing:.16em; color:var(--acc2); text-transform:uppercase; margin-bottom:9px; }
.ilan-sheet .lg{ display:flex; flex-direction:column; gap:7px; margin-bottom:10px; }
.ilan-sheet .lg .r{ display:flex; align-items:center; gap:8px; font-size:12px; color:var(--ink); }
.ilan-sheet .lg .d{ width:14px; height:14px; border-radius:4px; }
.ilan-sheet .summ{ font-size:11.5px; color:var(--mut); line-height:1.6; }
.ilan-sheet .summ b{ color:var(--ink); font-weight:600; }

.ilan-sheet .foot{ background:var(--dark); color:#fff; padding:7mm 13mm; display:grid; grid-template-columns:1.05fr 1fr auto; align-items:center; gap:20px; position:relative; }
.ilan-sheet .foot::before{ content:""; position:absolute; left:0; right:0; top:0; height:3px; background:linear-gradient(90deg,transparent,var(--acc2) 55%,var(--acc)); }
.ilan-sheet .plab,.ilan-sheet .clab{ font-size:10.5px; letter-spacing:.24em; color:rgba(255,255,255,.5); text-transform:uppercase; margin-bottom:6px; }
.ilan-sheet .amt{ font-family:'Spline Sans Mono'; font-weight:700; font-size:46px; line-height:.9; }
.ilan-sheet .amt span{ font-size:27px; color:var(--acc); margin-right:4px; }
.ilan-sheet .pnote{ font-size:12px; color:rgba(255,255,255,.6); margin-top:7px; }
.ilan-sheet .contact{ border-left:1px solid rgba(255,255,255,.14); padding-left:20px; }
.ilan-sheet .phone{ font-family:'Spline Sans Mono'; font-weight:700; font-size:27px; }
.ilan-sheet .addr{ font-size:12px; color:rgba(255,255,255,.6); margin-top:7px; line-height:1.5; }
.ilan-sheet .qrw{ display:flex; flex-direction:column; align-items:center; gap:6px; }
.ilan-sheet .qr{ width:88px; height:88px; border-radius:10px; background:#fff; padding:7px; }
.ilan-sheet .qr svg{ width:100%; height:100%; display:block; }
.ilan-sheet .qrc{ font-size:9px; letter-spacing:.14em; color:rgba(255,255,255,.5); text-transform:uppercase; }
`;

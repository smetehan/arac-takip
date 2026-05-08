'use client';

import Link from 'next/link';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatTL, formatDate } from '@/lib/format';

const RENKLER = ['#1c1a16', '#d97706', '#7a7259', '#534d3d', '#a59e85', '#fbbf24', '#92400e'];

export default function RaporlarClient({ ozet, aylikData, markaData, aracKarListesi }) {
  function aydanLabel(ay) {
    const [yil, ayNum] = ay.split('-');
    const aylar = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    return `${aylar[parseInt(ayNum) - 1]} ${yil.slice(2)}`;
  }

  const ortakPie = ozet.ortaklar
    .filter((o) => o.sermaye > 0)
    .map((o) => ({ name: `${o.ad} ${o.soyad}`, value: o.sermaye }));

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-ink-500 mb-2">İşler nasıl gidiyor?</div>
        <h1 className="display text-5xl">Raporlar</h1>
      </div>

      {/* Üst özet */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Toplam Net Kâr" val={formatTL(ozet.toplamNetKar)} accent={ozet.toplamNetKar >= 0 ? 'good' : 'bad'} />
        <Stat label="Stok Değeri" val={formatTL(ozet.stoktakiDeger)} />
        <Stat label="Toplam Masraf" val={formatTL(ozet.toplamMasraf)} />
        <Stat label="Satılan Araç" val={ozet.satilanAracSayisi} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Aylık kâr trend */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="heading text-xl mb-1">Aylık Net Kâr</h3>
          <p className="text-sm text-ink-500 mb-5">Her ayın satışlarından elde edilen net kâr/zarar</p>
          {aylikData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-ink-400 text-sm">
              Henüz satış verisi yok
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={aylikData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e6dc" vertical={false} />
                <XAxis
                  dataKey="ay"
                  tickFormatter={aydanLabel}
                  stroke="#a59e85"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#a59e85"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => {
                    if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
                    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}K`;
                    return v;
                  }}
                />
                <Tooltip
                  formatter={(v) => formatTL(v)}
                  labelFormatter={aydanLabel}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e8e6dc', fontFamily: 'Outfit' }}
                />
                <Bar dataKey="kar" radius={[6, 6, 0, 0]}>
                  {aylikData.map((d, i) => (
                    <Cell key={i} fill={d.kar >= 0 ? '#1c1a16' : '#991b1b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Ortak sermaye dağılımı (pie) */}
        <div className="card p-6">
          <h3 className="heading text-xl mb-1">Sermaye Dağılımı</h3>
          <p className="text-sm text-ink-500 mb-5">Aktif ortakların havuzdaki payı</p>
          {ortakPie.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-ink-400 text-sm">
              Henüz sermaye yatırılmamış
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={ortakPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {ortakPie.map((e, i) => (
                    <Cell key={i} fill={RENKLER[i % RENKLER.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => formatTL(v)}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e8e6dc', fontFamily: 'Outfit' }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Marka bazlı kâr */}
        <div className="card p-6">
          <h3 className="heading text-xl mb-1">Marka Bazlı Kâr</h3>
          <p className="text-sm text-ink-500 mb-5">Hangi markalar daha çok kazandırdı?</p>
          {markaData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-ink-400 text-sm">
              Henüz veri yok
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={markaData} layout="vertical" margin={{ top: 10, right: 10, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e6dc" horizontal={false} />
                <XAxis type="number" stroke="#a59e85" fontSize={12} tickLine={false} axisLine={false}
                  tickFormatter={(v) => {
                    if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
                    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}K`;
                    return v;
                  }} />
                <YAxis type="category" dataKey="marka" stroke="#a59e85" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v) => formatTL(v)}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e8e6dc', fontFamily: 'Outfit' }}
                />
                <Bar dataKey="kar" radius={[0, 6, 6, 0]} fill="#d97706" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* En iyi/en kötü araçlar */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="heading text-xl mb-1">En Çok Kazandıran 5 Araç</h3>
          <p className="text-sm text-ink-500 mb-5">Net kâr sıralamasına göre</p>
          {aracKarListesi.slice(0, 5).length === 0 ? (
            <p className="text-sm text-ink-400">Henüz veri yok</p>
          ) : (
            <ul className="space-y-2">
              {aracKarListesi.slice(0, 5).map((a, i) => (
                <li key={a.id}>
                  <Link href={`/araclar/${a.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-ink-50 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-green-50 text-green-800 text-sm font-medium flex items-center justify-center mono">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{a.ad}</div>
                      <div className="text-xs text-ink-500">{a.yil} · {formatDate(a.satimTarihi)}</div>
                    </div>
                    <div className="mono text-sm font-medium text-green-700">+{formatTL(a.net)}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <h3 className="heading text-xl mb-1">En Çok Zarar Ettiren 5 Araç</h3>
          <p className="text-sm text-ink-500 mb-5">Net zarar sıralamasına göre</p>
          {aracKarListesi.filter(a => a.net < 0).length === 0 ? (
            <p className="text-sm text-ink-400">Zarar eden araç yok 🎉</p>
          ) : (
            <ul className="space-y-2">
              {aracKarListesi.slice(-5).reverse().filter(a => a.net < 0).map((a, i) => (
                <li key={a.id}>
                  <Link href={`/araclar/${a.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-ink-50 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-red-50 text-red-800 text-sm font-medium flex items-center justify-center mono">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{a.ad}</div>
                      <div className="text-xs text-ink-500">{a.yil} · {formatDate(a.satimTarihi)}</div>
                    </div>
                    <div className="mono text-sm font-medium text-red-700">{formatTL(a.net)}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, val, accent }) {
  const renk = accent === 'good' ? 'text-green-700' : accent === 'bad' ? 'text-red-700' : '';
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-widest text-ink-500 mb-2">{label}</div>
      <div className={`text-2xl mono font-medium ${renk}`}>{val}</div>
    </div>
  );
}

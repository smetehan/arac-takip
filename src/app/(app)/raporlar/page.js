import { prisma } from '@/lib/prisma';
import { getDashboardOzet } from '@/lib/sermaye';
import RaporlarClient from './RaporlarClient';

export const dynamic = 'force-dynamic';

export default async function RaporlarPage() {
  const ozet = await getDashboardOzet();

  // Tüm satılan araçlar (kâr ile birlikte)
  const satilan = await prisma.arac.findMany({
    where: { durum: 'SATILDI', satimTarihi: { not: null } },
    include: { masraflar: true },
    orderBy: { satimTarihi: 'asc' },
  });

  // Aylık kâr verisi
  const aylikMap = {};
  satilan.forEach((a) => {
    const ay = new Date(a.satimTarihi).toISOString().slice(0, 7);
    const masraf = a.masraflar.reduce((s, m) => s + m.tutar, 0);
    const net = (a.satimFiyati || 0) - a.alimFiyati - masraf;
    if (!aylikMap[ay]) aylikMap[ay] = { ay, kar: 0, sayi: 0 };
    aylikMap[ay].kar += net;
    aylikMap[ay].sayi += 1;
  });
  const aylikData = Object.values(aylikMap).sort((a, b) => a.ay.localeCompare(b.ay));

  // Marka bazlı dağılım
  const markaMap = {};
  satilan.forEach((a) => {
    const masraf = a.masraflar.reduce((s, m) => s + m.tutar, 0);
    const net = (a.satimFiyati || 0) - a.alimFiyati - masraf;
    if (!markaMap[a.marka]) markaMap[a.marka] = { marka: a.marka, sayi: 0, kar: 0 };
    markaMap[a.marka].sayi += 1;
    markaMap[a.marka].kar += net;
  });
  const markaData = Object.values(markaMap).sort((a, b) => b.kar - a.kar);

  // En iyi ve en kötü araçlar
  const aracKarListesi = satilan.map((a) => {
    const masraf = a.masraflar.reduce((s, m) => s + m.tutar, 0);
    const net = (a.satimFiyati || 0) - a.alimFiyati - masraf;
    return {
      id: a.id,
      ad: `${a.marka} ${a.model}`,
      yil: a.uretimYili,
      net,
      satimTarihi: a.satimTarihi,
    };
  }).sort((a, b) => b.net - a.net);

  return (
    <RaporlarClient
      ozet={JSON.parse(JSON.stringify(ozet))}
      aylikData={aylikData}
      markaData={markaData}
      aracKarListesi={JSON.parse(JSON.stringify(aracKarListesi))}
    />
  );
}

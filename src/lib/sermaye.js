import { prisma } from './prisma';

/**
 * Bir kullanıcının toplam sermayesini hesaplar.
 * Tüm sermaye hareketlerinin toplamı = mevcut sermaye
 */
export async function getKullaniciSermayesi(userId) {
  const result = await prisma.sermayeHareket.aggregate({
    where: { userId },
    _sum: { tutar: true },
  });
  return result._sum.tutar || 0;
}

/**
 * Tüm aktif ortakların mevcut sermayelerini ve oranlarını döner.
 * Format: [{ userId, ad, soyad, sermaye, oran }]
 */
export async function getOrtaklarinSermayeleri() {
  const ortaklar = await prisma.user.findMany({
    where: { aktif: true },
    select: { id: true, ad: true, soyad: true, email: true },
  });

  const sermayeler = await Promise.all(
    ortaklar.map(async (o) => {
      const sermaye = await getKullaniciSermayesi(o.id);
      return { ...o, userId: o.id, sermaye };
    })
  );

  // Sadece sermayesi > 0 olanları kâr dağıtımına dahil et
  const aktifSermayeliler = sermayeler.filter((s) => s.sermaye > 0);
  const toplamSermaye = aktifSermayeliler.reduce((acc, s) => acc + s.sermaye, 0);

  return sermayeler.map((s) => ({
    ...s,
    oran: toplamSermaye > 0 && s.sermaye > 0 ? s.sermaye / toplamSermaye : 0,
  }));
}

/**
 * Bir aracın net kârını hesaplar:
 * net_kar = satim_fiyati - alim_fiyati - toplam_masraflar
 *
 * Eğer satılmadıysa null döner (kâr henüz realize edilmemiş)
 */
export async function getAracNetKar(aracId) {
  const arac = await prisma.arac.findUnique({
    where: { id: aracId },
    include: { masraflar: true },
  });
  if (!arac) return null;

  const toplamMasraf = arac.masraflar.reduce((acc, m) => acc + m.tutar, 0);

  if (arac.durum !== 'SATILDI' || arac.satimFiyati == null) {
    return {
      alim: arac.alimFiyati,
      satim: null,
      masraf: toplamMasraf,
      net: null,
      realize: false,
    };
  }

  const net = arac.satimFiyati - arac.alimFiyati - toplamMasraf;
  return {
    alim: arac.alimFiyati,
    satim: arac.satimFiyati,
    masraf: toplamMasraf,
    net,
    realize: true,
  };
}

/**
 * Bir araç satıldığında kâr/zararı ortaklara,
 * SATIM SIRASINDAKİ sermaye oranlarına göre dağıtır.
 * Her ortak için bir SermayeHareket (KAR_PAYI veya ZARAR_PAYI) oluşturur.
 *
 * Snapshot olarak araç üzerine yazılır - sonradan değiştirilse bile orijinal dağıtım kaydı kalır.
 */
export async function aracSatildigindaKariDagit(aracId) {
  const arac = await prisma.arac.findUnique({
    where: { id: aracId },
    include: { masraflar: true, sermayeHareketleri: true },
  });
  if (!arac) throw new Error('Araç bulunamadı');
  if (arac.durum !== 'SATILDI' || arac.satimFiyati == null) {
    throw new Error('Araç henüz satılmadı');
  }

  // Daha önce dağıtılmış mı? (KAR_PAYI veya ZARAR_PAYI hareketi var mı?)
  const oncedenDagitilmisMi = arac.sermayeHareketleri.some(
    (h) => h.tip === 'KAR_PAYI' || h.tip === 'ZARAR_PAYI'
  );
  if (oncedenDagitilmisMi) {
    throw new Error('Bu aracın kârı zaten dağıtılmış');
  }

  const toplamMasraf = arac.masraflar.reduce((acc, m) => acc + m.tutar, 0);
  const netKar = arac.satimFiyati - arac.alimFiyati - toplamMasraf;

  // Mevcut sermaye dağılımını al (kâr dağıtımından ÖNCE)
  const ortaklar = await getOrtaklarinSermayeleri();
  const aktifOrtaklar = ortaklar.filter((o) => o.sermaye > 0);

  if (aktifOrtaklar.length === 0) {
    throw new Error('Sermayesi olan ortak bulunamadı, kâr dağıtılamaz');
  }

  const tip = netKar >= 0 ? 'KAR_PAYI' : 'ZARAR_PAYI';
  const aracEtiketi = `${arac.marka} ${arac.model} (${arac.uretimYili})`;

  // Snapshot kaydı (orijinal dağıtımı saklamak için)
  const snapshot = aktifOrtaklar.map((o) => ({
    userId: o.userId,
    ad: o.ad,
    soyad: o.soyad,
    sermaye: o.sermaye,
    oran: o.oran,
    pay: netKar * o.oran,
  }));

  // Transaction ile tüm hareketleri aynı anda kaydet
  await prisma.$transaction(async (tx) => {
    for (const o of aktifOrtaklar) {
      const pay = netKar * o.oran;
      await tx.sermayeHareket.create({
        data: {
          userId: o.userId,
          tutar: pay, // pozitif veya negatif
          tip,
          aciklama: `${aracEtiketi} - ${tip === 'KAR_PAYI' ? 'kâr payı' : 'zarar payı'} (oran: %${(o.oran * 100).toFixed(2)})`,
          aracId: arac.id,
          tarih: arac.satimTarihi || new Date(),
        },
      });
    }
    await tx.arac.update({
      where: { id: arac.id },
      data: { sermayeSnapshot: JSON.stringify(snapshot) },
    });
  });

  return { netKar, dagitim: snapshot };
}

/**
 * Genel istatistikler - dashboard için
 */
export async function getDashboardOzet() {
  const [araclar, masraflar, ortaklar] = await Promise.all([
    prisma.arac.findMany({ include: { masraflar: true } }),
    prisma.masraf.aggregate({ _sum: { tutar: true } }),
    getOrtaklarinSermayeleri(),
  ]);

  const stoktaki = araclar.filter((a) => a.durum === 'STOKTA');
  const satilan = araclar.filter((a) => a.durum === 'SATILDI');

  const stoktakiDeger = stoktaki.reduce(
    (acc, a) => acc + a.alimFiyati + a.masraflar.reduce((s, m) => s + m.tutar, 0),
    0
  );

  const toplamNetKar = satilan.reduce((acc, a) => {
    const masraf = a.masraflar.reduce((s, m) => s + m.tutar, 0);
    return acc + (a.satimFiyati || 0) - a.alimFiyati - masraf;
  }, 0);

  const toplamSermaye = ortaklar.reduce((acc, o) => acc + o.sermaye, 0);

  return {
    stoktakiAracSayisi: stoktaki.length,
    satilanAracSayisi: satilan.length,
    stoktakiDeger,
    toplamNetKar,
    toplamSermaye,
    ortakSayisi: ortaklar.filter((o) => o.sermaye > 0).length,
    ortaklar,
    toplamMasraf: masraflar._sum.tutar || 0,
  };
}

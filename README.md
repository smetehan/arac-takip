# Araç Takip Sistemi

Ortaklı araç alım-satım işlerini yönetmek için Next.js + Turso + Vercel Blob ile inşa edilmiş web uygulaması.

## 🚀 Hızlı Başlangıç (Lokal)

```bash
npm install
npx prisma db push
npm run dev
```

Tarayıcıda aç: http://localhost:3000

İlk kayıt olan kullanıcı **otomatik admin** olur.

---

## ☁️ Vercel + Turso ile Yayına Alma (Ücretsiz)

Toplam süre: ~15 dakika. Hepsi ücretsiz.

### Adım 1: Turso veritabanı oluştur (ücretsiz, 9 GB)

1. https://turso.tech adresine git, GitHub ile kayıt ol
2. **Create Database** → bir isim ver (örn: `arac-takip`)
3. Bölge olarak en yakın olanı seç (Frankfurt, Amsterdam, Londra)
4. Veritabanı oluştuktan sonra **"Connect"** sekmesinden:
   - **URL**: `libsql://...turso.io` ile başlayan adresi kopyala
   - **Token**: "Create Token" → 'Read & Write' → token'ı kopyala (uzun bir string)

### Adım 2: GitHub'a yükle

1. https://github.com → yeni repo oluştur (private olabilir)
2. Terminal'de proje klasöründe:
   ```bash
   git init
   git add .
   git commit -m "İlk yükleme"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADIN/arac-takip.git
   git push -u origin main
   ```

### Adım 3: Vercel'e bağla

1. https://vercel.com → GitHub ile kayıt ol
2. **Add New → Project** → GitHub reponu seç → **Import**
3. **Environment Variables** bölümüne şunları ekle:

   | Anahtar | Değer |
   |---|---|
   | `DATABASE_URL` | `libsql://...turso.io` (Turso'dan kopyaladığın URL) |
   | `DATABASE_AUTH_TOKEN` | Turso'dan kopyaladığın token |
   | `JWT_SECRET` | Uzun rastgele bir string (örn: `kjasd123-xyzabc-987-q4w5e6r7t8y9` gibi) |

4. **Deploy** butonuna bas, ~2 dakika bekle.

### Adım 4: Veritabanı tablolarını oluştur

İlk deploy sonrası tabloları Turso'da oluşturman gerekiyor. Lokal terminalde:

```bash
# .env dosyasına Turso bilgilerini ekle (geçici olarak)
DATABASE_URL="libsql://...turso.io"
DATABASE_AUTH_TOKEN="eyJ..."

# Tabloları yarat
npx prisma db push
```

İşlem bitince `.env`'i tekrar lokal değerlerine geri çevir.

> **Alternatif:** Turso CLI kurarsan (`brew install tursodatabase/tap/turso`) hiç `.env` değiştirmen gerekmez.

### Adım 5: Vercel Blob bağla (resim yükleme için)

1. Vercel projesi → **Storage** sekmesi → **Create Database** → **Blob**
2. Bir isim ver (örn: `arac-resimleri`) → **Create**
3. Otomatik olarak `BLOB_READ_WRITE_TOKEN` env variable'ı eklenir
4. **Deployments** → son deploy → **Redeploy** (yeni env variable'ı alması için)

### Adım 6: Bitti! 🎉

Vercel'in sana verdiği `https://arac-takip-xxx.vercel.app` URL'sinden uygulamana eriş.

İlk kayıt olan admin olur. Diğer ortaklarına bu link'i gönder, onlar da kayıt olsun.

---

## 📦 Ücretsiz Limitler

| Servis | Ücretsiz Limit | Senin Kullanımın |
|---|---|---|
| **Vercel Hobby** | 100 GB bandwidth/ay | Çok rahat yeter |
| **Turso** | 9 GB DB, 1 milyar okuma/ay, 25 milyon yazma/ay | Binlerce araç olsa yetmez |
| **Vercel Blob** | 1 GB depolama, 10 GB transfer/ay | 100-200 araç resmi rahat sığar |

Bu limitler için endişelenme — küçük bir aile/ortaklık işletmesi için pratikte sınırsız.

---

## 🛠 Teknik Detaylar

- **Framework:** Next.js 14 (App Router)
- **Veritabanı:** SQLite (lokal) / Turso/libSQL (production) — Prisma ORM ile
- **Auth:** JWT + httpOnly cookie + bcrypt
- **Resim:** Lokal dosya sistemi (lokal) / Vercel Blob (production)
- **PDF:** jsPDF
- **Grafikler:** Recharts
- **Stil:** Tailwind CSS

## 💡 Kâr Dağıtımı Mantığı

Bir araç satıldığında:
1. Net kâr hesaplanır: `satım_fiyatı - alım_fiyatı - toplam_masraflar`
2. **O anda** ortakların ne kadar sermayesi varsa o orana göre dağıtılır
3. Her ortağın hesabına `KAR_PAYI` veya `ZARAR_PAYI` hareketi düşer
4. Snapshot araca kaydedilir (sonradan oranlar değişse bile geçmiş bozulmaz)

**Örnek:**
- Ahmet 100K, Mehmet 300K sermayesi var (toplam 400K)
- Bir araç 30K net kâr etti
- Ahmet → +7.5K (%25), Mehmet → +22.5K (%75)
- Yeni sermayeler: Ahmet 107.5K, Mehmet 322.5K

## 🔄 Değişiklik Yayına Alma

Kodda bir değişiklik yaparsan:
```bash
git add .
git commit -m "açıklama"
git push
```
Vercel otomatik yeniden deploy eder.

## 🐛 Sorun Giderme

**"Prisma schema değişti, db push lazım":**
Schemayı değiştirdiysen lokalden Turso'ya `npx prisma db push` ile yansıt.

**Resim yüklenmiyor:**
Vercel'de Blob entegrasyonunu yaptıktan sonra **Redeploy** etmeyi unutma.

**Token süresi:**
JWT 30 günlük. Ortaklar 30 günde bir yeniden giriş yapar.

## 📁 Yapı

```
src/
├── app/
│   ├── (app)/                # Korumalı sayfalar
│   ├── api/                  # REST API
│   ├── login/
│   └── register/
├── components/
└── lib/
    ├── prisma.js             # Turso/SQLite client
    ├── auth.js               # JWT auth
    ├── sermaye.js            # Kâr dağıtımı
    └── format.js
```

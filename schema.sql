-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'ORTAK',
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SermayeHareket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "tutar" REAL NOT NULL,
    "tip" TEXT NOT NULL,
    "aciklama" TEXT,
    "aracId" INTEGER,
    "tarih" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SermayeHareket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SermayeHareket_aracId_fkey" FOREIGN KEY ("aracId") REFERENCES "Arac" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Arac" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "marka" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "uretimYili" INTEGER NOT NULL,
    "km" INTEGER NOT NULL,
    "renk" TEXT NOT NULL,
    "plaka" TEXT,
    "alimFiyati" REAL NOT NULL,
    "alimTarihi" DATETIME NOT NULL,
    "satimFiyati" REAL,
    "satimTarihi" DATETIME,
    "alici" TEXT,
    "notlar" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'STOKTA',
    "sermayeSnapshot" TEXT,
    "kaydedenId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Arac_kaydedenId_fkey" FOREIGN KEY ("kaydedenId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AracResim" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "aracId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "baslik" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AracResim_aracId_fkey" FOREIGN KEY ("aracId") REFERENCES "Arac" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Masraf" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "aracId" INTEGER NOT NULL,
    "baslik" TEXT NOT NULL,
    "tutar" REAL NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'DIGER',
    "aciklama" TEXT,
    "tarih" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Masraf_aracId_fkey" FOREIGN KEY ("aracId") REFERENCES "Arac" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Islem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "aracId" INTEGER NOT NULL,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT,
    "tarih" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Islem_aracId_fkey" FOREIGN KEY ("aracId") REFERENCES "Arac" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");


import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function GET(_req, { params }) {
  const auth = await requireUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = parseInt(params.id);
  const arac = await prisma.arac.findUnique({
    where: { id },
    include: {
      masraflar: { orderBy: { tarih: 'asc' } },
      sermayeHareketleri: {
        where: { tip: { in: ['KAR_PAYI', 'ZARAR_PAYI'] } },
        include: { user: { select: { ad: true, soyad: true } } },
      },
    },
  });

  if (!arac) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });

  const doc = new jsPDF();
  const formatTL = (v) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(v);
  const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR');

  // Başlık
  doc.setFontSize(22);
  doc.text('Arac Satis Belgesi', 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`${arac.marka} ${arac.model} - ${arac.uretimYili}`, 14, 30);

  // Çizgi
  doc.setDrawColor(200);
  doc.line(14, 35, 196, 35);

  // Araç bilgileri
  doc.setTextColor(0);
  doc.setFontSize(13);
  doc.text('Arac Bilgileri', 14, 45);

  autoTable(doc, {
    startY: 50,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    body: [
      ['Marka / Model', `${arac.marka} ${arac.model}`],
      ['Uretim Yili', String(arac.uretimYili)],
      ['Renk', arac.renk],
      ['KM', new Intl.NumberFormat('tr-TR').format(arac.km)],
      ['Plaka', arac.plaka || '-'],
      ['Alim Tarihi', formatDate(arac.alimTarihi)],
      ['Alim Fiyati', formatTL(arac.alimFiyati)],
      ['Satim Tarihi', arac.satimTarihi ? formatDate(arac.satimTarihi) : '-'],
      ['Satim Fiyati', arac.satimFiyati ? formatTL(arac.satimFiyati) : '-'],
      ['Alici', arac.alici || '-'],
    ],
  });

  // Masraflar
  if (arac.masraflar.length > 0) {
    const y = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.text('Masraflar', 14, y);

    autoTable(doc, {
      startY: y + 5,
      head: [['Tarih', 'Baslik', 'Kategori', 'Tutar']],
      body: arac.masraflar.map((m) => [
        formatDate(m.tarih),
        m.baslik,
        m.kategori,
        formatTL(m.tutar),
      ]),
      foot: [['', '', 'Toplam Masraf', formatTL(arac.masraflar.reduce((s, m) => s + m.tutar, 0))]],
      theme: 'striped',
      headStyles: { fillColor: [28, 26, 22] },
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
    });
  }

  // Net kâr
  if (arac.durum === 'SATILDI' && arac.satimFiyati) {
    const masrafToplam = arac.masraflar.reduce((s, m) => s + m.tutar, 0);
    const net = arac.satimFiyati - arac.alimFiyati - masrafToplam;
    const y = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(13);
    doc.text('Kar/Zarar Hesabi', 14, y);

    autoTable(doc, {
      startY: y + 5,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      body: [
        ['Satim Fiyati', formatTL(arac.satimFiyati)],
        ['Alim Fiyati', `- ${formatTL(arac.alimFiyati)}`],
        ['Toplam Masraf', `- ${formatTL(masrafToplam)}`],
        [{ content: 'NET ' + (net >= 0 ? 'KAR' : 'ZARAR'), styles: { fontStyle: 'bold' } },
         { content: formatTL(net), styles: { fontStyle: 'bold', textColor: net >= 0 ? [20, 100, 50] : [150, 30, 30] } }],
      ],
    });

    // Ortak dağılımı
    if (arac.sermayeHareketleri.length > 0) {
      const y2 = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(13);
      doc.text('Ortak Dagilim', 14, y2);

      autoTable(doc, {
        startY: y2 + 5,
        head: [['Ortak', 'Pay']],
        body: arac.sermayeHareketleri.map((h) => [
          `${h.user.ad} ${h.user.soyad}`,
          formatTL(h.tutar),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [28, 26, 22] },
      });
    }
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Olusturulma: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}`,
      14,
      doc.internal.pageSize.height - 8
    );
    doc.text(`Sayfa ${i} / ${pageCount}`, 196, doc.internal.pageSize.height - 8, { align: 'right' });
  }

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="arac-${arac.id}-${arac.marka}-${arac.model}.pdf"`,
    },
  });
}

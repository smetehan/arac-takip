// src/app/araclar/[id]/ilan/page.jsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import IlanOlusturucu from '@/lib/ilan/IlanOlusturucu';

export const dynamic = 'force-dynamic';

export default async function IlanPage({ params }) {
  const { id } = await params; // Next 15: params bir Promise

  const arac = await prisma.arac.findUnique({
    where: { id: Number(id) },
    include: { resimler: { orderBy: { id: 'asc' } } },
  });

  if (!arac) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  return (
    <div style={{ padding: 24 }}>
      <IlanOlusturucu arac={arac} siteUrl={siteUrl} />
    </div>
  );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getAracNetKar } from '@/lib/sermaye';
import AracDetayClient from './AracDetayClient';

export const dynamic = 'force-dynamic';

export default async function AracDetayPage({ params }) {
  const user = await getCurrentUser();
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const arac = await prisma.arac.findUnique({
    where: { id },
    include: {
      resimler: { orderBy: { createdAt: 'asc' } },
      masraflar: { orderBy: { tarih: 'desc' } },
      islemler: { orderBy: { tarih: 'desc' } },
      sermayeHareketleri: {
        where: { tip: { in: ['KAR_PAYI', 'ZARAR_PAYI'] } },
        include: { user: { select: { ad: true, soyad: true } } },
      },
    },
  });
  if (!arac) notFound();

  const kar = await getAracNetKar(id);

  return <AracDetayClient arac={JSON.parse(JSON.stringify(arac))} kar={kar} user={user} />;
}

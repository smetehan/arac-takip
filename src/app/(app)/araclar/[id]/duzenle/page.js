import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import DuzenleClient from './DuzenleClient';

export const dynamic = 'force-dynamic';

export default async function AracDuzenlePage({ params }) {
  const user = await getCurrentUser();
  if (user.rol !== 'ADMIN') redirect('/araclar');

  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const arac = await prisma.arac.findUnique({ where: { id } });
  if (!arac) notFound();

  return <DuzenleClient arac={JSON.parse(JSON.stringify(arac))} />;
}

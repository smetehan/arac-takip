import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { getOrtaklarinSermayeleri } from '@/lib/sermaye';

export async function GET() {
  const auth = await requireUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const ortaklar = await getOrtaklarinSermayeleri();
  return NextResponse.json({ ortaklar });
}

import { NextResponse } from 'next/server';
import { getCurrentUser, clearAuthCookie } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

export async function DELETE() {
  await clearAuthCookie();
  return NextResponse.json({ ok: true });
}

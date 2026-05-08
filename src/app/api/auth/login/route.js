import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'E-posta ve şifre gerekli' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.aktif) {
      return NextResponse.json({ error: 'Geçersiz e-posta veya şifre' }, { status: 401 });
    }
    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: 'Geçersiz e-posta veya şifre' }, { status: 401 });
    }
    const token = signToken({ userId: user.id, rol: user.rol });
    await setAuthCookie(token);
    return NextResponse.json({
      user: { id: user.id, email: user.email, ad: user.ad, soyad: user.soyad, rol: user.rol },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

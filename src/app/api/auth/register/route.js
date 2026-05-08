import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, password, ad, soyad } = await req.json();
    if (!email || !password || !ad || !soyad) {
      return NextResponse.json({ error: 'Tüm alanları doldurun' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Şifre en az 6 karakter olmalı' }, { status: 400 });
    }

    const mevcut = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (mevcut) {
      return NextResponse.json({ error: 'Bu e-posta zaten kayıtlı' }, { status: 400 });
    }

    // İlk kullanıcı otomatik ADMIN olur
    const kullaniciSayisi = await prisma.user.count();
    const rol = kullaniciSayisi === 0 ? 'ADMIN' : 'ORTAK';

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), password: hashed, ad, soyad, rol },
    });

    const token = signToken({ userId: user.id, rol: user.rol });
    await setAuthCookie(token);

    return NextResponse.json({
      user: { id: user.id, email: user.email, ad: user.ad, soyad: user.soyad, rol: user.rol },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

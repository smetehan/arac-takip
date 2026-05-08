import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const SECRET = process.env.JWT_SECRET || 'gizli-anahtar-degistir';
const COOKIE_NAME = 'arac_takip_token';

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export async function setAuthCookie(token) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
}

export async function clearAuthCookie() {
  cookies().delete(COOKIE_NAME);
}

// Mevcut kullanıcıyı (server component / route içinde) döner
export async function getCurrentUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded?.userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, ad: true, soyad: true, rol: true, aktif: true },
  });
  if (!user || !user.aktif) return null;
  return user;
}

// API route'ları için: yetkisizse 401 dön
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Yetkisiz erişim', status: 401 };
  }
  return { user };
}

export async function requireAdmin() {
  const res = await requireUser();
  if (res.error) return res;
  if (res.user.rol !== 'ADMIN') {
    return { error: 'Bu işlem için admin yetkisi gerekli', status: 403 };
  }
  return res;
}

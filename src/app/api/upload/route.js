import { NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// Vercel Blob token'ı varsa Blob, yoksa lokal dosya sistemi kullanılır.
const BLOB_AKTIF = !!process.env.BLOB_READ_WRITE_TOKEN;

export async function POST(req) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const aracId = parseInt(formData.get('aracId'));
    const baslik = formData.get('baslik') || null;

    if (!file || !aracId) {
      return NextResponse.json({ error: 'Dosya ve aracId gerekli' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Sadece resim dosyaları' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Dosya çok büyük (max 10MB)' }, { status: 400 });
    }

    const ext = path.extname(file.name) || '.jpg';
    const filename = `arac-${aracId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    let url;

    if (BLOB_AKTIF) {
      // Vercel Blob'a yükle
      const blob = await put(`uploads/${filename}`, file, {
        access: 'public',
        addRandomSuffix: false,
      });
      url = blob.url;
    } else {
      // Lokal dosya sistemine yükle (geliştirme için)
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      url = `/uploads/${filename}`;
    }

    const resim = await prisma.aracResim.create({
      data: { aracId, url, baslik },
    });

    return NextResponse.json({ resim });
  } catch (e) {
    return NextResponse.json({ error: 'Yüklenemedi: ' + e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const url = new URL(req.url);
  const resimId = parseInt(url.searchParams.get('resimId'));
  if (!resimId) return NextResponse.json({ error: 'resimId gerekli' }, { status: 400 });

  try {
    const resim = await prisma.aracResim.findUnique({ where: { id: resimId } });
    if (!resim) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });

    // Storage'dan da sil
    if (BLOB_AKTIF && resim.url.startsWith('http')) {
      try { await del(resim.url); } catch {}
    } else if (resim.url.startsWith('/uploads/')) {
      const filepath = path.join(process.cwd(), 'public', resim.url);
      try { await unlink(filepath); } catch {}
    }

    await prisma.aracResim.delete({ where: { id: resimId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Silinemedi: ' + e.message }, { status: 500 });
  }
}

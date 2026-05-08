'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ ad: '', soyad: '', email: '', password: '' });
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  async function gonder(e) {
    e.preventDefault();
    setHata('');
    setYukleniyor(true);
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) {
        setHata(data.error || 'Kayıt başarısız');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setHata('Bağlantı hatası');
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 fade-up">
          <div className="inline-block mb-4 px-3 py-1 border border-ink-100 rounded-full text-xs uppercase tracking-widest text-ink-500">
            Yeni Hesap
          </div>
          <h1 className="display text-5xl mb-3">Hadi<br/>başlayalım</h1>
          <p className="text-ink-500 text-sm">İlk kayıt olan kullanıcı admin olur</p>
        </div>

        <form onSubmit={gonder} className="card p-8 fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="label">Ad</label>
              <input className="input" value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} required />
            </div>
            <div>
              <label className="label">Soyad</label>
              <input className="input" value={form.soyad} onChange={(e) => setForm({ ...form, soyad: e.target.value })} required />
            </div>
          </div>
          <div className="mb-5">
            <label className="label">E-posta</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="mb-6">
            <label className="label">Şifre (en az 6 karakter)</label>
            <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>

          {hata && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 text-red-800 text-sm">{hata}</div>
          )}

          <button type="submit" className="btn btn-primary w-full justify-center" disabled={yukleniyor}>
            {yukleniyor ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>

          <div className="mt-6 text-center text-sm text-ink-500">
            Zaten hesabın var mı?{' '}
            <Link href="/login" className="text-ink underline underline-offset-4">
              Giriş yap
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

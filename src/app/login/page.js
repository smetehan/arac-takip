'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  async function gonder(e) {
    e.preventDefault();
    setHata('');
    setYukleniyor(true);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) {
        setHata(data.error || 'Giriş başarısız');
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 fade-up">
          <div className="inline-block mb-4 px-3 py-1 border border-ink-100 rounded-full text-xs uppercase tracking-widest text-ink-500">
            Araç Takip Sistemi
          </div>
          <h1 className="display text-5xl mb-3">Tekrar hoş<br/>geldiniz</h1>
          <p className="text-ink-500">Hesabınıza giriş yapın</p>
        </div>

        <form onSubmit={gonder} className="card p-8 fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="mb-5">
            <label className="label">E-posta</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="mb-6">
            <label className="label">Şifre</label>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {hata && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 text-red-800 text-sm">{hata}</div>
          )}

          <button type="submit" className="btn btn-primary w-full justify-center" disabled={yukleniyor}>
            {yukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>

          <div className="mt-6 text-center text-sm text-ink-500">
            Hesabın yok mu?{' '}
            <Link href="/register" className="text-ink underline underline-offset-4">
              Kayıt ol
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

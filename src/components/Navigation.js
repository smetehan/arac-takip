'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const linkler = [
  { href: '/dashboard', label: 'Özet' },
  { href: '/araclar', label: 'Araçlar' },
  { href: '/ortaklar', label: 'Ortaklar' },
  { href: '/raporlar', label: 'Raporlar' },
];

export default function Navigation({ user }) {
  const pathname = usePathname();
  const router = useRouter();

  async function cikis() {
    await fetch('/api/auth/me', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[rgba(246,245,241,0.85)] border-b border-ink-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-ink-900 flex items-center justify-center">
            <span className="text-bg font-display text-lg leading-none">A</span>
          </div>
          <span className="heading text-lg">Araç Takip</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {linkler.map((l) => {
            const aktif = pathname === l.href || pathname.startsWith(l.href + '/');
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  aktif
                    ? 'bg-ink-900 text-bg'
                    : 'text-ink-600 hover:bg-ink-100'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-medium">{user.ad} {user.soyad}</div>
            <div className="text-xs text-ink-500">
              {user.rol === 'ADMIN' ? 'Yönetici' : 'Ortak'}
            </div>
          </div>
          <button onClick={cikis} className="btn btn-ghost text-xs">Çıkış</button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden flex overflow-x-auto px-4 pb-3 gap-1">
        {linkler.map((l) => {
          const aktif = pathname === l.href || pathname.startsWith(l.href + '/');
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
                aktif ? 'bg-ink-900 text-bg' : 'text-ink-600 bg-ink-100'
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Navigation from '@/components/Navigation';

export default async function AppLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen">
      <Navigation user={user} />
      <main className="max-w-6xl mx-auto px-6 py-8 fade-up">{children}</main>
    </div>
  );
}

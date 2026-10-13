'use client';
import Link from 'next/link';
import { usePreferences } from '@/components/providers/preferences';
export default function NotFound() {
  const { t, href } = usePreferences();
  return (
    <main id="main" className="message-page">
      <span className="mono muted">404</span>
      <h1>{t('notFoundTitle')}</h1>
      <Link href={href('/')} className="text-link">
        {t('backHome')}
      </Link>
    </main>
  );
}

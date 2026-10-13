'use client';
import { usePreferences } from '@/components/providers/preferences';
export default function ErrorPage({ reset }: { reset: () => void }) {
  const { t } = usePreferences();
  return (
    <main id="main" className="message-page">
      <h1>{t('errorTitle')}</h1>
      <button className="primary-button" onClick={reset}>
        {t('retry')}
      </button>
    </main>
  );
}

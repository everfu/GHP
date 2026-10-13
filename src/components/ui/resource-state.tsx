'use client';

import { RotateCcw, AlertCircle } from 'lucide-react';
import type { ApiError } from '@/types/github';
import { usePreferences } from '../providers/preferences';

export function ErrorNotice({
  error,
  retry,
  title,
}: {
  error: ApiError;
  retry: () => void;
  title?: string;
}) {
  const { t, date } = usePreferences();
  return (
    <div className="error-notice" role="alert">
      <AlertCircle size={18} aria-hidden="true" />
      <div>
        {title ? <p className="error-title">{title}</p> : null}
        <p>{t(error.code)}</p>
        {error.retryAt ? (
          <p className="note">
            {t('retryAfter')} {date(error.retryAt, true)}
          </p>
        ) : null}
      </div>
      <button type="button" className="secondary-button" onClick={retry}>
        <RotateCcw size={14} aria-hidden="true" />
        {t('retry')}
      </button>
    </div>
  );
}

export function LoadingBlock({ profile = false }: { profile?: boolean }) {
  const { t } = usePreferences();
  return (
    <div
      className={`loading-block ${profile ? 'profile-skeleton' : ''}`}
      role="status"
      aria-label={t(profile ? 'profileLoading' : 'loading')}
    >
      {profile ? <div className="skeleton skeleton-avatar" /> : null}
      <div className="skeleton-lines">
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
      <span className="sr-only">{t(profile ? 'profileLoading' : 'loading')}</span>
    </div>
  );
}

export function FetchedAt({ value }: { value: string }) {
  const { t, date } = usePreferences();
  return (
    <p className="fetched-at">
      {t('fetchedAt')} <time dateTime={value}>{date(value, true)}</time>
    </p>
  );
}

'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import {
  clearHistory,
  historySnapshot,
  parseHistory,
  subscribeHistory,
} from '@/lib/browser/history';
import { SearchForm } from './search-form';
import { usePreferences } from '../providers/preferences';
import { GithubIcon } from '../ui/github-icon';
import { ReferenceIcon } from '../ui/reference-icon';
import { ReferenceReveal } from '../ui/reference-motion';

export function Home() {
  const { t, href } = usePreferences();
  const history = parseHistory(useSyncExternalStore(subscribeHistory, historySnapshot, () => '[]'));
  return (
    <main id="main" className="home-main">
      <h1 className="sr-only">{t('headline')}</h1>
      <SearchForm />
      <ReferenceReveal kind="history">
        {history.length > 0 ? (
          <section className="history-section" aria-labelledby="history-title">
            <div className="history-heading">
              <span aria-hidden="true" />
              <h2 id="history-title">{t('history')}</h2>
              <span aria-hidden="true" />
              <button className="text-button" type="button" onClick={clearHistory}>
                {t('clearHistory')}
              </button>
            </div>
            <div className="history-list">
              {history.map((username) => (
                <Link key={username} href={href(`/u/${username}`)}>
                  <span className="history-icon">
                    <GithubIcon size={14} />
                  </span>
                  <span className="history-user">{username}</span>
                  <span className="type-badge">GITHUB</span>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className="history-empty" aria-labelledby="empty-history-title">
            <ReferenceIcon name="history" size={48} />
            <h2 id="empty-history-title">{t('emptyHistory')}</h2>
            <p>{t('emptyHistoryDescription')}</p>
          </section>
        )}
      </ReferenceReveal>
    </main>
  );
}

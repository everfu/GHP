'use client';

import { useState } from 'react';
import type { PublicEvent } from '@/types/github';
import { dictionary, type TranslationKey } from '@/lib/i18n/dictionary';
import { safeWebsite } from '@/lib/username';
import { usePreferences } from '../providers/preferences';

function eventUrl(event: PublicEvent) {
  const raw =
    event.payload.pull_request?.html_url ||
    event.payload.issue?.html_url ||
    event.payload.release?.html_url;
  const url = safeWebsite(raw);
  if (url && new URL(url).hostname === 'github.com') return url;
  return `https://github.com/${event.repo.name.split('/').map(encodeURIComponent).join('/')}`;
}

export function Activity({ events }: { events: PublicEvent[] }) {
  const { t, date, locale, number } = usePreferences();
  const [limit, setLimit] = useState(10);
  const copy = dictionary(locale);
  return (
    <>
      <div className="section-heading">
        <h2 id="activity-title">{t('activity')}</h2>
        <span className="section-count mono">{number(events.length)}</span>
      </div>
      {events.length ? (
        <ol className="activity-list experience-timeline" role="list">
          {events.slice(0, limit).map((event) => {
            const label = event.type in copy ? t(event.type as TranslationKey) : t('otherEvent');
            return (
              <li key={event.id} className="activity-row timeline-entry">
                <span className="timeline-node" aria-hidden="true" />
                <time className="activity-date timeline-date" dateTime={event.created_at}>
                  {date(event.created_at)}
                </time>
                <p className="timeline-subtitle">
                  {label}{' '}
                  <a
                    className="text-link"
                    href={eventUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {event.repo.name}
                  </a>
                </p>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="empty-state">{t('noEvents')}</p>
      )}
      {events.length > 10 ? (
        <button
          type="button"
          className="text-button activity-more"
          onClick={() => setLimit(limit === 10 ? 30 : 10)}
        >
          {t(limit === 10 ? 'showMore' : 'showLess')}
        </button>
      ) : null}
      <p className="note activity-scope">{t('activityScope')}</p>
    </>
  );
}

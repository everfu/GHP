'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Building2, CalendarDays, Check, Copy, Link2, MapPin } from 'lucide-react';
import type { GitHubUser } from '@/types/github';
import { safeWebsite } from '@/lib/username';
import { usePreferences } from '../providers/preferences';

export function Profile({ user }: { user: GitHubUser }) {
  const { t, number, date, href } = usePreferences();
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [avatarFailed, setAvatarFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${href(`/u/${user.login.toLowerCase()}`)}`,
      );
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopyState('idle'), 3000);
  }
  const website = safeWebsite(user.blog);
  return (
    <section className="profile" aria-labelledby="profile-title">
      <div className="avatar">
        {avatarFailed ? (
          <span>{user.login[0].toUpperCase()}</span>
        ) : (
          // GitHub avatars are already optimized; a plain image keeps arbitrary public avatars compatible.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar_url}
            alt={user.login}
            width={44}
            height={44}
            onError={() => setAvatarFailed(true)}
          />
        )}
      </div>
      <div className="profile-body">
        <div className="profile-top">
          <div>
            <span className="type-badge">GITHUB</span>
            <h1 id="profile-title">{user.name || user.login}</h1>
            <p className="username mono">@{user.login}</p>
          </div>
          <div className="profile-actions">
            <a className="text-link" href={user.html_url} target="_blank" rel="noopener noreferrer">
              {t('viewGitHub')}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
            <button
              type="button"
              className="icon-button"
              onClick={copy}
              aria-label={t(copyState === 'copied' ? 'copied' : 'copyLink')}
            >
              {copyState === 'copied' ? (
                <Check size={15} aria-hidden="true" />
              ) : (
                <Copy size={15} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        {user.bio ? <p className="profile-bio">{user.bio}</p> : null}
        <ul className="profile-meta">
          {user.location ? (
            <li>
              <MapPin size={14} aria-label={t('location')} />
              {user.location}
            </li>
          ) : null}
          {user.company ? (
            <li>
              <Building2 size={14} aria-label={t('company')} />
              {user.company}
            </li>
          ) : null}
          {website ? (
            <li>
              <Link2 size={14} aria-hidden="true" />
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t('website')}: ${user.blog}`}
              >
                {user.blog?.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            </li>
          ) : null}
          <li>
            <CalendarDays size={14} aria-hidden="true" />
            {t('joined')} <time dateTime={user.created_at}>{date(user.created_at)}</time>
          </li>
        </ul>
        <p className="social-counts">
          <span>
            <b className="mono">{number(user.followers)}</b> {t('followers')}
          </span>
          <span className="dot-separator">·</span>
          <span>
            <b className="mono">{number(user.following)}</b> {t('following')}
          </span>
        </p>
        <p className="copy-status" role="status">
          {copyState === 'copied' ? t('copied') : copyState === 'failed' ? t('copyFailed') : ''}
        </p>
      </div>
    </section>
  );
}

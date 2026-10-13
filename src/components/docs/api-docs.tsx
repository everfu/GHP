'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { ChevronLeft } from 'lucide-react';
import { CodeBlock } from '../ui/code-block';
import { usePreferences } from '../providers/preferences';
import { docsDictionary } from '@/lib/i18n/docs';

const subscribeOrigin = () => () => {};
const originSnapshot = () => window.location.origin;
const serverOrigin = () => 'https://your-domain.com';
const exampleTime = '2026-10-13T06:00:00Z';
const profile = {
  login: 'everfu',
  id: 74389842,
  name: '伍拾柒',
  avatar_url: 'https://avatars.githubusercontent.com/u/74389842?v=4',
  html_url: 'https://github.com/everfu',
  bio: '山不转路，我自转山。',
  company: 'undefined',
  location: 'China',
  blog: 'www.efu.me',
  created_at: '2020-11-13T02:00:22Z',
  followers: 48,
  following: 23,
  public_repos: 38,
  type: 'User',
};
const endpoints = [
  { suffix: '', key: 'profile', data: profile },
  {
    suffix: '/repos',
    key: 'repos',
    data: [
      {
        id: 783145918,
        name: 'static',
        full_name: 'everfu/static',
        html_url: 'https://github.com/everfu/static',
        description: 'Host for static files',
        language: 'TypeScript',
        stargazers_count: 1,
        forks_count: 0,
        fork: false,
        archived: false,
        pushed_at: '2026-10-13T04:41:57Z',
      },
    ],
  },
  {
    suffix: '/events',
    key: 'events',
    data: [
      {
        id: '16825798396',
        type: 'WatchEvent',
        created_at: '2026-10-09T14:26:24Z',
        payload: {
          action: 'started',
        },
        repo: {
          name: 'mui/mui-x',
        },
      },
    ],
  },
] as const;

const errors = [
  ['400', 'INVALID_INPUT'],
  ['404', 'NOT_FOUND'],
  ['429', 'RATE_LIMIT'],
  ['504', 'TIMEOUT'],
  ['502 / 503', 'UNAVAILABLE'],
  ['503', 'CONFIGURATION'],
];

export function ApiDocs() {
  const { locale, t, href } = usePreferences();
  const c = docsDictionary(locale);
  const origin = useSyncExternalStore(subscribeOrigin, originSnapshot, serverOrigin);
  return (
    <main id="main" className="docs-main">
      <div className="docs-heading">
        <Link href={href('/')} className="icon-button" aria-label={t('backHome')}>
          <ChevronLeft size={16} aria-hidden="true" />
        </Link>
        <div>
          <h1>{c.title}</h1>
          <p>v1.0</p>
        </div>
      </div>
      <p className="docs-intro">{c.intro}</p>
      {endpoints.map((endpoint) => {
        const path = `/api/users/[username]${endpoint.suffix}`;
        const requestLabel = `${path} · ${c.request}`;
        return (
          <section
            key={endpoint.key}
            className="panel endpoint-panel"
            aria-labelledby={`endpoint-${endpoint.key}`}
          >
            <h2 id={`endpoint-${endpoint.key}`}>
              <span className="method-badge">GET</span>
              <code>{path}</code>
            </h2>
            <p className="endpoint-description">{c[endpoint.key]}</p>
            <h3>{c.parameters}</h3>
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label={`${path} · ${c.parameters}`}
            >
              <table>
                <thead>
                  <tr>
                    <th>{c.parameter}</th>
                    <th>{c.type}</th>
                    <th>{c.required}</th>
                    <th>{c.description}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>username</code>
                    </td>
                    <td>string</td>
                    <td>
                      <span className="required-badge">{c.required}</span>
                    </td>
                    <td>{c.username}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3>{c.request}</h3>
            <CodeBlock
              label={requestLabel}
              code={`curl "${origin}/api/users/everfu${endpoint.suffix}"`}
            />
            <h3>{c.response}</h3>
            <CodeBlock
              label={`${path} · ${c.response}`}
              code={JSON.stringify(
                { data: endpoint.data, fetchedAt: exampleTime, complete: true },
                null,
                2,
              )}
            />
          </section>
        );
      })}
      <section className="panel endpoint-panel" aria-labelledby="response-fields">
        <h2 id="response-fields">{c.envelopeTitle}</h2>
        <p className="endpoint-description">{c.envelope}</p>
        <h3>{c.errors}</h3>
        <div className="table-scroll" tabIndex={0} role="region" aria-label={c.errors}>
          <table>
            <thead>
              <tr>
                <th>{c.status}</th>
                <th>{c.code}</th>
                <th>{c.meaning}</th>
              </tr>
            </thead>
            <tbody>
              {errors.map(([status, code], i) => (
                <tr key={code}>
                  <td>{status}</td>
                  <td>
                    <code>{code}</code>
                  </td>
                  <td>{c.errorMeanings[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CodeBlock
          label={c.errors}
          code={JSON.stringify(
            { error: { code: 'RATE_LIMIT', retryAt: '2026-10-13T07:00:00Z' } },
            null,
            2,
          )}
        />
        <h3>{c.partialTitle}</h3>
        <p className="endpoint-description">{c.partial}</p>
        <CodeBlock
          label={c.partialTitle}
          code={JSON.stringify(
            {
              data: endpoints[1].data,
              fetchedAt: exampleTime,
              complete: false,
              error: { code: 'TIMEOUT' },
            },
            null,
            2,
          )}
        />
      </section>
      <section className="panel endpoint-panel" aria-labelledby="api-cache">
        <h2 id="api-cache">{c.cachingTitle}</h2>
        <p className="endpoint-description">{c.caching}</p>
      </section>
      <footer className="docs-footer">
        <span>GHP Info v1.0</span>
        <span>·</span>
        <a href="https://docs.github.com/en/rest" target="_blank" rel="noopener noreferrer">
          {c.source}
        </a>
      </footer>
    </main>
  );
}

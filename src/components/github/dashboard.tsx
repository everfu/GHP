'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, AlertCircle, RotateCcw } from 'lucide-react';
import { analyzeRepositories, defaultFilters, type RepositoryFilters } from '@/lib/analytics';
import { rememberUser } from '@/lib/browser/history';
import type { GitHubUser, PublicEvent, Repository } from '@/types/github';
import { SearchForm } from '../search/search-form';
import { Profile } from './profile';
import { Statistics, AnalysisCharts, PartialAnalysis } from './analytics';
import { RepositoryExplorer } from './repository-explorer';
import { Activity } from './activity';
import { ErrorNotice, FetchedAt, LoadingBlock } from '../ui/resource-state';
import { useResource } from '../../hooks/use-resource';
import { usePreferences } from '../providers/preferences';
import { ReferenceReveal } from '../ui/reference-motion';

export function Dashboard({ username }: { username: string }) {
  const { t, date } = usePreferences();
  const base = `/api/users/${encodeURIComponent(username)}`;
  const profile = useResource<GitHubUser>(base);
  const user = profile.result?.data;
  const supported = !!user && user.type !== 'Organization';
  const repositories = useResource<Repository[]>(supported ? `${base}/repos` : null);
  const events = useResource<PublicEvent[]>(supported ? `${base}/events` : null);
  const [filters, setFilters] = useState<RepositoryFilters>({ ...defaultFilters });
  const data = repositories.result;
  const analytics = useMemo(() => (data?.complete ? analyzeRepositories(data.data) : null), [data]);
  useEffect(() => {
    if (user && supported) rememberUser(user.login);
  }, [user, supported]);

  return (
    <main id="main" className="dashboard">
      <SearchForm initialValue={username} compact />
      {profile.loading ? (
        <LoadingBlock profile />
      ) : profile.error ? (
        <ReferenceReveal kind="error" className="profile-error">
          <h1>@{username}</h1>
          <ErrorNotice error={profile.error} retry={profile.retry} />
        </ReferenceReveal>
      ) : user ? (
        <ReferenceReveal kind="result" key={username}>
          <section className="panel profile-surface" aria-label={t('profileSummary')}>
            <Profile user={user} />
            {supported ? <Statistics user={user} analytics={analytics} /> : null}
            {profile.result ? <FetchedAt value={profile.result.fetchedAt} /> : null}
          </section>
          {!supported ? (
            <section className="organization-notice">
              <h2>{t('organizationTitle')}</h2>
              <p>{t('organizationDescription')}</p>
              <a
                className="text-link"
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('viewGitHub')}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </section>
          ) : (
            <>
              {repositories.loading ? (
                <div className="analysis-grid">
                  <LoadingBlock />
                  <LoadingBlock />
                </div>
              ) : repositories.error ? (
                <ErrorNotice
                  error={repositories.error}
                  retry={repositories.retry}
                  title={t('repos')}
                />
              ) : data ? (
                <>
                  {!data.complete ? (
                    <div className="partial-notice" role="status">
                      <AlertCircle size={18} aria-hidden="true" />
                      <div>
                        <h2>{t('partial')}</h2>
                        <p>{t('partialDetails')}</p>
                        {data.error ? (
                          <p className="note">
                            {t(data.error.code)}
                            {data.error.retryAt
                              ? ` · ${t('retryAfter')} ${date(data.error.retryAt, true)}`
                              : ''}
                          </p>
                        ) : null}
                      </div>
                      <button className="secondary-button" onClick={repositories.retry}>
                        <RotateCcw size={14} aria-hidden="true" />
                        {t('retry')}
                      </button>
                    </div>
                  ) : null}
                  {analytics ? (
                    <AnalysisCharts
                      analytics={analytics}
                      selectedLanguage={filters.language}
                      onLanguage={(language) => setFilters({ ...filters, language })}
                    />
                  ) : (
                    <PartialAnalysis />
                  )}
                  <div className="panel repository-panel">
                    <RepositoryExplorer
                      repositories={data.data}
                      filters={filters}
                      setFilters={setFilters}
                    />
                    <FetchedAt value={data.fetchedAt} />
                  </div>
                </>
              ) : null}
              <section className="panel activity-section" aria-labelledby="activity-title">
                {events.loading ? (
                  <>
                    <h2 id="activity-title">{t('activity')}</h2>
                    <LoadingBlock />
                  </>
                ) : events.error ? (
                  <>
                    <h2 id="activity-title">{t('activity')}</h2>
                    <ErrorNotice error={events.error} retry={events.retry} />
                  </>
                ) : events.result ? (
                  <>
                    <Activity events={events.result.data} />
                    <FetchedAt value={events.result.fetchedAt} />
                  </>
                ) : null}
              </section>
            </>
          )}
        </ReferenceReveal>
      ) : null}
    </main>
  );
}

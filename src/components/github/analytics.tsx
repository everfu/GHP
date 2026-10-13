'use client';

import { analyzeRepositories } from '@/lib/analytics';
import type { GitHubUser } from '@/types/github';
import { usePreferences } from '../providers/preferences';
import { Code2, Trophy } from 'lucide-react';

export function Statistics({
  user,
  analytics,
}: {
  user: GitHubUser;
  analytics: ReturnType<typeof analyzeRepositories> | null;
}) {
  const { t, number } = usePreferences();
  const metrics = [
    { label: t('publicRepos'), value: user.public_repos },
    { label: t('sourceRepos'), value: analytics?.sourceCount },
    { label: t('totalStars'), value: analytics?.stars },
    { label: t('totalForks'), value: analytics?.forks },
  ];
  return (
    <section className="statistics" aria-label={t('statsScope')}>
      <dl className="metrics">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <dt>{metric.label}</dt>
            <dd
              className="mono"
              title={metric.value === undefined ? t('unavailableStats') : undefined}
            >
              {metric.value === undefined ? '—' : number(metric.value)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="note">{t('statsScope')}</p>
    </section>
  );
}

export function AnalysisCharts({
  analytics,
  selectedLanguage,
  onLanguage,
}: {
  analytics: ReturnType<typeof analyzeRepositories>;
  selectedLanguage: string;
  onLanguage: (name: string) => void;
}) {
  const { t, number, percentage } = usePreferences();
  const largest = analytics.ranking[0]?.stargazers_count || 1;
  return (
    <div className="analysis-grid">
      <section aria-labelledby="languages-title">
        <div className="section-heading">
          <h2 id="languages-title">
            <Code2 size={16} aria-hidden="true" />
            {t('languages')}
          </h2>
          <span className="section-count mono">{number(analytics.languages.length)}</span>
        </div>
        {analytics.languages.length ? (
          <ul className="language-chart">
            {analytics.languages.map((language) => (
              <li key={language.name}>
                <button
                  className={`chart-row ${selectedLanguage === language.name ? 'selected' : ''}`}
                  type="button"
                  onClick={() =>
                    onLanguage(selectedLanguage === language.name ? 'all' : language.name)
                  }
                  aria-pressed={selectedLanguage === language.name}
                >
                  <span className="chart-label">
                    {language.name === '__unknown' ? t('unknownLanguage') : language.name}
                  </span>
                  <span className="bar-track" aria-hidden="true">
                    <span className="bar-fill" style={{ width: `${language.percentage}%` }} />
                  </span>
                  <span className="chart-value mono">
                    {number(language.count)}{' '}
                    <span className="muted">
                      ({percentage(language.percentage)}
                      %)
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">{t('noSources')}</p>
        )}
        <p className="note chart-note">{t('languageScope')}</p>
      </section>
      <section aria-labelledby="ranking-title">
        <div className="section-heading">
          <h2 id="ranking-title">
            <Trophy size={16} aria-hidden="true" />
            {t('ranking')}
          </h2>
          <span className="section-count mono">{number(analytics.ranking.length)}</span>
        </div>
        {analytics.ranking.length ? (
          <ol className="ranking-chart">
            {analytics.ranking.map((repo, index) => (
              <li key={repo.id}>
                <a
                  className="chart-row"
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="chart-label">
                    <span className="ranking-index mono">{index + 1}</span>
                    {repo.name}
                  </span>
                  <span className="bar-track" aria-hidden="true">
                    <span
                      className="bar-fill"
                      style={{ width: `${(repo.stargazers_count / largest) * 100}%` }}
                    />
                  </span>
                  <span className="chart-value mono">{number(repo.stargazers_count)}</span>
                </a>
              </li>
            ))}
          </ol>
        ) : (
          <p className="empty-state">{t('noSources')}</p>
        )}
        <p className="note chart-note">{t('rankingScope')}</p>
      </section>
    </div>
  );
}

export function PartialAnalysis() {
  const { t } = usePreferences();
  return (
    <div className="analysis-grid analysis-unavailable">
      <section>
        <h2>{t('languages')}</h2>
        <p className="empty-state">{t('unavailableStats')}</p>
      </section>
      <section>
        <h2>{t('ranking')}</h2>
        <p className="empty-state">{t('unavailableStats')}</p>
      </section>
    </div>
  );
}

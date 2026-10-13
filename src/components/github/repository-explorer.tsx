'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, GitFork, Search, Star } from 'lucide-react';
import {
  defaultFilters,
  filterRepositories,
  languageOptions,
  type RepositoryFilters,
} from '@/lib/analytics';
import type { Repository } from '@/types/github';
import { usePreferences } from '../providers/preferences';
import { GithubIcon } from '../ui/github-icon';
import { CustomSelect } from '../ui/custom-select';

export function RepositoryExplorer({
  repositories,
  filters,
  setFilters,
}: {
  repositories: Repository[];
  filters: RepositoryFilters;
  setFilters: (filters: RepositoryFilters) => void;
}) {
  const { t, number, date } = usePreferences();
  const [pagination, setPagination] = useState({ page: 1, filterKey: '' });
  const filterKey = JSON.stringify(filters);
  const filtered = useMemo(
    () => filterRepositories(repositories, filters),
    [repositories, filters],
  );
  const languages = useMemo(() => languageOptions(repositories), [repositories]);
  const pages = Math.max(1, Math.ceil(filtered.length / 20));
  const page = pagination.filterKey === filterKey ? Math.min(pagination.page, pages) : 1;
  const visible = filtered.slice((page - 1) * 20, page * 20);
  const changed = JSON.stringify(filters) !== JSON.stringify(defaultFilters);
  const update = (patch: Partial<RepositoryFilters>) => setFilters({ ...filters, ...patch });

  return (
    <section className="repository-section" aria-labelledby="repos-title" id="repositories">
      <div className="section-heading">
        <h2 id="repos-title">{t('repos')}</h2>
        <span className="result-count mono" role="status">
          {number(filtered.length)} <span>{t('matching')}</span>
        </span>
      </div>
      <div className="repository-filters">
        <div className="repo-search">
          <Search size={15} aria-hidden="true" />
          <input
            aria-label={t('repoSearch')}
            placeholder={t('repoSearch')}
            value={filters.search}
            onChange={(event) => update({ search: event.target.value })}
          />
        </div>
        <CustomSelect
          active={filters.language !== defaultFilters.language}
          label={t('filterLanguage')}
          value={filters.language}
          onChange={(language) => update({ language })}
          options={[
            { value: 'all', label: t('allLanguages') },
            ...languages.map((language) => ({
              value: language,
              label: language === '__unknown' ? t('unknownLanguage') : language,
            })),
          ]}
        />
        <CustomSelect<RepositoryFilters['fork']>
          active={filters.fork !== defaultFilters.fork}
          label={t('forkFilter')}
          value={filters.fork}
          onChange={(fork) => update({ fork })}
          options={[
            { value: 'sources', label: t('sources') },
            { value: 'all', label: t('allRepos') },
            { value: 'forks', label: t('forksOnly') },
          ]}
        />
        <CustomSelect<RepositoryFilters['archived']>
          active={filters.archived !== defaultFilters.archived}
          label={t('archiveFilter')}
          value={filters.archived}
          onChange={(archived) => update({ archived })}
          options={[
            { value: 'all', label: t('allArchives') },
            { value: 'active', label: t('activeOnly') },
            { value: 'archived', label: t('archivedOnly') },
          ]}
        />
        <CustomSelect<RepositoryFilters['sort']>
          active={filters.sort !== defaultFilters.sort}
          label={t('sortLabel')}
          value={filters.sort}
          onChange={(sort) => update({ sort })}
          options={[
            { value: 'stars', label: t('byStars') },
            { value: 'forks', label: t('byForks') },
            { value: 'pushed', label: t('byPushed') },
          ]}
        />
      </div>
      {changed ? (
        <div className="filter-reset">
          <button
            type="button"
            className="text-button"
            onClick={() => setFilters({ ...defaultFilters })}
          >
            {t('resetFilters')}
          </button>
        </div>
      ) : null}
      {visible.length ? (
        <ul className="repository-list">
          {visible.map((repo) => (
            <li className="repository-item" key={repo.id}>
              <article className="repository-row">
                <div className="repository-details">
                  <div className="repository-name">
                    <h3>
                      <a
                        className="text-link"
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {repo.name}
                      </a>
                    </h3>
                    {repo.fork ? <span className="repo-badge">Fork</span> : null}
                    {repo.archived ? <span className="repo-badge">{t('archived')}</span> : null}
                  </div>
                  <p>{repo.description || t('noDescription')}</p>
                </div>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="icon-button"
                  aria-label={`${t('viewGitHub')}: ${repo.name}`}
                >
                  <GithubIcon />
                </a>
                <div className="repository-meta">
                  <span className="repo-language">
                    <span className="language-dot" aria-hidden="true" />
                    {repo.language || t('unknownLanguage')}
                  </span>
                  <span
                    className="repo-stat mono"
                    aria-label={`${number(repo.stargazers_count)} Star`}
                  >
                    <Star size={14} aria-hidden="true" />
                    {number(repo.stargazers_count)}
                  </span>
                  <span className="repo-stat mono" aria-label={`${number(repo.forks_count)} Fork`}>
                    <GitFork size={14} aria-hidden="true" />
                    {number(repo.forks_count)}
                  </span>
                  <span className="repo-date">
                    {repo.pushed_at ? (
                      <>
                        {t('lastPushed')}{' '}
                        <time dateTime={repo.pushed_at}>{date(repo.pushed_at)}</time>
                      </>
                    ) : (
                      t('noPushedDate')
                    )}
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state repository-empty">
          <p>{t(repositories.length ? 'noMatches' : 'noRepos')}</p>
          {changed ? (
            <button
              type="button"
              className="text-button"
              onClick={() => setFilters({ ...defaultFilters })}
            >
              {t('resetFilters')}
            </button>
          ) : null}
        </div>
      )}
      {pages > 1 ? (
        <nav className="pagination" aria-label={t('page')}>
          <button
            className="secondary-button"
            type="button"
            disabled={page === 1}
            onClick={() => setPagination({ page: page - 1, filterKey })}
          >
            <ChevronLeft size={14} aria-hidden="true" />
            {t('previous')}
          </button>
          <span className="mono">
            {page} / {pages}
          </span>
          <button
            className="secondary-button"
            type="button"
            disabled={page === pages}
            onClick={() => setPagination({ page: page + 1, filterKey })}
          >
            {t('next')}
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </nav>
      ) : null}
    </section>
  );
}

'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { normalizeUsername } from '@/lib/username';
import { usePreferences } from '../providers/preferences';
import { ReferenceIcon } from '../ui/reference-icon';

export function SearchForm({
  initialValue = '',
  compact = false,
}: {
  initialValue?: string;
  compact?: boolean;
}) {
  const { t, href } = usePreferences();
  const router = useRouter();
  const [input, setInput] = useState(initialValue);
  const [invalid, setInvalid] = useState(false);
  const [pending, startTransition] = useTransition();
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      const target = event.target;
      if (
        event.defaultPrevented ||
        event.key !== '/' ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        document.querySelector(
          '[data-language-menu]:not([data-state="closed"]), [data-select-popup]:not([data-state="closed"])',
        ) ||
        (target instanceof HTMLElement &&
          target.closest(
            'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
          ))
      )
        return;
      event.preventDefault();
      field.current?.focus();
    }
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const username = normalizeUsername(input);
    if (!username) {
      setInvalid(true);
      field.current?.focus();
      return;
    }
    setInvalid(false);
    startTransition(() => router.push(href(`/u/${username}`)));
  }

  return (
    <form
      onSubmit={submit}
      className={`search-form ${compact ? 'compact' : ''}`}
      aria-busy={pending}
    >
      <label htmlFor="user-search" className="sr-only">
        {t('searchLabel')}
      </label>
      <div className={`search-control ${invalid ? 'is-invalid' : ''}`}>
        <kbd className="input-shortcut" aria-hidden="true">
          /
        </kbd>
        <input
          ref={field}
          id="user-search"
          name="username"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setInvalid(false);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !event.defaultPrevented) {
              event.preventDefault();
              if (input) {
                setInput('');
                setInvalid(false);
              } else field.current?.blur();
            }
          }}
          placeholder={t('searchPlaceholder')}
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          maxLength={300}
          aria-invalid={invalid}
          aria-describedby={invalid ? 'search-error' : 'search-hint'}
        />
        <button
          className="search-submit"
          type="submit"
          disabled={pending}
          aria-label={pending ? t('searching') : t('search')}
          title={t('search')}
        >
          {pending ? (
            <LoaderCircle size={16} className="spin" aria-hidden="true" />
          ) : (
            <ReferenceIcon name="send" />
          )}
        </button>
      </div>
      <div id="search-hint" className="search-hint">
        <span>
          {t('focusSearch')} <kbd>/</kbd>
        </span>
        <span>
          {t('clearBlur')} <kbd>Esc</kbd>
        </span>
      </div>
      {invalid ? (
        <p id="search-error" className="inline-error" role="alert">
          {t('invalidInput')}
        </p>
      ) : null}
    </form>
  );
}

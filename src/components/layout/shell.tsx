'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { usePreferences } from '../providers/preferences';
import { GithubIcon } from '../ui/github-icon';
import { ReferenceIcon } from '../ui/reference-icon';
import { locales, localeNames, localeTags } from '@/lib/i18n/locales';
import { AnimatePresence, motion } from 'motion/react';
import {
  ReferenceMenu,
  ReferenceThemeIcon,
  useReferenceReducedMotion,
} from '../ui/reference-motion';

export function Header() {
  const { locale, dark, t, setLocale, toggleTheme, href } = usePreferences();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const reduced = useReferenceReducedMotion();
  const lastScroll = useRef(0);
  const language = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    lastScroll.current = window.scrollY;
    function onScroll() {
      const current = Math.max(0, window.scrollY);
      if (current !== lastScroll.current) setVisible(current < lastScroll.current || current < 10);
      lastScroll.current = current;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
    function close(event: PointerEvent) {
      if (!language.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      trigger.current?.focus();
    }
    document.addEventListener('pointerdown', close);
    window.addEventListener('keydown', escape, true);
    return () => {
      document.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', escape, true);
    };
  }, [open]);

  return (
    <>
      <a href="#main" className="skip-link">
        {t('skip')}
      </a>
      <header className="site-header">
        <nav
          className="capsule-nav"
          aria-label={t('navigation')}
          data-visible={visible || open}
          onFocusCapture={() => setVisible(true)}
          onPointerEnter={() => setVisible(true)}
        >
          <Link href={href('/')} className="brand" aria-label={`GHP Info · ${t('home')}`}>
            <Image
              src="/ghp-info-logo.png"
              alt=""
              width={28}
              height={28}
              className="brand-logo"
              loading="eager"
            />
            <span className="brand-name">
              GHP INFO <span className="brand-version">1.0</span>
            </span>
          </Link>
          <span className="nav-separator" aria-hidden="true" />
          <Link href={href('/docs')} className="api-link">
            API
          </Link>
          <span className="nav-separator" aria-hidden="true" />
          <div className="nav-controls">
            <motion.button
              className="icon-button theme-button"
              type="button"
              tabIndex={0}
              onClick={toggleTheme}
              whileHover={reduced ? undefined : { scale: 1.1 }}
              whileTap={reduced ? undefined : { scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              aria-label={t(dark ? 'light' : 'dark')}
              title={t(dark ? 'light' : 'dark')}
            >
              <AnimatePresence mode="wait">
                <ReferenceThemeIcon
                  data-theme-icon={dark ? 'dark' : 'light'}
                  key={dark ? 'dark' : 'light'}
                >
                  <ReferenceIcon name={dark ? 'moon' : 'sun'} />
                </ReferenceThemeIcon>
              </AnimatePresence>
            </motion.button>
            <div className="language-menu" ref={language}>
              <button
                className="icon-button language-trigger"
                ref={trigger}
                type="button"
                aria-label={t('language')}
                title={t('language')}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls="language-options"
                onClick={() => setOpen(!open)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.preventDefault();
                    setOpen(true);
                  }
                }}
              >
                <ReferenceIcon name="earth" />
              </button>
              <AnimatePresence>
                {open ? (
                  <ReferenceMenu
                    key="languages"
                    id="language-options"
                    role="menu"
                    aria-label={t('language')}
                    ref={menu}
                    className="language-options"
                    data-language-menu
                    onBlur={(event) => {
                      if (!language.current?.contains(event.relatedTarget as Node | null))
                        setOpen(false);
                    }}
                    onKeyDown={(event) => {
                      const items = Array.from(
                        menu.current?.querySelectorAll<HTMLButtonElement>('button') ?? [],
                      );
                      const index = items.indexOf(document.activeElement as HTMLButtonElement);
                      const next =
                        event.key === 'Home'
                          ? 0
                          : event.key === 'End'
                            ? items.length - 1
                            : event.key === 'ArrowDown'
                              ? (index + 1) % items.length
                              : event.key === 'ArrowUp'
                                ? (index + items.length - 1) % items.length
                                : -1;
                      if (next !== -1) {
                        event.preventDefault();
                        items[next]?.focus();
                      }
                    }}
                  >
                    {locales.map((value) => (
                      <motion.button
                        key={value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={locale === value}
                        whileTap={
                          reduced ? undefined : { scale: 0.95, transition: { duration: 0.1 } }
                        }
                        lang={localeTags[value]}
                        onClick={() => {
                          setLocale(value);
                          setOpen(false);
                          trigger.current?.focus();
                        }}
                      >
                        {localeNames[value]}
                        {locale === value ? <Check size={12} aria-hidden="true" /> : null}
                      </motion.button>
                    ))}
                  </ReferenceMenu>
                ) : null}
              </AnimatePresence>
            </div>
            <a
              href="https://github.com/everfu/GHP"
              className="icon-button github-button"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="GitHub"
            >
              <GithubIcon size={16} />
            </a>
          </div>
        </nav>
      </header>
    </>
  );
}

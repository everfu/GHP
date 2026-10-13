import { expect, test } from '@playwright/test';
import { user } from '../fixtures';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { locales, localeNames, localeTags, localizedPath } from '../../src/lib/i18n/locales';
import { dictionary } from '../../src/lib/i18n/dictionary';
import { docsDictionary } from '../../src/lib/i18n/docs';
import { mockGitHub } from './helpers/github';

test('all eight languages preserve the current URL and localize pages and navigation', async ({
  page,
  context,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await mockGitHub(page);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/zh/u/octocat?source=share#main');
  for (const locale of locales) {
    const c = dictionary(locale);
    await page.locator('.language-menu > button').click();
    await expect(page.getByRole('menuitemradio')).toHaveCount(8);
    await expect(page.getByRole('menuitemradio')).toHaveText(
      locales.map((value) => localeNames[value]),
    );
    await page.getByRole('menuitemradio', { name: localeNames[locale], exact: true }).click();
    await expect(page).toHaveURL(
      new URL(localizedPath('/u/octocat?source=share#main', locale), page.url()).href,
    );
    await expect(page.locator('html')).toHaveAttribute('lang', localeTags[locale]);
    await expect(page.getByRole('heading', { name: c.repos, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'API', exact: true })).toHaveAttribute(
      'href',
      localizedPath('/docs', locale),
    );
    await page.getByRole('button', { name: c.copyLink, exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: c.copied })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      `${new URL(page.url()).origin}${localizedPath('/u/octocat', locale)}`,
    );
    const joined = page.locator('.profile-meta time');
    await expect(joined).toHaveText(
      new Intl.DateTimeFormat(localeTags[locale], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(user.created_at)),
    );
    await page.reload();
    await expect(page.getByRole('heading', { name: c.repos, exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'API', exact: true }).click();
    await expect(page).toHaveURL(new URL(localizedPath('/docs', locale), page.url()).href);
    await expect(page).toHaveTitle(`${docsDictionary(locale).title} · GHP Info`);
    await expect(
      page.getByRole('heading', { name: docsDictionary(locale).title, exact: true }),
    ).toBeVisible();
    await page.getByRole('link', { name: c.backHome, exact: true }).click();
    await expect(page).toHaveURL(new URL(localizedPath('/', locale), page.url()).href);
    await expect(page.locator('.history-list a')).toHaveAttribute(
      'href',
      localizedPath('/u/octocat', locale),
    );
    await page.locator('.history-list a').click();
    await expect(page.getByRole('heading', { name: c.repos, exact: true })).toBeVisible();
    await page.goto(localizedPath('/u/octocat?source=share#main', locale));
  }
  await page.locator('.language-menu > button').click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({
    path: join(tmpdir(), `ghpinfo-language-menu-${testInfo.project.name}.png`),
  });
  expect(errors).toEqual([]);
});

test('locale URLs override saved preferences and browser history restores the language', async ({
  page,
}) => {
  await mockGitHub(page);
  await page.addInitScript(() =>
    localStorage.setItem('ghp:preferences:v1', JSON.stringify({ locale: 'en', theme: 'light' })),
  );
  await page.goto('/ja');
  await expect(page.getByRole('heading', { name: dictionary('ja').emptyHistory })).toBeVisible();
  await page.locator('.language-menu > button').click();
  await page.getByRole('menuitemradio', { name: 'Deutsch' }).click();
  await expect(page).toHaveURL(/\/de$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/ja$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await page.goForward();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.goto('/u/octocat?ref=legacy');
  await expect(page).toHaveURL(/\/de\/u\/octocat\?ref=legacy$/);
  await page.goto('/es');
  await expect(page.getByRole('heading', { name: dictionary('en').notFoundTitle })).toBeVisible();
});

test('direct locale requests render translated HTML before JavaScript and exclude APIs and assets', async ({
  request,
}) => {
  for (const locale of locales) {
    const response = await request.get(localizedPath('/', locale));
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain(`lang="${localeTags[locale]}"`);
    expect(html).toContain(dictionary(locale).emptyHistory);
    expect(html).toContain(`data-locale="${locale}"`);
  }
  const legacy = await request.get('/docs?source=legacy', {
    maxRedirects: 0,
    headers: { cookie: '', 'accept-language': 'zh-CN' },
  });
  expect(legacy.status()).toBe(307);
  expect(legacy.headers().location).toMatch(/\/zh\/docs\?source=legacy$/);
  const invalid = await request.get('/es');
  expect(invalid.status()).toBe(404);
  const api = await request.get('/api/users/invalid--name', { maxRedirects: 0 });
  expect(api.status()).toBe(400);
  expect(api.headers().location).toBeUndefined();
  const asset = await request.get('/ghp-info-logo.png', {
    maxRedirects: 0,
    headers: { cookie: '', 'accept-language': 'zh-CN' },
  });
  expect(asset.status()).toBe(200);
  expect(asset.headers().location).toBeUndefined();
  expect(asset.headers()['content-type']).toContain('image/png');
});

test('first visit matches the browser language and remembers a manual English choice', async ({
  browser,
  baseURL,
}, testInfo) => {
  for (const [browserLanguage, expected] of [
    ['en-US', 'en'],
    ['zh-CN', 'zh'],
    ['zh-TW', 'zh-tw'],
    ['zh-HK', 'zh-tw'],
    ['de-DE', 'de'],
    ['ru-RU', 'ru'],
    ['ja-JP', 'ja'],
    ['fr-CA', 'fr'],
    ['ko-KR', 'ko'],
    ['es-ES', 'en'],
  ] as const) {
    const context = await browser.newContext({
      baseURL,
      locale: browserLanguage,
      viewport: testInfo.project.use.viewport,
      isMobile: testInfo.project.use.isMobile,
      hasTouch: testInfo.project.use.hasTouch,
      deviceScaleFactor: testInfo.project.use.deviceScaleFactor,
    });
    try {
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('/?source=first#main');
      await expect(page).toHaveURL(
        new URL(localizedPath('/?source=first#main', expected), baseURL).href,
      );
      await expect(page.locator('html')).toHaveAttribute('lang', localeTags[expected]);
      await expect(
        page.getByRole('heading', { name: dictionary(expected).emptyHistory }),
      ).toBeVisible();
      await expect(page).toHaveTitle(`${dictionary(expected).headline} · GHP Info`);
      expect((await context.cookies()).find((cookie) => cookie.name === 'ghp:locale')?.value).toBe(
        expected,
      );
      if (expected !== 'en') {
        await page.locator('.language-menu > button').click();
        await page.getByRole('menuitemradio', { name: 'English', exact: true }).click();
        await expect(page).toHaveURL(new URL('/?source=first#main', baseURL).href);
      }
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await page.getByRole('link', { name: 'API', exact: true }).click();
      await expect(page).toHaveURL(new URL('/docs', baseURL).href);
      await expect(
        page.getByRole('heading', { name: 'API Documentation', exact: true }),
      ).toBeVisible();
      await page.getByRole('link', { name: 'Back to home', exact: true }).click();
      await expect(page).toHaveURL(new URL('/', baseURL).href);
      if (browserLanguage === 'zh-CN') {
        await page.screenshot({
          path: join(tmpdir(), `ghpinfo-default-english-${testInfo.project.name}.png`),
        });
      }
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  }
});

test('English aliases redirect to prefix-free URLs and explicit language paths win over browser preferences', async ({
  request,
}) => {
  const alias = await request.get('/en/u/octocat?source=alias', {
    maxRedirects: 0,
    headers: { 'accept-language': 'zh-CN', cookie: 'ghp:locale=zh' },
  });
  expect(alias.status()).toBe(307);
  expect(alias.headers().location).toMatch(/\/u\/octocat\?source=alias$/);
  expect(alias.headers()['set-cookie']).toContain('ghp:locale=en');
  const english = await request.get('/?source=saved', {
    headers: { 'accept-language': 'zh-CN', cookie: 'ghp:locale=en' },
  });
  expect(english.status()).toBe(200);
  expect(new URL(english.url()).pathname).toBe('/');
  expect(await english.text()).toContain('lang="en"');
  const explicit = await request.get('/ja', {
    headers: { 'accept-language': 'zh-CN', cookie: 'ghp:locale=en' },
  });
  expect(new URL(explicit.url()).pathname).toBe('/ja');
  expect(await explicit.text()).toContain('lang="ja"');
});

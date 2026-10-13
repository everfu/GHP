import { expect, test } from '@playwright/test';
import { repository } from '../fixtures';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mockGitHub } from './helpers/github';

test('language, theme, copied URL, local persistence and keyboard flow', async ({
  page,
  context,
}) => {
  await mockGitHub(page);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/zh/u/octocat');
  await page.getByRole('button', { name: '选择语言' }).click();
  await page.getByRole('menuitemradio', { name: 'English' }).click();
  await expect(page).toHaveURL(/\/u\/octocat$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: 'Public repositories' })).toBeVisible();
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Copy profile link' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Link copied' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/u\/octocat$/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('textbox', { name: 'GitHub username or profile URL' }).fill('@everfu');
  await page.getByRole('textbox', { name: 'GitHub username or profile URL' }).press('Enter');
  await expect(page).toHaveURL(/\/u\/everfu$/);
  await expect(page.locator('.username')).toHaveText('@everfu');
});

test('custom dropdown supports keyboard selection, dismissal and reset', async ({ page }) => {
  await mockGitHub(page);
  await page.goto('/zh/u/octocat');
  await expect(page.locator('.repository-row')).toHaveCount(20);
  const language = page.getByRole('combobox', { name: '筛选主要语言' });
  await language.click();
  const list = page.getByRole('listbox', { name: '筛选主要语言' });
  await expect(list.getByRole('option', { name: '全部语言', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await language.press('End');
  await expect(list.getByRole('option', { name: 'TypeScript', exact: true })).toHaveAttribute(
    'data-highlighted',
    'true',
  );
  await language.press('Home');
  await expect(list.getByRole('option', { name: '全部语言', exact: true })).toHaveAttribute(
    'data-highlighted',
    'true',
  );
  await language.press('p');
  await expect(list.getByRole('option', { name: 'Python', exact: true })).toHaveAttribute(
    'data-highlighted',
    'true',
  );
  await language.press('Enter');
  await expect(language).toHaveText('Python');
  await expect(language).toBeFocused();
  await expect(page.locator('.repository-row')).toHaveCount(1);
  await expect(page.locator('.repository-row')).toContainText('git-consortium');
  await language.press('ArrowDown');
  await language.press('ArrowDown');
  await language.press('/');
  await expect(language).toBeFocused();
  await language.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(language).toHaveText('Python');
  await expect(page.getByRole('textbox', { name: 'GitHub 用户名或个人主页链接' })).toHaveValue(
    'octocat',
  );
  await language.click();
  await language.press('Tab');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  const fork = page.getByRole('combobox', { name: '筛选 Fork 状态' });
  await expect(fork).toBeFocused();
  await fork.click();
  await page.getByRole('combobox', { name: '筛选归档状态' }).click();
  await expect(page.getByRole('listbox')).toHaveCount(1);
  await expect(page.getByRole('listbox', { name: '筛选归档状态' })).toBeVisible();
  await page.getByRole('textbox', { name: '搜索仓库名称或描述' }).click();
  await expect(page.getByRole('listbox')).toHaveCount(0);
  const sort = page.getByRole('combobox', { name: '仓库排序' });
  await sort.press('End');
  await sort.press(' ');
  await expect(sort).toHaveText('最近推送');
  await page.getByRole('button', { name: '重置筛选', exact: true }).click();
  await expect(language).toHaveText('全部语言');
  await expect(sort).toHaveText('最多 Star');
  await expect(page.locator('.repository-row')).toHaveCount(20);
});

test('long dropdown stays within a narrow viewport and scrolls to keyboard selection', async ({
  page,
}, testInfo) => {
  const languageNames = Array.from(
    { length: 40 },
    (_, i) => `Language ${String(i).padStart(2, '0')} with a long display name`,
  );
  await mockGitHub(page, {
    repos: languageNames.map((language, i) => repository(i + 1, { language })),
  });
  await page.setViewportSize({ width: 320, height: 600 });
  await page.goto('/zh/u/octocat');
  await expect(page.locator('.repository-row')).toHaveCount(20);
  const language = page.getByRole('combobox', { name: '筛选主要语言' });
  await language.click();
  const list = page.getByRole('listbox', { name: '筛选主要语言' });
  await expect(list).toBeVisible();
  await language.press('End');
  const option = list.getByRole('option', { name: languageNames.at(-1)!, exact: true });
  await expect(option).toHaveAttribute('data-highlighted', 'true');
  await expect(list).toHaveCSS('transform', 'none');
  await expect(page.locator('[data-motion-reveal="result"]')).toHaveCSS('transform', 'none');
  const box = (await list.boundingBox())!;
  const activeBox = (await option.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(8);
  expect(box.x + box.width).toBeLessThanOrEqual(312);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(600);
  expect(activeBox.y).toBeGreaterThanOrEqual(box.y);
  expect(activeBox.y + activeBox.height).toBeLessThanOrEqual(box.y + box.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({
    path: join(tmpdir(), `ghpinfo-custom-select-narrow-${testInfo.project.name}.png`),
  });
  await language.press('Enter');
  await expect(page.locator('.repository-row')).toHaveCount(1);
  await expect(page.locator('.repository-row')).toContainText('project-40');
  await language.evaluate((element) =>
    element.scrollIntoView({ block: 'end', behavior: 'instant' }),
  );
  await language.click();
  await expect(list).toHaveAttribute('data-side', 'top');
  const aboveBox = (await list.boundingBox())!;
  expect(aboveBox.y).toBeGreaterThanOrEqual(0);
  expect(aboveBox.y + aboveBox.height).toBeLessThanOrEqual(600);
  await language.press('Escape');
  await expect(language).toBeFocused();
});

test('search shortcuts respect editing and language menu focus', async ({ page }) => {
  await mockGitHub(page);
  await page.goto('/zh');
  await page.getByRole('button', { name: '选择语言' }).click();
  await expect(page.getByRole('menu')).toBeVisible();
  await page.keyboard.press('Escape');
  const input = page.getByRole('textbox', { name: 'GitHub 用户名或个人主页链接' });
  await page.keyboard.press('/');
  await expect(input).toBeFocused();
  await input.fill('@octocat');
  await input.press('Escape');
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await input.press('Escape');
  await expect(input).not.toBeFocused();
  await page.keyboard.press('/');
  await input.fill('octocat');
  await input.press('Enter');
  await expect(page.locator('.username')).toHaveText('@octocat');
  const filter = page.getByRole('textbox', { name: '搜索仓库名称或描述' });
  await filter.fill('hello');
  await filter.press('/');
  await expect(filter).toHaveValue('hello/');
  await expect(filter).toBeFocused();
  await expect(input).toHaveValue('octocat');
  const language = page.getByRole('button', { name: '选择语言' });
  await language.click();
  await expect(page.getByRole('menuitemradio', { name: '简体中文' })).toBeFocused();
  await page.keyboard.press('/');
  await expect(input).not.toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(language).toBeFocused();
  await expect(input).toHaveValue('octocat');
  await language.press('ArrowDown');
  await page.keyboard.press('Home');
  await expect(page.getByRole('menuitemradio', { name: 'English' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('reference entrance, menu exit and theme rotation complete without changing layout or focus', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'light' });
  await page.goto('/zh', { waitUntil: 'domcontentloaded' });
  const history = page.locator('[data-motion-reveal="history"]');
  await expect(history).toHaveCSS('opacity', '1');
  await expect(history).toHaveCSS('transform', 'none');
  expect((await page.locator('.search-control').boundingBox())?.y).toBe(88);

  const trigger = page.getByRole('button', { name: '选择语言', exact: true });
  await trigger.click();
  const menu = page.getByRole('menu');
  await expect(menu).toHaveCSS('opacity', '1');
  await expect(menu).toHaveCSS('transform', 'none');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(page.getByRole('menu')).toHaveCount(0);
  await page.keyboard.press('/');
  await expect(page.locator('#user-search')).toBeFocused();
  await expect(page.locator('#language-options')).toHaveCount(0);

  await page.getByRole('button', { name: '切换至深色', exact: true }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.locator('[data-theme-icon="dark"]')).toHaveCSS('transform', 'none');
  await expect(page.locator('.theme-icon')).toHaveCount(1);
  await expect(page.locator('.theme-icon')).toHaveCSS('opacity', '1');
  await expect(page.locator('.theme-icon')).toHaveCSS('transform', 'none');
  await page.getByRole('button', { name: '切换至浅色', exact: true }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await expect(page.locator('[data-theme-icon="light"]')).toHaveCSS('transform', 'none');
  await expect(page.locator('.theme-icon')).toHaveCSS('transform', 'none');
  await page.screenshot({
    path: join(tmpdir(), `ghpinfo-motion-home-${testInfo.project.name}.png`),
  });
  expect(errors).toEqual([]);
});

test('reference result reveal and scroll navigation preserve interaction with menus and keyboard focus', async ({
  page,
}) => {
  await mockGitHub(page);
  await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'light' });
  await page.goto('/zh/u/octocat');
  const result = page.locator('[data-motion-reveal="result"]');
  await expect(result).toHaveCSS('opacity', '1');
  await expect(result).toHaveCSS('transform', 'none');
  const nav = page.locator('.capsule-nav');
  await page.mouse.move(0, 0);
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
  await expect(nav).toHaveAttribute('data-visible', 'false');
  await expect(nav).toHaveCSS('opacity', '0');
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }));
  await expect(nav).toHaveAttribute('data-visible', 'true');
  await expect(nav).toHaveCSS('opacity', '1');
  await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'instant' }));
  await expect(nav).toHaveAttribute('data-visible', 'false');
  await page.getByRole('link', { name: 'API', exact: true }).focus();
  await expect(nav).toHaveAttribute('data-visible', 'true');
  await expect(nav).toHaveCSS('opacity', '1');
  await page.getByRole('button', { name: '选择语言', exact: true }).click();
  await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'instant' }));
  await expect(nav).toHaveAttribute('data-visible', 'true');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toHaveCount(0);
});

test('reduced motion removes delayed reveals, menu transforms and hover movement', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await mockGitHub(page);
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  await page.goto('/zh');
  await expect(page.locator('[data-motion-reveal="history"]')).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-motion-reveal="history"]')).toHaveCSS('transform', 'none');
  await page.getByRole('button', { name: '选择语言', exact: true }).click();
  await expect(page.getByRole('menu')).toHaveCSS('opacity', '1');
  await expect(page.getByRole('menu')).toHaveCSS('transform', 'none');
  await page.keyboard.press('Escape');
  await page.goto('/zh/u/octocat');
  await expect(page.locator('[data-motion-reveal="result"]')).toHaveCSS('transform', 'none');
  const language = page.getByRole('combobox', { name: '筛选主要语言' });
  await language.click();
  await expect(page.getByRole('listbox')).toHaveCSS('transform', 'none');
  await language.press('Escape');
  expect(
    await page.evaluate(
      () =>
        document.getAnimations().filter((animation) => {
          const timing = animation.effect?.getTiming();
          return (
            animation.playState === 'running' &&
            timing &&
            (Number(timing.duration) > 0 || Number(timing.delay) > 0)
          );
        }).length,
    ),
  ).toBe(0);
  expect(errors).toEqual([]);
});

test('reference layout at desktop, mobile and narrow widths with both themes', async ({
  page,
}, testInfo) => {
  await mockGitHub(page);
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/zh');
    for (const theme of ['light', 'dark'] as const) {
      const language = page.getByRole('button', { name: '选择语言' });
      await language.click();
      await expect(page.getByRole('menu')).toBeVisible();
      await language.click();
      await expect(page.locator('[data-motion-reveal="history"]')).toHaveCSS('opacity', '1');
      const clear = page.getByRole('button', { name: '清空', exact: true });
      if (await clear.count()) await clear.click();
      await expect(page.getByRole('heading', { name: '暂无历史记录' })).toBeVisible();
      if (theme === 'dark') await page.getByRole('button', { name: '切换至深色' }).click();
      await page.mouse.move(0, 0);
      const search = await page.locator('.search-control').boundingBox();
      expect(search?.y).toBe(88);
      expect(search?.height).toBe(40);
      const nav = await page.locator('.capsule-nav').boundingBox();
      expect(nav?.y).toBe(16);
      expect(nav?.height).toBe(40);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({
        path: join(tmpdir(), `ghpinfo-home-${width}-${theme}-${testInfo.project.name}.png`),
      });
      await page.goto('/zh/u/octocat');
      await expect(page.locator('.repository-row')).toHaveCount(20);
      expect(
        await page
          .locator('.analysis-grid')
          .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length),
      ).toBe(width < 640 ? 1 : 2);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({
        path: join(tmpdir(), `ghpinfo-result-${width}-${theme}-${testInfo.project.name}.png`),
      });
      await page.getByRole('link', { name: 'API', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'API 文档', exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({
        path: join(tmpdir(), `ghpinfo-docs-${width}-${theme}-${testInfo.project.name}.png`),
      });
      if (theme === 'dark') await page.getByRole('button', { name: '切换至浅色' }).click();
      await page.getByRole('link', { name: 'GHP Info · 返回首页' }).click();
    }
  }
});

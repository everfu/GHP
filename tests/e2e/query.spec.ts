import { expect, test } from '@playwright/test';
import { mockGitHub, selectFilter } from './helpers/github';

test('username, @username and profile URL query, validation and recent history', async ({
  page,
}) => {
  await mockGitHub(page);
  await page.goto('/zh');
  await expect(page).toHaveTitle(/GHP Info/);
  await expect(page.getByRole('heading', { name: '暂无历史记录' })).toBeVisible();
  const input = page.getByRole('textbox', { name: 'GitHub 用户名或个人主页链接' });
  await input.fill('https://github.com/octocat/repository');
  await input.press('Enter');
  await expect(page.getByRole('main').getByRole('alert')).toContainText('请输入有效');
  for (const value of ['Octocat', '@Octocat', 'https://github.com/Octocat/']) {
    await input.fill(value);
    await input.press('Enter');
    await expect(page).toHaveURL(/\/u\/octocat$/);
    await expect(page.getByRole('heading', { name: 'The Octocat', exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'GHP Info · 返回首页' }).click();
    await expect(page.getByRole('heading', { name: '最近查询' })).toBeVisible();
  }
  await expect(page.locator('.history-list a')).toHaveCount(1);
  await page.getByRole('button', { name: '清空', exact: true }).click();
  await expect(page.getByRole('heading', { name: '最近查询' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '暂无历史记录' })).toBeVisible();
});

test('direct URL, repository ranking, filters, pagination and activity expansion', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await mockGitHub(page);
  await page.goto('/zh/u/octocat');
  await expect(page.locator('.repository-row')).toHaveCount(20);
  await expect(page.locator('.ranking-chart a').first()).toContainText('hello-world');
  await page.getByRole('button', { name: '下一页' }).click();
  await expect(page.locator('.repository-row')).toHaveCount(6);
  await page.getByRole('button', { name: 'TypeScript', exact: false }).click();
  await expect(page.getByRole('combobox', { name: '筛选主要语言' })).toHaveText('TypeScript');
  await expect(page.locator('.pagination')).toContainText('1 / 2');
  await selectFilter(page, '筛选主要语言', 'Python');
  await expect(page.locator('.repository-row')).toHaveCount(1);
  await expect(page.locator('.repository-row')).toContainText('git-consortium');
  await page.getByRole('button', { name: '重置筛选', exact: true }).click();
  await selectFilter(page, '筛选 Fork 状态', '仅 Fork');
  await expect(page.locator('.repository-row')).toHaveCount(1);
  await expect(page.locator('.repository-row')).toContainText('spoon-knife');
  await selectFilter(page, '筛选 Fork 状态', '非 Fork');
  await selectFilter(page, '筛选归档状态', '已归档');
  await expect(page.locator('.repository-row')).toContainText('notes');
  await selectFilter(page, '筛选归档状态', '全部归档状态');
  await page.getByRole('textbox', { name: '搜索仓库名称或描述' }).fill('no-matching-repository');
  await expect(page.getByText('没有符合筛选条件的仓库。')).toBeVisible();
  await page.getByRole('textbox', { name: '搜索仓库名称或描述' }).fill('git-consortium');
  await expect(page.locator('.repository-row')).toHaveCount(1);
  await expect(page.locator('.activity-row')).toHaveCount(10);
  await page.getByRole('button', { name: '显示更多' }).click();
  await expect(page.locator('.activity-row')).toHaveCount(15);
  await page.getByRole('button', { name: '收起' }).click();
  await expect(page.locator('.activity-row')).toHaveCount(10);
  await page.reload();
  await expect(page.locator('.repository-row')).toHaveCount(20);
  expect(errors).toEqual([]);
});

test('API documentation navigation, endpoint contracts, copy and language', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/zh');
  await page.getByRole('link', { name: 'API', exact: true }).click();
  await expect(page).toHaveURL(/\/docs$/);
  await expect(page).toHaveTitle(/API 文档/);
  await expect(page.getByRole('heading', { name: 'API 文档', exact: true })).toBeVisible();
  await expect(page.locator('.method-badge')).toHaveCount(3);
  await expect(page.locator('#endpoint-profile')).toContainText('/api/users/[username]');
  await expect(page.locator('#endpoint-repos')).toContainText('/repos');
  await expect(page.locator('#endpoint-events')).toContainText('/events');
  const requestCopy = page.getByRole('button', {
    name: '复制代码: /api/users/[username] · 请求示例',
    exact: true,
  });
  await requestCopy.click();
  await expect(page.getByRole('status').filter({ hasText: '代码已复制' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    `curl "${new URL(page.url()).origin}/api/users/everfu"`,
  );
  await page.getByRole('button', { name: '选择语言' }).click();
  await page.getByRole('menuitemradio', { name: 'English' }).click();
  await expect(page.getByRole('heading', { name: 'API Documentation', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Partial results', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'API Documentation', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Back to home', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});

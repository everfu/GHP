# GHP

无需登录，探索 GitHub 开发者的公开资料、仓库与近期活动。

[English](../README.md) · [简体中文](README_CN.md) · [繁體中文](README_TW.md) · [Русский](README_RU.md) · [日本語](README_JP.md) · [Deutsch](README_DE.md) · [Français](README_FR.md) · [한국어](README_KR.md)

## 功能

- **开发者查询** — 支持用户名、`@用户名` 和 GitHub 主页链接，展示公开资料、粉丝、关注与注册时间。
- **仓库分析** — 完整读取公开仓库分页，汇总非 Fork 仓库的 Star / Fork，展示主要语言分布与 Star 前五名。
- **搜索与筛选** — 按名称、描述和语言搜索，筛选 Fork 和归档状态，按 Star、Fork 或更新时间排序，每页 20 条。
- **近期活动** — 最多 30 条公开事件，支持展开列表。
- **语言与主题** — 界面与 API 文档支持八种语言；适配桌面和手机，深浅主题跟随系统并记住手动选择。
- **历史与快捷键** — 保存最近十次成功查询，支持清空历史、复制分享链接及 `/`、Enter、Esc 快捷键。
- **服务端缓存** — 完整结果缓存十分钟，合并相同并发请求；资料、仓库和活动分别加载与重试。
- **公开 API** — 用户资料、仓库和活动的只读接口，附站内文档。

统计只使用公开数据。Star / Fork 汇总排除 Fork 仓库、包含归档仓库；语言分布按仓库的主要语言计数。仓库未完整加载时会提示并隐藏全量汇总。

## 部署

### 托管平台

将此仓库导入支持 **Next.js 16 和动态 Route Handlers** 的托管平台，使用以下配置：

| 配置     | 值                                    |
| -------- | ------------------------------------- |
| Node.js  | `24.x`                                |
| 安装命令 | `npm ci`                              |
| 构建命令 | `npm run build`                       |
| 环境变量 | `SITE_URL`，以及可选的 `GITHUB_TOKEN` |

服务器需要能够访问 `https://api.github.com`，仓库接口需要允许最长 60 秒的函数执行时间。本项目包含服务端接口，不支持纯静态导出到 GitHub Pages。

### Node.js 服务

```sh
npm ci
npm run build
npm run start
```

默认监听 `127.0.0.1:3000`，可通过反向代理对外提供访问。

### 源码运行

使用 Node.js **22.12+（22.x）或 24.x**，推荐采用项目 `.nvmrc` 指定的 Node.js 24。

```sh
git clone https://github.com/everfu/GHP.git
cd GHP
npm ci
npm run dev
```

打开 <http://127.0.0.1:3000>。英文地址不带语言前缀；其他语言使用 `/zh`、`/zh-tw`、`/de`、`/ru`、`/ja`、`/fr` 或 `/ko`，例如 `/zh/u/everfu` 和 `/zh/docs`。首次访问会根据浏览器语言选择入口，切换语言会保留当前查询。

## 环境变量

按需复制示例配置，修改后重启服务：

```sh
cp .env.example .env.local
```

| 变量           | 说明                                                    | 默认行为                             |
| -------------- | ------------------------------------------------------- | ------------------------------------ |
| `GITHUB_TOKEN` | 可选服务端凭证，用于提高 GitHub API 查询额度            | 未配置时使用服务器 IP 共享额度       |
| `SITE_URL`     | 网站公开地址，包含 `https://`，用于生成完整的分享图链接 | 使用 Vercel 提供的地址或本地开发地址 |

`GITHUB_TOKEN` 仅需要读取公开数据的权限，不需要私有仓库或写入权限。凭证只用于服务端，不要添加 `NEXT_PUBLIC_` 前缀，也不要提交 `.env.local`。

## API

运行项目后，查看站内 [API 文档](http://127.0.0.1:3000/zh/docs)。

| 接口                               | 数据                   |
| ---------------------------------- | ---------------------- |
| `GET /api/users/{username}`        | 用户公开资料           |
| `GET /api/users/{username}/repos`  | 完整分页的公开仓库     |
| `GET /api/users/{username}/events` | 最近最多 30 条公开事件 |

```sh
curl http://127.0.0.1:3000/api/users/everfu
curl http://127.0.0.1:3000/api/users/everfu/repos
curl http://127.0.0.1:3000/api/users/everfu/events
```

成功响应包含 `{ data, fetchedAt, complete }`。仓库已取得部分分页后中断时，响应包含已有数据、`complete: false` 和 `error`。错误响应使用 `{ error: { code, retryAt? } }`。

## 技术栈

- Next.js 16 App Router、React 19、TypeScript
- Tailwind CSS 4、Motion、Lucide React
- GitHub REST API、进程内 LRU 缓存
- Vitest、Playwright、ESLint、Prettier

## 开发与验证

```sh
npm run check
npm run build

# 首次运行浏览器测试时安装 Chromium
npx playwright install chromium
npm run test:e2e
```

CI 在 Node.js 22 / 24 上执行检查与构建，并运行桌面和手机浏览器回归测试。欢迎通过 [Issue](https://github.com/everfu/GHP/issues) 或 Pull Request 参与贡献。

## 致谢

感谢 [next-whois](https://github.com/zmh-program/next-whois) 项目。

## 许可

[Apache License 2.0](../LICENSE)。字体许可见 [public/fonts/LICENSE.txt](../public/fonts/LICENSE.txt)。

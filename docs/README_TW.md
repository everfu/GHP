# GHP

無需登入，探索 GitHub 開發者的公開資料、儲存庫與近期活動。

[English](../README.md) · [简体中文](README_CN.md) · [繁體中文](README_TW.md) · [Русский](README_RU.md) · [日本語](README_JP.md) · [Deutsch](README_DE.md) · [Français](README_FR.md) · [한국어](README_KR.md)

## 功能

- **開發者查詢** — 支援使用者名稱、`@使用者名稱` 和 GitHub 個人檔案連結，顯示公開資料、追蹤者、追蹤中與註冊時間。
- **儲存庫分析** — 完整讀取公開儲存庫分頁，彙總非 Fork 儲存庫的 Star / Fork，顯示主要語言分布與 Star 前五名。
- **搜尋與篩選** — 按名稱、描述和語言搜尋，篩選 Fork 和封存狀態，按 Star、Fork 或更新時間排序，每頁 20 筆。
- **近期活動** — 最多 30 筆公開事件，支援展開列表。
- **語言與主題** — 介面與 API 文件支援八種語言；適用於桌面和手機，深淺主題跟隨系統並記住手動選擇。
- **歷史與快捷鍵** — 儲存最近十次成功查詢，支援清除歷史、複製分享連結及 `/`、Enter、Esc 快捷鍵。
- **伺服器端快取** — 完整結果快取十分鐘，合併相同並行請求；資料、儲存庫和活動分別載入與重試。
- **公開 API** — 使用者資料、儲存庫和活動的唯讀端點，附站內文件。

統計僅使用公開資料。Star / Fork 彙總排除 Fork 儲存庫、包含封存儲存庫；語言分布按儲存庫的主要語言計數。儲存庫未完整載入時會提示並隱藏全量彙總。

## 部署

### 託管平台

將此儲存庫匯入支援 **Next.js 16 和動態 Route Handlers** 的託管平台，使用以下設定：

| 設定     | 值                                    |
| -------- | ------------------------------------- |
| Node.js  | `24.x`                                |
| 安裝指令 | `npm ci`                              |
| 建置指令 | `npm run build`                       |
| 環境變數 | `SITE_URL`，以及選用的 `GITHUB_TOKEN` |

伺服器需要能夠存取 `https://api.github.com`，儲存庫端點需要至少 60 秒的函式執行時間上限。本專案包含伺服器端端點，不支援純靜態匯出至 GitHub Pages。

### Node.js 伺服器

```sh
npm ci
npm run build
npm run start
```

預設監聽 `127.0.0.1:3000`，可透過反向代理對外提供存取。

### 原始碼執行

使用 Node.js **22.12+（22.x）或 24.x**，建議採用專案 `.nvmrc` 指定的 Node.js 24。

```sh
git clone https://github.com/everfu/GHP.git
cd GHP
npm ci
npm run dev
```

開啟 <http://127.0.0.1:3000>。英文網址不帶語言前綴；其他語言使用 `/zh`、`/zh-tw`、`/de`、`/ru`、`/ja`、`/fr` 或 `/ko`，例如 `/zh-tw/u/everfu` 和 `/zh-tw/docs`。首次造訪會依瀏覽器語言選擇入口，切換語言會保留目前查詢。

## 環境變數

依需要複製範例設定，修改後重新啟動伺服器：

```sh
cp .env.example .env.local
```

| 變數           | 說明                                                    | 預設行為                             |
| -------------- | ------------------------------------------------------- | ------------------------------------ |
| `GITHUB_TOKEN` | 選用的伺服器端憑證，用於提高 GitHub API 查詢額度        | 未設定時使用伺服器 IP 共用額度       |
| `SITE_URL`     | 網站公開網址，包含 `https://`，用於產生完整的分享圖連結 | 使用 Vercel 提供的網址或本機開發網址 |

`GITHUB_TOKEN` 僅需要讀取公開資料的權限，不需要私人儲存庫或寫入權限。憑證僅用於伺服器端，不要加上 `NEXT_PUBLIC_` 前綴，也不要提交 `.env.local`。

## API

啟動專案後，查看站內 [API 文件](http://127.0.0.1:3000/zh-tw/docs)。

| 端點                               | 資料                   |
| ---------------------------------- | ---------------------- |
| `GET /api/users/{username}`        | 使用者公開資料         |
| `GET /api/users/{username}/repos`  | 完整分頁的公開儲存庫   |
| `GET /api/users/{username}/events` | 最近最多 30 筆公開事件 |

```sh
curl http://127.0.0.1:3000/api/users/everfu
curl http://127.0.0.1:3000/api/users/everfu/repos
curl http://127.0.0.1:3000/api/users/everfu/events
```

成功回應包含 `{ data, fetchedAt, complete }`。儲存庫已取得部分分頁後中斷時，回應包含已有資料、`complete: false` 和 `error`。錯誤回應使用 `{ error: { code, retryAt? } }`。

## 技術堆疊

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4, Motion, Lucide React
- GitHub REST API、行程內 LRU 快取
- Vitest, Playwright, ESLint, Prettier

## 開發與驗證

```sh
npm run check
npm run build

# 首次執行瀏覽器測試時安裝 Chromium
npx playwright install chromium
npm run test:e2e
```

CI 在 Node.js 22 / 24 上執行檢查與建置，並執行桌面和手機瀏覽器迴歸測試。歡迎透過 [Issue](https://github.com/everfu/GHP/issues) 或 Pull Request 參與貢獻。

## 致謝

感謝 [next-whois](https://github.com/zmh-program/next-whois) 專案。

## 授權

[Apache License 2.0](../LICENSE)。字型授權見 [public/fonts/LICENSE.txt](../public/fonts/LICENSE.txt)。

# GHP

ログインせずに GitHub 開発者の公開プロフィール、リポジトリ、最近の活動を調べられます。

[English](../README.md) · [简体中文](README_CN.md) · [繁體中文](README_TW.md) · [Русский](README_RU.md) · [日本語](README_JP.md) · [Deutsch](README_DE.md) · [Français](README_FR.md) · [한국어](README_KR.md)

## 機能

- **開発者検索** — ユーザー名、`@ユーザー名`、GitHub プロフィール URL に対応。公開プロフィール、フォロワー、フォロー数、登録日を表示。
- **リポジトリ分析** — 公開リポジトリを全ページ取得。Fork 以外の Star / Fork 合計、主要言語の分布、Star 上位 5 件を表示。
- **検索とフィルター** — 名前・説明・言語で検索、Fork・アーカイブで絞り込み、Star・Fork・更新日時で並べ替え。1 ページ 20 件。
- **最近の活動** — 最大 30 件の公開イベントを表示し、一覧を展開可能。
- **言語とテーマ** — 画面と API ドキュメントは 8 言語対応。デスクトップ・モバイル、システムテーマ、ライト / ダークの選択保存に対応。
- **履歴とショートカット** — 直近 10 件の成功した検索、履歴削除、共有リンク、`/`・Enter・Esc に対応。
- **サーバー側キャッシュ** — 完全な結果を 10 分間保存し、同一の同時リクエストを統合。プロフィール・リポジトリ・活動は個別に読み込み、再試行可能。
- **公開 API** — プロフィール・リポジトリ・活動の読み取り専用エンドポイントと内蔵ドキュメント。

統計には公開データのみを使用します。Star / Fork の合計は Fork リポジトリを除外し、アーカイブ済みリポジトリを含みます。言語分布は各リポジトリの主要言語で集計します。取得が不完全な場合は通知を表示し、全体の集計を非表示にします。

## デプロイ

### ホスティングプラットフォーム

**Next.js 16 と動的な Route Handlers** に対応するプラットフォームにこのリポジトリをインポートし、以下を設定してください。

| 設定                 | 値                                 |
| -------------------- | ---------------------------------- |
| Node.js              | `24.x`                             |
| インストールコマンド | `npm ci`                           |
| ビルドコマンド       | `npm run build`                    |
| 環境変数             | `SITE_URL` と任意の `GITHUB_TOKEN` |

サーバーから `https://api.github.com` にアクセスできる必要があります。リポジトリのエンドポイントには、関数実行時間の上限を少なくとも 60 秒に設定してください。サーバー側エンドポイントを含むため、静的エクスポートによる GitHub Pages へのデプロイには対応していません。

### Node.js サーバー

```sh
npm ci
npm run build
npm run start
```

デフォルトでは `127.0.0.1:3000` で待ち受けます。外部公開にはリバースプロキシを使用してください。

### ソースコードから実行

Node.js **22.12 以上の 22.x、または 24.x** を使用してください。`.nvmrc` で指定している Node.js 24 を推奨します。

```sh
git clone https://github.com/everfu/GHP.git
cd GHP
npm ci
npm run dev
```

<http://127.0.0.1:3000> を開きます。英語の URL には言語プレフィックスがありません。他の言語では `/zh`、`/zh-tw`、`/de`、`/ru`、`/ja`、`/fr`、`/ko` を使用します。日本語の例は `/ja/u/everfu` と `/ja/docs` です。初回アクセス時はブラウザーの言語設定に基づいて選択されます。言語を切り替えても現在の検索は保持されます。

## 環境変数

必要に応じて設定例をコピーし、変更後にサーバーを再起動してください。

```sh
cp .env.example .env.local
```

| 変数           | 説明                                                                  | デフォルトの動作                                    |
| -------------- | --------------------------------------------------------------------- | --------------------------------------------------- |
| `GITHUB_TOKEN` | GitHub API のリクエスト上限を引き上げるための任意のサーバー側認証情報 | 未設定時はサーバー IP の共有上限を使用              |
| `SITE_URL`     | `https://` を含むサイトの公開 URL。共有画像の絶対 URL の生成に使用    | Vercel が提供する URL またはローカル開発 URL を使用 |

`GITHUB_TOKEN` に必要なのは公開データの読み取り権限のみです。非公開リポジトリへの権限や書き込み権限は不要です。サーバー側でのみ使用し、`NEXT_PUBLIC_` プレフィックスを付けたり、`.env.local` をコミットしたりしないでください。

## API

起動後に内蔵の [API ドキュメント](http://127.0.0.1:3000/ja/docs) を参照してください。

| エンドポイント                     | データ                             |
| ---------------------------------- | ---------------------------------- |
| `GET /api/users/{username}`        | ユーザーの公開プロフィール         |
| `GET /api/users/{username}/repos`  | 全ページから取得した公開リポジトリ |
| `GET /api/users/{username}/events` | 最近の公開イベント、最大 30 件     |

```sh
curl http://127.0.0.1:3000/api/users/everfu
curl http://127.0.0.1:3000/api/users/everfu/repos
curl http://127.0.0.1:3000/api/users/everfu/events
```

成功レスポンスには `{ data, fetchedAt, complete }` が含まれます。リポジトリの一部のページを取得した後に中断した場合、取得済みのデータとともに `complete: false` と `error` が返ります。エラーレスポンスの形式は `{ error: { code, retryAt? } }` です。

## 技術スタック

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4, Motion, Lucide React
- GitHub REST API、プロセス内 LRU キャッシュ
- Vitest, Playwright, ESLint, Prettier

## 開発と検証

```sh
npm run check
npm run build

# ブラウザーテストの初回実行前に Chromium をインストール
npx playwright install chromium
npm run test:e2e
```

CI は Node.js 22 / 24 でチェックとビルドを実行し、デスクトップ・モバイルブラウザーの回帰テストを行います。[Issue](https://github.com/everfu/GHP/issues) や Pull Request での貢献を歓迎します。

## 謝辞

[next-whois](https://github.com/zmh-program/next-whois) プロジェクトに感謝します。

## ライセンス

[Apache License 2.0](../LICENSE)。フォントのライセンスは [public/fonts/LICENSE.txt](../public/fonts/LICENSE.txt) をご覧ください。

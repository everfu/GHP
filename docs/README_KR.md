# GHP

로그인 없이 GitHub 개발자의 공개 프로필, 저장소, 최근 활동을 살펴보세요.

[English](../README.md) · [简体中文](README_CN.md) · [繁體中文](README_TW.md) · [Русский](README_RU.md) · [日本語](README_JP.md) · [Deutsch](README_DE.md) · [Français](README_FR.md) · [한국어](README_KR.md)

## 기능

- **개발자 검색** — 사용자 이름, `@사용자이름`, GitHub 프로필 URL로 공개 프로필, 팔로워, 팔로잉, 가입 날짜 확인.
- **저장소 분석** — 공개 저장소의 모든 페이지, Fork가 아닌 저장소의 Star / Fork 합계, 주요 언어 분포, Star 상위 5개 표시.
- **검색과 필터** — 이름·설명·언어로 검색, Fork·보관 상태로 필터링, Star·Fork·업데이트 시간으로 정렬. 페이지당 20개.
- **최근 활동** — 최대 30개의 공개 이벤트와 펼칠 수 있는 목록.
- **언어와 테마** — 화면과 API 문서의 8개 언어, 반응형 데스크톱·모바일 화면, 시스템 테마와 밝은 / 어두운 테마 선택 저장.
- **기록과 단축키** — 최근 10개의 성공한 검색, 기록 삭제, 공유 링크, `/`·Enter·Esc 지원.
- **서버 캐시** — 완전한 결과를 10분 동안 저장하고 동일한 동시 요청을 통합. 프로필·저장소·활동을 각각 불러오고 재시도.
- **공개 API** — 프로필·저장소·활동의 읽기 전용 엔드포인트와 내장 문서.

통계에는 공개 데이터만 사용합니다. Star / Fork 합계는 Fork 저장소를 제외하고 보관된 저장소를 포함합니다. 언어 분포는 저장소의 주요 언어별로 개수를 집계합니다. 저장소를 모두 불러오지 못하면 안내를 표시하고 전체 통계를 숨깁니다.

## 배포

### 호스팅 플랫폼

**Next.js 16과 동적 Route Handlers**를 지원하는 플랫폼에 이 저장소를 가져와 다음 설정을 적용하세요.

| 설정      | 값                                 |
| --------- | ---------------------------------- |
| Node.js   | `24.x`                             |
| 설치 명령 | `npm ci`                           |
| 빌드 명령 | `npm run build`                    |
| 환경 변수 | `SITE_URL`과 선택적 `GITHUB_TOKEN` |

서버에서 `https://api.github.com`에 접근할 수 있어야 하며 저장소 엔드포인트에는 최소 60초의 함수 실행 시간 한도가 필요합니다. 서버 엔드포인트를 포함하므로 정적 내보내기를 통한 GitHub Pages 배포는 지원하지 않습니다.

### Node.js 서버

```sh
npm ci
npm run build
npm run start
```

기본적으로 `127.0.0.1:3000`에서 수신합니다. 외부 공개에는 리버스 프록시를 사용하세요.

### 소스 코드 실행

Node.js **22.12 이상의 22.x 또는 24.x**를 사용하세요. `.nvmrc`에 지정된 Node.js 24를 권장합니다.

```sh
git clone https://github.com/everfu/GHP.git
cd GHP
npm ci
npm run dev
```

<http://127.0.0.1:3000>을 엽니다. 영어 URL에는 언어 접두사가 없으며 다른 언어는 `/zh`, `/zh-tw`, `/de`, `/ru`, `/ja`, `/fr`, `/ko`를 사용합니다. 한국어 경로의 예는 `/ko/u/everfu`와 `/ko/docs`입니다. 첫 방문 시 브라우저 언어 설정에 따라 언어를 선택하며 언어를 바꿔도 현재 검색은 유지됩니다.

## 환경 변수

필요에 따라 예제 설정을 복사하고 변경 후 서버를 다시 시작하세요.

```sh
cp .env.example .env.local
```

| 변수           | 설명                                                                    | 기본 동작                                   |
| -------------- | ----------------------------------------------------------------------- | ------------------------------------------- |
| `GITHUB_TOKEN` | GitHub API 요청 한도를 높이기 위한 선택적 서버 인증 정보                | 미설정 시 서버 IP의 공유 한도 사용          |
| `SITE_URL`     | `https://`를 포함한 사이트 공개 URL. 공유 이미지의 절대 URL 생성에 사용 | Vercel이 제공한 URL 또는 로컬 개발 URL 사용 |

`GITHUB_TOKEN`에는 공개 데이터 읽기 권한만 필요합니다. 비공개 저장소나 쓰기 권한은 필요하지 않습니다. 서버에서만 사용하고 `NEXT_PUBLIC_` 접두사를 붙이거나 `.env.local`을 커밋하지 마세요.

## API

실행 후 내장 [API 문서](http://127.0.0.1:3000/ko/docs)를 확인하세요.

| 엔드포인트                         | 데이터                             |
| ---------------------------------- | ---------------------------------- |
| `GET /api/users/{username}`        | 사용자의 공개 프로필               |
| `GET /api/users/{username}/repos`  | 모든 페이지에서 가져온 공개 저장소 |
| `GET /api/users/{username}/events` | 최근 공개 이벤트 최대 30개         |

```sh
curl http://127.0.0.1:3000/api/users/everfu
curl http://127.0.0.1:3000/api/users/everfu/repos
curl http://127.0.0.1:3000/api/users/everfu/events
```

성공 응답에는 `{ data, fetchedAt, complete }`가 포함됩니다. 일부 저장소 페이지를 가져온 후 중단되면 가져온 데이터와 함께 `complete: false`와 `error`를 반환합니다. 오류 응답 형식은 `{ error: { code, retryAt? } }`입니다.

## 기술 스택

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4, Motion, Lucide React
- GitHub REST API, 프로세스 내부 LRU 캐시
- Vitest, Playwright, ESLint, Prettier

## 개발과 검증

```sh
npm run check
npm run build

# 브라우저 테스트를 처음 실행하기 전에 Chromium 설치
npx playwright install chromium
npm run test:e2e
```

CI는 Node.js 22 / 24에서 검사와 빌드를 실행하고 데스크톱·모바일 브라우저 회귀 테스트를 수행합니다. [Issue](https://github.com/everfu/GHP/issues)와 Pull Request를 통한 기여를 환영합니다.

## 감사의 말

[next-whois](https://github.com/zmh-program/next-whois) 프로젝트에 감사드립니다.

## 라이선스

[Apache License 2.0](../LICENSE). 글꼴 라이선스는 [public/fonts/LICENSE.txt](../public/fonts/LICENSE.txt)를 참고하세요.

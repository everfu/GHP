# GHP

Öffentliche GitHub-Entwicklerprofile, Repositorys und aktuelle Aktivitäten ohne Anmeldung erkunden.

[English](../README.md) · [简体中文](README_CN.md) · [繁體中文](README_TW.md) · [Русский](README_RU.md) · [日本語](README_JP.md) · [Deutsch](README_DE.md) · [Français](README_FR.md) · [한국어](README_KR.md)

## Funktionen

- **Entwicklersuche** — Benutzernamen, `@Benutzername` oder GitHub-Profil-URLs; öffentliche Profile, Follower, gefolgte Konten und Registrierungsdatum.
- **Repository-Analyse** — Alle öffentlichen Repository-Seiten, Star- / Fork-Summen ohne Fork-Repositorys, Hauptsprachen und die fünf Repositorys mit den meisten Stars.
- **Suche & Filter** — Nach Name, Beschreibung oder Sprache suchen; Forks und Archive filtern; nach Stars, Forks oder Aktualisierung sortieren. 20 Ergebnisse pro Seite.
- **Aktuelle Aktivitäten** — Bis zu 30 öffentliche Ereignisse mit ausklappbarer Liste.
- **Sprachen & Designs** — Acht Sprachen für Oberfläche und API-Dokumentation; responsive Desktop- / Mobilansicht, Systemdesign und gespeicherte Hell- / Dunkelauswahl.
- **Verlauf & Tastenkürzel** — Die letzten zehn erfolgreichen Abfragen, löschbarer Verlauf, teilbare Links sowie `/`, Enter und Esc.
- **Serverseitiger Cache** — Vollständige Ergebnisse für zehn Minuten, gebündelte identische Anfragen und unabhängiges Laden / Wiederholen für Profile, Repositorys und Aktivitäten.
- **Öffentliche API** — Nur lesende Endpunkte für Profile, Repositorys und Aktivitäten mit integrierter Dokumentation.

Statistiken verwenden ausschließlich öffentliche Daten. Star- / Fork-Summen schließen Fork-Repositorys aus und archivierte Repositorys ein; die Sprachverteilung zählt Repositorys nach ihrer Hauptsprache. Bei unvollständig geladenen Repositorys erscheint ein Hinweis und Gesamtauswertungen werden ausgeblendet.

## Bereitstellung

### Hosting-Plattformen

Dieses Repository in eine Plattform importieren, die **Next.js 16 und dynamische Route Handlers** unterstützt, und folgende Einstellungen verwenden:

| Einstellung         | Wert                                   |
| ------------------- | -------------------------------------- |
| Node.js             | `24.x`                                 |
| Installationsbefehl | `npm ci`                               |
| Build-Befehl        | `npm run build`                        |
| Umgebungsvariablen  | `SITE_URL` und optional `GITHUB_TOKEN` |

Der Server muss `https://api.github.com` erreichen können. Für Repository-Endpunkte muss das Ausführungslimit der Funktion mindestens 60 Sekunden betragen. Das Projekt enthält serverseitige Endpunkte und kann nicht als statischer Export auf GitHub Pages bereitgestellt werden.

### Node.js-Server

```sh
npm ci
npm run build
npm run start
```

Der Server lauscht standardmäßig auf `127.0.0.1:3000`; für öffentlichen Zugriff einen Reverse Proxy verwenden.

### Quellcode

Node.js **22.12+ (22.x) oder 24.x** verwenden. Empfohlen wird Node.js 24, wie in `.nvmrc` festgelegt.

```sh
git clone https://github.com/everfu/GHP.git
cd GHP
npm ci
npm run dev
```

<http://127.0.0.1:3000> öffnen. Englische URLs haben kein Sprachpräfix; andere Sprachen verwenden `/zh`, `/zh-tw`, `/de`, `/ru`, `/ja`, `/fr` oder `/ko`, etwa `/de/u/everfu` und `/de/docs`. Beim ersten Besuch wird die Sprache anhand der Browsereinstellungen ausgewählt. Ein Sprachwechsel erhält die aktuelle Abfrage.

## Umgebungsvariablen

Die Beispielkonfiguration bei Bedarf kopieren und den Server nach Änderungen neu starten:

```sh
cp .env.example .env.local
```

| Variable       | Beschreibung                                                                           | Standardverhalten                                                             |
| -------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `GITHUB_TOKEN` | Optionale serverseitige Zugangsdaten für ein höheres GitHub-API-Anfragelimit           | Ohne Konfiguration gilt das gemeinsame Limit der Server-IP                    |
| `SITE_URL`     | Öffentliche Website-URL einschließlich `https://` für absolute URLs der Vorschaubilder | Verwendet die von Vercel bereitgestellte URL oder die lokale Entwicklungs-URL |

`GITHUB_TOKEN` benötigt nur Leserechte für öffentliche Daten; Rechte für private Repositorys oder Schreibzugriff sind unnötig. Das Token bleibt auf dem Server. Kein `NEXT_PUBLIC_`-Präfix hinzufügen und `.env.local` nicht committen.

## API

Nach dem Start steht die integrierte [API-Dokumentation](http://127.0.0.1:3000/de/docs) bereit.

| Endpunkt                           | Daten                                            |
| ---------------------------------- | ------------------------------------------------ |
| `GET /api/users/{username}`        | Öffentliches Benutzerprofil                      |
| `GET /api/users/{username}/repos`  | Öffentliche Repositorys aus allen Ergebnisseiten |
| `GET /api/users/{username}/events` | Bis zu 30 aktuelle öffentliche Ereignisse        |

```sh
curl http://127.0.0.1:3000/api/users/everfu
curl http://127.0.0.1:3000/api/users/everfu/repos
curl http://127.0.0.1:3000/api/users/everfu/events
```

Erfolgreiche Antworten enthalten `{ data, fetchedAt, complete }`. Wird der Abruf nach einigen Repository-Seiten unterbrochen, enthält die Antwort die verfügbaren Daten, `complete: false` und ein `error`-Feld. Fehlerantworten verwenden `{ error: { code, retryAt? } }`.

## Technologie

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4, Motion, Lucide React
- GitHub REST API, LRU-Cache im Prozess
- Vitest, Playwright, ESLint, Prettier

## Entwicklung & Prüfungen

```sh
npm run check
npm run build

# Chromium vor dem ersten Ausführen der Browsertests installieren
npx playwright install chromium
npm run test:e2e
```

CI prüft und baut mit Node.js 22 / 24 und führt Regressionstests in Desktop- und Mobilbrowsern aus. Beiträge über [Issues](https://github.com/everfu/GHP/issues) und Pull Requests sind willkommen.

## Danksagung

Vielen Dank an das Projekt [next-whois](https://github.com/zmh-program/next-whois).

## Lizenz

[Apache License 2.0](../LICENSE). Schriftlizenzen stehen in [public/fonts/LICENSE.txt](../public/fonts/LICENSE.txt).

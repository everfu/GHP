# GHP

Explorez les profils publics, les dépôts et l’activité récente des développeurs GitHub sans vous connecter.

[English](../README.md) · [简体中文](README_CN.md) · [繁體中文](README_TW.md) · [Русский](README_RU.md) · [日本語](README_JP.md) · [Deutsch](README_DE.md) · [Français](README_FR.md) · [한국어](README_KR.md)

## Fonctionnalités

- **Recherche de développeurs** — Noms d’utilisateur, `@utilisateur` ou URL GitHub ; profils publics, abonnés, abonnements et date d’inscription.
- **Analyse des dépôts** — Toutes les pages des dépôts publics, totaux de Stars / Forks hors forks, langages principaux et cinq dépôts en tête par Stars.
- **Recherche et filtres** — Par nom, description ou langage ; filtres des forks et archives ; tri par Stars, Forks ou mise à jour. 20 résultats par page.
- **Activité récente** — Jusqu’à 30 événements publics dans une liste dépliable.
- **Langues et thèmes** — Huit langues pour l’interface et la documentation API ; affichage adaptatif sur ordinateur et mobile, thème système et choix clair / sombre enregistré.
- **Historique et raccourcis** — Dix dernières recherches réussies, historique effaçable, liens de partage et `/`, Entrée, Échap.
- **Cache côté serveur** — Résultats complets pendant dix minutes, requêtes simultanées identiques regroupées, chargement et relance indépendants des profils, dépôts et activités.
- **API publique** — Points d’accès en lecture seule pour les profils, dépôts et activités, avec documentation intégrée.

Les statistiques utilisent uniquement les données publiques. Les totaux de Stars / Forks excluent les forks et incluent les dépôts archivés ; la répartition des langages compte les dépôts selon leur langage principal. Les résultats incomplets affichent un avertissement et masquent les statistiques globales.

## Déploiement

### Plateformes d’hébergement

Importez ce dépôt sur une plateforme prenant en charge **Next.js 16 et les Route Handlers dynamiques**, avec les paramètres suivants :

| Paramètre                 | Valeur                                         |
| ------------------------- | ---------------------------------------------- |
| Node.js                   | `24.x`                                         |
| Commande d’installation   | `npm ci`                                       |
| Commande de compilation   | `npm run build`                                |
| Variables d’environnement | `SITE_URL` et, facultativement, `GITHUB_TOKEN` |

Le serveur doit pouvoir accéder à `https://api.github.com`, et les points d’accès aux dépôts nécessitent une limite d’exécution des fonctions d’au moins 60 secondes. Le projet comprend des points d’accès côté serveur et ne peut pas être déployé par export statique sur GitHub Pages.

### Serveur Node.js

```sh
npm ci
npm run build
npm run start
```

Le serveur écoute par défaut sur `127.0.0.1:3000` ; utilisez un proxy inverse pour l’accès public.

### Code source

Utilisez Node.js **22.12+ (22.x) ou 24.x**. Node.js 24, indiqué dans `.nvmrc`, est recommandé.

```sh
git clone https://github.com/everfu/GHP.git
cd GHP
npm ci
npm run dev
```

Ouvrez <http://127.0.0.1:3000>. Les URL anglaises n’ont pas de préfixe de langue ; les autres utilisent `/zh`, `/zh-tw`, `/de`, `/ru`, `/ja`, `/fr` ou `/ko`, par exemple `/fr/u/everfu` et `/fr/docs`. La première visite choisit la langue selon les préférences du navigateur. Le changement de langue conserve la recherche en cours.

## Variables d’environnement

Copiez la configuration d’exemple si nécessaire, puis redémarrez le serveur après modification :

```sh
cp .env.example .env.local
```

| Variable       | Description                                                                              | Comportement par défaut                                           |
| -------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `GITHUB_TOKEN` | Identifiant facultatif côté serveur pour augmenter la limite de requêtes de l’API GitHub | Sans configuration, utilise la limite partagée de l’IP du serveur |
| `SITE_URL`     | URL publique du site, avec `https://`, pour les URL absolues des images de partage       | Utilise l’URL fournie par Vercel ou l’URL de développement local  |

`GITHUB_TOKEN` nécessite uniquement l’accès en lecture aux données publiques ; les permissions sur les dépôts privés ou en écriture sont inutiles. Conservez-le côté serveur, sans préfixe `NEXT_PUBLIC_`, et ne commitez pas `.env.local`.

## API

Après le démarrage, consultez la [documentation API](http://127.0.0.1:3000/fr/docs) intégrée.

| Point d’accès                      | Données                                       |
| ---------------------------------- | --------------------------------------------- |
| `GET /api/users/{username}`        | Profil public de l’utilisateur                |
| `GET /api/users/{username}/repos`  | Dépôts publics récupérés sur toutes les pages |
| `GET /api/users/{username}/events` | Jusqu’à 30 événements publics récents         |

```sh
curl http://127.0.0.1:3000/api/users/everfu
curl http://127.0.0.1:3000/api/users/everfu/repos
curl http://127.0.0.1:3000/api/users/everfu/events
```

Les réponses réussies contiennent `{ data, fetchedAt, complete }`. Si la récupération des dépôts est interrompue après quelques pages, la réponse contient les données disponibles, `complete: false` et un champ `error`. Les réponses d’erreur utilisent `{ error: { code, retryAt? } }`.

## Technologies

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4, Motion, Lucide React
- GitHub REST API, cache LRU en mémoire dans le processus
- Vitest, Playwright, ESLint, Prettier

## Développement et vérifications

```sh
npm run check
npm run build

# Installer Chromium avant la première exécution des tests de navigateur
npx playwright install chromium
npm run test:e2e
```

La CI vérifie et compile avec Node.js 22 / 24, avec des tests de régression sur navigateurs pour ordinateur et mobile. Les contributions via les [Issues](https://github.com/everfu/GHP/issues) et les Pull Requests sont les bienvenues.

## Remerciements

Merci au projet [next-whois](https://github.com/zmh-program/next-whois).

## Licence

[Apache License 2.0](../LICENSE). Les licences des polices figurent dans [public/fonts/LICENSE.txt](../public/fonts/LICENSE.txt).

import 'server-only';
import { createGitHubService } from './service';

// Kept across development reloads; bounded caches live within each server process.
const shared = globalThis as typeof globalThis & {
  ghpGitHub?: ReturnType<typeof createGitHubService>;
};
export const github = (shared.ghpGitHub ??= createGitHubService(fetch, {
  token: process.env.GITHUB_TOKEN,
}));

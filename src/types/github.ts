export interface GitHubUser {
  login: string;
  id: number;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  created_at: string;
  followers: number;
  following: number;
  public_repos: number;
  type: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  pushed_at: string | null;
}

export interface PublicEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: {
    action?: string;
    ref_type?: string;
    pull_request?: { number: number; html_url: string };
    issue?: { number: number; html_url: string };
    release?: { html_url: string };
  };
}

export type ErrorCode =
  'INVALID_INPUT' | 'NOT_FOUND' | 'RATE_LIMIT' | 'TIMEOUT' | 'UNAVAILABLE' | 'CONFIGURATION';
export interface ApiError {
  code: ErrorCode;
  retryAt?: string;
}
export interface ApiResult<T> {
  data: T;
  fetchedAt: string;
  complete: boolean;
  error?: ApiError;
}
export interface ErrorResult {
  error: ApiError;
}

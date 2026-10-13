'use client';

import { useEffect, useState } from 'react';
import type { ApiError, ApiResult, ErrorResult } from '@/types/github';

interface State<T> {
  path: string;
  attempt: number;
  result?: ApiResult<T>;
  error?: ApiError;
}
export interface Resource<T> {
  result: ApiResult<T> | null;
  error: ApiError | null;
  loading: boolean;
  retry: () => void;
}

export function useResource<T>(path: string | null): Resource<T> {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State<T> | null>(null);
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    let active = true;
    async function load() {
      try {
        const response = await fetch(path!, {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(60_000)]),
          cache: 'no-store',
        });
        const body = (await response.json()) as ApiResult<T> | ErrorResult;
        if (!active) return;
        if (!response.ok || !('data' in body)) {
          setState({ path: path!, attempt, error: body.error || { code: 'UNAVAILABLE' } });
        } else {
          setState({ path: path!, attempt, result: body });
        }
      } catch (error) {
        if (!active) return;
        const timeout = error instanceof Error && error.name === 'TimeoutError';
        setState({ path: path!, attempt, error: { code: timeout ? 'TIMEOUT' : 'UNAVAILABLE' } });
      }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [path, attempt]);
  const current = state?.path === path && state.attempt === attempt ? state : null;
  return {
    result: path ? current?.result || null : null,
    error: path ? current?.error || null : null,
    loading: !!path && !current,
    retry: () => setAttempt((value) => value + 1),
  };
}

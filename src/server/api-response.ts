import 'server-only';
import { asGitHubError } from './github/service';
import type { ApiResult } from '../types/github';

export async function apiResponse<T>(load: () => Promise<ApiResult<T>>) {
  try {
    return Response.json(await load(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const failure = asGitHubError(error);
    return Response.json(
      { error: failure.toJSON() },
      { status: failure.status, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

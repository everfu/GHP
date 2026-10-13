import { apiResponse } from '@/server/api-response';
import { github } from '@/server/github/index';

export const runtime = 'nodejs';
export async function GET(_request: Request, context: { params: Promise<{ username: string }> }) {
  const { username } = await context.params;
  return apiResponse(() => github.events(username));
}

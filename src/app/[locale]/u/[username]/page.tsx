import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { normalizeUsername } from '@/lib/username';
import { Dashboard } from '@/components/github/dashboard';

type Props = { params: Promise<{ username: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const normalized = normalizeUsername(username);
  return { title: normalized ? `@${normalized} · GitHub` : 'GitHub' };
}
export default async function Page({ params }: Props) {
  const name = normalizeUsername((await params).username);
  if (!name) notFound();
  return <Dashboard username={name} key={name} />;
}

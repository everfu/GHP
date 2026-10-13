import type { Metadata } from 'next';
import { ApiDocs } from '@/components/docs/api-docs';
import { docsDictionary } from '@/lib/i18n/docs';
import { defaultLocale, isLocale } from '@/lib/i18n/locales';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { title: docsDictionary(isLocale(locale) ? locale : defaultLocale).title };
}

export default function DocsPage() {
  return <ApiDocs />;
}

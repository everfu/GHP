import { Home } from '@/components/search/home';
import type { Metadata } from 'next';
import { dictionary } from '@/lib/i18n/dictionary';
import { defaultLocale, isLocale } from '@/lib/i18n/locales';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = dictionary(isLocale(locale) ? locale : defaultLocale);
  return { title: copy.headline, description: copy.intro };
}

export default function Page() {
  return <Home />;
}

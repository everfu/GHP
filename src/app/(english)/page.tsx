import type { Metadata } from 'next';
import { dictionary } from '@/lib/i18n/dictionary';

export { default } from '../[locale]/page';

const copy = dictionary('en');
export const metadata: Metadata = { title: copy.headline, description: copy.intro };

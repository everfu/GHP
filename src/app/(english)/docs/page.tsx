import type { Metadata } from 'next';
import { docsDictionary } from '@/lib/i18n/docs';

export { default } from '../../[locale]/docs/page';
export const metadata: Metadata = { title: docsDictionary('en').title };

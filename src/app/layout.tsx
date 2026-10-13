import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { headers } from 'next/headers';
import { defaultLocale, isLocale, localeTags } from '@/lib/i18n/locales';
import { PreferencesProvider } from '@/components/providers/preferences';
import { Header } from '@/components/layout/shell';
import './globals.css';

const sans = localFont({
  src: '../../public/fonts/geist-sans.woff2',
  variable: '--font-geist-sans',
  weight: '100 900',
  display: 'swap',
});
const mono = localFont({
  src: '../../public/fonts/geist-mono.woff2',
  variable: '--font-geist-mono',
  weight: '100 900',
  display: 'swap',
});
const sharingImage = {
  url: '/opengraph-image.png',
  width: 1200,
  height: 630,
  alt: 'GHP Info — Explore GitHub developers, public profiles, repositories, and recent activity.',
};
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.SITE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `http://localhost:${process.env.PORT || 3000}`),
  ),
  title: { default: 'GHP Info · GitHub 开发者查询', template: '%s · GHP Info' },
  description:
    '查询 GitHub 开发者的公开资料、仓库、技术分布与近期活动。Explore GitHub developers through their public projects.',
  icons: { icon: '/favicon.ico' },
  openGraph: { type: 'website', siteName: 'GHP Info', images: [sharingImage] },
  twitter: { card: 'summary_large_image', images: [sharingImage] },
};
const bootstrap = `try{const p=JSON.parse(localStorage.getItem('ghp:preferences:v1')||'{}');document.documentElement.classList.toggle('dark',p.theme==='dark'||(p.theme!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches))}catch{document.documentElement.classList.toggle('dark',matchMedia('(prefers-color-scheme: dark)').matches)}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const requested = (await headers()).get('x-ghp-locale');
  const locale = isLocale(requested) ? requested : defaultLocale;
  return (
    <html
      lang={localeTags[locale]}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
      </head>
      <body>
        <PreferencesProvider>
          <div className="site-background" aria-hidden="true" />
          <Header />
          <div className="site-container">{children}</div>
        </PreferencesProvider>
      </body>
    </html>
  );
}

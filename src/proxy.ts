import { NextResponse, type NextRequest } from 'next/server';
import {
  defaultLocale,
  isLocale,
  localeCookie,
  localeFromPath,
  localizedPath,
  preferredLocale,
} from '@/lib/i18n/locales';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = localeFromPath(pathname);
  const saved = request.cookies.get(localeCookie)?.value;
  const hasPreference = isLocale(saved);
  const unprefixedPage =
    pathname === '/' || pathname === '/docs' || pathname === '/u' || pathname.startsWith('/u/');
  const selected =
    locale ??
    (unprefixedPage
      ? hasPreference
        ? saved
        : preferredLocale(request.headers.get('accept-language'))
      : defaultLocale);
  const headers = new Headers(request.headers);
  // Always overwrite the request value; explicit language URLs take priority.
  headers.set('x-ghp-locale', selected);

  let response: NextResponse;
  if (locale === defaultLocale || (unprefixedPage && selected !== defaultLocale)) {
    const url = request.nextUrl.clone();
    url.pathname = localizedPath(pathname, selected);
    response = NextResponse.redirect(url);
  } else {
    response = NextResponse.next({ request: { headers } });
  }

  if ((!hasPreference && (locale || unprefixedPage)) || locale === defaultLocale) {
    response.cookies.set(localeCookie, selected, { path: '/', maxAge: 31536000, sameSite: 'lax' });
  }
  if (unprefixedPage) response.headers.append('Vary', 'Accept-Language, Cookie');
  return response;
}

export const config = {
  matcher: ['/((?!api(?:/|$)|_next(?:/|$)|.*\\..*).*)'],
};

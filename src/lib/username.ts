const USERNAME = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export function normalizeUsername(input: string): string | null {
  let name = input.trim();
  if (/^(?:https?:\/\/|(?:www\.)?github\.com\/)/i.test(name)) {
    try {
      const url = new URL(/^https?:\/\//i.test(name) ? name : `https://${name}`);
      if (
        !['github.com', 'www.github.com'].includes(url.hostname.toLowerCase()) ||
        url.username ||
        url.password ||
        url.port
      )
        return null;
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length !== 1) return null;
      name = decodeURIComponent(segments[0]);
    } catch {
      return null;
    }
  } else {
    name = name.replace(/^@/, '');
  }
  return USERNAME.test(name) ? name.toLowerCase() : null;
}

export function safeWebsite(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

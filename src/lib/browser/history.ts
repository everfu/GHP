import { normalizeUsername } from '../username';

export const HISTORY_KEY = 'ghp:history:v1';
const EVENT = 'ghp:history';
let memory = '[]';
export function parseHistory(raw: string): string[] {
  try {
    const entries: unknown = JSON.parse(raw);
    if (!Array.isArray(entries)) return [];
    return [
      ...new Set(
        entries
          .filter((entry): entry is string => typeof entry === 'string')
          .map(normalizeUsername)
          .filter((entry): entry is string => entry !== null),
      ),
    ].slice(0, 10);
  } catch {
    return [];
  }
}
export function historySnapshot() {
  try {
    return localStorage.getItem(HISTORY_KEY) ?? memory;
  } catch {
    return memory;
  }
}
export function subscribeHistory(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(EVENT, onChange);
  };
}
function write(entries: string[]) {
  memory = JSON.stringify(entries);
  try {
    localStorage.setItem(HISTORY_KEY, memory);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}
export function rememberUser(input: string) {
  const username = normalizeUsername(input);
  if (!username) return;
  write(
    [username, ...parseHistory(historySnapshot()).filter((name) => name !== username)].slice(0, 10),
  );
}
export function clearHistory() {
  write([]);
}

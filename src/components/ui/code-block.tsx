'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { usePreferences } from '../providers/preferences';

export function CodeBlock({ code, label }: { code: string; label: string }) {
  const { t } = usePreferences();
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setState('copied');
    } catch {
      setState('failed');
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2500);
  }
  return (
    <div className="code-block">
      <pre tabIndex={0} aria-label={label}>
        <code>
          {code.startsWith('{')
            ? code
                .split(/("(?:\\.|[^"\\])*"|\b(?:true|false|null)\b|-?\b\d+(?:\.\d+)?\b)/g)
                .map((part, index, parts) => {
                  const token = part.startsWith('"')
                    ? /^\s*:/.test(parts[index + 1] ?? '')
                      ? 'key'
                      : 'string'
                    : /^(true|false|null)$/.test(part)
                      ? 'literal'
                      : /^-?\d/.test(part)
                        ? 'number'
                        : '';
                  return token ? (
                    <span className={`syntax-${token}`} key={index}>
                      {part}
                    </span>
                  ) : (
                    part
                  );
                })
            : code}
        </code>
      </pre>
      <button
        className="icon-button code-copy"
        type="button"
        onClick={copy}
        aria-label={`${t('copyCode')}: ${label}`}
      >
        {state === 'copied' ? (
          <Check size={14} aria-hidden="true" />
        ) : (
          <Copy size={14} aria-hidden="true" />
        )}
      </button>
      <span className="code-copy-status" role="status">
        {state === 'copied' ? t('codeCopied') : state === 'failed' ? t('codeCopyFailed') : ''}
      </span>
    </div>
  );
}

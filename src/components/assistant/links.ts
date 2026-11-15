import approved from '../../../rag/implementation/approved_links.json';
import sources from '../../../rag/implementation/public_sources.json';

function canonical(value: string): string | null {
  if (value.length > 2048 || Array.from(value).some(character => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127)) return null;
  try {
    const url = new URL(value);
    if (url.username || url.password || url.search) return null;
    if (url.protocol === 'mailto:') return url.href;
    if (url.protocol !== 'https:') return null;
    return url.origin + url.pathname.replace(/\/$/, '') + url.hash;
  } catch { return null; }
}

const destinations = new Set([...approved, ...Object.values(sources).map(source => source.href)]
  .map(canonical).filter((value): value is string => value !== null));

/** Owner-approved destinations only; model/history URLs never extend the registry. */
export function approvedAssistantUrl(value: string): string {
  const normalized = canonical(value);
  return normalized !== null && destinations.has(normalized) ? value : '';
}

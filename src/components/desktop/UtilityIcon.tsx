type Kind = 'sound-on' | 'sound-off' | 'arrange' | 'settings';
export function UtilityIcon({ kind }: { kind: Kind }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {kind.startsWith('sound') ? <><path d="M10 5 5.5 9H3v6h2.5l4.5 4V5Z" />{kind === 'sound-on' ? <><path d="M14 8a6 6 0 0 1 0 8M17 5a10 10 0 0 1 0 14" /></> : <path d="m15 9 6 6m0-6-6 6" />}</> : kind === 'settings' ? <><path d="m9 3-.6 2-2 .9-2-.4-2 3.5 1.4 1.6v2.8L2.4 15l2 3.5 2-.4 2 .9.6 2h4l.6-2 2-.9 2 .4 2-3.5-1.4-1.6v-2.8l1.4-1.6-2-3.5-2 .4-2-.9L13 3Z"/><circle cx="11" cy="12" r="3"/></> : <>{[4, 14].flatMap(x => [4, 14].map(y => <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" rx="1.5" />))}</>}
  </svg>;
}

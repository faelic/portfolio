import { AnimatedIcon } from '../icons/AnimatedIcon';
type Kind = 'sound-on' | 'sound-off' | 'arrange' | 'settings';
export function UtilityIcon({ kind }: { kind: Kind }) {
  if (kind !== 'arrange') return <AnimatedIcon name={kind === 'settings' ? 'settings' : kind === 'sound-on' ? 'volume' : 'volume-off'} />;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false">
    {[4, 14].flatMap(x => [4, 14].map(y => <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" rx="1.5" />))}
  </svg>;
}

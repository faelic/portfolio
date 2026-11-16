/** Selected lucide-animated icons, adapted for semantic parent controls.
 * https://github.com/pqoqubbw/icons — MIT, see THIRD_PARTY_LICENSES.md.
 * Envelope-flap, trash and muted-volume adaptations use the same Lucide visual language.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LazyMotion, type FeatureBundle } from 'motion/react';
import * as motion from 'motion/react-m';
import { useMediaQuery } from '../../hooks/useMediaQuery';

// LazyMotion has no error callback. If this optional download fails, leave only
// its feature promise pending: rendered SVGs and their semantic controls remain
// usable. No app readiness, spinner, timer or user action waits on this promise.
const loadFeatures = () => import('./features').then(module => module.default)
  .catch(() => new Promise<FeatureBundle>(() => {}));

export function IconMotion({ children }: { children: ReactNode }) {
  return <LazyMotion features={loadFeatures} strict>{children}</LazyMotion>;
}

export type AnimatedIconName = 'envelope' | 'settings' | 'volume' | 'volume-off' | 'send' | 'trash' | 'arrow-left' | 'arrow-right';

export function AnimatedIcon({ name }: { name: AnimatedIconName }) {
  const ref = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState(false);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const control = ref.current?.closest<HTMLElement>('button, a');
    if (!control) return;
    let hovered = false;
    let focused = false;
    let pressed = false;
    const update = () => setActive(!control.matches(':disabled, [aria-disabled="true"]') && (hovered || focused || pressed));
    const enter = (event: PointerEvent) => { hovered = event.pointerType !== 'touch'; update(); };
    const leave = () => { hovered = false; pressed = false; update(); };
    const focus = () => { focused = true; update(); };
    const blur = () => { focused = false; pressed = false; update(); };
    const down = () => { pressed = true; update(); };
    const up = () => { pressed = false; update(); };
    const reset = () => { hovered = focused = pressed = false; update(); };
    control.addEventListener('pointerenter', enter);
    control.addEventListener('pointerleave', leave);
    control.addEventListener('focus', focus);
    control.addEventListener('blur', blur);
    control.addEventListener('pointerdown', down);
    control.addEventListener('pointercancel', reset);
    window.addEventListener('pointerup', up);
    window.addEventListener('blur', reset);
    const observer = new MutationObserver(update);
    observer.observe(control, { attributes: true, attributeFilter: ['disabled', 'aria-disabled'] });
    return () => {
      observer.disconnect();
      control.removeEventListener('pointerenter', enter);
      control.removeEventListener('pointerleave', leave);
      control.removeEventListener('focus', focus);
      control.removeEventListener('blur', blur);
      control.removeEventListener('pointerdown', down);
      control.removeEventListener('pointercancel', reset);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('blur', reset);
    };
  }, []);

  const animate = active && !reduced;
  const transition = { duration: reduced ? 0 : .24, ease: 'easeOut' as const };
  const arrow = name === 'arrow-left' || name === 'arrow-right';
  const left = name === 'arrow-left';
  return <motion.svg ref={ref} className={`animated-icon animated-icon--${name}`} data-animation={reduced ? 'reduced' : animate ? 'active' : 'idle'}
    viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true" focusable="false" initial={false}>
    {name === 'envelope' && <>
      <rect x="3" y="5" width="18" height="14" rx="3"/>
      <motion.path data-envelope-flap="" d="M4 7L12 13L20 7" initial={false}
        animate={{ d: animate ? 'M4 7L12 1L20 7' : 'M4 7L12 13L20 7' }} transition={transition}/>
      <motion.path d="m4 17 5-5m6 0 5 5" initial={false} animate={{ opacity: animate ? 1 : 0 }} transition={transition}/>
    </>}
    {name === 'settings' && <motion.g initial={false} animate={{ rotate: animate ? 90 : 0 }} style={{ transformOrigin: '12px 12px' }} transition={transition}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
    </motion.g>}
    {(name === 'volume' || name === 'volume-off') && <>
      <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/>
      {name === 'volume' ? <motion.g initial={false} animate={{ opacity: animate ? [1, .45, 1] : 1 }} transition={{ ...transition, duration: reduced ? 0 : .35 }}><path d="M16 9a5 5 0 0 1 0 6M19.364 18.364a9 9 0 0 0 0-12.728"/></motion.g> : <path d="m16 9 6 6m0-6-6 6"/>}
    </>}
    {name === 'send' && <motion.g initial={false} animate={{ x: animate ? 1.5 : 0, y: animate ? -1.5 : 0, scale: animate ? .92 : 1 }} style={{ transformOrigin: '12px 12px' }} transition={transition}>
      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11zM21.854 2.147l-10.94 10.939"/>
    </motion.g>}
    {name === 'trash' && <>
      <motion.g initial={false} animate={{ rotate: animate ? -12 : 0, y: animate ? -1 : 0 }} style={{ transformOrigin: '5px 6px' }} transition={transition}><path d="M3 6h18M9 6V3h6v3"/></motion.g>
      <path d="m5 6 1 15h12l1-15M10 10v7m4-7v7"/>
    </>}
    {arrow && <>
      <motion.path d={left ? 'M19 12H5' : 'M5 12h14'} initial={false} animate={{ scaleX: animate ? [.95, .8, 1] : 1 }} style={{ transformOrigin: '12px 12px' }} transition={transition}/>
      <motion.path d={left ? 'm12 5-7 7 7 7' : 'm12 5 7 7-7 7'} initial={false} animate={{ x: animate ? (left ? -2 : 2) : 0 }} transition={transition}/>
    </>}
  </motion.svg>;
}

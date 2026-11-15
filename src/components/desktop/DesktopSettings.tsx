import { useEffect, useRef } from 'react';
import { play } from 'cuelume';
import { ArrangementDemo } from './ArrangementDemo';
import type { useInterfaceSounds } from '../../hooks/useInterfaceSounds';
export type ArrangementMethod = 'drag' | 'arrows';
interface Props {
  method: ArrangementMethod; onMethod: (method: ArrangementMethod) => void;
  sound: ReturnType<typeof useInterfaceSounds>; changed: boolean; canUndo: boolean;
  onReset: () => void; onUndo: () => void; onArrange: () => void; onClose: () => void;
}
export function DesktopSettings({ method, onMethod, sound, changed, canUndo, onReset, onUndo, onArrange, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const node = dialog.current; node?.showModal(); return () => node?.close(); }, []);
  return <dialog ref={dialog} className="desktop-settings" aria-labelledby="settings-title" onKeyDown={event => {
    if (event.key !== 'Tab') return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href]')).filter(node => node.getClientRects().length && (!(node instanceof HTMLInputElement) || node.type !== 'radio' || node.checked));
    if (!items.length) return;
    event.preventDefault();
    const current = items.indexOf(document.activeElement as HTMLElement);
    const next = current < 0 ? (event.shiftKey ? items.length - 1 : 0) : (current + (event.shiftKey ? -1 : 1) + items.length) % items.length;
    items[next].focus();
  }} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) { const r=event.currentTarget.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) onClose(); } }}>
    <header><h2 id="settings-title">Desktop settings</h2><button type="button" className="settings-close" aria-label="Close settings" onClick={onClose}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button></header>
    <section className="settings-arrangement"><fieldset><legend id="arrange-heading">Arrange apps</legend><div className="settings-methods">{(['drag','arrows'] as const).map(value => <label key={value}><input type="radio" name="arrange-method" aria-label={value==='drag'?'Drag':'Arrow controls'} value={value} checked={method===value} onChange={()=>onMethod(value)} /><span>{value==='drag'?'Drag':'Arrows'}</span></label>)}</div></fieldset>
      <ArrangementDemo method={method} />
      <div className="settings-arrange-actions"><button type="button" className="settings-primary" onClick={onArrange}>Rearrange apps</button>
      <div className="settings-reset">{canUndo ? <button type="button" onClick={onUndo}>Undo reset</button> : changed ? <button type="button" onClick={onReset}>Reset to default</button> : <span>Default order</span>}</div></div>
      {canUndo && <p className="settings-reset-status" role="status">Default order restored.</p>}
    </section>
    <section aria-label="Sound"><label className="settings-sound"><span>Interface sounds</span><input type="checkbox" role="switch" checked={sound.enabled} onChange={event=>sound.setEnabled(event.target.checked)} /></label>
      <label className="settings-volume" htmlFor="sound-volume"><span>{sound.audible?'Volume':'Saved volume'}</span><output>{Math.round(sound.volume*100)}%</output></label>
      <input id="sound-volume" aria-label="Volume" className={sound.audible?'':'is-muted'} type="range" min="0" max="100" step="1" value={Math.round(sound.volume*100)} onChange={event=>sound.setVolume(Number(event.target.value)/100)} />
      <div className="settings-sample-row"><p>{!sound.enabled?'Muted. Your volume preference is saved.':sound.volume===0?'Volume is zero.':'Sounds on.'}</p>
      {sound.audible && <button type="button" className="settings-sample" onClick={()=>play('release',{volume:.5})}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg>Play sample</button>}</div>
    </section><footer>Saved in this browser</footer>
  </dialog>;
}

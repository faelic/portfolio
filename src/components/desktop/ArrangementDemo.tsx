import { projects } from '../../data/projects';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { ResilientImage } from '../shared/ResilientImage';
import type { ArrangementMethod } from './DesktopSettings';

export function ArrangementDemo({ method }: { method: ArrangementMethod }) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  return <figure className={`arrangement-demo demo--${method}${reduced ? ' demo--static' : ''}`} role="img" aria-label={method === 'drag' ? 'Demonstration: drag an app to swap positions.' : 'Demonstration: select an app and move it one slot with an arrow.'}>
    <div className="demo-stage" key={method} aria-hidden="true">
      <div className="demo-slots"><span/><span/><span/></div>
      {(['champ','eau','silences'] as const).map((key,index)=><span key={key} className={`demo-app demo-app--${index}`}><ResilientImage src={projects[key].icon} alt="" icon fallbackLabel="Project icon" width={42} height={42} /></span>)}
      {method==='drag' ? <svg className="demo-cursor" viewBox="0 0 24 24"><path d="m5 3 14 10-7 1-3 7Z"/></svg> : <span className="demo-arrow"><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span>}
    </div>
    <figcaption>{method==='drag'?'Drag to swap positions':'Move one slot at a time'}</figcaption>
  </figure>;
}

import { useLayoutEffect, useRef, useState } from 'react';
import { projectCases } from '../../data/projectCases';
import type { Project } from '../../types/portfolio';
import { ResilientImage } from '../shared/ResilientImage';

export function ProjectPreview({ project, onHover }: { project: Project; onHover: (entered: boolean) => void }) {
  const ref = useRef<HTMLElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number }>();
  useLayoutEffect(() => {
    const place = () => {
      const source = document.querySelector<HTMLElement>(`[data-project="${project.key}"]`);
      const card = ref.current;
      if (!source || !card) return;
      const bounds = source.getBoundingClientRect();
      const left = Math.max(16, Math.min(window.innerWidth - card.offsetWidth - 16, bounds.left + bounds.width / 2 - card.offsetWidth / 2));
      const above = bounds.top - card.offsetHeight - 12;
      const top = above >= 16 ? above : Math.min(window.innerHeight - card.offsetHeight - 16, bounds.bottom + 12);
      setPosition({ left, top: Math.max(16, top) });
    };
    place();
    const observer = new ResizeObserver(place);
    if (ref.current) observer.observe(ref.current);
    window.addEventListener('resize', place); window.addEventListener('scroll', place, true);
    return () => { observer.disconnect(); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [project.key]);
  const story = projectCases[project.key];
  const image = project.images[project.featuredImageIndex ?? 0];
  return <aside ref={ref} id={`${project.key}-preview`} className="project-preview" role="tooltip" onPointerEnter={() => onHover(true)} onPointerLeave={() => onHover(false)} style={{ ...position, visibility: position ? 'visible' : 'hidden' }}>
    {image && <ResilientImage src={`/assets/projects/previews/${project.key}.jpg`} alt={image.alt} fallbackLabel={`${project.title} workflow`} width={640} height={360} decoding="async" />}
    <div className="project-preview-copy"><h2>{project.title}</h2><h3>My contribution</h3><p>{story.contribution}</p><h3>A decision to inspect</h3><p>{story.decision}</p>{!image && <span className="project-preview-note">Repository evidence · Frontend not deployed</span>}</div>
  </aside>;
}

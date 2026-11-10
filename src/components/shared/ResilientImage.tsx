import { useState, type ImgHTMLAttributes } from "react";

type Props = ImgHTMLAttributes<HTMLImageElement> & { fallbackLabel: string; icon?: boolean };
export function ResilientImage({ src, alt, fallbackLabel, icon = false, className = "", ...props }: Props) {
  const [failedSource, setFailedSource] = useState<string>();
  if (failedSource === src && src) {
    return <span className={`${className} image-fallback${icon ? " image-fallback--icon" : ""}`} role={icon ? undefined : "img"} aria-label={icon ? undefined : fallbackLabel} aria-hidden={icon && alt === "" ? true : undefined}>
      {icon ? <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="m7 16 4-5 3 3 3-2"/></svg> : <><strong>Preview unavailable</strong><span>{fallbackLabel}</span></>}
    </span>;
  }
  return <img {...props} src={src} alt={alt} className={className} onError={() => setFailedSource(src)} />;
}

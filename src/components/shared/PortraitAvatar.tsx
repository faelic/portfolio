import { profile } from "../../data/profile";
import { ResilientImage } from "./ResilientImage";

export function PortraitAvatar({ className = "", large = false, decorative = false }: {
  className?: string;
  large?: boolean;
  decorative?: boolean;
}) {
  const size = large ? 384 : 96;
  return <span className={`portrait-avatar ${className}`} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : "Favour’s portrait"} aria-hidden={decorative || undefined}>
    <ResilientImage src={large ? profile.avatar.large : profile.avatar.small} alt="" width={size} height={size} icon fallbackLabel="Favour’s portrait" />
  </span>;
}

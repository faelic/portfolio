import { session } from "../../utils/storage";
import { useEffect, useRef, useState } from "react";
import { MODE_DRAWS, resolvePreset } from "thinking-orbs/engine";

const BOOT_SEEN_KEY = "favour.boot-seen.v1";
const FIRST_VISIT_MINIMUM_MS = 1700;
const RETURN_VISIT_MINIMUM_MS = 820;
const ASSET_WAIT_LIMIT_MS = 2800;
const EXIT_DURATION_MS = 460;

interface BootPreloaderProps {
  assets: string[];
  onReveal: () => void;
  onComplete: () => void;
}

function wait(duration: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, duration));
}

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();
    const finish = () => resolve();

    image.onload = finish;
    image.onerror = finish;
    image.src = src;

    if (image.complete) finish();
  });
}

function hasBootedThisSession() {
  return session.flag(BOOT_SEEN_KEY);
}

function SolvingOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = 64;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);

    const { mode, speed, opts } = resolvePreset("solving", size);
    const drawOrb = MODE_DRAWS[mode];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;

    const draw = (time: number) => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, size, size);
      drawOrb(context, size, time, true, opts);
    };

    const animate = () => {
      draw(performance.now() / 1000 * speed);
      animationFrame = requestAnimationFrame(animate);
    };

    if (reducedMotion) {
      draw(0.6);
    } else {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="boot-preloader__orb"
      width="64"
      height="64"
      role="img"
      aria-label="Loading portfolio"
    />
  );
}

export function BootPreloader({ assets, onReveal, onComplete }: BootPreloaderProps) {
  const [exiting, setExiting] = useState(false);
  const firstVisitRef = useRef(!hasBootedThisSession());
  const callbacksRef = useRef({ onReveal, onComplete });

  useEffect(() => {
    callbacksRef.current = { onReveal, onComplete };
  }, [onReveal, onComplete]);

  useEffect(() => {
    let cancelled = false;
    let exitTimer = 0;
    const minimumDuration = firstVisitRef.current
      ? FIRST_VISIT_MINIMUM_MS
      : RETURN_VISIT_MINIMUM_MS;

    const imagesReady = Promise.allSettled(assets.map(preloadImage));
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const criticalAssetsReady = Promise.allSettled([imagesReady, fontsReady]);

    Promise.all([
      wait(minimumDuration),
      Promise.race([criticalAssetsReady, wait(ASSET_WAIT_LIMIT_MS)]),
    ]).then(() => {
      if (cancelled) return;

      session.writeFlag(BOOT_SEEN_KEY, true);

      setExiting(true);
      callbacksRef.current.onReveal();
      exitTimer = window.setTimeout(() => callbacksRef.current.onComplete(), EXIT_DURATION_MS);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(exitTimer);
    };
  }, [assets]);

  return (
    <div
      className={`boot-preloader${exiting ? " is-exiting" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      <div className="boot-preloader__status" data-theme="dark">
        <SolvingOrb />
        <span className="boot-preloader__label" aria-hidden="true">
          Loading portfolio
          <span className="boot-preloader__ellipsis">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </span>
      </div>
    </div>
  );
}

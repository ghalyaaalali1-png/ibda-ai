import { useId } from "react";

/*
 * The KHITTA "K" mark with its sparkle, drawn as a vector so it stays sharp
 * at every size (header, browser tab, phone home screen).
 */
export const markPaths = {
  stem: { x: 6, y: 20, width: 29, height: 88, rx: 4.5 },
  leg: "M48 72 L70 72 L105 108 L81 108 Z",
  arm: "M60 32 L104 32 C86 46 66 60 50 74 C38 84 24 96 10 105 C16 90 26 72 38 58 C44 50 52 40 60 32 Z",
  sparkle: "M96 3 Q97.6 11.4 106 13 Q97.6 14.6 96 23 Q94.4 14.6 86 13 Q94.4 11.4 96 3 Z",
};

/** The mark alone (no text); size it with `className`. */
export function KhittaMark({ className }: { className?: string }) {
  const id = useId();
  const stem = `${id}-stem`;
  const arm = `${id}-arm`;
  const leg = `${id}-leg`;
  return (
    <svg viewBox="0 0 112 112" className={className} aria-hidden>
      <defs>
        <linearGradient id={stem} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5ab8ff" />
          <stop offset="1" stopColor="#3355e8" />
        </linearGradient>
        <linearGradient id={arm} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#2f5cf0" />
          <stop offset="0.55" stopColor="#7a6cff" />
          <stop offset="1" stopColor="#a68bff" />
        </linearGradient>
        <linearGradient id={leg} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b4fd8" />
          <stop offset="1" stopColor="#9076ff" />
        </linearGradient>
      </defs>
      <rect {...markPaths.stem} fill={`url(#${stem})`} />
      <path d={markPaths.leg} fill={`url(#${leg})`} />
      <path d={markPaths.arm} fill={`url(#${arm})`} />
      <path d={markPaths.sparkle} fill="#7fa8ff" />
    </svg>
  );
}
